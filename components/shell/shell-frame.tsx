"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import { ChevronRight, PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/shell/sidebar"

export type Crumb = { label: string; href?: string }

// Below md the sidebar lives in a sheet; keying it by pathname closes it after navigation.
function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="h-full pt-2">
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ShellFrame({ crumbs, children }: { crumbs: Crumb[]; children: ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-0 flex-1">
      {sidebarOpen && (
        <aside className="sticky top-11 hidden h-[calc(100vh-44px)] w-56 shrink-0 md:block" data-print-hidden>
          <Sidebar key={pathname} />
        </aside>
      )}
      <MobileSidebar key={pathname} open={mobileOpen} onOpenChange={setMobileOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="bg-background sticky top-11 z-20 flex h-10 items-center gap-1 border-b px-2 text-[13px]" data-print-hidden>
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <PanelLeft />
          </Button>
          <Button variant="ghost" size="icon-sm" className="hidden md:inline-flex" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"} aria-pressed={sidebarOpen}>
            <PanelLeft />
          </Button>
          <nav aria-label="Breadcrumb" className="text-muted-foreground flex min-w-0 items-center gap-1">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1
              return (
                <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="hover:text-foreground truncate rounded px-1 py-0.5">{crumb.label}</Link>
                  ) : (
                    <span className={isLast ? "text-foreground truncate px-1 font-medium" : "truncate px-1"}>{crumb.label}</span>
                  )}
                  {!isLast && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
                </span>
              )
            })}
          </nav>
        </div>
        {children}
      </div>
    </div>
  )
}
