import type { ReactNode } from "react"

import { TopBar } from "@/components/shell/top-bar"
import { ShellFrame, type Crumb } from "@/components/shell/shell-frame"

export type { Crumb }

export function AppShell({ crumbs, children }: { crumbs: Crumb[]; children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30" data-print-hidden>
        <TopBar />
      </header>
      <ShellFrame crumbs={crumbs}>{children}</ShellFrame>
    </>
  )
}
