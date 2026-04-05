/**
 * Demonstration monitoring dataset for the decision-support UI.
 * Coordinates are illustrative for the Namibian / Orange Basin offshore context.
 * Integrate with USGS / IRIS / regional tsunami bulletins for operational use.
 */

export const SEISMIC_EVENTS = [
  {
    id: "se-1",
    time: "2026-04-03T08:14:00Z",
    magnitude: 3.2,
    depthKm: 8,
    distanceKm: 180,
    region: "Passive margin — offshore Luderitz sector",
    lat: -26.98,
    lng: 13.86,
    agency: "Synthetic feed",
    reviewed: true,
  },
  {
    id: "se-2",
    time: "2026-04-02T19:41:00Z",
    magnitude: 4.1,
    depthKm: 22,
    distanceKm: 420,
    region: "Mid-Atlantic Ridge — distant",
    lat: -27.64,
    lng: 11.92,
    agency: "Synthetic feed",
    reviewed: true,
  },
  {
    id: "se-3",
    time: "2026-04-01T06:03:00Z",
    magnitude: 2.4,
    depthKm: 5,
    distanceKm: 95,
    region: "Coastal shelf — micro-seismicity",
    lat: -28.42,
    lng: 14.42,
    agency: "Synthetic feed",
    reviewed: true,
  },
];

/** Last 24 h nominal tremor index (0–100, synthetic for dashboard) */
export const SEISMIC_TREND = [
  { t: "00:00", index: 12 },
  { t: "04:00", index: 14 },
  { t: "08:00", index: 18 },
  { t: "12:00", index: 15 },
  { t: "16:00", index: 11 },
  { t: "20:00", index: 13 },
  { t: "24:00", index: 12 },
];

export const NATURAL_HAZARDS = [
  {
    id: "nh-1",
    severity: "watch",
    title: "Tsunami information",
    detail:
      "No regional tsunami threat for Namibia following distant M7+ source (Pacific). Passive-margin warning time 4–10 h if ever applicable.",
    source: "Protocol — regional bulletins",
  },
  {
    id: "nh-2",
    severity: "advisory",
    title: "Swell / marine weather",
    detail: "Moderate SW swell 2.5–3.5 m. DP station-keeping within design; small craft avoid exclusion envelopes.",
    source: "Marine forecast (illustrative)",
  },
  {
    id: "nh-3",
    severity: "nominal",
    title: "Cyclone / tropical systems",
    detail: "No tropical cyclone tracks within South Atlantic monitoring window affecting mooring routes.",
    source: "Seasonal outlook",
  },
];

export const ALERT_TIMELINE = [
  {
    id: 'alert-1',
    severity: 'critical',
    title: 'Unauthorized trawler crossed outer exclusion boundary',
    detail: 'AIS track entered the Unit A no-go ring for 6 minutes before patrol Sierra redirected the vessel.',
    source: 'AIS + patrol confirmation',
    timeLabel: '09:42 UTC',
    transition: 'Watch → Critical',
    active: true,
  },
  {
    id: 'alert-2',
    severity: 'advisory',
    title: 'Swell state raised DP fuel margin consumption',
    detail: 'Wave height trend moved above 3.3 m and station-keeping reserve assumptions were updated.',
    source: 'Met buoy Bravo',
    timeLabel: '08:55 UTC',
    transition: 'Nominal → Advisory',
    active: true,
  },
  {
    id: 'alert-3',
    severity: 'watch',
    title: 'Cooling plume temperature drift remains within envelope',
    detail: 'Thermal anomaly expanded 0.6 km down-current but remains below intervention threshold.',
    source: 'Thermal watch box',
    timeLabel: '07:18 UTC',
    transition: 'Nominal → Watch',
    active: true,
  },
  {
    id: 'alert-4',
    severity: 'watch',
    title: 'Micro-seismic event logged on coastal shelf',
    detail: 'Magnitude 2.4 shelf event correlated with no structural alarms on the mooring field.',
    source: 'Synthetic seismic feed',
    timeLabel: '06:03 UTC',
    transition: 'Watch maintained',
    active: false,
  },
  {
    id: 'alert-5',
    severity: 'advisory',
    title: 'Export cable inspection task closed',
    detail: 'ROV visual survey confirmed no abrasion growth at the shore approach section.',
    source: 'Maintenance control',
    timeLabel: 'Yesterday · 21:10 UTC',
    transition: 'Advisory → Resolved',
    active: false,
  },
];

export const AI_SCAN_TARGETS = [
  {
    id: 'scan-1',
    name: 'Sandwich Harbour Lagoon approach',
    lat: -23.365,
    lng: 14.483,
    shelterScore: 22,
    logisticsScore: 19,
    gridTieScore: 16,
    ecologicalPenalty: 8,
    swellPenalty: 5,
    note: 'Lagoon-adjacent approach with strong shelter and favorable coastal access.',
  },
  {
    id: 'scan-2',
    name: 'Northern lagoon shelf pocket',
    lat: -23.29,
    lng: 14.56,
    shelterScore: 18,
    logisticsScore: 17,
    gridTieScore: 14,
    ecologicalPenalty: 10,
    swellPenalty: 7,
    note: 'Good marine access, but slightly higher swell exposure than the main lagoon approach.',
  },
  {
    id: 'scan-3',
    name: 'South shelf transition box',
    lat: -23.54,
    lng: 14.42,
    shelterScore: 14,
    logisticsScore: 16,
    gridTieScore: 13,
    ecologicalPenalty: 6,
    swellPenalty: 9,
    note: 'Stable water column and manageable environmental sensitivity, but farther from shore services.',
  },
  {
    id: 'scan-4',
    name: 'Open-water fallback lane',
    lat: -23.61,
    lng: 14.2,
    shelterScore: 10,
    logisticsScore: 12,
    gridTieScore: 11,
    ecologicalPenalty: 5,
    swellPenalty: 13,
    note: 'Operationally viable fallback corridor with lower congestion, but weaker shelter and higher marine forcing.',
  },
];

/**
 * Reactor / FPU sites shown on the map (case-study deployment + reference point).
 * lat, lng in WGS84.
 */
export const REACTOR_SITES = [
  {
    id: "fpu-a",
    name: "Orange Basin FPU — Unit A",
    role: "Case study — primary mooring",
    lat: -28.15,
    lng: 14.12,
    healthScore: 97,
    status: "Power & cooling nominal",
    powerMw: 70,
    coolantTempC: 286,
    lastTelemetry: "2026-04-03T08:10:00Z",
    onRegionalMap: true,
  },
  {
    id: "fpu-b",
    name: "Orange Basin FPU — Unit B",
    role: "Case study — phased twin",
    lat: -28.22,
    lng: 14.08,
    healthScore: 94,
    status: "Hot standby — reduced load",
    powerMw: 35,
    coolantTempC: 278,
    lastTelemetry: "2026-04-03T08:09:00Z",
    onRegionalMap: true,
  },
  {
    id: "ref-akademik",
    name: "Akademik Lomonosov (reference)",
    role: "Operating marine FPU — Pevek, RU (global precedent)",
    lat: 69.705,
    lng: 170.29,
    healthScore: 99,
    status: "Commercial operation (reference only)",
    powerMw: 70,
    coolantTempC: 290,
    lastTelemetry: "Illustrative — not on regional chart",
    onRegionalMap: false,
  },
];

/**
 * Reactor NO-GO zones: unauthorized surface traffic and fishing prohibited.
 * radiusM ≈ nautical miles × 1852 (12 NM ≈ 22.2 km).
 */
export const NO_GO_ZONES = [
  {
    id: "ng-1",
    reactorId: "fpu-a",
    title: "NO-GO — Unit A",
    subtitle: "12 NM radius · mooring & intake protection",
    lat: -28.15,
    lng: 14.12,
    radiusM: 22224,
    rules: "No fishing, no drifting, no anchoring; authorized traffic only via charted corridors.",
  },
  {
    id: "ng-2",
    reactorId: "fpu-b",
    title: "NO-GO — Unit B",
    subtitle: "12 NM radius · station-keeping safety envelope",
    lat: -28.22,
    lng: 14.08,
    radiusM: 22224,
    rules: "Same as Unit A; crossing hawser fields or DP footprint prohibited.",
  },
];

/** @deprecated use NO_GO_ZONES */
export const EXCLUSION_ZONES = NO_GO_ZONES;

/**
 * Authorized shipping corridors — vessels shall use these tracks so traffic does not
 * cut across mooring fields or disturb station-keeping (fishing fleets routed outside).
 */
export const SHIPPING_CORRIDORS = [
  {
    id: "sc-1",
    name: "Inbound lane — Luderitz supply",
    color: "#4ade80",
    coordinates: [
      [-29.2, 14.95],
      [-28.9, 14.55],
      [-28.5, 14.25],
      [-28.25, 14.15],
    ],
  },
  {
    id: "sc-2",
    name: "E-W transit — clear of moorings",
    color: "#22d3ee",
    coordinates: [
      [-27.9, 13.4],
      [-28.1, 13.85],
      [-28.35, 14.0],
      [-28.5, 14.2],
    ],
  },
];

/**
 * Coastal / onshore grid infrastructure (illustrative layout for the case-study corridor).
 * Coordinates are representative for dashboard integration with utility GIS.
 */
export const COASTAL_GRID_NODES = [
  {
    id: "grid-shore-1",
    name: "Shore landing — HVAC export",
    shortName: "Landfall GIS",
    lat: -27.28,
    lng: 14.78,
    voltageKv: 275,
    role: "Submarine cable termination, sync & metering",
  },
  {
    id: "grid-ss-1",
    name: "Coastal substation — Orange corridor",
    shortName: "SS Erongo South",
    lat: -27.42,
    lng: 14.92,
    voltageKv: 400,
    role: "Step-up / grid interconnection — NamPower interface (illustrative)",
  },
  {
    id: "grid-tap-1",
    name: "Mining load tap (industrial)",
    shortName: "Erongo load",
    lat: -27.58,
    lng: 15.18,
    voltageKv: 132,
    role: "Bulk supply tap for coastal industrial corridor",
  },
];

/** Overhead / onshore transmission spine (charted as polyline). */
export const TRANSMISSION_LINES = [
  {
    id: "tx-400-1",
    name: "400 kV coastal spine (illustrative)",
    voltageKv: 400,
    color: "#fbbf24",
    coordinates: [
      [-27.28, 14.78],
      [-27.35, 14.88],
      [-27.42, 14.92],
      [-27.5, 15.05],
      [-27.58, 15.18],
    ],
  },
  {
    id: "tx-132-1",
    name: "132 kV feeder — port / desal (illustrative)",
    voltageKv: 132,
    color: "#fcd34d",
    coordinates: [
      [-27.42, 14.92],
      [-27.48, 14.85],
      [-27.52, 14.78],
    ],
  },
];

/**
 * Submarine export cables — FPU platform to shore landing (subsea; distinct from shipping lanes).
 */
export const EXPORT_CABLES = [
  {
    id: "exp-a",
    name: "Export cable A — Unit A → landfall",
    voltageKv: 275,
    fromReactorId: "fpu-a",
    color: "#38bdf8",
    coordinates: [
      [-28.15, 14.12],
      [-27.95, 14.28],
      [-27.62, 14.52],
      [-27.38, 14.68],
      [-27.28, 14.78],
    ],
  },
  {
    id: "exp-b",
    name: "Export cable B — Unit B → landfall",
    voltageKv: 275,
    fromReactorId: "fpu-b",
    color: "#7dd3fc",
    coordinates: [
      [-28.22, 14.08],
      [-28.0, 14.3],
      [-27.65, 14.55],
      [-27.35, 14.72],
      [-27.28, 14.78],
    ],
  },
];

export const COASTLINE_TRACE = [
  [-26.1, 15.15],
  [-26.42, 15.08],
  [-26.83, 14.95],
  [-27.26, 14.82],
  [-27.74, 14.64],
  [-28.16, 14.48],
  [-28.6, 14.3],
  [-29.05, 14.09],
];

export const BATHYMETRY_CONTOURS = [
  {
    id: "bath-200",
    label: "Shelf contour · 200 m",
    color: "#67e8f9",
    coordinates: [
      [-26.25, 14.78],
      [-26.7, 14.62],
      [-27.14, 14.47],
      [-27.61, 14.28],
      [-28.04, 14.08],
      [-28.48, 13.92],
      [-28.92, 13.72],
    ],
  },
  {
    id: "bath-1000",
    label: "Deepwater contour · 1000 m",
    color: "#0ea5e9",
    coordinates: [
      [-26.38, 14.42],
      [-26.82, 14.22],
      [-27.26, 14.03],
      [-27.72, 13.8],
      [-28.14, 13.61],
      [-28.57, 13.39],
      [-29.02, 13.15],
    ],
  },
];

export const WEATHER_BUOYS = [
  {
    id: "buoy-1",
    name: "Met buoy Alpha",
    lat: -27.86,
    lng: 14.24,
    waveHeightM: 2.8,
    currentKt: 1.2,
    windKt: 16,
    status: "Online",
  },
  {
    id: "buoy-2",
    name: "Met buoy Bravo",
    lat: -28.34,
    lng: 13.98,
    waveHeightM: 3.4,
    currentKt: 1.6,
    windKt: 19,
    status: "Online",
  },
];

export const PATROL_ASSETS = [
  {
    id: "patrol-1",
    name: "Safety patrol Sierra",
    type: "Patrol vessel",
    lat: -28.46,
    lng: 14.18,
    heading: "NE corridor sweep",
    status: "Inspecting shipping separation lane",
  },
  {
    id: "patrol-2",
    name: "Aerial watch Echo",
    type: "Drone overwatch",
    lat: -27.98,
    lng: 14.56,
    heading: "Shoreline / landfall pass",
    status: "Streaming optical + thermal feed",
  },
];

export const SURVEILLANCE_ZONES = [
  {
    id: "surv-1",
    title: "Coastal radar coverage",
    lat: -27.42,
    lng: 14.92,
    radiusM: 95000,
    color: "#4ade80",
    description: "Port-to-platform vessel tracking envelope",
  },
  {
    id: "surv-2",
    title: "Offshore reactor watch",
    lat: -28.18,
    lng: 14.1,
    radiusM: 42000,
    color: "#c084fc",
    description: "Persistent combined radar / AIS / thermal surveillance box",
  },
];
