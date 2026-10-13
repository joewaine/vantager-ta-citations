import type { ComponentType } from "react"

import CobaltRidgeMemo from "@/content/cobalt-ridge-buyout-iv-q2-2026.mdx"
import HalyardMemo from "@/content/memo.mdx"
import LarkspurMemo from "@/content/larkspur-ventures-ii-q2-2026.mdx"
import { NOTES, type NoteMeta } from "@/lib/notes"

// Server-only: binds each note's metadata to its MDX component.
export { NOTE_ID, noteHref } from "@/lib/notes"

export type MemoEntry = NoteMeta & { Component: ComponentType }

const COMPONENTS: Record<string, ComponentType> = {
  "content/memo.mdx": HalyardMemo,
  "content/cobalt-ridge-buyout-iv-q2-2026.mdx": CobaltRidgeMemo,
  "content/larkspur-ventures-ii-q2-2026.mdx": LarkspurMemo,
}

export const MEMOS: MemoEntry[] = NOTES.map((note) => {
  const Component = COMPONENTS[note.contentFile]
  if (!Component) throw new Error(`No MDX component registered for ${note.contentFile}`)
  return { ...note, Component }
})

export const getMemo = (fundSlug: string, noteId: string) =>
  MEMOS.find((memo) => memo.fundSlug === fundSlug && memo.noteId === noteId)
