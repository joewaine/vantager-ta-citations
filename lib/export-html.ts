"use client"

import type { ManifestCitation } from "@/lib/citation-manifest"
import type { MemoContext } from "@/lib/memo-context"

// Builds a self-contained HTML file from the rendered memo: no scripts, no external
// assets, citation markers become footnote links, and the sources list is appended.

const STYLES = `
  :root { color-scheme: light; }
  body { margin: 0; background: #f4f5f7; font-family: Inter, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; }
  .bar { background: #1a3fd6; color: #fff; padding: 10px 16px; font-size: 15px; }
  .bar b { font-weight: 700; }
  article { max-width: 760px; margin: 24px auto; background: #fff; border: 1px solid #e3e6eb; border-radius: 8px; padding: 32px 40px; }
  h1 { font-size: 22px; letter-spacing: -0.04em; margin: 0 0 12px; }
  h2 { color: #1a3fd6; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; border-top: 1px solid #e3e6eb; padding-top: 20px; margin: 28px 0 6px; }
  p { font-size: 13px; line-height: 20px; margin: 8px 0; color: rgba(17,17,17,.9); }
  a[data-source-number] { color: #1a3fd6; text-decoration: none; font-size: .85em; font-weight: 500; font-variant-numeric: tabular-nums; }
  ol.sources { font-size: 12px; line-height: 20px; padding-left: 0; list-style: none; }
  ol.sources li { display: flex; gap: 8px; margin: 4px 0; }
  ol.sources .n { color: #1a3fd6; width: 28px; flex: none; font-weight: 500; }
  .muted { color: #5f6670; }
  footer { max-width: 760px; margin: 0 auto 32px; text-align: center; font-size: 11px; color: #5f6670; }
`

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function appendixHtml(citations: ManifestCitation[]) {
  const items = citations
    .map((c) => {
      const name = escapeHtml(c.fileName.replace(/\.pdf$/i, ""))
      const extracted = c.highlight?.label || c.highlight?.value
        ? ` <span class="muted">· ${c.highlight.label ? escapeHtml(c.highlight.label) + ": " : ""}<span style="color:#111">${escapeHtml(c.highlight.value ?? "")}</span></span>`
        : ""
      return `<li id="source-${c.sourceNumber}"><span class="n">[${c.sourceNumber}]</span><span><b>${name}</b>, page ${c.pageNumber}${c.bBox ? "" : " (whole page)"}${extracted}</span></li>`
    })
    .join("\n")
  return `<h2>Sources</h2><ol class="sources">${items}</ol>`
}

/** Clones the on-screen article, replaces interactive markers with footnote links, drops icons. */
function cleanArticleHtml(article: HTMLElement) {
  const clone = article.cloneNode(true) as HTMLElement
  clone.querySelectorAll("svg").forEach((svg) => svg.remove())
  clone.querySelectorAll<HTMLElement>("[data-source-number]").forEach((marker) => {
    const n = marker.dataset.sourceNumber
    const link = document.createElement("a")
    link.href = `#source-${n}`
    link.dataset.sourceNumber = n
    link.textContent = `[${n}]`
    marker.replaceWith(link)
  })
  clone.querySelectorAll("[data-print-only], [data-export-skip]").forEach((el) => el.remove())
  clone.querySelectorAll("*").forEach((el) => el.removeAttribute("class"))
  return clone.innerHTML
}

export function buildStandaloneHtml(article: HTMLElement, memo: MemoContext, citations: ManifestCitation[]) {
  const title = `${memo.fundName}: ${memo.memoTitle}`
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${STYLES}</style>
</head>
<body>
<div class="bar"><b>MSCI</b> Diligence Platform &nbsp;·&nbsp; Exported copy</div>
<article>
${cleanArticleHtml(article)}
${appendixHtml(citations)}
</article>
<footer>Exported ${new Date().toLocaleString()}. Source documents require a platform sign-in. Fictional data for assessment use.</footer>
</body>
</html>
`
}

export function downloadFile(filename: string, contents: string, type = "text/html") {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
