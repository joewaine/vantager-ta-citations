"use client"

import { useState } from "react"
import { ChevronDown, Star, Trash2 } from "lucide-react"

import { removeFavorite, useFavorites, type Favorite } from "@/lib/favorites"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { shortFileName } from "@/components/source-badge"
import { useOpenCitation } from "@/components/panels/use-open-citation"

function groupByFund(favorites: Favorite[]) {
  const groups = new Map<string, { fundSlug: string; fundName: string; items: Favorite[] }>()
  for (const favorite of favorites) {
    const group = groups.get(favorite.fundSlug) ?? { fundSlug: favorite.fundSlug, fundName: favorite.fundName, items: [] }
    group.items.push(favorite)
    groups.set(favorite.fundSlug, group)
  }
  return [...groups.values()].sort((a, b) => a.fundName.localeCompare(b.fundName))
}

export function FavoritesSheet() {
  const favorites = useFavorites()
  const openCitation = useOpenCitation()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground" aria-label="Favorited extractions">
          <Star />
          <span className="hidden sm:inline">Favorites</span>
          {favorites.length > 0 && (
            <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] tabular-nums">{favorites.length}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="tracking-display">Favorited extractions</SheetTitle>
          <SheetDescription className="text-xs">Pinned source values to reference while you work. Stored in this browser only.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="[&_[data-radix-scroll-area-viewport]>div]:block! min-h-0 flex-1">
          {favorites.length === 0 ? (
            <p className="text-muted-foreground px-4 py-8 text-center text-sm">
              Nothing favorited yet. Open a citation and press the star.
            </p>
          ) : (
            groupByFund(favorites).map((group) => (
              <Collapsible key={group.fundSlug} defaultOpen className="border-b last:border-b-0">
                <CollapsibleTrigger className="group/drawer bg-muted/60 hover:bg-muted flex w-full items-center gap-2 px-4 py-2 text-left">
                  <ChevronDown className="text-muted-foreground size-3.5 transition-transform group-data-[state=closed]/drawer:-rotate-90" aria-hidden />
                  <span className="text-muted-foreground flex-1 truncate text-[11px] font-semibold tracking-wide uppercase">{group.fundName}</span>
                  <span className="text-muted-foreground text-[11px] tabular-nums">{group.items.length}</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul>
                    {group.items.map((favorite) => {
                      const { citation } = favorite
                      return (
                        <li key={favorite.id} className="hover:bg-accent/60 flex items-start gap-2 px-4 py-2.5">
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => {
                              setOpen(false)
                              openCitation(favorite.memoHref, citation)
                            }}
                          >
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-primary text-xs font-semibold tabular-nums">[{citation.sourceNumber}]</span>
                              {citation.highlight?.label && (
                                <span className="text-muted-foreground truncate text-[11px] font-semibold tracking-wide uppercase">
                                  {citation.highlight.label}
                                </span>
                              )}
                            </div>
                            <div className="line-clamp-2 text-sm font-medium tabular-nums">
                              {citation.highlight?.value ?? "No extracted text"}
                            </div>
                            <div className="text-muted-foreground truncate text-xs">
                              {shortFileName(citation.fileName)} · p. {citation.pageNumber} · {favorite.memoTitle}
                            </div>
                          </button>
                          <Button variant="ghost" size="icon-xs" aria-label="Remove favorite" onClick={() => removeFavorite(favorite.id)}>
                            <Trash2 />
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
