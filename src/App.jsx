import React, { useState } from 'react';
import { Shield, Map as MapIcon, Info, ChevronRight, Settings, Radio } from 'lucide-react';
import { TECHNOLOGY_OPTIONS, GEOLOGICAL_DATA, RECOMMENDATION } from './data/platform-data';
import { REACTOR_SITES as REFERENCE_REACTOR_SITES } from './data/monitoring-data';
import { COMPETITION_QUESTIONS } from './data/competition-brief';
import TechReview from './components/TechReview';
import HazardMap from './components/HazardMap';
import Recommendation from './components/Recommendation';
import Monitoring from './components/Monitoring';
import NariAssistant from './components/NariAssistant';
import NamibiaReactorLogo from './components/NamibiaReactorLogo';

const TAB_ICONS = [Settings, MapIcon, ChevronRight];

const MONITOR_TAB = {
  id: 'monitor',
  shortLabel: 'LIVE',
  label: 'Monitoring',
  icon: Radio,
};

const BASIN_MONITORING_LAYOUTS = {
  orange: {
    anchor: { lat: -28.15, lng: 14.12 },
    landfall: { lat: -27.28, lng: 14.78 },
    offsets: [
      [0, 0],
      [-0.07, -0.04],
      [0.06, 0.06],
      [-0.12, 0.03],
      [0.1, -0.08],
    ],
  },
  luderitz: {
    anchor: { lat: -26.63, lng: 14.94 },
    landfall: { lat: -26.58, lng: 15.16 },
    offsets: [
      [0, 0],
      [-0.05, 0.06],
      [0.07, -0.05],
      [-0.11, 0.02],
      [0.12, 0.08],
    ],
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parsePercent = (value, fallback) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const createCableCoordinates = (start, end) => [
  [start.lat, start.lng],
  [start.lat + (end.lat - start.lat) * 0.28, start.lng + (end.lng - start.lng) * 0.22],
  [start.lat + (end.lat - start.lat) * 0.58, start.lng + (end.lng - start.lng) * 0.63],
  [end.lat, end.lng],
];

const buildMonitoringAssets = (basins) => {
  const dynamicSites = basins.flatMap((basin) => {
    const layout = BASIN_MONITORING_LAYOUTS[basin.id] ?? BASIN_MONITORING_LAYOUTS.orange;

    return (basin.reactors ?? []).map((reactor, index) => {
      const offset = layout.offsets[index] ?? [0.05 * (index + 1), index % 2 === 0 ? 0.04 : -0.04];
      const lat = reactor.lat ?? layout.anchor.lat + offset[0];
      const lng = reactor.lng ?? layout.anchor.lng + offset[1];
      const efficiencyScore = parsePercent(reactor.efficiency, 92);

      return {
        id: reactor.id,
        name: `${basin.name} — ${reactor.name}`,
        reactorLabel: reactor.name,
        basinId: basin.id,
        basinName: basin.name,
        role: reactor.role ?? `${basin.name} deployment` ,
        lat,
        lng,
        healthScore: reactor.healthScore ?? clamp(Math.round(efficiencyScore), 80, 99),
        status: reactor.status ?? `Operational · next repair ${reactor.nextRepair}`,
        powerMw: reactor.powerMw ?? 70,
        coolantTempC: reactor.coolantTempC ?? 280 + index * 4,
        lastTelemetry: reactor.lastTelemetry ?? '2026-04-04T08:10:00Z',
        onRegionalMap: reactor.onRegionalMap ?? true,
      };
    });
  });

  const noGoZones = dynamicSites
    .filter((site) => site.onRegionalMap)
    .map((site) => ({
      id: `ng-${site.id}`,
      reactorId: site.id,
      title: `NO-GO — ${site.reactorLabel}`,
      subtitle: '12 NM radius · mooring & intake protection',
      labelLine2: `${site.reactorLabel} · 12 NM`,
      lat: site.lat,
      lng: site.lng,
      radiusM: 22224,
      rules: 'No fishing, no drifting, no anchoring; authorized traffic only via charted corridors.',
    }));

  const exportCables = dynamicSites
    .filter((site) => site.onRegionalMap)
    .map((site, index) => {
      const layout = BASIN_MONITORING_LAYOUTS[site.basinId] ?? BASIN_MONITORING_LAYOUTS.orange;

      return {
        id: `exp-${site.id}`,
        name: `Export cable ${index + 1} — ${site.reactorLabel} → landfall`,
        voltageKv: 275,
        fromReactorId: site.id,
        color: index % 2 === 0 ? '#38bdf8' : '#7dd3fc',
        coordinates: createCableCoordinates(site, layout.landfall),
      };
    });

  return {
    reactorSites: [
      ...dynamicSites,
      ...REFERENCE_REACTOR_SITES.filter((site) => !site.onRegionalMap),
    ],
    noGoZones,
    exportCables,
  };
};

const App = () => {
  const [activeTab, setActiveTab] = useState('review');
  const [showIntro, setShowIntro] = useState(true);
  const [basins, setBasins] = useState(GEOLOGICAL_DATA.basins);

  const briefNavTabs = COMPETITION_QUESTIONS.map((q, i) => ({
    id: q.tab,
    shortLabel: q.shortLabel,
    label: q.tabLabel,
    icon: TAB_ICONS[i],
  }));

  const navTabs = [...briefNavTabs, MONITOR_TAB];
  const monitoringAssets = buildMonitoringAssets(basins);
  const nariSiteData = {
    questions: COMPETITION_QUESTIONS,
    technologyOptions: TECHNOLOGY_OPTIONS,
    basins,
    recommendation: RECOMMENDATION,
    monitoringAssets,
  };

  const openBriefSection = (tabId) => {
    setActiveTab(tabId);
    setShowIntro(false);
  };

  const handleAddReactor = (basinId, reactor) => {
    setBasins((currentBasins) =>
      currentBasins.map((basin) =>
        basin.id === basinId
          ? {
              ...basin,
              reactors: [...(basin.reactors ?? []), reactor],
            }
          : basin
      )
    );
  };

  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary p-6 pb-16">
        <div className="max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium tracking-wider uppercase">
            <Shield size={16} /> Technical Decision Support Environment
          </div>
          <h1 className="text-5xl md:text-7xl font-display leading-[1.1]">
            Namibia Coastal FPU / <br />
            <span className="text-secondary opacity-60">Marine SMR Platform</span>
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
            Integrating advanced reactor technology, geological hazard intelligence, and
            site-suitability modeling for the Namibian energy strategy.
          </p>

          <div className="w-full max-w-5xl mx-auto pt-2 text-left space-y-4">
            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-primary/70 font-semibold">
              Case study brief — three required competition questions
            </p>
            <p className="text-center text-xs text-secondary/80 max-w-2xl mx-auto leading-relaxed">
              Each main section below corresponds to one jury question from the participant instructions, in order.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMPETITION_QUESTIONS.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-col rounded-lg bg-surface-low p-5 outline outline-1 outline-[#3b494c]/15"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-sm text-primary/70 uppercase tracking-[0.2em]">Section</span>
                    <span className="text-[10px] uppercase tracking-wider text-secondary/50">→ {q.tabLabel}</span>
                  </div>
                  <p className="mt-3 text-sm font-display font-medium text-primary/95 leading-snug">{q.sectionTitle}</p>
                  <p className="mt-2 flex-1 text-[11px] leading-relaxed text-secondary/85 line-clamp-5 md:line-clamp-none">
                    {q.brief}
                  </p>
                  <button
                    type="button"
                    onClick={() => openBriefSection(q.tab)}
                    className="mt-4 w-full btn-primary text-xs py-2.5"
                  >
                    Open {q.tabLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowIntro(false)}
              className="btn-primary flex items-center gap-2 group"
            >
              Enter command center (full dashboard){' '}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => openBriefSection('monitor')}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <Radio size={18} /> Open live monitoring (seismic &amp; maritime map)
            </button>
          </div>
        </div>

        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-secondary font-sans flex flex-col">
      <header className="min-h-16 border-b border-surface-high glass sticky top-0 z-50 px-4 md:px-6 flex flex-wrap items-center justify-between gap-y-3 py-2">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 shrink-0 bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
            <NamibiaReactorLogo className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-display m-0 leading-none truncate">MARITIME ENERGY COMMAND</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">
              Namibia Offshore Initiative · Core sections + LIVE monitoring
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex gap-1 flex-1 justify-center flex-wrap max-w-4xl" aria-label="Main sections">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-high text-primary outline outline-1 outline-primary/30'
                  : 'hover:bg-surface-low outline outline-1 outline-transparent'
              }`}
            >
              <tab.icon size={16} className="opacity-80" />
              <span className="text-sm font-semibold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex lg:hidden gap-1 overflow-x-auto max-w-full w-full justify-center no-scrollbar order-last basis-full sm:order-none sm:basis-auto">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab.id ? 'bg-surface-high text-primary' : 'text-secondary/70 hover:bg-surface-low'
              }`}
            >
              <tab.icon size={14} />
              <span className="truncate max-w-[5.5rem] sm:max-w-none">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex px-3 py-1 bg-accent-emerald/10 border border-accent-emerald/20 rounded items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-accent-emerald">System Nominal</span>
          </div>
          <button type="button" className="p-2 hover:bg-surface-high rounded-full transition-colors" aria-label="About">
            <Info size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
        {activeTab === 'review' && <TechReview options={TECHNOLOGY_OPTIONS} />}
        {activeTab === 'map' && <HazardMap data={{ ...GEOLOGICAL_DATA, basins }} onAddReactor={handleAddReactor} recommendedCoordinates={RECOMMENDATION.recommendedCoordinates} />}
        {activeTab === 'final' && <Recommendation data={RECOMMENDATION} basins={basins} options={TECHNOLOGY_OPTIONS} />}
        {activeTab === 'monitor' && (
          <Monitoring
            reactorSites={monitoringAssets.reactorSites}
            noGoZones={monitoringAssets.noGoZones}
            exportCables={monitoringAssets.exportCables}
            recommendedCoordinates={RECOMMENDATION.recommendedCoordinates}
          />
        )}
      </main>

      <footer className="p-6 border-t border-surface-high flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between opacity-60 text-[10px] uppercase tracking-widest">
        <div>© 2026 Sovereign Intelligence Group</div>
        <div className="text-[9px] normal-case tracking-normal max-w-xl text-secondary/90 leading-relaxed">
          Case study sections: Tech Review, Hazard Analysis, Recommendation (full question text at top of
          each). LIVE Monitoring adds seismic / natural-hazard watch and maritime safety over reactor positions.
        </div>
        <div className="flex flex-wrap gap-4 italic">
          <span>Lat: 22.95S</span>
          <span>Lon: 14.50E</span>
          <span>Depth: 2,800m (Avg)</span>
        </div>
      </footer>

      <NariAssistant siteData={nariSiteData} />
    </div>
  );
};

export default App;
