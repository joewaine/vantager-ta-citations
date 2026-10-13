"use client"

import { useState } from "react"
import { FolderArchive } from "lucide-react"

import { buildFundBundle, downloadBytes, slugify } from "@/lib/export-zip"
import type { Fund } from "@/lib/funds"
import { Button } from "@/components/ui/button"

export function FundExportButton({ fund }: { fund: Fund }) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const available = fund.documents.filter((d) => d.external && d.href).length

  const exportBundle = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const result = await buildFundBundle(fund)
      downloadBytes(`${slugify(fund.name)}-documents.zip`, result.bytes)
      setStatus(`${result.included} file${result.included === 1 ? "" : "s"} bundled${result.missing.length ? `, ${result.missing.length} unavailable` : ""}`)
    } catch {
      setStatus("Export failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status && <span className="text-muted-foreground text-xs">{status}</span>}
      <Button variant="outline" size="sm" onClick={exportBundle} disabled={busy || available === 0}>
        <FolderArchive />
        {busy ? "Bundling…" : "Export documents (.zip)"}
      </Button>
    </div>
  )
}
