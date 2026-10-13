// Fictional fund universe for the assessment. Halyard's figures match the memo's
// source documents; every other fund is invented. Cobalt Ridge and Larkspur have
// generated quarterly reports (scripts/generate-fixture-pdfs.mjs) so their notes can cite
// real pages. Nothing here is real data.

export type DocumentStatus = "Ready" | "Extracted" | "Processing" | "Awaiting documents" | "Missing from data room" | "Not generated"

export type FundDocument = {
  id: string
  title: string
  kind: "Monitoring note" | "GP quarterly report" | "Capital account statement" | "LPA" | "DDQ" | "Marketing deck"
  period: string
  status: DocumentStatus
  /** Internal route or a PDF under /docs. Absent when nothing can be opened. */
  href?: string
  external?: boolean
}

export type FundStatus = "Active" | "Harvesting" | "In diligence" | "Fundraising"

export type Fund = {
  slug: string
  name: string
  manager: string
  strategy: string
  vintage: number
  status: FundStatus
  /** Meridian's position, USD millions. */
  commitment: number
  called: number
  nav: number
  tvpi: number
  netIrr: number
  asOf: string
  documents: FundDocument[]
}

export const HALYARD_SLUG = "halyard-growth-partners-iii"
export const LP_NAME = "Meridian Public Employees Trust"

export const FUNDS: Fund[] = [
  {
    slug: HALYARD_SLUG,
    name: "Halyard Growth Partners III",
    manager: "Halyard Capital Management",
    strategy: "Growth equity",
    vintage: 2021,
    status: "Active",
    commitment: 20.0,
    called: 15.9,
    nav: 17.0,
    tvpi: 1.68,
    netIrr: 17.9,
    asOf: "Jun 30, 2026",
    documents: [
      { id: "hgp3-note-q2-2026", title: "Q2 2026 monitoring note", kind: "Monitoring note", period: "Q2 2026", status: "Ready", href: "/" },
      { id: "hgp3-qr-q2-2026", title: "Halyard Growth Partners III - Q2 2026 Quarterly Report", kind: "GP quarterly report", period: "Q2 2026", status: "Extracted", href: "/docs/q2-2026-quarterly-report.pdf", external: true },
      { id: "hgp3-cas-q2-2026", title: "Capital Account Statement - Meridian - Q2 2026", kind: "Capital account statement", period: "Q2 2026", status: "Extracted", href: "/docs/lp-capital-account-q2-2026.pdf", external: true },
      { id: "hgp3-qr-q1-2026", title: "Halyard Growth Partners III - Q1 2026 Quarterly Report", kind: "GP quarterly report", period: "Q1 2026", status: "Missing from data room" },
      { id: "hgp3-note-q1-2026", title: "Q1 2026 monitoring note", kind: "Monitoring note", period: "Q1 2026", status: "Not generated" },
      { id: "hgp3-lpa", title: "Limited Partnership Agreement", kind: "LPA", period: "2021", status: "Extracted" },
    ],
  },
  {
    slug: "cobalt-ridge-buyout-iv",
    name: "Cobalt Ridge Buyout IV",
    manager: "Cobalt Ridge Partners",
    strategy: "Mid-market buyout",
    vintage: 2019,
    status: "Harvesting",
    commitment: 25.0,
    called: 23.1,
    nav: 19.4,
    tvpi: 1.96,
    netIrr: 21.3,
    asOf: "Jun 30, 2026",
    documents: [
      { id: "crb4-note-q2-2026", title: "Q2 2026 monitoring note", kind: "Monitoring note", period: "Q2 2026", status: "Ready", href: "/funds/cobalt-ridge-buyout-iv/notes/q2-2026-monitoring-note" },
      { id: "crb4-qr-q2-2026", title: "Cobalt Ridge Buyout IV - Q2 2026 Quarterly Report", kind: "GP quarterly report", period: "Q2 2026", status: "Extracted", href: "/docs/cobalt-ridge-q2-2026-quarterly-report.pdf", external: true },
      { id: "crb4-cas-q2-2026", title: "Capital Account Statement - Meridian - Q2 2026", kind: "Capital account statement", period: "Q2 2026", status: "Processing" },
      { id: "crb4-note-q1-2026", title: "Q1 2026 monitoring note", kind: "Monitoring note", period: "Q1 2026", status: "Not generated" },
    ],
  },
  {
    slug: "larkspur-ventures-ii",
    name: "Larkspur Ventures II",
    manager: "Larkspur Venture Management",
    strategy: "Early-stage venture",
    vintage: 2023,
    status: "Active",
    commitment: 10.0,
    called: 4.6,
    nav: 4.9,
    tvpi: 1.07,
    netIrr: 6.2,
    asOf: "Jun 30, 2026",
    documents: [
      { id: "lv2-note-q2-2026", title: "Q2 2026 monitoring note", kind: "Monitoring note", period: "Q2 2026", status: "Ready", href: "/funds/larkspur-ventures-ii/notes/q2-2026-monitoring-note" },
      { id: "lv2-qr-q2-2026", title: "Larkspur Ventures II - Q2 2026 Quarterly Report", kind: "GP quarterly report", period: "Q2 2026", status: "Extracted", href: "/docs/larkspur-ventures-q2-2026-quarterly-report.pdf", external: true },
      { id: "lv2-cas-q2-2026", title: "Capital Account Statement - Meridian - Q2 2026", kind: "Capital account statement", period: "Q2 2026", status: "Awaiting documents" },
      { id: "lv2-ddq", title: "Due Diligence Questionnaire", kind: "DDQ", period: "2023", status: "Extracted" },
    ],
  },
  {
    slug: "tidewater-infrastructure-partners-i",
    name: "Tidewater Infrastructure Partners I",
    manager: "Tidewater Asset Management",
    strategy: "Core-plus infrastructure",
    vintage: 2022,
    status: "Active",
    commitment: 30.0,
    called: 18.3,
    nav: 19.8,
    tvpi: 1.14,
    netIrr: 9.1,
    asOf: "Jun 30, 2026",
    documents: [
      { id: "tip1-qr-q2-2026", title: "Tidewater Infrastructure Partners I - Q2 2026 Quarterly Report", kind: "GP quarterly report", period: "Q2 2026", status: "Processing" },
      { id: "tip1-cas-q2-2026", title: "Capital Account Statement - Meridian - Q2 2026", kind: "Capital account statement", period: "Q2 2026", status: "Processing" },
    ],
  },
  {
    slug: "ashgrove-credit-opportunities-ii",
    name: "Ashgrove Credit Opportunities II",
    manager: "Ashgrove Capital",
    strategy: "Opportunistic credit",
    vintage: 2020,
    status: "Harvesting",
    commitment: 15.0,
    called: 14.7,
    nav: 8.2,
    tvpi: 1.31,
    netIrr: 11.4,
    asOf: "Jun 30, 2026",
    documents: [
      { id: "aco2-qr-q2-2026", title: "Ashgrove Credit Opportunities II - Q2 2026 Quarterly Report", kind: "GP quarterly report", period: "Q2 2026", status: "Extracted" },
      { id: "aco2-note-q2-2026", title: "Q2 2026 monitoring note", kind: "Monitoring note", period: "Q2 2026", status: "Processing" },
    ],
  },
  {
    slug: "kestrel-secondaries-v",
    name: "Kestrel Secondaries V",
    manager: "Kestrel Partners",
    strategy: "Secondaries",
    vintage: 2025,
    status: "In diligence",
    commitment: 0,
    called: 0,
    nav: 0,
    tvpi: 0,
    netIrr: 0,
    asOf: "Jun 30, 2026",
    documents: [
      { id: "ks5-deck", title: "Kestrel Secondaries V - Marketing Deck", kind: "Marketing deck", period: "2026", status: "Extracted" },
      { id: "ks5-ddq", title: "Due Diligence Questionnaire", kind: "DDQ", period: "2026", status: "Processing" },
    ],
  },
]

export const getFund = (slug: string) => FUNDS.find((fund) => fund.slug === slug)

export const fundHref = (slug: string) => `/funds/${slug}`

export const formatMillions = (value: number) => (value === 0 ? "–" : `$${value.toFixed(1)}m`)
export const formatMultiple = (value: number) => (value === 0 ? "–" : `${value.toFixed(2)}x`)
export const formatPercent = (value: number) => (value === 0 ? "–" : `${value.toFixed(1)}%`)
