"use client"

import { createLocalStore } from "@/lib/local-store"
import type { MemoContext } from "@/lib/memo-context"
import type { SourceBadgeProps } from "@/lib/sources"

export type Favorite = MemoContext & {
  id: string
  addedAt: string
  citation: SourceBadgeProps
}

const store = createLocalStore<Favorite[]>("msci-dp.favorites.v1", [])

export const favoriteId = (fundSlug: string, sourceNumber: number) => `${fundSlug}:${sourceNumber}`

export function toggleFavorite(memo: MemoContext, citation: SourceBadgeProps) {
  const id = favoriteId(memo.fundSlug, citation.sourceNumber)
  store.update((favorites) => {
    if (favorites.some((f) => f.id === id)) return favorites.filter((f) => f.id !== id)
    return [{ id, addedAt: new Date().toISOString(), ...memo, citation }, ...favorites]
  })
}

export function removeFavorite(id: string) {
  store.update((favorites) => favorites.filter((f) => f.id !== id))
}

export const useFavorites = store.useValue
