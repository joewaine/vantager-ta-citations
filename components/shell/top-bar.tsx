import Link from "next/link"
import { Search } from "lucide-react"

import { FavoritesSheet } from "@/components/panels/favorites-sheet"
import { HelpSheet } from "@/components/panels/help-sheet"
import { NotificationsMenu } from "@/components/panels/notifications-menu"
import { PaperTrailSheet } from "@/components/panels/paper-trail-sheet"
import { UserMenu } from "@/components/shell/user-menu"

// Mirrors the platform's top bar: wordmark, global search, utilities, account.
export function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground flex h-11 items-center gap-4 px-4">
      <Link href="/funds" className="shrink-0 text-[17px] tracking-tight">
        <span className="font-bold">MSCI</span> <span className="hidden sm:inline">Diligence Platform</span>
      </Link>
      <form action="/funds" method="get" role="search" className="mx-auto hidden w-full max-w-md md:block">
        <label className="flex h-7 items-center overflow-hidden rounded-md bg-white text-xs text-black">
          <span className="text-muted-foreground border-r px-2.5">All</span>
          <input
            name="q"
            type="search"
            placeholder="Search funds"
            className="h-full min-w-0 flex-1 bg-transparent px-2.5 outline-none"
          />
          <Search className="text-muted-foreground mr-2.5 size-3.5" aria-hidden />
        </label>
      </form>
      <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
        <FavoritesSheet />
        <PaperTrailSheet />
        <NotificationsMenu />
        <HelpSheet />
        <UserMenu />
      </div>
    </div>
  )
}
