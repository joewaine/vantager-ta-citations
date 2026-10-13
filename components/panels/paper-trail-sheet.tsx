"use client"

import { useState } from "react"
import { History } from "lucide-react"

import { clearPaperTrail, usePaperTrail, type PaperTrailEvent } from "@/lib/paper-trail"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { shortFileName } from "@/components/source-badge"
import { useOpenCitation } from "@/components/panels/use-open-citation"

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" })
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" })

function dayKey(iso: string) {
  return dayFormat.format(new Date(iso))
}

function groupByDay(events: PaperTrailEvent[]) {
  const groups = new Map<string, PaperTrailEvent[]>()
  for (const event of events) {
    const key = dayKey(event.at)
    groups.set(key, [...(groups.get(key) ?? []), event])
  }
  return [...groups.entries()]
}

export function PaperTrailSheet() {
  const events = usePaperTrail()
  const openCitation = useOpenCitation()
  const [open, setOpen] = useState(false)
  const uniqueCitations = new Set(events.map((e) => `${e.memoHref}#${e.sourceNumber}`)).size

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground" aria-label="Paper trail">
          <History />
          <span className="hidden sm:inline">Paper trail</span>
          {events.length > 0 && (
            <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] tabular-nums">{events.length}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="tracking-display">Paper trail</SheetTitle>
          <SheetDescription className="text-xs">
            Every source this viewer has opened, newest first. {uniqueCitations} distinct citation{uniqueCitations === 1 ? "" : "s"} checked.
            Stored in this browser only.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="[&_[data-radix-scroll-area-viewport]>div]:block! min-h-0 flex-1">
          {events.length === 0 ? (
            <p className="text-muted-foreground px-4 py-8 text-center text-sm">No sources opened yet.</p>
          ) : (
            groupByDay(events).map(([day, dayEvents]) => (
              <section key={day} className="border-b last:border-b-0">
                <h3 className="text-muted-foreground bg-muted/60 px-4 py-1.5 text-[11px] font-semibold tracking-wide uppercase">{day}</h3>
                <ol>
                  {dayEvents.map((event) => (
                    <li key={event.id}>
                      <button
                        type="button"
                        className="hover:bg-accent/60 flex w-full items-start gap-3 px-4 py-2 text-left"
                        onClick={() => {
                          setOpen(false)
                          openCitation(event.memoHref, {
                            sourceNumber: event.sourceNumber,
                            fileId: event.fileId,
                            fileName: event.fileName,
                            pageNumber: event.pageNumber,
                          })
                        }}
                      >
                        <span className="text-muted-foreground w-16 shrink-0 pt-0.5 text-xs tabular-nums">{timeFormat.format(new Date(event.at))}</span>
                        <span className="block min-w-0 flex-1 overflow-hidden">
                          <span className="flex items-baseline gap-1.5 text-sm">
                            <span className="text-primary font-semibold tabular-nums">[{event.sourceNumber}]</span>
                            <span className="truncate font-medium">
                              {event.label ? `${event.label}: ` : ""}
                              {event.value ?? "page only"}
                            </span>
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {shortFileName(event.fileName)} · p. {event.pageNumber} · {event.fundName}
                            {event.viewer ? ` · ${event.viewer}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            ))
          )}
        </ScrollArea>
        {events.length > 0 && (
          <SheetFooter className="border-t">
            <Button variant="outline" size="sm" onClick={clearPaperTrail}>Clear history</Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
