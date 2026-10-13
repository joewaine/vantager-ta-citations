"use client"

import { useEffect } from "react"
import { AlertTriangle, FileText, Star } from "lucide-react"

import type { SourceBadgeProps } from "@/lib/sources"
import { useFileAvailable } from "@/lib/use-file-available"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useOptionalSourceViewer } from "@/components/source-viewer-provider"

const PDF_EXTENSION = /\.pdf$/i

export function shortFileName(fileName: string) {
  return fileName.replace(PDF_EXTENSION, "")
}

// Inline bracketed reference in brand blue, like a footnote marker. Hover shows what the
// extraction pipeline saw; click opens the source viewer at the cited region.
export function SourceBadge(props: SourceBadgeProps) {
  const { sourceNumber, fileId, fileName, pageNumber, bBox, highlight } = props
  const viewer = useOptionalSourceViewer()
  const availability = useFileAvailable(fileId)
  const isMissing = availability === "missing"
  const isActive = viewer?.active?.sourceNumber === sourceNumber
  const isViewed = viewer?.viewed.has(sourceNumber) ?? false
  const isFavorite = viewer?.favorited.has(sourceNumber) ?? false
  const hasRegion = bBox !== undefined

  // Register keyed on the stable `register` callback and the serialized props. Depending on
  // the whole context, or on the always-new MDX props object, would unregister and
  // re-register every badge on each render.
  const register = viewer?.register
  const propsKey = JSON.stringify(props)
  useEffect(() => register?.(JSON.parse(propsKey) as SourceBadgeProps), [register, propsKey])

  // Without a viewer (shared copy, print, export) the marker is a footnote link to the sources list.
  if (!viewer) {
    return (
      <a href={`#source-${sourceNumber}`} className="text-primary px-px align-baseline text-[0.85em] font-medium tabular-nums no-underline hover:underline" data-source-number={sourceNumber}>
        [{sourceNumber}]
      </a>
    )
  }
  const { open } = viewer

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => open(props)}
          aria-pressed={isActive}
          aria-label={`Source ${sourceNumber}: ${fileName}, page ${pageNumber}`}
          data-source-number={sourceNumber}
          className={cn(
            "text-primary inline rounded-sm px-px align-baseline text-[0.85em] font-medium tabular-nums transition-colors touch-manipulation",
            "hover:bg-accent focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
            isActive && "bg-accent",
            isViewed && !isActive && "decoration-primary/40 underline decoration-dotted underline-offset-[3px]",
            isMissing && "text-destructive",
          )}
        >
          [{sourceNumber}]
          {isMissing && <AlertTriangle className="ml-0.5 inline size-3 align-[-2px]" aria-hidden />}
          {isFavorite && <Star className="fill-primary ml-0.5 inline size-2.5 align-[-1px]" aria-label="Favorited" />}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="w-72 flex-col items-stretch gap-0 overflow-hidden bg-white p-0 text-left shadow-lg ring-1 ring-black/5 dark:bg-popover"
      >
        {/* The whole card is a second click target; the pointer can travel from [n] onto it. */}
        <button
          type="button"
          onClick={() => open(props)}
          aria-label={`Open source ${sourceNumber} in the viewer`}
          className="hover:bg-accent/40 focus-visible:ring-ring/50 block w-full cursor-pointer text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <div className="bg-primary text-primary-foreground flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium">
            <FileText className="size-3 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{shortFileName(fileName)}</span>
            <span className="shrink-0 tabular-nums opacity-90">p. {pageNumber}</span>
          </div>
          <div className="space-y-1 px-3 py-2">
            {highlight?.label && (
              <div className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">{highlight.label}</div>
            )}
            {highlight?.value && (
              <div className="text-foreground text-[13px] leading-snug font-semibold tabular-nums">{highlight.value}</div>
            )}
            {highlight?.reasoning && <div className="text-muted-foreground italic">{highlight.reasoning}</div>}
            {!highlight && <div className="text-muted-foreground italic">No extracted text for this citation</div>}
            {!hasRegion && <div className="text-muted-foreground">Whole page cited, no region recorded</div>}
            {isMissing && (
              <div className="text-destructive flex items-center gap-1 font-medium">
                <AlertTriangle className="size-3" aria-hidden />
                Source file not found
              </div>
            )}
            <div className="text-primary pt-0.5 text-[10px] font-medium">
              {isViewed ? "Checked before · click to open again" : "Click to open in the source viewer"}
            </div>
          </div>
        </button>
      </TooltipContent>
    </Tooltip>
  )
}
