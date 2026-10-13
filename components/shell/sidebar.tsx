"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { BarChart3, Briefcase, Building2, ChevronDown, Database, FileText, Folder, Landmark, LayoutTemplate, Lightbulb } from "lucide-react"

import { NAVIGATION, type NavItem } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Documents: Folder,
  Funds: Landmark,
  Firm: Building2,
  Analysis: Lightbulb,
  Analytics: BarChart3,
  Dealflow: Briefcase,
  Database: Database,
  Reports: FileText,
  Templates: LayoutTemplate,
}

const INERT_TITLE = "Not part of this assessment"

const ROW = "flex h-7 w-full items-center gap-2 rounded-md text-[13px]"

function containsActive(item: NavItem, pathname: string): boolean {
  return item.href === pathname || (item.children?.some((child) => child.href === pathname) ?? false)
}

function Leaf({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.href !== undefined && item.href === pathname
  const className = cn(
    ROW,
    "text-muted-foreground px-2",
    isActive ? "bg-accent text-accent-foreground font-medium" : item.href ? "hover:bg-accent/60 hover:text-foreground" : "cursor-default opacity-60",
  )
  return item.href ? (
    <Link href={item.href} className={className} aria-current={isActive ? "page" : undefined}>
      <span className="truncate">{item.label}</span>
    </Link>
  ) : (
    <span className={className} title={INERT_TITLE} aria-disabled>
      <span className="truncate">{item.label}</span>
    </span>
  )
}

// Top-level items with children are drawers. A drawer starts open when it holds the
// current page; the viewer can open or close any drawer, and the sidebar remounts on
// navigation so the active section is always revealed.
function Drawer({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = ICONS[item.label]
  const active = containsActive(item, pathname)
  const [open, setOpen] = useState(active)
  const isSelf = item.href !== undefined && item.href === pathname

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className={cn(ROW, "group/drawer px-1 font-medium", active && !open && "text-primary")}>
        {item.href ? (
          <Link href={item.href} className={cn("flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-0.5", isSelf ? "bg-accent text-accent-foreground" : "hover:bg-accent/60")} aria-current={isSelf ? "page" : undefined}>
            {Icon && <Icon className="size-4 shrink-0" />}
            <span className="truncate">{item.label}</span>
          </Link>
        ) : (
          <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-0.5 text-left hover:bg-accent/60">
            {Icon && <Icon className="size-4 shrink-0" />}
            <span className="truncate">{item.label}</span>
          </CollapsibleTrigger>
        )}
        <CollapsibleTrigger
          className="hover:bg-accent/60 flex size-6 shrink-0 items-center justify-center rounded-md"
          aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
        >
          <ChevronDown className={cn("text-muted-foreground size-3.5 transition-transform", !open && "-rotate-90")} aria-hidden />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <ul className="border-border my-px ml-4 space-y-px border-l pl-2">
          {item.children!.map((child) => (
            <li key={child.label}>
              <Leaf item={child} pathname={pathname} />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

function TopLeaf({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = ICONS[item.label]
  const isActive = item.href !== undefined && item.href === pathname
  const className = cn(
    ROW,
    "px-2 font-medium",
    isActive ? "bg-accent text-accent-foreground" : item.href ? "hover:bg-accent/60" : "cursor-default opacity-60",
  )
  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0" />}
      <span className="truncate">{item.label}</span>
    </>
  )
  return item.href ? (
    <Link href={item.href} className={className} aria-current={isActive ? "page" : undefined}>{content}</Link>
  ) : (
    <span className={className} title={INERT_TITLE} aria-disabled>{content}</span>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  return (
    <nav aria-label="Primary" className="bg-background flex h-full flex-col gap-4 overflow-y-auto border-r px-3 py-3">
      {NAVIGATION.map((section) => (
        <div key={section.heading}>
          <div className="text-muted-foreground mb-1 px-2 text-[11px] font-medium">{section.heading}</div>
          <ul className="space-y-px">
            {section.items.map((item) => (
              <li key={item.label}>
                {item.children ? <Drawer item={item} pathname={pathname} /> : <TopLeaf item={item} pathname={pathname} />}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-muted-foreground mt-auto px-2 text-[10px] leading-tight">Fictional data for assessment use.</p>
    </nav>
  )
}
