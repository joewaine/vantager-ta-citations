"use client"

import { Star } from "lucide-react"

import { useFavorites } from "@/lib/favorites"
import { usePaperTrail } from "@/lib/paper-trail"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { shortFileName } from "@/components/source-badge"
import { useOpenCitation } from "@/components/panels/use-open-citation"

const RECENT_LIMIT = 6
const timeFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })

// Per-fund slice of the viewer's paper trail and favorites, read from this browser.
export function FundActivity({ fundSlug }: { fundSlug: string }) {
  const events = usePaperTrail().filter((e) => e.fundSlug === fundSlug).slice(0, RECENT_LIMIT)
  const favorites = useFavorites().filter((f) => f.fundSlug === fundSlug)
  const openCitation = useOpenCitation()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent source checks</CardTitle>
          <CardDescription>Citations this viewer opened for this fund.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sources opened yet.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {events.map((event) => (
                <li key={event.id} className="flex items-baseline gap-2">
                  <span className="text-muted-foreground w-24 shrink-0 text-xs tabular-nums">{timeFormat.format(new Date(event.at))}</span>
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left hover:underline"
                    onClick={() =>
                      openCitation(event.memoHref, {
                        sourceNumber: event.sourceNumber,
                        fileId: event.fileId,
                        fileName: event.fileName,
                        pageNumber: event.pageNumber,
                      })
                    }
                  >
                    <span className="text-primary font-semibold tabular-nums">[{event.sourceNumber}]</span>{" "}
                    {event.label ? `${event.label}: ` : ""}
                    {event.value ?? shortFileName(event.fileName)}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Favorited extractions</CardTitle>
          <CardDescription>Pinned values from this fund&rsquo;s sources.</CardDescription>
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nothing favorited for this fund.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {favorites.map((favorite) => (
                <li key={favorite.id} className="flex items-baseline gap-2">
                  <Star className="fill-primary text-primary size-3 shrink-0 translate-y-0.5" aria-hidden />
                  <button type="button" className="min-w-0 flex-1 truncate text-left hover:underline" onClick={() => openCitation(favorite.memoHref, favorite.citation)}>
                    <span className="text-primary font-semibold tabular-nums">[{favorite.citation.sourceNumber}]</span>{" "}
                    {favorite.citation.highlight?.label ? `${favorite.citation.highlight.label}: ` : ""}
                    {favorite.citation.highlight?.value ?? shortFileName(favorite.citation.fileName)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
