import { connection } from "next/server"
import { Suspense } from "react"

import { NOTE_CITATIONS } from "@/lib/citation-manifest"
import { MEMOS } from "@/lib/memos"
import { verifyShare } from "@/lib/session"
import { Skeleton } from "@/components/ui/skeleton"
import { SourcesAppendix } from "@/components/sources-appendix"

export const metadata = { title: "Shared note | MSCI Diligence Platform", robots: { index: false, follow: false } }

const expiryFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })

// Read-only copy for people outside the platform. No sign-in, no viewer, no history;
// citations are footnotes to a sources list. Source PDFs stay behind sign-in.
export default function SharePage({ params }: PageProps<"/share/[token]">) {
  return (
    <div className="bg-muted flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground flex h-11 items-center gap-3 px-4">
        <span className="text-[17px] tracking-tight">
          <span className="font-bold">MSCI</span> Diligence Platform
        </span>
        <span className="ml-auto text-xs opacity-90">Shared copy · read-only</span>
      </header>
      <main className="flex-1 px-4 py-6 md:px-8">
        <Suspense fallback={<Skeleton className="mx-auto h-[70vh] w-full max-w-3xl rounded-lg" />}>
          <SharedMemo params={params} />
        </Suspense>
      </main>
    </div>
  )
}

// Token expiry depends on the clock, so this part renders at request time, never at build.
async function SharedMemo({ params }: { params: PageProps<"/share/[token]">["params"] }) {
  await connection()
  const { token } = await params
  const share = await verifyShare(token)
  const memo = share ? MEMOS.find((m) => m.memoHref === share.memoHref) : undefined
  if (!share || !memo) {
    return (
      <div className="bg-card mx-auto w-full max-w-md rounded-lg border px-6 py-8 text-center shadow-xs">
        <h1 className="tracking-display text-lg font-semibold">This link is no longer available</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Shared links expire after 7 days or when they are malformed. Ask the person who shared it for a new one.
        </p>
      </div>
    )
  }
  const citations = NOTE_CITATIONS.find((n) => n.memoHref === memo.memoHref)?.citations ?? []
  const { Component } = memo

  return (
    <>
      <article className="bg-card text-card-foreground mx-auto w-full max-w-3xl rounded-lg border px-4 py-6 shadow-xs sm:px-7 sm:py-8 md:px-10">
        <Component />
        <SourcesAppendix citations={citations} linkFiles={false} />
      </article>
      <p className="text-muted-foreground mx-auto mt-4 max-w-3xl text-center text-[11px]">
        Shared by {share.by}. This link expires {expiryFormat.format(new Date(share.exp * 1000))}. Source documents require a platform sign-in.
        Fictional data for assessment use.
      </p>
    </>
  )
}
