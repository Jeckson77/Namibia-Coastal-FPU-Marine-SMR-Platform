import React, { useState } from 'react';
import { Target, Zap, Waves, Settings, Layout, Info } from 'lucide-react';
import CompetitionQuestionBanner from './CompetitionQuestionBanner';

const NAMIBIA_ADVANTAGES = [
  'Floating units can electrify remote mining, desalination, and port corridors without waiting for major inland transmission expansion.',
  'Coastal deployment keeps high-output generation close to Walvis Bay, Luderitz, offshore energy projects, and water-stressed industrial users.',
  'Factory-built modular reactors reduce land disturbance and allow phased deployment as Namibia grows demand in uranium processing, green hydrogen, and marine industry.',
  'Marine siting creates a strong platform for coupled power-and-water production, especially where reliable desalination is strategically important.',
];

const TECHNOLOGICAL_POTENTIAL = [
  'High-capacity baseload generation with a smaller coastal footprint than large conventional land stations.',
  'Mobility and modular hull deployment that can be repositioned, expanded, or serviced with maritime logistics.',
  'Strong fit for hybrid energy systems where nuclear output stabilizes grids supporting renewables, ports, and critical industry.',
  'Potential to support electricity, desalination, synthetic fuel production, and resilient power for remote economic clusters from a single platform.',
];

const TechReview = ({ options }) => {
  const [selectedId, setSelectedId] = useState(options[0].id);
  const selected = options.find(o => o.id === selectedId);

  return (
    <div className="h-full">
      <CompetitionQuestionBanner questionId="q1" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Left List Card */}
      <div className="lg:col-span-4 space-y-4 h-full">
        <div className="p-6 bg-surface-low rounded-xl border border-surface-high">
          <h3 className="uppercase text-[10px] tracking-widest text-primary/60 mb-6 flex items-center gap-2">
            <Layout size={14} /> Technology Matrix
          </h3>
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedId(option.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between ${
                  selectedId === option.id 
                    ? 'bg-surface-high border-primary/40 shadow-lg' 
                    : 'bg-surface-lowest border-surface-high hover:border-primary/20'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white leading-none mb-1">{option.name}</div>
                  <div className="text-[10px] opacity-40 uppercase tracking-wider">{option.type}</div>
                </div>
                {selectedId === option.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6 glass rounded-xl border border-primary/10">
          <h4 className="text-sm font-bold text-primary mb-3">Why FPU / SMR for Namibia?</h4>
          <ul className="text-xs space-y-3 opacity-80 leading-relaxed list-none p-0">
            <li className="flex gap-2">
              <span className="text-primary">01.</span> Modular deployment ensures phased capital expenditure.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">02.</span> Massive desalination potential for arid coastal mining regions.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">03.</span> Direct integration with offshore energy zones (Orange Basin).
            </li>
          </ul>
        </div>

        <div className="p-6 bg-surface-low rounded-xl border border-surface-high">
          <h4 className="text-sm font-bold text-primary mb-3">Technological Potential Of Floating Nuclear Power Units</h4>
          <div className="space-y-3 text-xs opacity-80 leading-relaxed">
            {TECHNOLOGICAL_POTENTIAL.map((item, index) => (
              <div key={item} className="flex gap-2">
                <span className="text-primary">0{index + 1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Detail Card */}
      <div className="lg:col-span-8 flex flex-col h-full">
        <div className="flex-1 bg-surface-high p-8 lg:p-12 rounded-2xl relative overflow-hidden border border-surface-highest">
          {/* Subtle Background Icon */}
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Target size={400} />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 block">SELECTED SYSTEM</span>
                <h1 className="text-4xl md:text-5xl mb-2">{selected.name}</h1>
                <p className="text-lg opacity-70 max-w-xl">{selected.description}</p>
              </div>
              <div className="p-6 bg-surface-lowest rounded-xl border border-primary/10 text-center min-w-[120px]">
                <div className="text-primary text-3xl font-display leading-none mb-1">{selected.suitability}%</div>
                <div className="text-[9px] uppercase tracking-wider opacity-60">Suitability Index</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="p-4 bg-surface-low rounded-lg border border-surface-high">
                <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">OUTPUT CLASS</span>
                <span className="text-lg font-bold text-white">{selected.output}</span>
              </div>
              <div className="p-4 bg-surface-low rounded-lg border border-surface-high">
                <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">READINESS</span>
                <span className="text-lg font-bold text-white">{selected.readiness}</span>
              </div>
              <div className="p-4 bg-surface-low rounded-lg border border-surface-high">
                <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">HULL TYPE</span>
                <span className="text-lg font-bold text-white">{selected.deployment}</span>
              </div>
              <div className="p-4 bg-surface-low rounded-lg border border-surface-high">
                <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">REACTOR</span>
                <span className="text-lg font-bold text-white">{selected.type.split(' ')[0]}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                  <Zap size={14} /> Core Advantages
                </h4>
                <p className="text-sm opacity-80 leading-relaxed indent-4">{selected.advantages}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                  <Info size={14} /> Constraints / Risks
                </h4>
                <p className="text-sm opacity-80 leading-relaxed indent-4">{selected.limitations}</p>
              </div>
            </div>

            <div className="mt-10 p-6 bg-surface-low rounded-xl border border-surface-high">
              <h4 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                <Waves size={14} /> Key Advantages For Remote And Coastal Areas Of Namibia
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NAMIBIA_ADVANTAGES.map((item) => (
                  <div key={item} className="p-4 bg-surface-lowest rounded-lg border border-surface-high text-sm opacity-80 leading-relaxed">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-lg">
              <Settings size={20} className="text-primary animate-spin-slow" />
              <div className="text-[10px] uppercase tracking-widest">
                Optimizing telemetry for 2,500m deployment depth in Namibian Orange Basin...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TechReview;
