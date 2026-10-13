import { Suspense } from "react"

import { FUNDS } from "@/lib/funds"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/shell/app-shell"
import { FundsTable } from "@/components/funds-table"

export const metadata = { title: "Funds | MSCI Diligence Platform" }

export default function FundsPage() {
  return (
    <TooltipProvider delayDuration={150}>
      <AppShell crumbs={[{ label: "Funds" }]}>
        <main className="bg-muted flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-4">
            <div>
              <h1 className="tracking-display text-xl font-semibold">Funds</h1>
              <p className="text-muted-foreground text-sm">Monitored positions and funds in diligence for Meridian Public Employees Trust.</p>
            </div>
            <Suspense fallback={null}>
              <FundsTable funds={FUNDS} />
            </Suspense>
          </div>
        </main>
      </AppShell>
    </TooltipProvider>
  )
}
