import { HALYARD_SLUG } from "@/lib/funds"
import { NOTE_ID, getMemo } from "@/lib/memos"
import { MemoPage } from "@/components/memo-page"

export default function Page() {
  const memo = getMemo(HALYARD_SLUG, NOTE_ID)
  if (!memo) throw new Error("The assessment memo is not registered in lib/memos.ts")
  return <MemoPage memo={memo} />
}
