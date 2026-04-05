import { jsPDF } from 'jspdf';

const PAGE_HEIGHT = 842;
const BOTTOM_MARGIN = 56;
const LEFT_MARGIN = 48;
const CONTENT_WIDTH = 500;

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const number = (value, digits = 1) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);

const addWrappedBlock = (doc, text, y, options = {}) => {
  const { x = LEFT_MARGIN, width = CONTENT_WIDTH, lineHeight = 16, fontSize = 11 } = options;
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
};

const ensurePageSpace = (doc, y, needed = 56) => {
  if (y + needed <= PAGE_HEIGHT - BOTTOM_MARGIN) {
    return y;
  }

  doc.addPage();
  return 56;
};

export const exportDecisionReport = ({
  recommendation,
  basins,
  selectedBasin,
  selectedTechnology,
  scenario,
  metrics,
}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Namibia FPU / Marine SMR Decision Report', LEFT_MARGIN, y);
  y += 26;

  doc.setFont('helvetica', 'normal');
  y = addWrappedBlock(
    doc,
    'This report combines the hazard-analysis basis and the active recommendation scenario generated from the website simulator.',
    y,
    { fontSize: 11, lineHeight: 15 }
  );
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Executive Summary', LEFT_MARGIN, y);
  y += 20;
  doc.setFont('helvetica', 'normal');
  y = addWrappedBlock(
    doc,
    `${recommendation.zone} remains the anchor recommendation because ${recommendation.reason} The active simulator scenario evaluates ${scenario.unitCount} ${selectedTechnology.name} units in ${selectedBasin.name}. The preferred deployment key point is ${recommendation.recommendedCoordinates?.primary ?? 'not specified'}.`,
    y,
    { lineHeight: 15 }
  );
  y += 14;

  y = ensurePageSpace(doc, y, 150);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Scenario Snapshot', LEFT_MARGIN, y);
  y += 20;
  doc.setFont('helvetica', 'normal');

  const snapshotLines = [
    `Selected basin: ${selectedBasin.name}`,
    `Technology: ${selectedTechnology.name}`,
    `Preferred coordinates: ${recommendation.recommendedCoordinates?.primary ?? 'Not specified'}`,
    `Installed capacity: ${number(metrics.installedMw, 0)} MWe`,
    `Annual generation: ${number(metrics.annualGenerationGWh)} GWh`,
    `Grid delivery after desalination allocation: ${number(metrics.gridSupplyGWh)} GWh`,
    `Water output enabled: ${number(metrics.waterOutputM3PerDay, 0)} m3/day`,
    `Risk-adjusted suitability score: ${number(metrics.riskAdjustedScore, 0)}/100`,
  ];

  snapshotLines.forEach((line) => {
    y = ensurePageSpace(doc, y, 18);
    doc.text(`• ${line}`, LEFT_MARGIN, y);
    y += 18;
  });

  y += 8;
  y = ensurePageSpace(doc, y, 170);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Cost And ROI Dashboard', LEFT_MARGIN, y);
  y += 20;
  doc.setFont('helvetica', 'normal');

  const financeLines = [
    `Estimated CAPEX: ${currency(metrics.capexUsd)}`,
    `Annual OPEX: ${currency(metrics.annualOpexUsd)}`,
    `Annual energy revenue: ${currency(metrics.annualEnergyRevenueUsd)}`,
    `Annual water-linked value: ${currency(metrics.annualWaterValueUsd)}`,
    `Annual operating cash flow: ${currency(metrics.annualCashFlowUsd)}`,
    `Simple payback: ${number(metrics.paybackYears)} years`,
    `10-year ROI: ${number(metrics.roiTenYearPct)}%`,
  ];

  financeLines.forEach((line) => {
    y = ensurePageSpace(doc, y, 18);
    doc.text(`• ${line}`, LEFT_MARGIN, y);
    y += 18;
  });

  y += 8;
  y = ensurePageSpace(doc, y, 220);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Hazard Analysis Summary', LEFT_MARGIN, y);
  y += 20;
  doc.setFont('helvetica', 'normal');

  basins.forEach((basin) => {
    y = ensurePageSpace(doc, y, 72);
    doc.setFont('helvetica', 'bold');
    doc.text(`${basin.name} — score ${basin.score}/100`, LEFT_MARGIN, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    y = addWrappedBlock(
      doc,
      `${basin.description} Hazard: ${basin.hazard}. Tectonic setting: ${basin.tectonic}. Thermo status: ${basin.mapOverlay?.thermoScan?.status ?? 'No thermo status available'}`,
      y,
      { lineHeight: 14, fontSize: 10 }
    );
    y += 10;
  });

  y = ensurePageSpace(doc, y, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Recommendation Basis', LEFT_MARGIN, y);
  y += 20;
  doc.setFont('helvetica', 'normal');
  y = addWrappedBlock(doc, `Recommended platform: ${recommendation.fpuType.name}.`, y, { lineHeight: 15 });
  y = addWrappedBlock(doc, `Why selected: ${recommendation.fpuType.whySelected}`, y, { lineHeight: 15 });
  y = addWrappedBlock(doc, `Preferred deployment key point: ${recommendation.recommendedCoordinates?.primary ?? 'Not specified'}. ${recommendation.recommendedCoordinates?.note ?? ''}`, y, { lineHeight: 15 });
  y = addWrappedBlock(doc, `Strategic use cases: ${recommendation.useCases.join(', ')}.`, y, { lineHeight: 15 });

  doc.save('namibia-fpu-decision-report.pdf');
};