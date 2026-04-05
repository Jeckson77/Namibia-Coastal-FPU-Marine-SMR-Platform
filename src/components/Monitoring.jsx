import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Circle,
  Polyline,
  CircleMarker,
  Popup,
  Tooltip as LeafletTooltip,
  Marker,
  useMap,
} from 'react-leaflet';
import {
  Activity,
  AlertTriangle,
  Anchor,
  Bell,
  Brain,
  ChevronDown,
  ChevronUp,
  Eye,
  ScanSearch,
  Navigation,
  Radio,
  Ship,
  Waves,
  Shield,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  SEISMIC_EVENTS,
  SEISMIC_TREND,
  NATURAL_HAZARDS,
  ALERT_TIMELINE,
  AI_SCAN_TARGETS,
  BATHYMETRY_CONTOURS,
  COASTLINE_TRACE,
  PATROL_ASSETS,
  SHIPPING_CORRIDORS,
  COASTAL_GRID_NODES,
  TRANSMISSION_LINES,
  SURVEILLANCE_ZONES,
  WEATHER_BUOYS,
} from '../data/monitoring-data';

const MAP_CENTER = [-28.18, 14.12];
const MAP_ZOOM = 8;

/** ~3 NM inner “critical” footprint inside each NO-GO (illustrative). */
const CRITICAL_RADIUS_M = 3 * 1852;

const noGoLabelIcon = (line1, line2) =>
  L.divIcon({
    className: 'leaflet-no-go-label',
    html: `<div class="no-go-pill"><div>${line1}</div><div style="font-size:9px;font-weight:600;opacity:.9;margin-top:2px;letter-spacing:0.04em">${line2}</div></div>`,
    iconSize: [168, 44],
    iconAnchor: [84, 22],
  });

const gridNodeIcon = (shortName, voltageKv) =>
  L.divIcon({
    className: 'leaflet-grid-node',
    html: `<div class="grid-node-pill">${shortName} · ${voltageKv} kV</div>`,
    iconSize: [118, 26],
    iconAnchor: [59, 13],
  });

const severityStyle = {
  critical: 'text-red-300 bg-red-500/10 border-red-500/30',
  watch: 'text-tertiary bg-tertiary/10 border-tertiary/30',
  advisory: 'text-accent-amber bg-accent-amber/10 border-accent-amber/30',
  nominal: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/30',
};

const MAP_THEMES = {
  night: {
    label: 'Night Ops',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; OpenStreetMap, SRTM | style &copy; OpenTopoMap',
  },
};

const buoyIcon = () =>
  L.divIcon({
    className: 'leaflet-grid-node',
    html: '<div class="grid-node-pill" style="background:rgba(56,189,248,.95);color:#0f172a;border-color:#7dd3fc">BUOY</div>',
    iconSize: [58, 24],
    iconAnchor: [29, 12],
  });

const patrolIcon = (label) =>
  L.divIcon({
    className: 'leaflet-grid-node',
    html: `<div class="grid-node-pill" style="background:rgba(251,191,36,.96);color:#1f2937;border-color:#fde68a">${label}</div>`,
    iconSize: [92, 24],
    iconAnchor: [46, 12],
  });

const scoreScannerTarget = (target, recommendedCoordinates) => {
  const referenceDistance = recommendedCoordinates?.lat != null && recommendedCoordinates?.lng != null
    ? Math.sqrt((target.lat - recommendedCoordinates.lat) ** 2 + (target.lng - recommendedCoordinates.lng) ** 2)
    : 0;
  const proximityBonus = Math.max(0, 14 - referenceDistance * 180);
  const score = Math.round(
    40 +
    target.shelterScore +
    target.logisticsScore +
    target.gridTieScore +
    proximityBonus -
    target.ecologicalPenalty -
    target.swellPenalty
  );

  return Math.min(98, Math.max(52, score));
};

const getScannerStatus = (score) => {
  if (score >= 82) {
    return {
      label: 'High suitability',
      className: 'border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald',
      marker: '#4ade80',
    };
  }

  if (score >= 72) {
    return {
      label: 'Suitable with review',
      className: 'border-accent-amber/30 bg-accent-amber/10 text-accent-amber',
      marker: '#fbbf24',
    };
  }

  return {
    label: 'Lower priority',
    className: 'border-red-500/30 bg-red-500/10 text-red-300',
    marker: '#f87171',
  };
};

const MonitoringViewport = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds?.length) {
      map.fitBounds(bounds, { padding: [32, 32] });
    }
  }, [map, bounds]);

  return null;
};

const Monitoring = ({ reactorSites = [], noGoZones = [], exportCables = [], recommendedCoordinates }) => {
  const [mapTheme, setMapTheme] = useState('night');
  const [isLegendMinimized, setIsLegendMinimized] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const mapSites = reactorSites.filter((site) => site.onRegionalMap);
  const tileTheme = MAP_THEMES[mapTheme];
  const plottedReactors = mapSites.length;
  const activeAlerts = ALERT_TIMELINE.filter((alert) => alert.active);
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === 'critical').length;
  const advisoryAlerts = activeAlerts.filter((alert) => alert.severity === 'advisory').length;
  const watchAlerts = activeAlerts.filter((alert) => alert.severity === 'watch').length;
  const topAlert = activeAlerts[0] ?? ALERT_TIMELINE[0];
  const keyPointPosition = recommendedCoordinates?.lat != null && recommendedCoordinates?.lng != null
    ? [recommendedCoordinates.lat, recommendedCoordinates.lng]
    : null;
  const aiScanResults = AI_SCAN_TARGETS.map((target) => {
    const score = scoreScannerTarget(target, recommendedCoordinates);

    return {
      ...target,
      score,
      status: getScannerStatus(score),
    };
  }).sort((left, right) => right.score - left.score);
  const bestScanTarget = aiScanResults[0];
  const mapBounds = [
    ...COASTLINE_TRACE,
    ...BATHYMETRY_CONTOURS.flatMap((contour) => contour.coordinates),
    ...SURVEILLANCE_ZONES.map((zone) => [zone.lat, zone.lng]),
    ...TRANSMISSION_LINES.flatMap((line) => line.coordinates),
    ...exportCables.flatMap((cable) => cable.coordinates),
    ...SHIPPING_CORRIDORS.flatMap((lane) => lane.coordinates),
    ...SEISMIC_EVENTS.map((event) => [event.lat, event.lng]),
    ...noGoZones.map((zone) => [zone.lat, zone.lng]),
    ...COASTAL_GRID_NODES.map((node) => [node.lat, node.lng]),
    ...WEATHER_BUOYS.map((buoy) => [buoy.lat, buoy.lng]),
    ...PATROL_ASSETS.map((asset) => [asset.lat, asset.lng]),
    ...mapSites.map((site) => [site.lat, site.lng]),
    ...(keyPointPosition ? [keyPointPosition] : []),
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-surface-low/80 border-l-2 border-primary/45 pl-4 pr-5 py-4 md:py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary/70">
              Coastal & offshore monitoring
            </span>
            <h2 className="mt-1 text-lg font-display font-semibold text-primary md:text-xl">
              Live situational picture — seismicity, natural hazards, reactor health, coastal grid &amp; maritime
              safety
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-accent-emerald">
            <Radio size={14} className="animate-pulse" />
            Synthetic demo feed — connect IRIS / USGS / regional TWS for operations
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-surface-high to-surface-high px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-red-200">
              <Bell size={12} /> Operations notifications
            </div>
            <div className="mt-1 text-sm text-secondary/90">
              <span className="font-bold text-red-200">{topAlert.title}</span> — {topAlert.detail}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest">
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-200">Critical {criticalAlerts}</span>
            <span className="rounded-full border border-accent-amber/30 bg-accent-amber/10 px-3 py-1 text-accent-amber">Advisory {advisoryAlerts}</span>
            <span className="rounded-full border border-tertiary/30 bg-tertiary/10 px-3 py-1 text-tertiary">Watch {watchAlerts}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-surface-high rounded-xl border border-surface-highest">
          <div className="text-[10px] uppercase tracking-widest opacity-50">Plotted Reactors</div>
          <div className="mt-1 text-2xl font-display text-primary">{plottedReactors}</div>
          <div className="text-[11px] opacity-70 mt-1">Live reactor markers with health popups</div>
        </div>
        <div className="p-4 bg-surface-high rounded-xl border border-surface-highest">
          <div className="text-[10px] uppercase tracking-widest opacity-50">Surveillance Rings</div>
          <div className="mt-1 text-2xl font-display text-primary">{SURVEILLANCE_ZONES.length}</div>
          <div className="text-[11px] opacity-70 mt-1">Radar, AIS, and thermal watch envelopes</div>
        </div>
        <div className="p-4 bg-surface-high rounded-xl border border-surface-highest">
          <div className="text-[10px] uppercase tracking-widest opacity-50">Metocean Buoys</div>
          <div className="mt-1 text-2xl font-display text-primary">{WEATHER_BUOYS.length}</div>
          <div className="text-[11px] opacity-70 mt-1">Wave, current, and wind feed sources</div>
        </div>
        <div className="p-4 bg-surface-high rounded-xl border border-surface-highest">
          <div className="text-[10px] uppercase tracking-widest opacity-50">Mapped Seismic Events</div>
          <div className="mt-1 text-2xl font-display text-primary">{SEISMIC_EVENTS.length}</div>
          <div className="text-[11px] opacity-70 mt-1">Epicenters plotted against coastal shelf geometry</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="p-4 bg-surface-high rounded-xl border border-red-500/20">
          <div className="text-[10px] uppercase tracking-widest text-red-200/80">Critical alerts</div>
          <div className="mt-1 text-2xl font-display text-red-200">{criticalAlerts}</div>
          <div className="text-[11px] opacity-70 mt-1">Immediate operational intervention or patrol action</div>
        </div>
        <div className="p-4 bg-surface-high rounded-xl border border-accent-amber/20">
          <div className="text-[10px] uppercase tracking-widest text-accent-amber/80">Advisories</div>
          <div className="mt-1 text-2xl font-display text-accent-amber">{advisoryAlerts}</div>
          <div className="text-[11px] opacity-70 mt-1">Conditions requiring margin review or inspection planning</div>
        </div>
        <div className="p-4 bg-surface-high rounded-xl border border-tertiary/20">
          <div className="text-[10px] uppercase tracking-widest text-tertiary/80">Watch items</div>
          <div className="mt-1 text-2xl font-display text-tertiary">{watchAlerts}</div>
          <div className="text-[11px] opacity-70 mt-1">Tracked changes still inside the approved operating envelope</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 bg-surface-high rounded-xl border border-surface-highest">
            <h3 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2 m-0 mb-4">
              <Activity size={14} /> Seismic watch — coastal / margin
            </h3>
            <div className="h-36 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SEISMIC_TREND}>
                  <CartesianGrid stroke="#3b494c" strokeOpacity={0.2} />
                  <XAxis dataKey="t" tick={{ fill: '#b1cad7', fontSize: 10 }} />
                  <YAxis domain={[0, 40]} tick={{ fill: '#b1cad7', fontSize: 10 }} />
                  <ChartTooltip
                    contentStyle={{ background: '#161b22', border: '1px solid #262a31', fontSize: 11 }}
                    labelStyle={{ color: '#c3f5ff' }}
                  />
                  <Line type="monotone" dataKey="index" stroke="#c3f5ff" strokeWidth={2} dot={false} name="Tremor index" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] uppercase tracking-wider opacity-50 mb-3">Recent events (illustrative)</p>
            <ul className="space-y-3 m-0 p-0 list-none">
              {SEISMIC_EVENTS.map((e) => (
                <li
                  key={e.id}
                  className="text-xs border-l-2 border-primary/25 pl-3 py-1 bg-surface-low/50 rounded-r"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold text-primary">M{e.magnitude}</span>
                    <span className="opacity-50 text-[10px]">{e.time.slice(0, 16)}Z</span>
                  </div>
                  <div className="opacity-70 mt-0.5">{e.region}</div>
                  <div className="text-[10px] opacity-50 mt-1">
                    Depth {e.depthKm} km · ~{e.distanceKm} km from ops box
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-surface-high rounded-xl border-2 border-red-900/40 bg-gradient-to-b from-red-950/20 to-surface-high">
            <h3 className="text-xs uppercase tracking-widest text-red-300 flex items-center gap-2 m-0 mb-3">
              <AlertTriangle size={14} className="text-red-400" /> Reactor NO-GO zones (charted)
            </h3>
            <p className="text-[11px] text-secondary/85 leading-relaxed m-0 mb-4">
              Red hatched areas on the map are <strong className="text-red-300">prohibited</strong> for fishing,
              drifting, and unauthorized traffic — keep clear of moorings, hawsers, and intakes.
            </p>
            <ul className="space-y-3 m-0 p-0 list-none">
              {noGoZones.map((z) => (
                <li
                  key={z.id}
                  className="text-xs rounded-lg border border-red-500/25 bg-red-950/30 px-3 py-2.5"
                >
                  <div className="font-display font-bold text-red-200 tracking-wide">{z.title}</div>
                  <div className="text-[10px] text-secondary/80 mt-1">{z.subtitle}</div>
                  <div className="text-[10px] text-secondary/70 mt-2 leading-relaxed">{z.rules}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-surface-high rounded-xl border border-surface-highest">
            <h3 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2 m-0 mb-4">
              <Waves size={14} /> Natural hazards & marine conditions
            </h3>
            <ul className="space-y-3 m-0 p-0 list-none">
              {NATURAL_HAZARDS.map((h) => (
                <li
                  key={h.id}
                  className={`p-3 rounded-lg border text-xs ${severityStyle[h.severity] || severityStyle.nominal}`}
                >
                  <div className="font-bold flex items-center gap-2 mb-1">
                    {h.severity !== 'nominal' && <AlertTriangle size={12} />}
                    {h.title}
                  </div>
                  <div className="opacity-90 leading-relaxed">{h.detail}</div>
                  <div className="text-[10px] opacity-50 mt-2">{h.source}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-surface-high rounded-xl border border-surface-highest">
            <h3 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2 m-0 mb-4">
              <Bell size={14} /> Notification timeline
            </h3>
            <div className="space-y-3">
              {ALERT_TIMELINE.map((alert) => (
                <div key={alert.id} className={`rounded-xl border px-4 py-3 ${severityStyle[alert.severity] || severityStyle.watch}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest opacity-70">{alert.transition}</div>
                      <div className="mt-1 text-sm font-bold">{alert.title}</div>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest opacity-70 text-right">{alert.timeLabel}</div>
                  </div>
                  <div className="mt-2 text-xs leading-relaxed opacity-90">{alert.detail}</div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest opacity-60">
                    <span>{alert.source}</span>
                    <span>{alert.active ? 'Active' : 'Resolved / logged'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-surface-high rounded-xl border border-surface-highest">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2 m-0">
                <Brain size={14} /> AI suitability scanner
              </h3>
              <button
                type="button"
                onClick={() => setScannerVisible((current) => !current)}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
              >
                <ScanSearch size={14} /> {scannerVisible ? 'Hide scan' : 'Run AI scan'}
              </button>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
              <div className="text-[10px] uppercase tracking-widest opacity-50">Top ranked area</div>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">{bestScanTarget.name}</div>
                  <div className="mt-1 text-[11px] opacity-75 leading-relaxed">{bestScanTarget.note}</div>
                </div>
                <div className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest ${bestScanTarget.status.className}`}>
                  {bestScanTarget.score}/100
                </div>
              </div>
            </div>
            {scannerVisible && (
              <div className="mt-4 space-y-3">
                {aiScanResults.map((result) => (
                  <div key={result.id} className="rounded-xl border border-surface-high bg-surface-low px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">{result.name}</div>
                        <div className="mt-1 text-[11px] opacity-75 leading-relaxed">{result.note}</div>
                      </div>
                      <div className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest ${result.status.className}`}>
                        {result.score}/100
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest opacity-60">
                      <span>{result.status.label}</span>
                      <span>{result.lat.toFixed(3)}, {result.lng.toFixed(3)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 bg-surface-high rounded-xl border border-surface-highest">
            <h3 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2 m-0 mb-4">
              <Navigation size={14} /> Metocean & patrol feed
            </h3>
            <div className="space-y-3">
              {WEATHER_BUOYS.map((buoy) => (
                <div key={buoy.id} className="rounded-lg border border-surface-high bg-surface-low px-3 py-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-primary">{buoy.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-accent-emerald">{buoy.status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] opacity-80">
                    <span>Wave {buoy.waveHeightM} m</span>
                    <span>Current {buoy.currentKt} kt</span>
                    <span>Wind {buoy.windKt} kt</span>
                  </div>
                </div>
              ))}
              {PATROL_ASSETS.map((asset) => (
                <div key={asset.id} className="rounded-lg border border-surface-high bg-surface-low px-3 py-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-primary">{asset.name}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-50">{asset.type}</span>
                  </div>
                  <div className="mt-2 opacity-75">{asset.heading}</div>
                  <div className="text-[10px] opacity-50 mt-1">{asset.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-surface-high bg-surface-lowest min-h-[420px] md:min-h-[520px] z-0">
            <div className="absolute top-3 right-3 z-[450] flex flex-wrap gap-2 max-w-[calc(100%-1.5rem)] justify-end">
              {Object.entries(MAP_THEMES).map(([id, theme]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMapTheme(id)}
                  className={`px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest border transition-colors ${
                    mapTheme === id
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'bg-surface-high/90 border-surface-highest text-secondary/80 hover:border-primary/30'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
            <MapContainer
              center={MAP_CENTER}
              zoom={MAP_ZOOM}
              className="h-[420px] md:h-[520px] w-full z-0"
              scrollWheelZoom
            >
              <MonitoringViewport bounds={mapBounds} />
              <TileLayer
                attribution={tileTheme.attribution}
                url={tileTheme.url}
              />

              {mapTheme !== 'night' && (
                <TileLayer
                  attribution='&copy; OpenStreetMap &copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                  opacity={0.4}
                />
              )}

              <Polyline
                positions={COASTLINE_TRACE}
                pathOptions={{
                  color: '#f8fafc',
                  weight: 3,
                  opacity: 0.92,
                  dashArray: '8 6',
                }}
              >
                <LeafletTooltip sticky>
                  <span className="text-[11px] font-semibold text-white">Namib coastline</span>
                  <br />
                  <span className="text-[10px]">Shoreline split between landfall infrastructure and Atlantic operating water</span>
                </LeafletTooltip>
              </Polyline>

              {BATHYMETRY_CONTOURS.map((contour) => (
                <Polyline
                  key={contour.id}
                  positions={contour.coordinates}
                  pathOptions={{
                    color: contour.color,
                    weight: 2,
                    opacity: 0.75,
                    dashArray: '6 8',
                  }}
                >
                  <LeafletTooltip sticky>
                    <span className="text-[11px] font-semibold">{contour.label}</span>
                  </LeafletTooltip>
                </Polyline>
              ))}

              {SURVEILLANCE_ZONES.map((zone) => (
                <Circle
                  key={zone.id}
                  center={[zone.lat, zone.lng]}
                  radius={zone.radiusM}
                  pathOptions={{
                    color: zone.color,
                    fillColor: zone.color,
                    fillOpacity: 0.06,
                    weight: 2,
                    dashArray: '12 10',
                  }}
                >
                  <LeafletTooltip sticky>
                    <span className="text-[11px] font-semibold">{zone.title}</span>
                    <br />
                    <span className="text-[10px] opacity-90">{zone.description}</span>
                  </LeafletTooltip>
                </Circle>
              ))}

              {TRANSMISSION_LINES.map((line) => (
                <Polyline
                  key={line.id}
                  positions={line.coordinates}
                  pathOptions={{
                    color: line.color,
                    weight: line.voltageKv >= 400 ? 5 : 3,
                    opacity: 0.9,
                    dashArray: '1 0',
                  }}
                >
                  <LeafletTooltip sticky>
                    <span className="text-[11px] font-semibold text-amber-100">{line.name}</span>
                    <br />
                    <span className="text-[10px] text-amber-50/90">Overhead / onshore transmission · {line.voltageKv} kV</span>
                  </LeafletTooltip>
                </Polyline>
              ))}

              {SEISMIC_EVENTS.map((event) => (
                <Circle
                  key={event.id}
                  center={[event.lat, event.lng]}
                  radius={event.magnitude * 4200}
                  pathOptions={{
                    color: '#f97316',
                    fillColor: '#ea580c',
                    fillOpacity: 0.16,
                    weight: 2,
                  }}
                >
                  <LeafletTooltip sticky>
                    <span className="text-[11px] font-semibold">M{event.magnitude} seismic event</span>
                    <br />
                    <span className="text-[10px]">{event.region}</span>
                    <br />
                    <span className="text-[10px] opacity-90">Depth {event.depthKm} km · {event.time.slice(0, 16)}Z</span>
                  </LeafletTooltip>
                </Circle>
              ))}

              {exportCables.map((cable) => (
                <Polyline
                  key={cable.id}
                  positions={cable.coordinates}
                  pathOptions={{
                    color: cable.color,
                    weight: 5,
                    opacity: 0.93,
                    dashArray: '14 12',
                    lineCap: 'round',
                  }}
                >
                  <LeafletTooltip sticky>
                    <span className="text-[11px] font-semibold text-sky-200">{cable.name}</span>
                    <br />
                    <span className="text-[10px] text-sky-100/90">
                      Submarine export · {cable.voltageKv} kV — tie-in at shore landing
                    </span>
                  </LeafletTooltip>
                </Polyline>
              ))}

              {SHIPPING_CORRIDORS.map((lane) => (
                <Polyline
                  key={lane.id}
                  positions={lane.coordinates}
                  pathOptions={{
                    color: lane.color,
                    weight: 4,
                    opacity: 0.85,
                    dashArray: '10 14',
                  }}
                >
                  <LeafletTooltip sticky>
                    <span className="text-[11px] font-semibold">{lane.name}</span>
                    <br />
                    <span className="text-[10px]">Authorized vessel lane — keep clear of mooring fields</span>
                  </LeafletTooltip>
                </Polyline>
              ))}

              {noGoZones.map((z) => (
                <React.Fragment key={z.id}>
                  <Circle
                    center={[z.lat, z.lng]}
                    radius={z.radiusM}
                    pathOptions={{
                      color: '#f87171',
                      fillColor: '#ef4444',
                      fillOpacity: 0.26,
                      weight: 3,
                      lineCap: 'round',
                      dashArray: '10 8',
                    }}
                    eventHandlers={{
                      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.32 }),
                      mouseout: (e) => e.target.setStyle({ fillOpacity: 0.26 }),
                    }}
                  >
                    <LeafletTooltip direction="center" sticky>
                      <span className="text-[12px] font-bold text-red-200 uppercase tracking-wide">{z.title}</span>
                      <br />
                      <span className="text-[11px] text-red-100/90">{z.subtitle}</span>
                      <br />
                      <span className="text-[10px] text-gray-200 mt-1 block">{z.rules}</span>
                    </LeafletTooltip>
                  </Circle>
                  <Circle
                    center={[z.lat, z.lng]}
                    radius={CRITICAL_RADIUS_M}
                    pathOptions={{
                      color: '#fca5a5',
                      fillColor: '#991b1b',
                      fillOpacity: 0.38,
                      weight: 2,
                      dashArray: '4 4',
                    }}
                  >
                    <LeafletTooltip direction="center">
                      <span className="text-[11px] font-semibold text-red-100">Critical footprint (~3 NM)</span>
                      <br />
                      <span className="text-[10px]">No surface traffic — DP &amp; hawser box</span>
                    </LeafletTooltip>
                  </Circle>
                  <Marker
                    position={[z.lat + 0.04, z.lng]}
                    icon={noGoLabelIcon('NO-GO ZONE', z.labelLine2 ?? `${z.title} · 12 NM`)}
                  />
                </React.Fragment>
              ))}

              {COASTAL_GRID_NODES.map((node) => (
                <Marker
                  key={node.id}
                  position={[node.lat, node.lng]}
                  icon={gridNodeIcon(node.shortName, node.voltageKv)}
                  zIndexOffset={600}
                >
                  <Popup>
                    <div className="text-xs min-w-[220px]">
                      <div className="font-display font-bold text-amber-200">{node.name}</div>
                      <div className="text-[10px] text-amber-100/80 mt-1">{node.role}</div>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                        <span className="opacity-60">Voltage</span>
                        <span className="font-semibold">{node.voltageKv} kV</span>
                      </div>
                    </div>
                  </Popup>
                  <LeafletTooltip direction="top" offset={[0, -10]}>
                    <span className="text-[11px] font-semibold text-amber-100">{node.shortName}</span>
                  </LeafletTooltip>
                </Marker>
              ))}

              {WEATHER_BUOYS.map((buoy) => (
                <Marker key={buoy.id} position={[buoy.lat, buoy.lng]} icon={buoyIcon()} zIndexOffset={550}>
                  <Popup>
                    <div className="text-xs min-w-[220px]">
                      <div className="font-display font-bold text-sky-200">{buoy.name}</div>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                        <span className="opacity-60">Wave</span>
                        <span className="font-semibold">{buoy.waveHeightM} m</span>
                        <span className="opacity-60">Current</span>
                        <span className="font-semibold">{buoy.currentKt} kt</span>
                        <span className="opacity-60">Wind</span>
                        <span className="font-semibold">{buoy.windKt} kt</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {PATROL_ASSETS.map((asset) => (
                <Marker key={asset.id} position={[asset.lat, asset.lng]} icon={patrolIcon(asset.type === 'Drone overwatch' ? 'UAV' : 'PATROL')}>
                  <Popup>
                    <div className="text-xs min-w-[220px]">
                      <div className="font-display font-bold text-amber-200">{asset.name}</div>
                      <div className="text-[10px] opacity-70 mt-1">{asset.type}</div>
                      <div className="mt-2 text-[11px]">{asset.heading}</div>
                      <div className="text-[10px] opacity-60 mt-1">{asset.status}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {keyPointPosition && (
                <>
                  <Circle
                    center={keyPointPosition}
                    radius={22000}
                    pathOptions={{
                      color: '#fbbf24',
                      fillColor: '#f59e0b',
                      fillOpacity: 0.08,
                      weight: 2,
                      dashArray: '8 8',
                    }}
                  >
                    <LeafletTooltip sticky>
                      <span className="text-[11px] font-semibold text-amber-100">Preferred deployment point</span>
                      <br />
                      <span className="text-[10px] text-amber-50/90">{recommendedCoordinates.primary}</span>
                    </LeafletTooltip>
                  </Circle>
                  <CircleMarker
                    center={keyPointPosition}
                    radius={10}
                    pathOptions={{
                      color: '#fde68a',
                      fillColor: '#f59e0b',
                      weight: 3,
                      fillOpacity: 0.95,
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

              {scannerVisible && aiScanResults.map((result) => (
                <CircleMarker
                  key={result.id}
                  center={[result.lat, result.lng]}
                  radius={bestScanTarget?.id === result.id ? 9 : 7}
                  pathOptions={{
                    color: result.status.marker,
                    fillColor: '#0f172a',
                    fillOpacity: 0.92,
                    weight: bestScanTarget?.id === result.id ? 4 : 3,
                  }}
                >
                  <LeafletTooltip direction="top" offset={[0, -8]} opacity={0.95}>
                    <span className="text-[11px] font-semibold">{result.name}</span>
                    <br />
                    <span className="text-[10px] opacity-90">AI score {result.score}/100 · {result.status.label}</span>
                  </LeafletTooltip>
                </CircleMarker>
              ))}

              {mapSites.map((site) => (
                <CircleMarker
                  key={site.id}
                  center={[site.lat, site.lng]}
                  radius={12}
                  pathOptions={{
                    color: '#c3f5ff',
                    fillColor: '#10141a',
                    weight: 3,
                    fillOpacity: 0.95,
                  }}
                >
                  <Popup className="!bg-surface-high !text-secondary [&_.leaflet-popup-content-wrapper]:!bg-surface-high">
                    <div className="text-xs min-w-[200px]">
                      <div className="font-display font-bold text-primary">{site.name}</div>
                      <div className="opacity-70 mt-1">{site.role}</div>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                        <span className="opacity-50">Health</span>
                        <span className="text-primary font-bold">{site.healthScore}%</span>
                        <span className="opacity-50">Output</span>
                        <span>{site.powerMw} MWe</span>
                        <span className="opacity-50">Coolant</span>
                        <span>{site.coolantTempC} °C</span>
                      </div>
                      <div className="mt-2 text-[10px] opacity-60">{site.status}</div>
                    </div>
                  </Popup>
                  <LeafletTooltip direction="top" offset={[0, -8]} opacity={0.95}>
                    <span className="text-[11px] font-semibold">{site.name}</span>
                  </LeafletTooltip>
                </CircleMarker>
              ))}
            </MapContainer>

            <div className="absolute top-3 left-3 max-w-[min(100%,280px)] p-3 glass rounded-lg border-2 border-red-500/35 text-[10px] space-y-2.5 pointer-events-none z-[400] bg-red-950/40">
              <div className="font-display font-bold uppercase tracking-[0.15em] text-red-200">NO-GO zones</div>
              <p className="text-[10px] text-red-100/85 leading-relaxed m-0 normal-case tracking-normal">
                Dark red core = critical (~3 NM). Outer red hatched = full 12 NM prohibition — no fishing or
                unauthorized movement.
              </p>
            </div>
            <div className="absolute top-24 left-3 max-w-[min(100%,320px)] p-3 glass rounded-lg border border-primary/20 text-[10px] space-y-2.5 pointer-events-none z-[400] bg-surface-high/70">
              <div className="font-display font-bold uppercase tracking-[0.15em] text-primary flex items-center gap-2">
                <Eye size={12} /> Advanced overlays active
              </div>
              <p className="m-0 text-secondary/80 leading-relaxed normal-case tracking-normal">
                Coastline, bathymetry, surveillance rings, buoy telemetry, patrol assets, and seismic epicenters are now layered into the live operating picture.
              </p>
            </div>
            <div className="absolute bottom-3 left-3 right-3 md:left-auto md:right-3 md:w-72 p-3 glass rounded-lg border border-primary/20 text-[10px] pointer-events-auto z-[400]">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold uppercase tracking-wider text-primary">Legend</div>
                <button
                  type="button"
                  onClick={() => setIsLegendMinimized((current) => !current)}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
                >
                  {isLegendMinimized ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {isLegendMinimized ? 'Expand' : 'Minimize'}
                </button>
              </div>
              {!isLegendMinimized && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 w-4 h-4 rounded-full border-2 border-[#c3f5ff] bg-[#10141a] shrink-0" />
                    FPU / reactor site (click for health)
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 w-7 h-3 rounded border-2 border-red-400/80 bg-red-500/25 shrink-0" />
                    <span>
                      <strong className="text-red-300">NO-GO</strong> — 12 NM surface exclusion (fishing &amp; traffic
                      prohibited)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 w-7 h-3 rounded border border-red-900 bg-red-950/70 shrink-0" />
                    Inner critical zone (~3 NM) — DP / hawser footprint
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 w-8 h-1 bg-emerald-400/90 shrink-0" style={{ borderStyle: 'dashed' }} />
                    Authorized shipping corridor — stay on line; do not cut through NO-GO
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-surface-highest/60">
                    <span className="inline-block mt-0.5 w-8 h-1 bg-amber-400 shrink-0 rounded-sm" />
                    <span>
                      <strong className="text-amber-200">Transmission</strong> — coastal / onshore grid (400 / 132 kV
                      illustrative)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-100 shrink-0" />
                    Preferred deployment point
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 w-4 h-4 rounded-full border-2 border-emerald-300 bg-slate-900 shrink-0" />
                    AI scan candidate marker
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 w-8 h-1 bg-sky-400 shrink-0" style={{ borderStyle: 'dashed' }} />
                    <span>
                      <strong className="text-sky-200">Subsea export cables</strong> — FPU → shore landing (grid
                      infrastructure)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 w-8 h-1 bg-white shrink-0" style={{ borderStyle: 'dashed' }} />
                    Coastline trace and shelf contours
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 w-4 h-4 rounded-full bg-orange-500/70 shrink-0" />
                    Seismic event footprint
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-sky-400 text-[8px] font-bold text-slate-900 shrink-0">
                      BUOY
                    </span>
                    Metocean buoy feed and patrol markers
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-amber-400 text-[8px] font-bold text-stone-900 shrink-0">
                      GIS
                    </span>
                    Substations / shore landing — coastal grid nodes (click marker)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 bg-surface-high rounded-xl border border-surface-highest">
            <h3 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2 m-0 mb-4">
              <Shield size={14} /> Reactor fleet health &amp; reference
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider opacity-50 border-b border-surface-highest">
                    <th className="py-2 pr-3">Unit</th>
                    <th className="py-2 pr-3">Health</th>
                    <th className="py-2 pr-3">Power</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Map</th>
                  </tr>
                </thead>
                <tbody>
                  {reactorSites.map((site) => (
                    <tr key={site.id} className="border-b border-surface-low hover:bg-surface-low/40">
                      <td className="py-3 pr-3 font-medium text-primary">{site.name}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`font-display font-bold ${
                            site.healthScore >= 95 ? 'text-accent-emerald' : 'text-primary'
                          }`}
                        >
                          {site.healthScore}%
                        </span>
                      </td>
                      <td className="py-3 pr-3">{site.powerMw} MWe</td>
                      <td className="py-3 pr-3 opacity-80 max-w-[200px]">{site.status}</td>
                      <td className="py-3 text-[10px] opacity-60">
                        {site.onRegionalMap ? 'Plotted' : 'List only (non-regional)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-secondary/80 leading-relaxed border-t border-surface-low pt-4">
              <div className="flex gap-2 min-w-[200px]">
                <Anchor size={16} className="text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-primary">Mooring protection:</strong> moving and fishing vessels must not
                  enter amber exclusion envelopes or cross active hawser patterns — use green/cyan corridors only.
                </span>
              </div>
              <div className="flex gap-2 min-w-[200px]">
                <Ship size={16} className="text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-primary">Traffic separation:</strong> supply and transit traffic is
                  charted to avoid disturbing DP station-keeping and intake screens.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
