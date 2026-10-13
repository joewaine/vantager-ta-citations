"use client"

import { AlertTriangle, FileText } from "lucide-react"

import { getFileUrl, type SourceBadgeProps } from "@/lib/sources"
import { useFileAvailable } from "@/lib/use-file-available"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Template badge built on shadcn Badge + Tooltip. Shows the citation's data on hover;
// click opens the PDF at the cited page in a new tab until the source viewer replaces it.

const PDF_EXTENSION = /\.pdf$/i

function shortFileName(fileName: string) {
  return fileName.replace(PDF_EXTENSION, "")
}

export function SourceBadge(props: SourceBadgeProps) {
  const { sourceNumber, fileId, fileName, pageNumber, bBox, highlight } = props
  const availability = useFileAvailable(fileId)
  const isMissing = availability === "missing"
  const hasRegion = bBox !== undefined
  // Browser PDF viewers honour #page=N; this is the pre-viewer fallback.
  const href = `${getFileUrl(fileId)}#page=${pageNumber}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <sup className="ml-0.5 align-super">
          <Badge
            asChild
            variant={isMissing ? "destructive" : "outline"}
            className="h-4 min-w-4 px-1 font-mono text-[10px] no-underline"
          >
            <a
              href={isMissing ? undefined : href}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={isMissing}
              aria-label={`Source ${sourceNumber}: ${fileName}, page ${pageNumber}`}
              data-source-number={sourceNumber}
            >
              {sourceNumber}
              {isMissing && <AlertTriangle data-icon="inline-end" aria-hidden />}
            </a>
          </Badge>
        </sup>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm flex-col items-start gap-1 text-left">
        <div className="flex items-center gap-1.5 font-medium">
          <FileText className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{shortFileName(fileName)}</span>
        </div>
        <div className="opacity-80">
          Page {pageNumber}
          {!hasRegion && " · whole page, no region recorded"}
        </div>
        {highlight?.label && <div className="opacity-80">{highlight.label}</div>}
        {highlight?.value && <div className="font-mono text-[11px]">{highlight.value}</div>}
        {highlight?.reasoning && <div className="opacity-80 italic">{highlight.reasoning}</div>}
        {!highlight && <div className="opacity-80 italic">No extracted text for this citation</div>}
        {isMissing && (
          <div className="flex items-center gap-1 font-medium">
            <AlertTriangle className="size-3" aria-hidden />
            Source file not found
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
