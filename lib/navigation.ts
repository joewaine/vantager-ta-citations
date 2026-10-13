import { FUNDS, fundHref } from "@/lib/funds"

// Sidebar structure mirrors the MSCI Diligence Platform. Entries without an href are
// visual context only; they are rendered inert and labelled as such.

export type NavItem = { label: string; href?: string; children?: NavItem[] }
export type NavSection = { heading: string; items: NavItem[] }

export const NAVIGATION: NavSection[] = [
  {
    heading: "Dashboard",
    items: [
      { label: "Documents", children: [{ label: "Files" }, { label: "Topics" }] },
      {
        label: "Funds",
        href: "/funds",
        children: FUNDS.map((fund) => ({ label: fund.name, href: fundHref(fund.slug) })),
      },
      { label: "Firm", children: [{ label: "Overview" }, { label: "Track Record" }, { label: "Investments" }, { label: "Team" }, { label: "News" }] },
      { label: "Analysis", children: [{ label: "Reports", href: "/funds" }, { label: "Chat" }] },
    ],
  },
  {
    heading: "Platform",
    items: [
      { label: "Analytics" },
      { label: "Dealflow" },
      { label: "Database", children: [{ label: "Firms" }, { label: "Funds", href: "/funds" }, { label: "Investments" }, { label: "People" }, { label: "News" }] },
      { label: "Reports", href: "/funds" },
      { label: "Templates" },
    ],
  },
]
