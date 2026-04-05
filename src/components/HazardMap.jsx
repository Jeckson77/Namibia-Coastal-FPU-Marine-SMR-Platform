import React, { useEffect, useState } from 'react';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip as LeafletTooltip,
  useMap,
} from 'react-leaflet';
import {
  Activity,
  AlertTriangle,
  Camera,
  Gauge,
  Hourglass,
  Plus,
  Shield,
  Thermometer,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react';
import CompetitionQuestionBanner from './CompetitionQuestionBanner';

const createReactorDraft = (index) => ({
  name: `Reactor ${index}`,
  efficiency: '',
  lifespan: '',
  energyProduced: '',
  nextRepair: '',
  nuclearWaste: '',
});

const THERMO_STYLES = {
  nominal: {
    circle: { color: '#4ade80', fillColor: '#14532d', fillOpacity: 0.24, weight: 2 },
    marker: { color: '#86efac', fillColor: '#166534', fillOpacity: 0.95 },
    badge: 'text-accent-emerald border-accent-emerald/30 bg-accent-emerald/10',
  },
  watch: {
    circle: { color: '#fb923c', fillColor: '#9a3412', fillOpacity: 0.28, weight: 2 },
    marker: { color: '#fdba74', fillColor: '#c2410c', fillOpacity: 0.95 },
    badge: 'text-accent-amber border-accent-amber/30 bg-accent-amber/10',
  },
  alert: {
    circle: { color: '#f87171', fillColor: '#7f1d1d', fillOpacity: 0.3, weight: 2 },
    marker: { color: '#fca5a5', fillColor: '#991b1b', fillOpacity: 0.95 },
    badge: 'text-red-300 border-red-500/30 bg-red-500/10',
  },
};

const TERRAIN_COLORS = {
  coast: '#f8fafc',
  land: '#fbbf24',
  ocean: '#38bdf8',
  reactor: '#c3f5ff',
};

const MAP_MODES = [
  { id: 'terrain', label: 'Terrain' },
  { id: 'combined', label: 'Combined' },
  { id: 'thermo', label: 'Thermo Cam' },
];

const MAP_LEGENDS = {
  terrain: {
    title: 'Terrain Legend',
    subtitle: 'Coastline, shelf geometry, and coastal terrain context',
    items: [
      { id: 'land', swatchClassName: 'bg-amber-700/80 border border-amber-300/40', label: 'Namib coastal landmass' },
      { id: 'key-point', swatchClassName: 'bg-amber-400 border border-amber-100/40', label: 'Preferred deployment point' },
      { id: 'coast', swatchClassName: 'bg-white/95', shapeClassName: 'h-1 w-6 rounded-full', label: 'Atlantic shoreline / ocean boundary' },
      { id: 'shelf', swatchClassName: 'bg-sky-400', shapeClassName: 'h-1 w-6 rounded-full', label: 'Continental shelf transition' },
      { id: 'feature', swatchClassName: 'bg-amber-400 border border-white/20', label: 'Terrain point of interest' },
    ],
  },
  combined: {
    title: 'Combined Legend',
    subtitle: 'Terrain, operating corridor, reactors, and thermo-rad scan',
    items: [
      { id: 'reactor', swatchClassName: 'bg-[#c3f5ff] border border-white/30', label: 'Reactor position' },
      { id: 'key-point', swatchClassName: 'bg-amber-400 border border-amber-100/40', label: 'Preferred deployment point' },
      { id: 'ops', swatchClassName: 'bg-cyan-900/70 border border-cyan-200/40', label: 'Recommended operating envelope' },
      { id: 'coast', swatchClassName: 'bg-white/95', shapeClassName: 'h-1 w-6 rounded-full', label: 'Atlantic shoreline / ocean boundary' },
      { id: 'shelf', swatchClassName: 'bg-sky-400', shapeClassName: 'h-1 w-6 rounded-full', label: 'Continental shelf transition' },
      { id: 'hotspot', swatchClassName: 'bg-orange-400 border border-orange-200/40', label: 'Thermo-rad hotspot' },
    ],
  },
  thermo: {
    title: 'Thermo Cam Legend',
    subtitle: 'Heat and radiation sweep with reactor operating markers',
    items: [
      { id: 'reactor', swatchClassName: 'bg-[#c3f5ff] border border-white/30', label: 'Reactor position' },
      { id: 'key-point', swatchClassName: 'bg-amber-400 border border-amber-100/40', label: 'Preferred deployment point' },
      { id: 'ops', swatchClassName: 'bg-cyan-900/70 border border-cyan-200/40', label: 'Recommended operating envelope' },
      { id: 'nominal', swatchClassName: 'bg-emerald-400 border border-emerald-200/40', label: 'Nominal thermo-rad reading' },
      { id: 'watch', swatchClassName: 'bg-orange-400 border border-orange-200/40', label: 'Watch-level hotspot' },
      { id: 'alert', swatchClassName: 'bg-red-400 border border-red-200/40', label: 'Alert-level hotspot' },
    ],
  },
};

const HazardMapViewport = ({ center, zoom, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds?.length) {
      map.fitBounds(bounds, { padding: [36, 36] });
    } else {
      map.setView(center, zoom, { animate: true });
    }
    map.invalidateSize();

    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, center, zoom, bounds]);

  return null;
};

const getReactorMapSites = (zone, reactors) => {
  const layout = zone.mapOverlay?.reactorLayout;
  if (!layout) {
    return [];
  }

  return reactors.map((reactor, index) => {
    const offset = layout.offsets[index] ?? [0.05 * (index + 1), index % 2 === 0 ? 0.04 : -0.04];

    return {
      ...reactor,
      lat: reactor.lat ?? layout.anchor[0] + offset[0],
      lng: reactor.lng ?? layout.anchor[1] + offset[1],
    };
  });
};

const HazardMap = ({ data, onAddReactor, recommendedCoordinates }) => {
  const basins = data.basins;
  const [selectedZone, setSelectedZone] = useState(data.basins[0].id);
  const [showAddReactorForm, setShowAddReactorForm] = useState(false);
  const [mapMode, setMapMode] = useState('combined');
  const [newReactor, setNewReactor] = useState(createReactorDraft((data.basins[0].reactors?.length ?? 0) + 1));
  const zone = basins.find((basin) => basin.id === selectedZone) ?? basins[0];
  const reactors = zone.reactors ?? [];
  const reactorSites = getReactorMapSites(zone, reactors);
  const terrainFeatures = zone.mapOverlay?.terrainFeatures ?? [];
  const thermoScan = zone.mapOverlay?.thermoScan;
  const thermoHotspots = thermoScan?.hotspots ?? [];
  const showTerrainLayer = mapMode !== 'thermo';
  const showThermoLayer = mapMode !== 'terrain';
  const showOperationsLayer = mapMode !== 'terrain';
  const activeLegend = MAP_LEGENDS[mapMode] ?? MAP_LEGENDS.combined;
  const keyPointPosition = recommendedCoordinates?.lat != null && recommendedCoordinates?.lng != null
    ? [recommendedCoordinates.lat, recommendedCoordinates.lng]
    : null;
  const mapBounds = [
    ...(zone.mapOverlay?.landPolygon ?? []),
    ...(zone.mapOverlay?.coastline ?? []),
    ...(zone.mapOverlay?.shelfBreak ?? []),
    ...terrainFeatures.map((feature) => [feature.lat, feature.lng]),
    ...reactorSites.map((reactor) => [reactor.lat, reactor.lng]),
    ...thermoHotspots.map((hotspot) => [hotspot.lat, hotspot.lng]),
    ...(keyPointPosition ? [keyPointPosition] : []),
  ];

  useEffect(() => {
    setShowAddReactorForm(false);
    setNewReactor(createReactorDraft((reactors.length ?? 0) + 1));
  }, [selectedZone, reactors.length]);

  const handleReactorFieldChange = (field, value) => {
    setNewReactor((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAddReactor = (event) => {
    event.preventDefault();

    const nextReactor = {
      id: `${zone.id}-r${reactors.length + 1}`,
      name: newReactor.name.trim() || `Reactor ${reactors.length + 1}`,
      efficiency: newReactor.efficiency.trim(),
      lifespan: newReactor.lifespan.trim(),
      energyProduced: newReactor.energyProduced.trim(),
      nextRepair: newReactor.nextRepair.trim(),
      nuclearWaste: newReactor.nuclearWaste.trim(),
    };

    onAddReactor?.(zone.id, nextReactor);
    setNewReactor(createReactorDraft(reactors.length + 2));
    setShowAddReactorForm(false);
  };

  return (
    <div className="bg-background relative overflow-hidden">
      <CompetitionQuestionBanner questionId="q2" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative overflow-hidden">
        <div className="lg:col-span-8 relative bg-surface-lowest rounded-2xl border border-surface-high overflow-hidden min-h-[760px]">
          <MapContainer center={zone.mapView.center} zoom={zone.mapView.zoom} className="h-[760px] w-full z-0" scrollWheelZoom>
            <HazardMapViewport center={zone.mapView.center} zoom={zone.mapView.zoom} bounds={mapBounds} />
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              attribution="Labels &copy; Esri"
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              opacity={0.45}
            />

            {showTerrainLayer && (
              <Polygon
                positions={zone.mapOverlay.landPolygon}
                pathOptions={{
                  color: '#fbbf24',
                  fillColor: '#78350f',
                  fillOpacity: 0.24,
                  weight: 1.5,
                }}
              >
                <LeafletTooltip sticky>
                  <span className="text-[11px] font-semibold text-amber-100">Namib coastal landscape</span>
                  <br />
                  <span className="text-[10px] text-amber-50/90">Onshore dunes, rock, and support corridor east of the shoreline</span>
                </LeafletTooltip>
              </Polygon>
            )}

            {showTerrainLayer && (
              <Polyline
                positions={zone.mapOverlay.coastline}
                pathOptions={{
                  color: '#f8fafc',
                  weight: 3,
                  opacity: 0.95,
                  dashArray: '8 6',
                }}
              >
                <LeafletTooltip sticky>
                  <span className="text-[11px] font-semibold text-white">Atlantic shoreline</span>
                  <br />
                  <span className="text-[10px] text-slate-100/90">Land ends east of this line. Open ocean begins west of it.</span>
                </LeafletTooltip>
              </Polyline>
            )}

            {showTerrainLayer && (
              <Polyline
                positions={zone.mapOverlay.shelfBreak}
                pathOptions={{
                  color: '#22d3ee',
                  weight: 2,
                  opacity: 0.9,
                  dashArray: '10 10',
                }}
              >
                <LeafletTooltip sticky>
                  <span className="text-[11px] font-semibold text-sky-200">Continental shelf transition</span>
                  <br />
                  <span className="text-[10px] text-sky-100/90">Bathymetric drop toward deeper, more stable reactor mooring water.</span>
                </LeafletTooltip>
              </Polyline>
            )}

            {showOperationsLayer && (
              <Circle
                center={zone.mapOverlay.reactorLayout.anchor}
                radius={22000}
                pathOptions={{
                  color: '#c3f5ff',
                  fillColor: '#0f2f3a',
                  fillOpacity: mapMode === 'thermo' ? 0.12 : 0.18,
                  weight: 2,
                }}
              >
                <LeafletTooltip sticky>
                  <span className="text-[11px] font-semibold text-cyan-100">Recommended operating envelope</span>
                  <br />
                  <span className="text-[10px] text-cyan-50/90">Low-seismic offshore deployment corridor around {zone.name}</span>
                </LeafletTooltip>
              </Circle>
            )}

            {showTerrainLayer && terrainFeatures.map((feature) => (
              <CircleMarker
                key={feature.id}
                center={[feature.lat, feature.lng]}
                radius={7}
                pathOptions={{
                  color: TERRAIN_COLORS[feature.type] ?? '#c3f5ff',
                  fillColor: '#111827',
                  fillOpacity: 0.95,
                  weight: 2,
                }}
              >
                <LeafletTooltip direction="top" offset={[0, -8]}>
                  <span className="text-[11px] font-semibold">{feature.label}</span>
                  <br />
                  <span className="text-[10px] opacity-90">{feature.detail}</span>
                </LeafletTooltip>
              </CircleMarker>
            ))}

            {showOperationsLayer && reactorSites.map((reactor) => (
              <CircleMarker
                key={reactor.id}
                center={[reactor.lat, reactor.lng]}
                radius={10}
                pathOptions={{
                  color: '#c3f5ff',
                  fillColor: '#0b1620',
                  fillOpacity: 0.96,
                  weight: 3,
                }}
              >
                <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <span className="text-[11px] font-semibold text-cyan-100">{reactor.name}</span>
                  <br />
                  <span className="text-[10px] text-cyan-50/90">{reactor.efficiency} efficiency · next repair {reactor.nextRepair}</span>
                </LeafletTooltip>
              </CircleMarker>
            ))}

            {keyPointPosition && (
              <>
                <Circle
                  center={keyPointPosition}
                  radius={18000}
                  pathOptions={{
                    color: '#fbbf24',
                    fillColor: '#f59e0b',
                    fillOpacity: 0.08,
                    weight: 2,
                    dashArray: '8 8',
                  }}
                >
                  <LeafletTooltip sticky>
                    <span className="text-[11px] font-semibold text-amber-100">Preferred deployment key point</span>
                    <br />
                    <span className="text-[10px] text-amber-50/90">{recommendedCoordinates.primary}</span>
                  </LeafletTooltip>
                </Circle>
                <CircleMarker
                  center={keyPointPosition}
                  radius={9}
                  pathOptions={{
                    color: '#fde68a',
                    fillColor: '#f59e0b',
                    fillOpacity: 0.95,
                    weight: 3,
                  }}
                >
                  <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.95}>
                    <span className="text-[11px] font-semibold text-amber-100">Preferred deployment point</span>
                    <br />
                    <span className="text-[10px] text-amber-50/90">{recommendedCoordinates.primary}</span>
                  </LeafletTooltip>
                </CircleMarker>
              </>
            )}

            {showThermoLayer && thermoHotspots.map((hotspot) => {
              const style = THERMO_STYLES[hotspot.severity] ?? THERMO_STYLES.nominal;

              return (
                <React.Fragment key={hotspot.id}>
                  <Circle center={[hotspot.lat, hotspot.lng]} radius={hotspot.radiusM} pathOptions={style.circle}>
                    <LeafletTooltip sticky>
                      <span className="text-[11px] font-semibold">{hotspot.label}</span>
                      <br />
                      <span className="text-[10px] opacity-90">{hotspot.medium} · {hotspot.temperature} · {hotspot.radiation}</span>
                      <br />
                      <span className="text-[10px] opacity-80">{hotspot.note}</span>
                    </LeafletTooltip>
                  </Circle>
                  <CircleMarker
                    center={[hotspot.lat, hotspot.lng]}
                    radius={8}
                    pathOptions={{
                      ...style.marker,
                      weight: 2,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>

          <div className="absolute top-4 left-4 z-[450] flex flex-wrap gap-2 max-w-[calc(100%-2rem)]">
            {basins.map((basin) => (
              <button
                key={basin.id}
                type="button"
                onClick={() => setSelectedZone(basin.id)}
                className={`px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest border transition-colors ${
                  selectedZone === basin.id
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-surface-high/85 border-surface-highest text-secondary/80 hover:border-primary/30'
                }`}
              >
                {basin.name}
              </button>
            ))}
          </div>

          <div className="absolute top-4 right-4 z-[450] flex flex-wrap gap-2 justify-end max-w-[calc(100%-2rem)]">
            {MAP_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setMapMode(mode.id)}
                className={`px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest border transition-colors ${
                  mapMode === mode.id
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-surface-high/85 border-surface-highest text-secondary/80 hover:border-primary/30'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="absolute top-20 left-4 z-[450] space-y-2 max-w-[22rem]">
            <div className="glass p-4 rounded-xl border border-primary/20">
              <div className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary animate-ping" /> SCANNING COASTAL SECTOR: {zone.name.toUpperCase()}
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-widest opacity-50">Terrain imagery + coastline + thermo-rad sweep</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass p-3 rounded-xl border border-primary/10">
                <div className="text-[10px] uppercase tracking-widest opacity-50">Landscape</div>
                <div className="mt-1 text-sm font-bold text-white">Namib coast / offshore shelf</div>
              </div>
              <div className="glass p-3 rounded-xl border border-primary/10">
                <div className="text-[10px] uppercase tracking-widest opacity-50">Ocean start</div>
                <div className="mt-1 text-sm font-bold text-white">West of traced shoreline</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-[450] glass p-4 rounded-xl border border-primary/20 space-y-3 w-[min(22rem,calc(100%-2rem))]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold m-0">{activeLegend.title}</h4>
                <p className="mt-1 mb-0 text-[11px] opacity-70 leading-relaxed">{activeLegend.subtitle}</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-primary">{MAP_MODES.find((mode) => mode.id === mapMode)?.label}</span>
            </div>

            <div className="space-y-2">
              {activeLegend.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${item.shapeClassName ?? ''} ${item.swatchClassName}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 text-[10px] uppercase tracking-widest opacity-50">
              Basin: {zone.name} · score {zone.score}/100
            </div>
          </div>

          <div className="absolute bottom-4 right-4 z-[450] glass p-4 rounded-xl border border-primary/20 w-[min(22rem,calc(100%-2rem))] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                <Camera size={14} className="text-primary" /> Thermo Camera
              </h4>
              <span className="text-[10px] uppercase tracking-widest text-primary">{thermoScan.sensor}</span>
            </div>
            <p className="text-xs opacity-80 leading-relaxed m-0">{thermoScan.status}</p>
            <div className="text-[10px] uppercase tracking-widest opacity-50">Last sweep: {thermoScan.lastSweep}</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-widest">
              <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                <div className="opacity-50">Hotspots</div>
                <div className="mt-1 text-sm text-primary font-bold normal-case tracking-normal">{thermoHotspots.length}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                <div className="opacity-50">Displayed mode</div>
                <div className="mt-1 text-sm text-primary font-bold normal-case tracking-normal">{MAP_MODES.find((mode) => mode.id === mapMode)?.label}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 bg-surface-high rounded-2xl border border-surface-highest">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Selected Basin</span>
                <h2 className="text-3xl font-display">{zone.name}</h2>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center">
                <Shield size={24} className="text-primary" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-surface-low rounded-xl border border-surface-high">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Seismic Score</span>
                  <span className="text-primary font-bold">{zone.score}/100</span>
                </div>
                <div className="h-1.5 bg-surface-lowest rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${zone.score}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-low rounded-xl border border-surface-high">
                  <Activity size={16} className="text-primary mb-2" />
                  <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Max PGA</span>
                  <span className="text-xs font-bold text-white">{zone.hazard.split(' ')[1]}</span>
                </div>
                <div className="p-4 bg-surface-low rounded-xl border border-surface-high">
                  <Shield size={16} className="text-primary mb-2" />
                  <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Stability</span>
                  <span className="text-xs font-bold text-white">{zone.tectonic}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-low rounded-xl border border-surface-high">
                  <Waves size={16} className="text-primary mb-2" />
                  <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Ocean Start</span>
                  <span className="text-xs font-bold text-white">West of mapped shoreline</span>
                </div>
                <div className="p-4 bg-surface-low rounded-xl border border-surface-high">
                  <Thermometer size={16} className="text-primary mb-2" />
                  <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Thermo Scan</span>
                  <span className="text-xs font-bold text-white">{thermoScan.status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-60">Strategic Intelligence</h4>
                <p className="text-sm border-l-2 border-primary/20 pl-4 py-1 leading-relaxed opacity-80">{zone.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-60">Landscape Detail</h4>
                  <span className="text-[10px] uppercase tracking-widest text-primary">Coast / land / ocean</span>
                </div>
                {terrainFeatures.map((feature) => (
                  <div key={feature.id} className="p-4 bg-surface-low rounded-xl border border-surface-high">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-white">{feature.label}</span>
                      <span className="text-[10px] uppercase tracking-widest text-primary">{feature.type}</span>
                    </div>
                    <p className="mt-2 text-[11px] opacity-75 leading-relaxed m-0">{feature.detail}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-60">Thermo Camera Findings</h4>
                  <span className="text-[10px] uppercase tracking-widest text-primary">{thermoScan.lastSweep}</span>
                </div>
                {thermoHotspots.map((hotspot) => {
                  const style = THERMO_STYLES[hotspot.severity] ?? THERMO_STYLES.nominal;

                  return (
                    <div key={hotspot.id} className="p-4 bg-surface-low rounded-xl border border-surface-high space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h5 className="text-sm font-bold text-white m-0">{hotspot.label}</h5>
                          <div className="text-[10px] uppercase tracking-widest opacity-50 mt-1">{hotspot.medium} surveillance zone</div>
                        </div>
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-widest rounded border ${style.badge}`}>
                          {hotspot.severity}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Thermal delta</span>
                          <span className="font-bold text-white">{hotspot.temperature}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Radiation</span>
                          <span className="font-bold text-white">{hotspot.radiation}</span>
                        </div>
                      </div>
                      <p className="text-[11px] opacity-75 leading-relaxed m-0">{hotspot.note}</p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-60">Reactor Performance</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddReactorForm((current) => !current)}
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <Plus size={14} />
                    Add Reactor
                  </button>
                </div>

                {showAddReactorForm && (
                  <form onSubmit={handleAddReactor} className="p-4 bg-surface-low rounded-xl border border-surface-high space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase tracking-widest opacity-50 block">Name</span>
                        <input
                          type="text"
                          value={newReactor.name}
                          onChange={(event) => handleReactorFieldChange('name', event.target.value)}
                          className="w-full rounded-lg border border-surface-high bg-surface-lowest px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                          placeholder="Reactor 3"
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase tracking-widest opacity-50 block">Reactor Efficacy</span>
                        <input
                          type="text"
                          value={newReactor.efficiency}
                          onChange={(event) => handleReactorFieldChange('efficiency', event.target.value)}
                          className="w-full rounded-lg border border-surface-high bg-surface-lowest px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                          placeholder="94.7%"
                          required
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase tracking-widest opacity-50 block">Life Span</span>
                        <input
                          type="text"
                          value={newReactor.lifespan}
                          onChange={(event) => handleReactorFieldChange('lifespan', event.target.value)}
                          className="w-full rounded-lg border border-surface-high bg-surface-lowest px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                          placeholder="60 years"
                          required
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase tracking-widest opacity-50 block">Energy Produced</span>
                        <input
                          type="text"
                          value={newReactor.energyProduced}
                          onChange={(event) => handleReactorFieldChange('energyProduced', event.target.value)}
                          className="w-full rounded-lg border border-surface-high bg-surface-lowest px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                          placeholder="11.4 TWh"
                          required
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase tracking-widest opacity-50 block">Next Repair</span>
                        <input
                          type="text"
                          value={newReactor.nextRepair}
                          onChange={(event) => handleReactorFieldChange('nextRepair', event.target.value)}
                          className="w-full rounded-lg border border-surface-high bg-surface-lowest px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                          placeholder="22 Sep 2027"
                          required
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase tracking-widest opacity-50 block">Nuclear Waste Created</span>
                        <input
                          type="text"
                          value={newReactor.nuclearWaste}
                          onChange={(event) => handleReactorFieldChange('nuclearWaste', event.target.value)}
                          className="w-full rounded-lg border border-surface-high bg-surface-lowest px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                          placeholder="5.8 t spent fuel equivalent"
                          required
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddReactorForm(false)}
                        className="px-4 py-2 rounded-lg border border-surface-high text-xs uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary text-xs px-4 py-2">
                        Save Reactor
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {reactors.map((reactor) => (
                    <div key={reactor.id} className="p-4 bg-surface-low rounded-xl border border-surface-high space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-white m-0">{reactor.name}</h5>
                        <span className="text-[10px] uppercase tracking-widest text-primary">Online</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 bg-surface-lowest rounded-xl border border-surface-high">
                          <Gauge size={16} className="text-primary mb-2" />
                          <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Reactor Efficacy</span>
                          <span className="text-sm font-bold text-white">{reactor.efficiency}</span>
                        </div>
                        <div className="p-4 bg-surface-lowest rounded-xl border border-surface-high">
                          <Hourglass size={16} className="text-primary mb-2" />
                          <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Life Span</span>
                          <span className="text-sm font-bold text-white">{reactor.lifespan}</span>
                        </div>
                        <div className="p-4 bg-surface-lowest rounded-xl border border-surface-high">
                          <Zap size={16} className="text-primary mb-2" />
                          <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Energy Produced</span>
                          <span className="text-sm font-bold text-white">{reactor.energyProduced}</span>
                        </div>
                        <div className="p-4 bg-surface-lowest rounded-xl border border-surface-high">
                          <Wrench size={16} className="text-primary mb-2" />
                          <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Next Repair</span>
                          <span className="text-sm font-bold text-white">{reactor.nextRepair}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-surface-lowest rounded-xl border border-surface-high flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Nuclear Waste Created</span>
                          <span className="text-sm font-bold text-white">{reactor.nuclearWaste}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Shield size={18} className="text-primary" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-primary px-2">Hazard Insights</h4>
            {data.hazards.map((hazard, idx) => (
              <div key={idx} className="p-4 glass rounded-xl border border-primary/10 flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                  {hazard.icon === 'activity' ? <Activity size={20} className="text-primary" /> : <Waves size={20} className="text-primary" />}
                </div>
                <div>
                  <h5 className="text-sm font-bold m-0 mb-1">{hazard.title}</h5>
                  <p className="text-[11px] opacity-70 leading-relaxed">{hazard.description}</p>
                </div>
              </div>
            ))}
            <div className="p-4 glass rounded-xl border border-primary/10 flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                <Camera size={20} className="text-primary" />
              </div>
              <div>
                <h5 className="text-sm font-bold m-0 mb-1">Thermo-Radiological Sweep</h5>
                <p className="text-[11px] opacity-70 leading-relaxed">
                  Simulated thermal camera overlays reveal whether spill signatures appear on landfall infrastructure, shoreline, or offshore cooling plumes around the selected basin.
                </p>
              </div>
            </div>
            <div className="p-4 glass rounded-xl border border-primary/10 flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-primary" />
              </div>
              <div>
                <h5 className="text-sm font-bold m-0 mb-1">Coastline Delineation</h5>
                <p className="text-[11px] opacity-70 leading-relaxed">
                  The traced white shoreline separates the Namib land surface from the Atlantic operational water, making it clear where coastal spill migration would cross onto land.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HazardMap;
