import type { ManifestCitation } from "@/lib/citation-manifest"
import { getFileUrl } from "@/lib/sources"

const PDF_EXTENSION = /\.pdf$/i

/** Footnote-style list of every citation, for print, shared copies and exports. */
export function SourcesAppendix({ citations, linkFiles = true }: { citations: ManifestCitation[]; linkFiles?: boolean }) {
  return (
    <section className="mt-8 border-t pt-5" aria-label="Sources">
      <h2 className="text-primary mb-2 text-[13px] font-semibold tracking-wide uppercase">Sources</h2>
      <ol className="space-y-1.5 text-[12px] leading-5">
        {citations.map((c) => {
          const name = c.fileName.replace(PDF_EXTENSION, "")
          return (
            <li key={c.sourceNumber} id={`source-${c.sourceNumber}`} className="flex gap-2">
              <span className="text-primary w-7 shrink-0 font-medium tabular-nums">[{c.sourceNumber}]</span>
              <span className="min-w-0">
                {linkFiles ? (
                  <a href={`${getFileUrl(c.fileId)}#page=${c.pageNumber}`} className="font-medium hover:underline">{name}</a>
                ) : (
                  <span className="font-medium">{name}</span>
                )}
                , page {c.pageNumber}
                {c.bBox ? "" : " (whole page)"}
                {c.highlight?.label || c.highlight?.value ? (
                  <span className="text-muted-foreground">
                    {" · "}
                    {c.highlight.label ? `${c.highlight.label}: ` : ""}
                    <span className="text-foreground tabular-nums">{c.highlight.value}</span>
                  </span>
                ) : null}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
