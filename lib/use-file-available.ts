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
    if (!fileId) return
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

/** Availability for many files at once, keyed by file id. Missing keys are still checking. */
export function useFileAvailabilityMap(fileIds: readonly string[]): Record<string, FileAvailability> {
  const [map, setMap] = useState<Record<string, FileAvailability>>({})
  const key = [...new Set(fileIds)].sort().join("|")

  useEffect(() => {
    let cancelled = false
    for (const fileId of key.split("|").filter(Boolean)) {
      checkFile(fileId).then((result) => {
        if (!cancelled) setMap((current) => (current[fileId] === result ? current : { ...current, [fileId]: result }))
      })
    }
    return () => {
      cancelled = true
    }
  }, [key])

  return map
}
