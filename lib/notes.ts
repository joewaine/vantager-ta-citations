import { HALYARD_SLUG, fundHref } from "@/lib/funds"
import type { MemoContext } from "@/lib/memo-context"

// Note metadata without MDX imports, safe for client code and build scripts.

export const NOTE_ID = "q2-2026-monitoring-note"

export const noteHref = (fundSlug: string, noteId: string) =>
  fundSlug === HALYARD_SLUG ? "/" : `${fundHref(fundSlug)}/notes/${noteId}`

export type NoteMeta = MemoContext & { noteId: string; contentFile: string }

const note = (fundSlug: string, fundName: string, contentFile: string): NoteMeta => ({
  fundSlug,
  fundName,
  memoTitle: "Q2 2026 monitoring note",
  memoHref: noteHref(fundSlug, NOTE_ID),
  noteId: NOTE_ID,
  contentFile,
})

export const NOTES: NoteMeta[] = [
  note(HALYARD_SLUG, "Halyard Growth Partners III", "content/memo.mdx"),
  note("cobalt-ridge-buyout-iv", "Cobalt Ridge Buyout IV", "content/cobalt-ridge-buyout-iv-q2-2026.mdx"),
  note("larkspur-ventures-ii", "Larkspur Ventures II", "content/larkspur-ventures-ii-q2-2026.mdx"),
]
