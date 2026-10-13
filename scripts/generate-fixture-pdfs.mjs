// Generates fictional GP quarterly reports for the non-Halyard funds so their monitoring
// notes have real pages to cite. Layout mirrors the Halyard report (letter page, then a
// performance summary) and every cited region's top-left bBox is printed for the memo.
//
//   node scripts/generate-fixture-pdfs.mjs
import { writeFileSync } from "node:fs"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

const PAGE = { width: 612, height: 792 }
const MARGIN_X = 54
const BODY_SIZE = 10
const LINE_HEIGHT = 12.15
const ROW_HEIGHT = 22
const ROW_BOX = { x: 62, w: 488, h: 9.3 }
const INK = rgb(0.1, 0.1, 0.1)
const MUTED = rgb(0.4, 0.4, 0.4)
const RULE = rgb(0.85, 0.85, 0.85)

const FUNDS = [
  {
    fileId: "cobalt-ridge-q2-2026-quarterly-report",
    manager: "COBALT RIDGE PARTNERS",
    fund: "Cobalt Ridge Buyout IV, L.P.",
    letterLines: [
      "In June, the Fund completed the recapitalization of Summit Packaging, returning $58.0 million to",
      "limited partners while retaining a 35% stake in the business. The transaction was priced at 11.2x",
      "LTM EBITDA, a premium to the Fund's carrying value at March 31, 2026.",
    ],
    citedLetterLines: [0, 1],
    body: [
      "Across the six remaining portfolio companies, last-twelve-month revenue grew 9% and EBITDA grew 14%",
      "on a weighted basis. Harbor Dental Group and Meridian Fleet Services remain the two largest positions.",
      "",
      "We expect to exit two further positions during the second half of 2026 and will update limited",
      "partners on process timing at the annual meeting in November.",
    ],
    signatory: "Daniel Okoro",
    metrics: [
      ["Vintage year", "2019"],
      ["Total commitments", "400.0"],
      ["Capital called", "369.6"],
      ["% of commitments called", "92.4%"],
      ["Cumulative distributions", "412.8"],
      ["Net asset value", "310.4"],
      ["Total value (distributions + NAV)", "723.2"],
      ["DPI", "1.12x"],
      ["TVPI (net)", "1.96x"],
      ["Net IRR", "21.3%"],
      ["Gross IRR", "27.8%"],
    ],
  },
  {
    fileId: "larkspur-ventures-q2-2026-quarterly-report",
    manager: "LARKSPUR VENTURE MANAGEMENT",
    fund: "Larkspur Ventures II, L.P.",
    letterLines: [
      "During the quarter the Fund led a $12.0 million Series A in Kelp Robotics and completed follow-on",
      "investments in two existing portfolio companies, bringing the portfolio to fourteen active companies.",
      "No realizations occurred during the period.",
    ],
    citedLetterLines: [0, 1],
    body: [
      "Portfolio companies raised $64.0 million of external capital during the quarter, with three rounds",
      "priced above the Fund's prior carrying value. Two companies remain on the Fund's watch list.",
      "",
      "We expect to call approximately $9.0 million over the next two quarters to fund reserved follow-on",
      "allocations.",
    ],
    signatory: "Priya Natarajan",
    metrics: [
      ["Vintage year", "2023"],
      ["Total commitments", "150.0"],
      ["Capital called", "69.0"],
      ["% of commitments called", "46.0%"],
      ["Cumulative distributions", "0.0"],
      ["Net asset value", "73.6"],
      ["Total value (distributions + NAV)", "73.6"],
      ["DPI", "0.00x"],
      ["TVPI (net)", "1.07x"],
      ["Net IRR", "6.2%"],
      ["Gross IRR", "9.4%"],
    ],
  },
]

// pdf-lib's origin is bottom-left; the memo's bBoxes use top-left. A text line whose
// top edge sits at `top` (top-left coords) gets its baseline at height - top - ascent.
const ASCENT = 7.4
const baseline = (top) => PAGE.height - top - ASCENT

function header(page, fonts, left, right) {
  page.drawText(left, { x: MARGIN_X, y: PAGE.height - 50, size: 9, font: fonts.bold, color: INK })
  const width = fonts.regular.widthOfTextAtSize(right, 9)
  page.drawText(right, { x: PAGE.width - MARGIN_X - width, y: PAGE.height - 50, size: 9, font: fonts.regular, color: MUTED })
  page.drawLine({ start: { x: MARGIN_X, y: PAGE.height - 58 }, end: { x: PAGE.width - MARGIN_X, y: PAGE.height - 58 }, thickness: 0.5, color: RULE })
}

function footer(page, fonts, text, pageNumber) {
  page.drawText(text, { x: MARGIN_X, y: 40, size: 7, font: fonts.regular, color: MUTED })
  page.drawText(`Page ${pageNumber}`, { x: PAGE.width - MARGIN_X - 28, y: 40, size: 7, font: fonts.regular, color: MUTED })
}

async function build(spec) {
  const doc = await PDFDocument.create()
  doc.setTitle(`${spec.fund} Q2 2026 Quarterly Report (fictional)`)
  const fonts = { regular: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) }
  const boxes = {}

  // Page 1: letter.
  const letter = doc.addPage([PAGE.width, PAGE.height])
  header(letter, fonts, spec.manager, "Quarter ended June 30, 2026")
  letter.drawText("Letter to Limited Partners", { x: MARGIN_X, y: baseline(90), size: 14, font: fonts.bold, color: INK })
  letter.drawText("Dear Limited Partners,", { x: MARGIN_X, y: baseline(122), size: BODY_SIZE, font: fonts.regular, color: INK })
  const intro = [
    `We are pleased to present the quarterly report for ${spec.fund} (the "Fund") for the quarter ended`,
    "June 30, 2026.",
  ]
  let top = 150
  for (const line of intro) {
    letter.drawText(line, { x: MARGIN_X, y: baseline(top), size: BODY_SIZE, font: fonts.regular, color: INK })
    top += LINE_HEIGHT
  }
  top += LINE_HEIGHT
  const citedTop = top
  for (const line of spec.letterLines) {
    letter.drawText(line, { x: MARGIN_X, y: baseline(top), size: BODY_SIZE, font: fonts.regular, color: INK })
    top += LINE_HEIGHT
  }
  const citedCount = spec.citedLetterLines.length
  boxes.letter = { page: 1, x: MARGIN_X, y: +citedTop.toFixed(1), w: 439.5, h: +(LINE_HEIGHT * citedCount).toFixed(1) }
  top += LINE_HEIGHT
  for (const line of spec.body) {
    if (line) letter.drawText(line, { x: MARGIN_X, y: baseline(top), size: BODY_SIZE, font: fonts.regular, color: INK })
    top += LINE_HEIGHT
  }
  top += LINE_HEIGHT * 2
  letter.drawText("Sincerely,", { x: MARGIN_X, y: baseline(top), size: BODY_SIZE, font: fonts.regular, color: INK })
  top += LINE_HEIGHT * 2.5
  letter.drawText(spec.signatory, { x: MARGIN_X, y: baseline(top), size: BODY_SIZE, font: fonts.bold, color: INK })
  top += LINE_HEIGHT
  letter.drawText(`Managing Partner, ${spec.manager.charAt(0) + spec.manager.slice(1).toLowerCase()}`, { x: MARGIN_X, y: baseline(top), size: BODY_SIZE, font: fonts.regular, color: INK })
  footer(letter, fonts, `${spec.fund} Q2 2026 Quarterly Report | Confidential. For limited partners only. Fictional data for assessment use.`, 1)

  // Page 2: performance summary table, one metric per row.
  const summary = doc.addPage([PAGE.width, PAGE.height])
  header(summary, fonts, spec.manager, "As of June 30, 2026 | USD millions")
  summary.drawText("Fund Performance Summary", { x: MARGIN_X, y: baseline(90), size: 14, font: fonts.bold, color: INK })
  summary.drawText("Metric", { x: ROW_BOX.x, y: baseline(128), size: 9, font: fonts.bold, color: MUTED })
  summary.drawText("Value", { x: ROW_BOX.x + ROW_BOX.w - 24, y: baseline(128), size: 9, font: fonts.bold, color: MUTED })
  summary.drawLine({ start: { x: ROW_BOX.x, y: baseline(128) - 5 }, end: { x: ROW_BOX.x + ROW_BOX.w, y: baseline(128) - 5 }, thickness: 0.5, color: RULE })
  boxes.metrics = {}
  spec.metrics.forEach(([label, value], index) => {
    const rowTop = 150 + index * ROW_HEIGHT
    summary.drawText(label, { x: ROW_BOX.x + 8, y: baseline(rowTop), size: BODY_SIZE, font: fonts.regular, color: INK })
    const width = fonts.regular.widthOfTextAtSize(value, BODY_SIZE)
    summary.drawText(value, { x: ROW_BOX.x + ROW_BOX.w - 8 - width, y: baseline(rowTop), size: BODY_SIZE, font: fonts.regular, color: INK })
    summary.drawLine({ start: { x: ROW_BOX.x, y: baseline(rowTop) - 6 }, end: { x: ROW_BOX.x + ROW_BOX.w, y: baseline(rowTop) - 6 }, thickness: 0.25, color: RULE })
    boxes.metrics[label] = { page: 2, x: ROW_BOX.x, y: rowTop, w: ROW_BOX.w, h: ROW_BOX.h, value }
  })
  const note = [
    "Net figures are after management fees, fund expenses and carried interest. Gross IRR is calculated on",
    "investment-level cash flows before fees and expenses.",
  ]
  let noteTop = 150 + spec.metrics.length * ROW_HEIGHT + 24
  for (const line of note) {
    summary.drawText(line, { x: MARGIN_X, y: baseline(noteTop), size: 9, font: fonts.regular, color: MUTED })
    noteTop += LINE_HEIGHT
  }
  footer(summary, fonts, `${spec.fund} Q2 2026 Quarterly Report | Confidential. For limited partners only. Fictional data for assessment use.`, 2)

  writeFileSync(`public/docs/${spec.fileId}.pdf`, await doc.save())
  return { fileId: spec.fileId, boxes }
}

for (const spec of FUNDS) {
  const result = await build(spec)
  console.log(JSON.stringify(result, null, 1))
}
