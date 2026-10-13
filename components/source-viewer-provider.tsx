"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { favoriteId, toggleFavorite as toggleFavoriteInStore, useFavorites } from "@/lib/favorites"
import type { MemoContext } from "@/lib/memo-context"
import { recordCitationOpened, usePaperTrail } from "@/lib/paper-trail"
import type { SourceBadgeProps } from "@/lib/sources"
import { useViewerIdentity } from "@/lib/viewer-identity"

type SourceViewerContextValue = {
  memo: MemoContext
  active: SourceBadgeProps | null
  /** All citations on the page, ordered by source number, for prev/next navigation. */
  citations: SourceBadgeProps[]
  /** Source numbers this viewer has opened before, from the paper trail. */
  viewed: ReadonlySet<number>
  /** Source numbers the viewer has favorited. */
  favorited: ReadonlySet<number>
  open: (citation: SourceBadgeProps) => void
  close: () => void
  next: () => void
  prev: () => void
  toggleFavorite: (citation: SourceBadgeProps) => void
  /** Badges register themselves on mount; returns an unregister function. */
  register: (citation: SourceBadgeProps) => () => void
}

const SourceViewerContext = createContext<SourceViewerContextValue | null>(null)

const DEEP_LINK_PARAM = "source"

function sameCitation(a: SourceBadgeProps, b: SourceBadgeProps) {
  return (
    a.sourceNumber === b.sourceNumber &&
    a.fileId === b.fileId &&
    a.fileName === b.fileName &&
    a.pageNumber === b.pageNumber &&
    a.bBox?.x === b.bBox?.x &&
    a.bBox?.y === b.bBox?.y &&
    a.bBox?.w === b.bBox?.w &&
    a.bBox?.h === b.bBox?.h &&
    a.highlight?.label === b.highlight?.label &&
    a.highlight?.value === b.highlight?.value &&
    a.highlight?.reasoning === b.highlight?.reasoning
  )
}

export function SourceViewerProvider({ memo, children }: { memo: MemoContext; children: ReactNode }) {
  const [active, setActive] = useState<SourceBadgeProps | null>(null)
  const [registry, setRegistry] = useState<Map<number, SourceBadgeProps>>(() => new Map())
  const identity = useViewerIdentity()
  const trail = usePaperTrail()
  const favorites = useFavorites()
  const deepLinkHandled = useRef(false)

  const register = useCallback((citation: SourceBadgeProps) => {
    setRegistry((current) => {
      const existing = current.get(citation.sourceNumber)
      // Badges re-run this effect on every render; return the same Map so React bails out.
      if (existing && sameCitation(existing, citation)) return current
      const updated = new Map(current)
      updated.set(citation.sourceNumber, citation)
      return updated
    })
    return () => {
      setRegistry((current) => {
        if (!current.has(citation.sourceNumber)) return current
        const updated = new Map(current)
        updated.delete(citation.sourceNumber)
        return updated
      })
    }
  }, [])

  const citations = useMemo(
    () => [...registry.values()].sort((a, b) => a.sourceNumber - b.sourceNumber),
    [registry],
  )

  const viewed = useMemo(
    () => new Set(trail.filter((e) => e.memoHref === memo.memoHref).map((e) => e.sourceNumber)),
    [trail, memo.memoHref],
  )
  const favorited = useMemo(
    () => new Set(favorites.filter((f) => f.memoHref === memo.memoHref).map((f) => f.citation.sourceNumber)),
    [favorites, memo.memoHref],
  )

  const open = useCallback(
    (citation: SourceBadgeProps) => {
      recordCitationOpened(memo, citation, identity?.email ?? null)
      setActive(citation)
    },
    [memo, identity?.email],
  )
  const close = useCallback(() => setActive(null), [])

  const step = useCallback(
    (delta: 1 | -1) => {
      if (!active) return
      const index = citations.findIndex((c) => c.sourceNumber === active.sourceNumber)
      const target = citations[index + delta]
      if (target) open(target)
    },
    [active, citations, open],
  )
  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => step(-1), [step])

  const toggleFavorite = useCallback((citation: SourceBadgeProps) => toggleFavoriteInStore(memo, citation), [memo])

  // Favorites and the paper trail link to a memo with ?source=N; open it once badges have registered.
  useEffect(() => {
    if (deepLinkHandled.current || registry.size === 0) return
    const requested = Number(new URLSearchParams(window.location.search).get(DEEP_LINK_PARAM))
    const target = registry.get(requested)
    if (!target) return
    deepLinkHandled.current = true
    const timer = window.setTimeout(() => open(target), 0)
    return () => window.clearTimeout(timer)
  }, [registry, open])

  const value = useMemo(
    () => ({ memo, active, citations, viewed, favorited, open, close, next, prev, toggleFavorite, register }),
    [memo, active, citations, viewed, favorited, open, close, next, prev, toggleFavorite, register],
  )

  return <SourceViewerContext.Provider value={value}>{children}</SourceViewerContext.Provider>
}

export function useSourceViewer() {
  const context = useContext(SourceViewerContext)
  if (!context) {
    throw new Error("useSourceViewer must be used inside <SourceViewerProvider>")
  }
  return context
}

/** For chrome that renders on every page, with or without a memo open. */
export function useOptionalSourceViewer() {
  return useContext(SourceViewerContext)
}

export const favoriteKey = favoriteId
