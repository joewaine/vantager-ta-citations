"use client"

import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { FileWarning } from "lucide-react"

import type { BBox } from "@/lib/sources"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

// Served from public/ so the worker version always matches the pinned pdfjs-dist.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

/** Extra space around the cited region so single-line table cells stay visible. */
const HIGHLIGHT_PADDING_PT = 3

type PageDims = { width: number; height: number }

export type PdfDocumentProps = {
  url: string
  pageNumber: number
  bBox?: BBox
  /** 1 = fit the panel width. */
  zoom: number
  /** Changes whenever a different citation opens, so the viewer re-scrolls. */
  citationKey: string
  onLoaded?: (numPages: number) => void
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.floor(entry.contentRect.width))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

// The parent keys this component by file, so per-document state resets by remounting.
export default function PdfDocument({ url, pageNumber, bBox, zoom, citationKey, onLoaded }: PdfDocumentProps) {
  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>()
  const [numPages, setNumPages] = useState(0)
  const [dims, setDims] = useState<Record<number, PageDims>>({})
  const targetRef = useRef<HTMLDivElement>(null)

  const renderWidth = Math.floor(containerWidth * zoom)
  const loadedCount = Object.keys(dims).length
  const allPagesLoaded = numPages > 0 && loadedCount === numPages
  const targetDims = dims[pageNumber]

  // Scroll once the target page has real dimensions, and again when every page has
  // loaded, because pages above the target change height as they come in.
  useEffect(() => {
    if (!targetDims || !targetRef.current) return
    targetRef.current.scrollIntoView({ block: bBox ? "center" : "start", behavior: "smooth" })
  }, [citationKey, targetDims, allPagesLoaded, bBox])

  const scale = targetDims && renderWidth > 0 ? renderWidth / targetDims.width : 0

  return (
    <div ref={containerRef} className="w-full">
      {renderWidth > 0 && (
        <div style={{ width: renderWidth }}>
          <Document
            file={url}
            loading={<Skeleton className="aspect-[612/792] w-full" />}
            error={
              <Alert variant="destructive">
                <FileWarning />
                <AlertTitle>Source file could not be loaded</AlertTitle>
                <AlertDescription>
                  The cited document was not found at <code className="font-mono">{url}</code>. The
                  extracted text in the header is all that is available for this citation.
                </AlertDescription>
              </Alert>
            }
            onLoadSuccess={(doc) => {
              setNumPages(doc.numPages)
              onLoaded?.(doc.numPages)
            }}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => {
              const isTarget = n === pageNumber
              return (
                <div key={n} className="ring-border relative mb-4 bg-white shadow-sm ring-1" data-page-number={n}>
                  <Page
                    pageNumber={n}
                    width={renderWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadSuccess={(page) =>
                      setDims((current) => ({
                        ...current,
                        [n]: { width: page.originalWidth, height: page.originalHeight },
                      }))
                    }
                  />
                  {isTarget && !bBox && <div ref={targetRef} className="absolute inset-x-0 top-0" />}
                  {isTarget && bBox && scale > 0 && (
                    <div
                      ref={targetRef}
                      aria-label="Cited region"
                      className="border-primary bg-primary/15 ring-primary/15 pointer-events-none absolute rounded-sm border-2 ring-4 animate-in fade-in zoom-in-95 duration-500"
                      style={{
                        left: (bBox.x - HIGHLIGHT_PADDING_PT) * scale,
                        top: (bBox.y - HIGHLIGHT_PADDING_PT) * scale,
                        width: (bBox.w + 2 * HIGHLIGHT_PADDING_PT) * scale,
                        height: (bBox.h + 2 * HIGHLIGHT_PADDING_PT) * scale,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </Document>
        </div>
      )}
    </div>
  )
}
