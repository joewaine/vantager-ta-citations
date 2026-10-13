"use client"

import { checkClaim } from "@/lib/claim-check"
import { NOTE_CITATIONS, type ManifestCitation, type NoteCitations } from "@/lib/citation-manifest"
import { createLocalStore } from "@/lib/local-store"
import type { PaperTrailEvent } from "@/lib/paper-trail"
import type { SourceBadgeProps } from "@/lib/sources"
import type { FileAvailability } from "@/lib/use-file-available"

export type NotificationKind = "discrepancy" | "missing-source" | "unchecked" | "source-update"

export type Notification = {
  id: string
  kind: NotificationKind
  title: string
  body: string
  memoHref: string
  fundName: string
  /** Citation to open when the notification is actioned. */
  citation?: SourceBadgeProps
  fileId?: string
  fileName?: string
}

// Fictional pipeline events, the one kind the client cannot derive from local state.
const SOURCE_UPDATES = [
  {
    fileId: "q2-2026-quarterly-report",
    fileName: "Halyard Growth Partners III - Q2 2026 Quarterly Report.pdf",
    when: "Oct 10, 2026",
  },
  {
    fileId: "cobalt-ridge-q2-2026-quarterly-report",
    fileName: "Cobalt Ridge Buyout IV - Q2 2026 Quarterly Report.pdf",
    when: "Oct 12, 2026",
  },
]

// Read and dismissed marks are scoped to a sign-in: each login starts with a full inbox.
type Scoped = { session: string; ids: string[] }
const EMPTY_SCOPED: Scoped = { session: "", ids: [] }
const EMPTY_IDS: string[] = []

const dismissedStore = createLocalStore<Scoped>("msci-dp.notifications.dismissed.v2", EMPTY_SCOPED)
const readStore = createLocalStore<Scoped>("msci-dp.notifications.read.v2", EMPTY_SCOPED)
const requestedStore = createLocalStore<string[]>("msci-dp.notifications.requested.v1", [])

const scopedIds = (value: Scoped, session: string) => (value.session === session ? value.ids : EMPTY_IDS)
const addScoped = (session: string, ids: string[]) => (current: Scoped): Scoped => ({
  session,
  ids: [...new Set([...(current.session === session ? current.ids : []), ...ids])],
})

export const useDismissed = (session: string) => scopedIds(dismissedStore.useValue(), session)
export const useRead = (session: string) => scopedIds(readStore.useValue(), session)
export const useRequested = requestedStore.useValue

export const dismissNotification = (session: string, id: string) => dismissedStore.update(addScoped(session, [id]))
export const markRead = (session: string, ids: string[]) => readStore.update(addScoped(session, ids))
export const requestFromGp = (fileId: string) => requestedStore.update((ids) => (ids.includes(fileId) ? ids : [...ids, fileId]))

const stripProps = ({ sourceNumber, fileId, fileName, pageNumber, bBox, highlight }: ManifestCitation): SourceBadgeProps => ({
  sourceNumber,
  fileId,
  fileName,
  pageNumber,
  bBox,
  highlight,
})

function discrepancies(note: NoteCitations): Notification[] {
  return note.citations
    .filter((c) => checkClaim(c.claim, c.highlight?.value) === "disagrees")
    .map((c) => ({
      id: `discrepancy:${note.memoHref}#${c.sourceNumber}`,
      kind: "discrepancy",
      title: `Citation [${c.sourceNumber}] may disagree with its source`,
      body: `${note.fundName}: the memo says "${c.claim.slice(-60).trim()}" but the extracted ${c.highlight?.label ? c.highlight.label.toLowerCase() : "value"} is ${c.highlight?.value}.`,
      memoHref: note.memoHref,
      fundName: note.fundName,
      citation: stripProps(c),
    }))
}

function missingSources(note: NoteCitations, availability: Record<string, FileAvailability>): Notification[] {
  const seen = new Set<string>()
  const result: Notification[] = []
  for (const c of note.citations) {
    if (availability[c.fileId] !== "missing" || seen.has(c.fileId)) continue
    seen.add(c.fileId)
    const count = note.citations.filter((x) => x.fileId === c.fileId).length
    result.push({
      id: `missing:${note.memoHref}#${c.fileId}`,
      kind: "missing-source",
      title: `Source not in data room: ${c.fileName.replace(/\.pdf$/i, "")}`,
      body: `${count} citation${count === 1 ? "" : "s"} in the ${note.fundName} note cannot be verified until the GP provides this document.`,
      memoHref: note.memoHref,
      fundName: note.fundName,
      citation: stripProps(c),
      fileId: c.fileId,
      fileName: c.fileName,
    })
  }
  return result
}

function unchecked(note: NoteCitations, trail: PaperTrailEvent[]): Notification[] {
  const viewed = new Set(trail.filter((e) => e.memoHref === note.memoHref).map((e) => e.sourceNumber))
  const remaining = note.citations.filter((c) => !viewed.has(c.sourceNumber))
  if (remaining.length === 0) return []
  const untouched = remaining.length === note.citations.length
  return [
    {
      id: `unchecked:${note.memoHref}`,
      kind: "unchecked",
      title: untouched
        ? `${note.citations.length} citations awaiting check`
        : `${remaining.length} of ${note.citations.length} citations not yet checked`,
      body: `${note.fundName}: ${note.memoTitle}. ${untouched ? "Start with" : "Next unchecked is"} [${remaining[0].sourceNumber}].`,
      memoHref: note.memoHref,
      fundName: note.fundName,
      citation: stripProps(remaining[0]),
    },
  ]
}

function sourceUpdates(note: NoteCitations): Notification[] {
  return SOURCE_UPDATES.flatMap((update) => {
    const affected = note.citations.filter((c) => c.fileId === update.fileId)
    if (affected.length === 0) return []
    return [
      {
        id: `update:${note.memoHref}#${update.fileId}`,
        kind: "source-update",
        title: `${update.fileName.replace(/\.pdf$/i, "")} was re-uploaded`,
        body: `Re-uploaded ${update.when}. ${affected.length} citations in the ${note.fundName} note reference it and may have moved.`,
        memoHref: note.memoHref,
        fundName: note.fundName,
        citation: stripProps(affected[0]),
        fileId: update.fileId,
        fileName: update.fileName,
      },
    ]
  })
}

const KIND_ORDER: NotificationKind[] = ["discrepancy", "missing-source", "source-update", "unchecked"]

export function deriveNotifications(trail: PaperTrailEvent[], availability: Record<string, FileAvailability>, dismissed: string[]) {
  const all = NOTE_CITATIONS.flatMap((note) => [
    ...discrepancies(note),
    ...missingSources(note, availability),
    ...sourceUpdates(note),
    ...unchecked(note, trail),
  ])
  return all
    .filter((n) => !dismissed.includes(n.id))
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))
}
