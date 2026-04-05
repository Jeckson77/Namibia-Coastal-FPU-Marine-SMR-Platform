import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Droplets,
  Factory,
  Gauge,
  Landmark,
  Shield,
  SlidersHorizontal,
  TrendingUp,
  Waves,
  Zap,
  Anchor,
} from 'lucide-react';
import CompetitionQuestionBanner from './CompetitionQuestionBanner';
import { exportDecisionReport } from '../utils/exportDecisionReport';

const TECH_ECONOMICS = {
  'fpu-ac': {
    unitMw: 70,
    capexPerMw: 6200000,
    opexPerMWh: 36,
    defaultAvailabilityPct: 93,
    waterM3PerDayPerMw: 240,
    waterValueUsdPerM3: 1.45,
  },
  'msmr-1': {
    unitMw: 150,
    capexPerMw: 7100000,
    opexPerMWh: 33,
    defaultAvailabilityPct: 94,
    waterM3PerDayPerMw: 225,
    waterValueUsdPerM3: 1.45,
  },
  'offshore-v-p': {
    unitMw: 100,
    capexPerMw: 8400000,
    opexPerMWh: 42,
    defaultAvailabilityPct: 90,
    waterM3PerDayPerMw: 210,
    waterValueUsdPerM3: 1.45,
  },
};

const BASIN_BASELINES = {
  orange: {
    baseDemandMw: 180,
    capexMultiplier: 1,
    riskPenalty: 2,
    logisticsReadiness: 'High',
  },
  luderitz: {
    baseDemandMw: 145,
    capexMultiplier: 1.08,
    riskPenalty: 6,
    logisticsReadiness: 'Medium',
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000000000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000000000 ? 1 : 0,
  }).format(value);

const formatNumber = (value, digits = 1) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const Recommendation = ({ data, basins = [], options = [] }) => {
  const defaultTechnologyId = options[0]?.id ?? 'fpu-ac';
  const [scenario, setScenario] = useState({
    basinId: basins[0]?.id ?? 'orange',
    technologyId: defaultTechnologyId,
    unitCount: 2,
    availabilityPct: TECH_ECONOMICS[defaultTechnologyId]?.defaultAvailabilityPct ?? 93,
    industryGrowthPct: 32,
    desalinationSharePct: 18,
    tariffUsdPerMWh: 128,
  });

  const selectedBasin = basins.find((basin) => basin.id === scenario.basinId) ?? basins[0];
  const selectedTechnology = options.find((option) => option.id === scenario.technologyId) ?? options[0];
  const techMetrics = TECH_ECONOMICS[selectedTechnology?.id] ?? TECH_ECONOMICS['fpu-ac'];
  const basinMetrics = BASIN_BASELINES[selectedBasin?.id] ?? BASIN_BASELINES.orange;

  const installedMw = scenario.unitCount * techMetrics.unitMw;
  const annualGenerationGWh = installedMw * 8.76 * (scenario.availabilityPct / 100);
  const gridSupplyGWh = annualGenerationGWh * (1 - scenario.desalinationSharePct / 100);
  const waterOutputM3PerDay = installedMw * (scenario.desalinationSharePct / 100) * techMetrics.waterM3PerDayPerMw;
  const demandTargetMw = basinMetrics.baseDemandMw * (1 + scenario.industryGrowthPct / 100);
  const capexUsd = installedMw * techMetrics.capexPerMw * basinMetrics.capexMultiplier;
  const annualOpexUsd = annualGenerationGWh * 1000 * techMetrics.opexPerMWh;
  const annualEnergyRevenueUsd = gridSupplyGWh * 1000 * scenario.tariffUsdPerMWh;
  const annualWaterValueUsd = waterOutputM3PerDay * 365 * techMetrics.waterValueUsdPerM3;
  const annualCashFlowUsd = annualEnergyRevenueUsd + annualWaterValueUsd - annualOpexUsd;
  const paybackYears = annualCashFlowUsd > 0 ? capexUsd / annualCashFlowUsd : 0;
  const roiTenYearPct = capexUsd > 0 ? ((annualCashFlowUsd * 10 - capexUsd) / capexUsd) * 100 : 0;
  const demandCoveragePct = clamp((installedMw / demandTargetMw) * 100, 0, 180);
  const riskAdjustedScore = clamp(
    Math.round(selectedBasin.score * 0.55 + selectedTechnology.suitability * 0.35 + scenario.availabilityPct * 0.15 - basinMetrics.riskPenalty),
    0,
    100
  );

  const simulatorSummary = {
    installedMw,
    annualGenerationGWh,
    gridSupplyGWh,
    waterOutputM3PerDay,
    capexUsd,
    annualOpexUsd,
    annualEnergyRevenueUsd,
    annualWaterValueUsd,
    annualCashFlowUsd,
    paybackYears,
    roiTenYearPct,
    riskAdjustedScore,
  };

  const handleScenarioChange = (field, value) => {
    setScenario((current) => {
      const nextScenario = {
        ...current,
        [field]: value,
      };

      if (field === 'technologyId') {
        nextScenario.availabilityPct = TECH_ECONOMICS[value]?.defaultAvailabilityPct ?? current.availabilityPct;
      }

      return nextScenario;
    });
  };

  const handleExportPdf = () => {
    exportDecisionReport({
      recommendation: data,
      basins,
      selectedBasin,
      selectedTechnology,
      scenario,
      metrics: simulatorSummary,
    });
  };

  return (
    <div className="bg-background relative overflow-hidden">
      <CompetitionQuestionBanner questionId="q3" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative overflow-hidden">
        <div className="lg:col-span-8 space-y-8">
          <div className="p-10 lg:p-16 bg-surface-high rounded-[32px] border border-surface-highest relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#c3f5ff_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold tracking-widest text-primary uppercase">
                    <Shield size={14} /> Final strategy (unit, capacity, socio-economics)
                  </div>
                  <h1 className="text-4xl md:text-6xl font-display leading-[1.1] mb-3">
                    Optimal Deployment: <br />
                    <span className="text-primary italic">{data.zone}</span>
                  </h1>
                  <p className="text-base opacity-75 max-w-2xl leading-relaxed">{data.reason}</p>
                </div>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/15"
                >
                  <Download size={16} /> Export recommendation + hazard PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
                <div className="p-5 bg-surface-low rounded-2xl border border-surface-high">
                  <div className="text-[10px] uppercase tracking-widest opacity-40">Recommended FPU</div>
                  <div className="mt-2 text-lg font-bold text-white">{data.fpuType.name}</div>
                  <div className="mt-2 text-[11px] opacity-70">{data.fpuType.reactorClass}</div>
                </div>
                <div className="p-5 bg-surface-low rounded-2xl border border-surface-high">
                  <div className="text-[10px] uppercase tracking-widest opacity-40">Static capacity band</div>
                  <div className="mt-2 text-lg font-bold text-white">{data.capacity}</div>
                  <div className="mt-2 text-[11px] opacity-70">Phased package from case-study recommendation</div>
                </div>
                <div className="p-5 bg-surface-low rounded-2xl border border-surface-high">
                  <div className="text-[10px] uppercase tracking-widest opacity-40">Live simulator score</div>
                  <div className="mt-2 text-lg font-bold text-primary">{riskAdjustedScore}/100</div>
                  <div className="mt-2 text-[11px] opacity-70">Basin stability, technology suitability, and availability combined</div>
                </div>
                <div className="p-5 bg-surface-low rounded-2xl border border-primary/20">
                  <div className="text-[10px] uppercase tracking-widest opacity-40">Preferred coordinates</div>
                  <div className="mt-2 text-lg font-bold text-white">{data.recommendedCoordinates?.primary}</div>
                  <div className="mt-2 text-[11px] opacity-70">{data.recommendedCoordinates?.label}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-surface-low rounded-2xl border border-surface-high space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-primary flex items-center gap-2">
                    <Anchor size={14} /> Capacity calculation
                  </h4>
                  <div className="space-y-3">
                    {data.capacityCalculation.map((item) => (
                      <div key={item.label} className="p-4 bg-surface-lowest rounded-xl border border-surface-high">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-sm font-bold text-white">{item.label}</span>
                          <span className="text-[10px] uppercase tracking-widest text-primary">{item.value}</span>
                        </div>
                        <p className="text-[11px] opacity-75 leading-relaxed m-0">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-surface-low rounded-2xl border border-surface-high space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-primary flex items-center gap-2">
                    <Factory size={14} /> Strategic use cases
                  </h4>
                  <ul className="text-xs space-y-3 opacity-80 p-0 m-0 list-none">
                    {data.useCases.map((useCase) => (
                      <li key={useCase} className="flex gap-3">
                        <span className="text-primary font-bold">»</span>
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-surface-high space-y-3">
                    <div className="text-[10px] uppercase tracking-widest opacity-50">Selected basin hazard note</div>
                    <div className="text-sm font-bold text-white">{selectedBasin?.name}</div>
                    <div className="text-[11px] opacity-75 leading-relaxed">{selectedBasin?.mapOverlay?.thermoScan?.status}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-surface-high rounded-2xl border border-surface-highest space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-primary/70 font-semibold">Scenario simulator</div>
                <h3 className="mt-1 text-2xl font-display text-primary">Capacity, desalination, and growth case builder</h3>
              </div>
              <div className="text-[11px] text-secondary/75 max-w-xl">
                Adjust basin, platform, fleet size, availability, demand growth, and desalination share. The ROI dashboard updates immediately from the same scenario assumptions.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <label className="space-y-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest opacity-50 block">Deployment basin</span>
                <select
                  value={scenario.basinId}
                  onChange={(event) => handleScenarioChange('basinId', event.target.value)}
                  className="w-full rounded-xl border border-surface-high bg-surface-lowest px-3 py-3 text-sm text-white outline-none focus:border-primary/35"
                >
                  {basins.map((basin) => (
                    <option key={basin.id} value={basin.id}>{basin.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest opacity-50 block">Platform technology</span>
                <select
                  value={scenario.technologyId}
                  onChange={(event) => handleScenarioChange('technologyId', event.target.value)}
                  className="w-full rounded-xl border border-surface-high bg-surface-lowest px-3 py-3 text-sm text-white outline-none focus:border-primary/35"
                >
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest opacity-50 block">Fleet size</span>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={scenario.unitCount}
                  onChange={(event) => handleScenarioChange('unitCount', Number(event.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-white">{scenario.unitCount} units</div>
              </label>

              <label className="space-y-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest opacity-50 block">Availability</span>
                <input
                  type="range"
                  min="85"
                  max="98"
                  value={scenario.availabilityPct}
                  onChange={(event) => handleScenarioChange('availabilityPct', Number(event.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-white">{scenario.availabilityPct}%</div>
              </label>

              <label className="space-y-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest opacity-50 block">Industrial demand growth</span>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={scenario.industryGrowthPct}
                  onChange={(event) => handleScenarioChange('industryGrowthPct', Number(event.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-white">{scenario.industryGrowthPct}%</div>
              </label>

              <label className="space-y-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest opacity-50 block">Desalination allocation</span>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={scenario.desalinationSharePct}
                  onChange={(event) => handleScenarioChange('desalinationSharePct', Number(event.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-white">{scenario.desalinationSharePct}% of output</div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-surface-high bg-surface-low">
                <div className="text-[10px] uppercase tracking-widest opacity-45">Installed capacity</div>
                <div className="mt-2 text-2xl font-display text-primary">{formatNumber(installedMw, 0)} MWe</div>
              </div>
              <div className="p-4 rounded-xl border border-surface-high bg-surface-low">
                <div className="text-[10px] uppercase tracking-widest opacity-45">Annual generation</div>
                <div className="mt-2 text-2xl font-display text-primary">{formatNumber(annualGenerationGWh)} GWh</div>
              </div>
              <div className="p-4 rounded-xl border border-surface-high bg-surface-low">
                <div className="text-[10px] uppercase tracking-widest opacity-45">Demand target</div>
                <div className="mt-2 text-2xl font-display text-primary">{formatNumber(demandTargetMw, 0)} MW</div>
              </div>
              <div className="p-4 rounded-xl border border-surface-high bg-surface-low">
                <div className="text-[10px] uppercase tracking-widest opacity-45">Coverage</div>
                <div className="mt-2 text-2xl font-display text-primary">{formatNumber(demandCoveragePct, 0)}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 glass rounded-2xl border border-primary/10 space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-primary/70 font-semibold">Cost and ROI dashboard</div>
              <h3 className="mt-1 text-xl font-display">Scenario economics</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-surface-high bg-surface-low px-4 py-4">
                <div className="text-[10px] uppercase tracking-widest opacity-45">CAPEX</div>
                <div className="mt-2 font-bold text-white">{formatCurrency(capexUsd)}</div>
              </div>
              <div className="rounded-xl border border-surface-high bg-surface-low px-4 py-4">
                <div className="text-[10px] uppercase tracking-widest opacity-45">Annual OPEX</div>
                <div className="mt-2 font-bold text-white">{formatCurrency(annualOpexUsd)}</div>
              </div>
              <div className="rounded-xl border border-surface-high bg-surface-low px-4 py-4">
                <div className="text-[10px] uppercase tracking-widest opacity-45">Energy revenue</div>
                <div className="mt-2 font-bold text-white">{formatCurrency(annualEnergyRevenueUsd)}</div>
              </div>
              <div className="rounded-xl border border-surface-high bg-surface-low px-4 py-4">
                <div className="text-[10px] uppercase tracking-widest opacity-45">Water value</div>
                <div className="mt-2 font-bold text-white">{formatCurrency(annualWaterValueUsd)}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-accent-emerald/20 bg-accent-emerald/10 px-4 py-3">
                <div className="flex items-center gap-2 text-accent-emerald"><TrendingUp size={16} /> Annual cash flow</div>
                <span className="font-display text-lg text-accent-emerald">{formatCurrency(annualCashFlowUsd)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
                <div className="flex items-center gap-2 text-primary"><Gauge size={16} /> Simple payback</div>
                <span className="font-display text-lg text-primary">{formatNumber(paybackYears)} yrs</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-surface-high bg-surface-low px-4 py-3">
                <div className="flex items-center gap-2"><Landmark size={16} className="text-primary" /> 10-year ROI</div>
                <span className={`font-display text-lg ${roiTenYearPct >= 0 ? 'text-primary' : 'text-red-300'}`}>{formatNumber(roiTenYearPct)}%</span>
              </div>
            </div>

            <div className="space-y-4 border-t border-surface-high pt-4">
              <div className="flex items-start gap-3 text-sm">
                <SlidersHorizontal size={16} className="text-primary mt-0.5 shrink-0" />
                <span>Higher unit count and availability drive the strongest improvement in payback for Orange Basin scenarios.</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Droplets size={16} className="text-primary mt-0.5 shrink-0" />
                <span>{formatNumber(waterOutputM3PerDay, 0)} m3/day of desalination-equivalent output is enabled by the current allocation.</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Factory size={16} className="text-primary mt-0.5 shrink-0" />
                <span>{formatNumber(gridSupplyGWh)} GWh remains available for grid, industrial, and port demand after water allocation.</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-surface-high rounded-2xl border border-surface-highest space-y-4">
            <h3 className="text-lg font-display">Hazard linkage</h3>
            <div className="rounded-xl border border-surface-high bg-surface-low px-4 py-4">
              <div className="text-[10px] uppercase tracking-widest opacity-45">Selected basin</div>
              <div className="mt-2 text-lg font-bold text-white">{selectedBasin?.name}</div>
              <div className="mt-2 text-[11px] opacity-75 leading-relaxed">{selectedBasin?.description}</div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
              <div className="text-[10px] uppercase tracking-widest text-primary/70">Recommended key point</div>
              <div className="mt-2 text-lg font-bold text-white">{data.recommendedCoordinates?.primary}</div>
              <div className="mt-2 text-[11px] opacity-75 leading-relaxed">{data.recommendedCoordinates?.note}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-surface-high bg-surface-low px-4 py-4">
                <div className="text-[10px] uppercase tracking-widest opacity-45">Hazard band</div>
                <div className="mt-2 font-bold text-white">{selectedBasin?.hazard}</div>
              </div>
              <div className="rounded-xl border border-surface-high bg-surface-low px-4 py-4">
                <div className="text-[10px] uppercase tracking-widest opacity-45">Logistics readiness</div>
                <div className="mt-2 font-bold text-white">{basinMetrics.logisticsReadiness}</div>
              </div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4 text-sm leading-relaxed">
              <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                <Waves size={16} /> Thermo and hazard note
              </div>
              {selectedBasin?.mapOverlay?.thermoScan?.status}
            </div>
          </div>

          <div className="p-8 bg-surface-lowest rounded-2xl border border-surface-high space-y-5">
            <div className="flex items-center justify-between text-xs opacity-70">
              <span>Confidence Index</span>
              <span className="font-display text-primary">{formatNumber((riskAdjustedScore + selectedTechnology.suitability) / 2, 0)}%</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 text-primary">
                  <Zap size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold m-0 mb-1">Energy Independence</h5>
                  <p className="text-[11px] opacity-70 leading-relaxed">Diversification from imported grid power into stable, baseload domestic nuclear energy.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 text-primary">
                  <Waves size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold m-0 mb-1">Water Security</h5>
                  <p className="text-[11px] opacity-70 leading-relaxed">Integrated desalination capability powering the Erongo and Arandis industrial corridors.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 text-primary">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold m-0 mb-1">Industrial Catalysis</h5>
                  <p className="text-[11px] opacity-70 leading-relaxed">Attracting high-value mining and processing investments through reliable fixed-cost energy.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/15"
            >
              <Download size={16} /> Download PDF package
            </button>

            <div className="text-[11px] opacity-60 leading-relaxed">
              Export includes the recommendation basis, current simulator assumptions, ROI output, and hazard-analysis summary for the basin options in this application.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
