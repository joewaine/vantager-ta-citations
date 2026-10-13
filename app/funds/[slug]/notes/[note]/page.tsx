import { notFound, redirect } from "next/navigation"

import { HALYARD_SLUG } from "@/lib/funds"
import { MEMOS, getMemo } from "@/lib/memos"
import { MemoPage } from "@/components/memo-page"

export function generateStaticParams() {
  return MEMOS.filter((memo) => memo.fundSlug !== HALYARD_SLUG).map((memo) => ({ slug: memo.fundSlug, note: memo.noteId }))
}

export async function generateMetadata({ params }: PageProps<"/funds/[slug]/notes/[note]">) {
  const { slug, note } = await params
  const memo = getMemo(slug, note)
  return { title: memo ? `${memo.fundName}: ${memo.memoTitle} | MSCI Diligence Platform` : "Note not found" }
}

export default async function NotePage({ params }: PageProps<"/funds/[slug]/notes/[note]">) {
  const { slug, note } = await params
  const memo = getMemo(slug, note)
  if (!memo) notFound()
  // The assessment memo has one canonical URL so its paper trail and favorites stay together.
  if (memo.memoHref === "/") redirect("/")
  return <MemoPage memo={memo} />
}
