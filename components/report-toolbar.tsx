"use client"

import { useState } from "react"
import { Check, Copy, Download, FolderArchive, Link2, Printer, Share2 } from "lucide-react"

import { createShareToken, type ShareLink } from "@/app/share/actions"
import { NOTE_CITATIONS } from "@/lib/citation-manifest"
import { buildStandaloneHtml, downloadFile } from "@/lib/export-html"
import { buildMemoBundle, downloadBytes } from "@/lib/export-zip"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSourceViewer } from "@/components/source-viewer-provider"

const expiryFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

// Mirrors the platform's report toolbar: title on the left, status and actions on the right.
export function ReportToolbar({ title }: { title: string }) {
  const { memo, citations, viewed, favorited } = useSourceViewer()
  const checked = citations.filter((c) => viewed.has(c.sourceNumber)).length
  const allChecked = citations.length > 0 && checked === citations.length
  const manifest = NOTE_CITATIONS.find((n) => n.memoHref === memo.memoHref)?.citations ?? []

  const [share, setShare] = useState<ShareLink | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [bundling, setBundling] = useState(false)
  const [bundleStatus, setBundleStatus] = useState<string | null>(null)

  const shareUrl = share ? `${window.location.origin}/share/${share.token}` : null

  const mintLink = async () => {
    setBusy(true)
    setShareError(null)
    try {
      setShare(await createShareToken(memo.memoHref))
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "Could not create a link")
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setShareError("Clipboard unavailable; select the link and copy it.")
    }
  }

  const exportHtml = () => {
    const article = document.querySelector<HTMLElement>("article[data-memo]")
    if (!article) return
    downloadFile(`${slugify(`${memo.fundName} ${memo.memoTitle}`)}.html`, buildStandaloneHtml(article, memo, manifest))
  }

  const exportBundle = async () => {
    const article = document.querySelector<HTMLElement>("article[data-memo]")
    if (!article) return
    setBundling(true)
    setBundleStatus(null)
    try {
      const result = await buildMemoBundle(memo, manifest, buildStandaloneHtml(article, memo, manifest))
      downloadBytes(`${slugify(`${memo.fundName} ${memo.memoTitle}`)}-bundle.zip`, result.bytes)
      setBundleStatus(
        `${result.included} source document${result.included === 1 ? "" : "s"} included` +
          (result.missing.length ? `; not in data room: ${result.missing.join(", ")}` : ""),
      )
    } catch {
      setBundleStatus("Export failed")
    } finally {
      setBundling(false)
    }
  }

  return (
    <div className="bg-background flex h-11 items-center gap-3 border-b px-4" data-print-hidden>
      <h2 className="tracking-display min-w-0 flex-1 truncate text-sm font-semibold">{title}</h2>
      <div className="text-muted-foreground hidden items-center gap-3 text-xs tabular-nums sm:flex">
        <span>
          {citations.length} citation{citations.length === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={allChecked ? "size-2 rounded-full bg-emerald-500" : "bg-chart-5 size-2 rounded-full"} aria-hidden />
          {checked} checked
        </span>
        {favorited.size > 0 && <span>{favorited.size} favorited</span>}
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer />
              <span className="hidden md:inline">Print / PDF</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Print, or save as PDF with a sources list appended</TooltipContent>
        </Tooltip>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Share2 />
              <span className="hidden md:inline">Share</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-[min(360px,calc(100vw-16px))] space-y-4 p-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Link2 className="size-4" aria-hidden />
                Read-only link
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Anyone with the link can read this note and its sources list without signing in. Links expire after 7 days.
              </p>
              {shareUrl ? (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1">
                    <input readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} className="bg-muted h-7 min-w-0 flex-1 rounded-md border px-2 font-mono text-[11px]" aria-label="Share link" />
                    <Button variant="outline" size="icon-sm" onClick={copyLink} aria-label="Copy link">
                      {copied ? <Check /> : <Copy />}
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-[11px]">Expires {share && expiryFormat.format(new Date(share.expiresAt))}.</p>
                </div>
              ) : (
                <Button size="sm" className="mt-2" onClick={mintLink} disabled={busy}>
                  {busy ? "Creating…" : "Create link"}
                </Button>
              )}
              {shareError && <p className="text-destructive mt-1 text-xs">{shareError}</p>}
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Download className="size-4" aria-hidden />
                Standalone file
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                A single HTML file with the note and its sources list. Opens anywhere, no platform required.
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={exportHtml}>
                Download HTML
              </Button>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <FolderArchive className="size-4" aria-hidden />
                Evidence bundle
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                A zip with the note, every cited source PDF that is available, and a citations CSV and JSON listing file, page and region for each claim.
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={exportBundle} disabled={bundling}>
                {bundling ? "Bundling…" : "Download bundle (.zip)"}
              </Button>
              {bundleStatus && <p className="text-muted-foreground mt-1 text-[11px]">{bundleStatus}</p>}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
