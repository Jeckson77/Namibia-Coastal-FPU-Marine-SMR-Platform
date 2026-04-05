/**
 * Verbatim competition requirements from participant instructions (case study brief).
 * Each main section of the site maps to exactly one of these three questions.
 */
export const COMPETITION_QUESTIONS = [
  {
    id: "q1",
    label: "Question 1",
    shortLabel: "",
    sectionTitle: "Technology review — FPUs & marine SMRs",
    /** Main website section that answers this question */
    tab: "review",
    tabLabel: "Tech Review",
    brief:
      "A review of modern technologies in the field of floating nuclear power units (FPUs) and marine-based small modular reactors (SMRs). Key advantages for remote and coastal areas of Namibia.",
  },
  {
    id: "q2",
    label: "Question 2",
    shortLabel: "",
    sectionTitle: "Geology, seismicity & tsunami hazard — site zones",
    tab: "map",
    tabLabel: "Hazard Analysis",
    brief:
      "An analysis of the geological, geotectonic, and seismic setting to assess the potential threat of earthquakes and tsunamis, identifying the zone(s) suitable for the safe deployment of an FPU on the southern coast of Africa (Namibia).",
  },
  {
    id: "q3",
    label: "Question 3",
    shortLabel: "",
    sectionTitle: "Optimal unit, capacity & socio-economic benefits",
    tab: "final",
    tabLabel: "Recommendation",
    brief:
      "Considering technological capabilities and geological constraints, propose the optimal type/kind of floating power unit, justify its capacity, and evaluate the socio-economic benefits for Namibia.",
  },
];

export const TAB_TO_QUESTION = {
  review: "q1",
  map: "q2",
  final: "q3",
};
