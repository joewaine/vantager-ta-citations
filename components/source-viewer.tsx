"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, FileWarning, Maximize2, Star, X, ZoomIn, ZoomOut } from "lucide-react"

import { getFileUrl } from "@/lib/sources"
import { useFileAvailable } from "@/lib/use-file-available"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { shortFileName } from "@/components/source-badge"
import { useSourceViewer } from "@/components/source-viewer-provider"

// pdf.js needs the DOM; never render it during the static prerender.
const PdfDocument = dynamic(() => import("@/components/pdf-document"), {
  ssr: false,
  loading: () => <Skeleton className="aspect-[612/792] w-full" />,
})

const ZOOM_MIN = 0.5
const ZOOM_MAX = 3
const ZOOM_STEP = 0.25

function IconAction({ label, onClick, disabled, children }: { label: string; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" onClick={onClick} disabled={disabled} aria-label={label}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function SourceViewer() {
  const { active, citations, favorited, close, next, prev, toggleFavorite } = useSourceViewer()
  // Keyed by file so a stale page count never shows for a newly opened document.
  const [loaded, setLoaded] = useState<{ fileId: string; numPages: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  // Gate pdf.js on the HEAD check so a missing file never reaches the loader,
  // which would log a console error and trip the Next dev overlay.
  const availability = useFileAvailable(active?.fileId ?? "")

  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active, close])

  if (!active) return null

  const index = citations.findIndex((c) => c.sourceNumber === active.sourceNumber)
  const hasPrev = index > 0
  const hasNext = index >= 0 && index < citations.length - 1
  const url = getFileUrl(active.fileId)
  const numPages = loaded?.fileId === active.fileId ? loaded.numPages : null
  const isFavorite = favorited.has(active.sourceNumber)
  const { highlight, bBox } = active

  return (
    <aside
      aria-label={`Source ${active.sourceNumber}`}
      data-print-hidden
      className="bg-background fixed inset-x-0 top-11 bottom-0 z-40 flex flex-col md:sticky md:top-[84px] md:h-[calc(100vh-84px)] md:w-[min(46vw,680px)] md:shrink-0 md:border-l"
    >
      <header className="flex items-start gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <span className="text-primary mt-0.5 text-sm font-semibold tabular-nums">[{active.sourceNumber}]</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium" title={active.fileName}>
            {shortFileName(active.fileName)}
          </div>
          <div className="text-muted-foreground text-xs">
            Page {active.pageNumber}
            {numPages ? ` of ${numPages}` : ""}
            {!bBox && " · whole page cited, no region recorded"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => toggleFavorite(active)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={isFavorite ? "fill-primary text-primary" : undefined} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFavorite ? "Remove from favorites" : "Favorite this extraction"}</TooltipContent>
          </Tooltip>
          <IconAction label="Previous citation" onClick={prev} disabled={!hasPrev}>
            <ChevronLeft />
          </IconAction>
          <IconAction label="Next citation" onClick={next} disabled={!hasNext}>
            <ChevronRight />
          </IconAction>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" asChild aria-label="Open PDF in a new tab">
                <a href={`${url}#page=${active.pageNumber}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open PDF in a new tab</TooltipContent>
          </Tooltip>
          <IconAction label="Close (Esc)" onClick={close}>
            <X />
          </IconAction>
        </div>
      </header>

      <div className="bg-secondary px-4 py-2.5 text-xs">
        <div className="text-secondary-foreground mb-0.5 text-[11px] font-semibold tracking-wide uppercase">Extracted from source</div>
        {highlight ? (
          <div className="space-y-0.5">
            {highlight.label && <div className="text-muted-foreground">{highlight.label}</div>}
            {highlight.value && <div className="text-sm font-semibold tabular-nums">{highlight.value}</div>}
            {highlight.reasoning && <div className="text-muted-foreground italic">{highlight.reasoning}</div>}
          </div>
        ) : (
          <div className="text-muted-foreground italic">No extracted text for this citation</div>
        )}
      </div>

      <Separator />

      <div className="flex h-9 items-center gap-1 border-b px-2">
        <IconAction label="Zoom out" onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))} disabled={zoom <= ZOOM_MIN}>
          <ZoomOut />
        </IconAction>
        <span className="text-muted-foreground w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
        <IconAction label="Zoom in" onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))} disabled={zoom >= ZOOM_MAX}>
          <ZoomIn />
        </IconAction>
        <IconAction label="Fit to width" onClick={() => setZoom(1)} disabled={zoom === 1}>
          <Maximize2 />
        </IconAction>
      </div>

      <ScrollArea className="bg-muted/40 min-h-0 flex-1">
        <div className="p-4">
          {availability === "checking" && <Skeleton className="aspect-[612/792] w-full" />}
          {availability === "missing" && (
            <Alert variant="destructive">
              <FileWarning />
              <AlertTitle>Source file not found</AlertTitle>
              <AlertDescription>
                <span className="font-mono">{active.fileName}</span> is not available at{" "}
                <span className="font-mono">{url}</span>. The extracted text above is all that exists
                for this citation.
              </AlertDescription>
            </Alert>
          )}
          {availability === "available" && (
            <PdfDocument
              key={active.fileId}
              url={url}
              pageNumber={active.pageNumber}
              bBox={bBox}
              zoom={zoom}
              citationKey={`${active.sourceNumber}`}
              onLoaded={(count) => setLoaded({ fileId: active.fileId, numPages: count })}
            />
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </aside>
  )
}
