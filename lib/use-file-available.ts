"use client"

import { useEffect, useState } from "react"

import { getFileUrl } from "@/lib/sources"

export type FileAvailability = "checking" | "available" | "missing"

// One HEAD request per distinct file for the whole page; many badges share a file.
const availabilityCache = new Map<string, Promise<FileAvailability>>()

function checkFile(fileId: string): Promise<FileAvailability> {
  let pending = availabilityCache.get(fileId)
  if (!pending) {
    pending = fetch(getFileUrl(fileId), { method: "HEAD" })
      .then((res): FileAvailability => (res.ok ? "available" : "missing"))
      .catch((): FileAvailability => "missing")
    availabilityCache.set(fileId, pending)
  }
  return pending
}

export function useFileAvailable(fileId: string): FileAvailability {
  const [state, setState] = useState<FileAvailability>("checking")

  useEffect(() => {
    let cancelled = false
    checkFile(fileId).then((result) => {
      if (!cancelled) setState(result)
    })
    return () => {
      cancelled = true
    }
  }, [fileId])

  return state
}
