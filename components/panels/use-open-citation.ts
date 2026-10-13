"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

import type { SourceBadgeProps } from "@/lib/sources"
import { useOptionalSourceViewer } from "@/components/source-viewer-provider"

/** Open a citation in place when its memo is on screen, otherwise navigate to it. */
export function useOpenCitation() {
  const router = useRouter()
  const viewer = useOptionalSourceViewer()
  return useCallback(
    (memoHref: string, citation: SourceBadgeProps) => {
      if (viewer && viewer.memo.memoHref === memoHref) {
        viewer.open(citation)
        return
      }
      router.push(`${memoHref}?source=${citation.sourceNumber}`)
    },
    [router, viewer],
  )
}
