"use client"

import { strToU8, zipSync } from "fflate"

import type { ManifestCitation } from "@/lib/citation-manifest"
import type { Fund } from "@/lib/funds"
import type { MemoContext } from "@/lib/memo-context"
import { getFileUrl } from "@/lib/sources"

// Client-side bundles: the browser already holds the session for the PDFs and the
// rendered memo for the HTML copy, so nothing needs a server round trip.

type ZipEntries = Record<string, Uint8Array>

const FICTIONAL_NOTICE = "All data is fictional and prepared for an assessment exercise."

export function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function csvEscape(value: unknown) {
  const text = value === undefined || value === null ? "" : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n"
}

async function fetchBinary(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return new Uint8Array(await response.arrayBuffer())
  } catch {
    return null
  }
}

/** Fetches each distinct file once; returns the entries that exist and the ids that do not. */
async function collectPdfs(files: Array<{ fileId: string; fileName: string }>) {
  const entries: ZipEntries = {}
  const missing: Array<{ fileId: string; fileName: string }> = []
  const seen = new Set<string>()
  await Promise.all(
    files.map(async (file) => {
      if (seen.has(file.fileId)) return
      seen.add(file.fileId)
      const bytes = await fetchBinary(getFileUrl(file.fileId))
      if (bytes) entries[`documents/${file.fileName}`] = bytes
      else missing.push(file)
    }),
  )
  return { entries, missing }
}

export type BundleResult = { bytes: Uint8Array; included: number; missing: string[] }

export async function buildMemoBundle(memo: MemoContext, citations: ManifestCitation[], memoHtml: string): Promise<BundleResult> {
  const { entries, missing } = await collectPdfs(citations.map((c) => ({ fileId: c.fileId, fileName: c.fileName })))
  const title = `${memo.fundName}: ${memo.memoTitle}`
  const missingIds = new Set(missing.map((m) => m.fileId))

  const csv = toCsv([
    ["source", "file", "page", "bbox_x", "bbox_y", "bbox_w", "bbox_h", "label", "extracted_value", "claim_excerpt", "file_in_bundle"],
    ...citations.map((c) => [
      c.sourceNumber, c.fileName, c.pageNumber,
      c.bBox?.x ?? "", c.bBox?.y ?? "", c.bBox?.w ?? "", c.bBox?.h ?? "",
      c.highlight?.label ?? "", c.highlight?.value ?? "", c.claim,
      missingIds.has(c.fileId) ? "no" : "yes",
    ]),
  ])

  const readme = [
    title,
    "=".repeat(title.length),
    "",
    `Exported ${new Date().toISOString()}`,
    "",
    "Contents",
    `  ${slugify(title)}.html   The note as a standalone page with a sources list.`,
    "  citations.csv            One row per citation: file, page, region (PDF points, top-left origin), extracted text.",
    "  citations.json           The same, as the raw citation records.",
    "  documents/               Every cited source document that is available.",
    "",
    missing.length
      ? ["Not included (not in the data room):", ...missing.map((m) => `  ${m.fileName}`), ""].join("\n")
      : "All cited documents are included.\n",
    FICTIONAL_NOTICE,
    "",
  ].join("\n")

  const bytes = zipSync(
    {
      "README.txt": strToU8(readme),
      [`${slugify(title)}.html`]: strToU8(memoHtml),
      "citations.csv": strToU8(csv),
      "citations.json": strToU8(JSON.stringify(citations, null, 2)),
      ...entries,
    },
    { level: 6 },
  )
  return { bytes, included: Object.keys(entries).length, missing: missing.map((m) => m.fileName) }
}

export async function buildFundBundle(fund: Fund): Promise<BundleResult> {
  const pdfDocs = fund.documents.filter((d) => d.external && d.href)
  const { entries, missing } = await collectPdfs(
    pdfDocs.map((d) => ({ fileId: d.href!.replace(/^\/docs\//, "").replace(/\.pdf$/, ""), fileName: `${d.title}.pdf` })),
  )
  const manifest = toCsv([
    ["title", "type", "period", "status", "in_bundle"],
    ...fund.documents.map((d) => [d.title, d.kind, d.period, d.status, d.external && d.href && !missing.some((m) => m.fileName === `${d.title}.pdf`) ? "yes" : "no"]),
  ])
  const readme = [
    `${fund.name}: document bundle`,
    "",
    `Exported ${new Date().toISOString()}`,
    `${fund.manager} · ${fund.strategy} · ${fund.vintage} vintage`,
    "",
    "  documents.csv   Every document the platform knows about for this fund, with status.",
    "  documents/      The source documents that are available as files.",
    "",
    "Documents that are processing, awaiting, missing or not generated have no file and are listed in documents.csv only.",
    "",
    FICTIONAL_NOTICE,
    "",
  ].join("\n")
  const bytes = zipSync({ "README.txt": strToU8(readme), "documents.csv": strToU8(manifest), ...entries }, { level: 6 })
  return { bytes, included: Object.keys(entries).length, missing: missing.map((m) => m.fileName) }
}

export function downloadBytes(filename: string, bytes: Uint8Array, type = "application/zip") {
  const blob = new Blob([bytes as BlobPart], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
