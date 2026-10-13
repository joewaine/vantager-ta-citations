import { NOTE_CITATIONS } from "@/lib/citation-manifest"
import { fundHref } from "@/lib/funds"
import type { MemoEntry } from "@/lib/memos"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/shell/app-shell"
import { ReportToolbar } from "@/components/report-toolbar"
import { SourceViewer } from "@/components/source-viewer"
import { SourceViewerProvider } from "@/components/source-viewer-provider"
import { SourcesAppendix } from "@/components/sources-appendix"

// Shared frame for every cited memo: shell, report toolbar, document card, source viewer.
export function MemoPage({ memo }: { memo: MemoEntry }) {
  const { Component, ...context } = memo
  const citations = NOTE_CITATIONS.find((n) => n.memoHref === memo.memoHref)?.citations ?? []

  return (
    <TooltipProvider delayDuration={150}>
      <SourceViewerProvider memo={context}>
        <AppShell
          crumbs={[
            { label: "Funds", href: "/funds" },
            { label: memo.fundName, href: fundHref(memo.fundSlug) },
            { label: memo.memoTitle },
          ]}
        >
          <ReportToolbar title={`${memo.fundName}: ${memo.memoTitle}`} />
          <div className="bg-muted flex min-h-0 w-full flex-1">
            <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-8">
              <article data-memo className="bg-card text-card-foreground mx-auto w-full max-w-3xl rounded-lg border px-4 py-6 shadow-xs sm:px-7 sm:py-8 md:px-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
                <Component />
                {/* Printed and exported copies carry their own sources list. */}
                <div className="hidden print:block" data-print-only>
                  <SourcesAppendix citations={citations} />
                </div>
              </article>
            </main>
            <SourceViewer />
          </div>
        </AppShell>
      </SourceViewerProvider>
    </TooltipProvider>
  )
}
