export const TECHNOLOGY_OPTIONS = [
  {
    id: "fpu-ac",
    name: "Floating Power Unit (Advanced)",
    type: "Barge-Mounted PWR",
    output: "70 MWe (Dual units)",
    deployment: "Moored barge / nearshore",
    maturity: "Ready / Commissioned",
    suitability: 95,
    advantages: "Rapid deployment, mobile, minimal land use, proven in Russian Arctic.",
    limitations: "Higher maintenance in corrosive marine environment, mooring complexity.",
    description: "A mobile, autonomous power unit based on naval reactor technology. Ideal for remote industrial hubs and desalination.",
    readiness: "Operational (Akademik Lomonosov precedent)"
  },
  {
    id: "msmr-1",
    name: "Marine SMR Concept",
    type: "Modular SMR (High-Density)",
    output: "150-300 MWe",
    deployment: "Semi-submersible or fixed jacket",
    maturity: "Developmental / Prototype",
    suitability: 88,
    advantages: "Scalable, high energy density, integrated cooling system.",
    limitations: "Complex regulatory landscape, high upfront R&D costs.",
    description: "Small Modular Reactors adapted precisely for marine platforms, offering significantly higher output than first-gen barges.",
    readiness: "Pre-commercial"
  },
  {
    id: "offshore-v-p",
    name: "Deepwater Floating Station",
    type: "Liquid Metal / Gas Cooled",
    output: "100 MWe",
    deployment: "TLP (Tension Leg Platform)",
    maturity: "Conceptual",
    suitability: 82,
    advantages: "Ultra-deepwater operation, passive safety, low pressure.",
    limitations: "Unproven deployment at scale, technical maintenance challenges.",
    description: "Innovative SMR deployment using oil-and-gas style hulls for deepwater stability and safety.",
    readiness: "Conceptual"
  }
];

export const GEOLOGICAL_DATA = {
  basins: [
    {
      id: "orange",
      name: "Orange Basin",
      hazard: "LOW (0.017–0.045 g PGA)",
      tectonic: "Stable Passive Margin",
      status: "Optimal Zone",
      description: "Primary target for FPU deployment. Seismically quiet with stable substrate.",
      recommendation: "High / Primary",
      score: 98,
      reactors: [
        {
          id: "orange-r1",
          name: "Reactor 1",
          efficiency: "96.4%",
          lifespan: "60 years",
          energyProduced: "12.6 TWh",
          nextRepair: "14 Nov 2026",
          nuclearWaste: "6.1 t spent fuel equivalent"
        },
        {
          id: "orange-r2",
          name: "Reactor 2",
          efficiency: "96.0%",
          lifespan: "60 years",
          energyProduced: "12.2 TWh",
          nextRepair: "03 Mar 2027",
          nuclearWaste: "6.3 t spent fuel equivalent"
        }
      ],
      mapView: {
        center: [-28.12, 14.42],
        zoom: 8
      },
      mapOverlay: {
        coastline: [
          [-26.72, 15.02],
          [-27.1, 14.96],
          [-27.56, 14.86],
          [-28.03, 14.69],
          [-28.46, 14.54],
          [-28.95, 14.34],
          [-29.34, 14.18]
        ],
        landPolygon: [
          [-26.45, 16.25],
          [-26.45, 15.04],
          [-26.72, 15.02],
          [-27.1, 14.96],
          [-27.56, 14.86],
          [-28.03, 14.69],
          [-28.46, 14.54],
          [-28.95, 14.34],
          [-29.34, 14.18],
          [-29.75, 16.25]
        ],
        shelfBreak: [
          [-26.9, 14.48],
          [-27.4, 14.34],
          [-27.86, 14.16],
          [-28.35, 13.96],
          [-28.86, 13.72]
        ],
        reactorLayout: {
          anchor: [-28.15, 14.12],
          offsets: [
            [0, 0],
            [-0.07, -0.04],
            [0.06, 0.06],
            [-0.12, 0.03],
            [0.09, -0.08]
          ]
        },
        terrainFeatures: [
          {
            id: "orange-shoreline",
            label: "Atlantic shoreline",
            type: "coast",
            lat: -27.98,
            lng: 14.67,
            detail: "Coastal break where land ends and Atlantic surface conditions begin."
          },
          {
            id: "orange-dunes",
            label: "Namib dune belt",
            type: "land",
            lat: -27.82,
            lng: 14.98,
            detail: "Arid dune field and coastal plain dominating the onshore landscape."
          },
          {
            id: "orange-shelf",
            label: "Shelf edge",
            type: "ocean",
            lat: -28.18,
            lng: 14.02,
            detail: "Rapid bathymetric drop toward the deepwater operating box."
          },
          {
            id: "orange-ops",
            label: "Deepwater ops box",
            type: "reactor",
            lat: -28.18,
            lng: 14.1,
            detail: "Preferred floating reactor envelope with low seismic disturbance."
          }
        ],
        thermoScan: {
          sensor: "Thermo-rad Cam Mk IV",
          lastSweep: "04 Apr 2026 · 09:10 UTC",
          status: "No critical radiological release detected",
          hotspots: [
            {
              id: "orange-hotspot-1",
              label: "Cooling plume thermal wake",
              lat: -28.11,
              lng: 14.18,
              radiusM: 3600,
              medium: "ocean",
              severity: "watch",
              radiation: "0.06 mSv/h",
              temperature: "+3.2 C above baseline",
              note: "Thermal signature matches controlled discharge mixing offshore."
            },
            {
              id: "orange-hotspot-2",
              label: "Shoreline trace survey",
              lat: -27.95,
              lng: 14.72,
              radiusM: 2200,
              medium: "land",
              severity: "nominal",
              radiation: "Background only",
              temperature: "+0.4 C above baseline",
              note: "No spill migration detected across the coastal landfall corridor."
            }
          ]
        }
      }
    },
    {
      id: "luderitz",
      name: "Luderitz Basin",
      hazard: "LOW (0.030–0.055 g PGA)",
      tectonic: "Stable Substrate",
      status: "Secondary Zone",
      description: "Suitable for nearshore deployment near Kudu field. Some coastal tsunami exposure.",
      recommendation: "Medium / Secondary",
      score: 85,
      reactors: [
        {
          id: "luderitz-r1",
          name: "Reactor 1",
          efficiency: "92.1%",
          lifespan: "55 years",
          energyProduced: "9.8 TWh",
          nextRepair: "08 Feb 2027",
          nuclearWaste: "6.9 t spent fuel equivalent"
        },
        {
          id: "luderitz-r2",
          name: "Reactor 2",
          efficiency: "91.5%",
          lifespan: "55 years",
          energyProduced: "9.5 TWh",
          nextRepair: "19 Jun 2027",
          nuclearWaste: "7.2 t spent fuel equivalent"
        }
      ],
      mapView: {
        center: [-26.76, 15.02],
        zoom: 9
      },
      mapOverlay: {
        coastline: [
          [-25.95, 15.15],
          [-26.24, 15.08],
          [-26.56, 15.02],
          [-26.88, 14.89],
          [-27.14, 14.78],
          [-27.42, 14.62]
        ],
        landPolygon: [
          [-25.7, 15.95],
          [-25.7, 15.18],
          [-25.95, 15.15],
          [-26.24, 15.08],
          [-26.56, 15.02],
          [-26.88, 14.89],
          [-27.14, 14.78],
          [-27.42, 14.62],
          [-27.8, 15.95]
        ],
        shelfBreak: [
          [-26.02, 14.7],
          [-26.34, 14.62],
          [-26.62, 14.52],
          [-26.92, 14.38],
          [-27.2, 14.26]
        ],
        reactorLayout: {
          anchor: [-26.63, 14.94],
          offsets: [
            [0, 0],
            [-0.05, 0.06],
            [0.07, -0.05],
            [-0.11, 0.02],
            [0.12, 0.08]
          ]
        },
        terrainFeatures: [
          {
            id: "luderitz-shoreline",
            label: "Rocky shoreline",
            type: "coast",
            lat: -26.54,
            lng: 15.03,
            detail: "Narrow coastal edge where Atlantic surf meets exposed rock and harbor approaches."
          },
          {
            id: "luderitz-port",
            label: "Luderitz coastal corridor",
            type: "land",
            lat: -26.64,
            lng: 15.16,
            detail: "Industrial logistics strip linking port, shore landing, and support yards."
          },
          {
            id: "luderitz-shelf",
            label: "Shelf transition",
            type: "ocean",
            lat: -26.73,
            lng: 14.64,
            detail: "Continental shelf transition into deeper, more stable floating deployment water."
          },
          {
            id: "luderitz-ops",
            label: "Secondary reactor lane",
            type: "reactor",
            lat: -26.66,
            lng: 14.95,
            detail: "Secondary deployment lane with manageable tsunami exposure and port access."
          }
        ],
        thermoScan: {
          sensor: "Thermo-rad Cam Mk IV",
          lastSweep: "04 Apr 2026 · 09:05 UTC",
          status: "Minor offshore anomaly under watch; no land contamination",
          hotspots: [
            {
              id: "luderitz-hotspot-1",
              label: "Warm eddy around coolant outlet",
              lat: -26.59,
              lng: 14.99,
              radiusM: 3000,
              medium: "ocean",
              severity: "watch",
              radiation: "0.08 mSv/h",
              temperature: "+4.1 C above baseline",
              note: "Localized plume remains within the offshore mixing allowance."
            },
            {
              id: "luderitz-hotspot-2",
              label: "Landfall gamma sweep",
              lat: -26.57,
              lng: 15.12,
              radiusM: 1800,
              medium: "land",
              severity: "nominal",
              radiation: "Background only",
              temperature: "+0.2 C above baseline",
              note: "Thermal camera confirms no spill trace at the shore support compound."
            }
          ]
        }
      }
    }
  ],
  hazards: [
    {
      title: "Seismic Safety",
      description: "Namibia is on a stable passive margin with no active offshore subduction zone.",
      icon: "activity"
    },
    {
      title: "Tsunami Warning",
      description: "Remote tsunami sources allow 4–10 hours of warning time for passive margins.",
      icon: "waves"
    }
  ]
};

export const RECOMMENDATION = {
  zone: "Orange Basin Ultradeepwater",
  distance: "290–320 km SW of Luderitz",
  depth: "2,600–3,300 m",
  reason: "Maximum tectonic stability, zero active faults, and optimal separation from coastal hazards.",
  recommendedCoordinates: {
    primary: "23.3650° S, 14.4830° E",
    lat: -23.365,
    lng: 14.483,
    label: "Preferred deployment point — nearest lagoon",
    note: "After considering the current environmental reports and research findings, the preferred deployment area is positioned at the nearest lagoon reference point near Sandwich Harbour Lagoon as the key siting location.",
  },
  capacity: "200-400 MWe (Phased)",
  fpuType: {
    name: "Dual-unit advanced floating power unit",
    reactorClass: "Barge-mounted pressurized water reactor",
    whySelected:
      "Chosen because it combines near-term deployability, proven marine reactor practice, modular expansion, and a strong fit for Namibia's offshore industrial corridor.",
  },
  capacityCalculation: [
    {
      label: "Initial baseload block",
      value: "2 x 70 MWe = 140 MWe",
      detail: "Two proven floating reactors provide the first reliable baseload package for coastal industry and desalination.",
    },
    {
      label: "Operational reserve and parasitic load allowance",
      value: "+ 20-30 MWe margin",
      detail: "Reserve capacity covers maintenance windows, marine systems, pumping, and emergency operating headroom.",
    },
    {
      label: "Industrial and desalination growth phase",
      value: "+ 60-230 MWe modular expansion",
      detail: "Additional floating modules or higher-density marine SMR blocks scale supply toward mining, ports, synthetic fuels, and grid support.",
    },
  ],
  benefitsAssessment: [
    {
      title: "Namibia power-system value",
      detail: "Floating nuclear baseload stabilizes coastal demand centers and reduces exposure to imported power volatility or inland transmission bottlenecks.",
    },
    {
      title: "Water and industrial resilience",
      detail: "The selected FPU supports desalination and high-load industrial processing in arid regions where water security and stable electricity are tightly linked.",
    },
    {
      title: "Offshore energy integration",
      detail: "Marine siting aligns with Orange Basin logistics, future offshore petroleum support, port activity, and possible hydrogen production corridors.",
    },
  ],
  socioEconomicBenefits: [
    {
      title: "Job creation and skills transfer",
      detail: "Creates demand for marine engineering, reactor operations, port services, safety oversight, and technical training partnerships in Namibia.",
    },
    {
      title: "Mining and processing competitiveness",
      detail: "Reliable fixed-output electricity improves the economics of uranium, critical minerals, refining, and export-oriented industrial projects.",
    },
    {
      title: "Regional development uplift",
      detail: "Strengthens coastal towns through better infrastructure, water availability, logistics throughput, and long-term industrial confidence.",
    },
    {
      title: "Strategic energy sovereignty",
      detail: "Supports a more self-directed national energy strategy with less dependence on external supply constraints during growth cycles.",
    },
  ],
  useCases: [
    "Industrial Electricity Supply (Mining/Refining)",
    "Coastal Desalination Support",
    "Port Logistics Hub Powering",
    "Regional Grid Stabilization"
  ]
};
