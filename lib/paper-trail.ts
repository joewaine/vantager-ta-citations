"use client"

import { createLocalStore, newId } from "@/lib/local-store"
import type { MemoContext } from "@/lib/memo-context"
import type { SourceBadgeProps } from "@/lib/sources"

export type PaperTrailEvent = {
  id: string
  at: string
  viewer: string | null
  fundSlug: string
  fundName: string
  memoTitle: string
  memoHref: string
  sourceNumber: number
  fileId: string
  fileName: string
  pageNumber: number
  label?: string
  value?: string
}

const MAX_EVENTS = 500
const store = createLocalStore<PaperTrailEvent[]>("msci-dp.paper-trail.v1", [])

export function recordCitationOpened(memo: MemoContext, citation: SourceBadgeProps, viewer: string | null) {
  const event: PaperTrailEvent = {
    id: newId(),
    at: new Date().toISOString(),
    viewer,
    ...memo,
    sourceNumber: citation.sourceNumber,
    fileId: citation.fileId,
    fileName: citation.fileName,
    pageNumber: citation.pageNumber,
    label: citation.highlight?.label,
    value: citation.highlight?.value,
  }
  store.update((events) => [event, ...events].slice(0, MAX_EVENTS))
}

export function clearPaperTrail() {
  store.write([])
}

export const usePaperTrail = store.useValue
