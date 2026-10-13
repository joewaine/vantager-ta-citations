import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"

import { FUNDS, LP_NAME, formatMillions, formatMultiple, formatPercent, getFund, type DocumentStatus } from "@/lib/funds"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/shell/app-shell"
import { FundActivity } from "@/components/fund-activity"
import { FundExportButton } from "@/components/fund-export-button"
import { StatusBadge } from "@/components/funds-table"

export function generateStaticParams() {
  return FUNDS.map((fund) => ({ slug: fund.slug }))
}

export async function generateMetadata({ params }: PageProps<"/funds/[slug]">) {
  const { slug } = await params
  const fund = getFund(slug)
  return { title: fund ? `${fund.name} | MSCI Diligence Platform` : "Fund not found" }
}

const DOC_STATUS_STYLE: Record<DocumentStatus, string> = {
  Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Extracted: "bg-sky-50 text-sky-700 border-sky-200",
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  "Awaiting documents": "bg-muted text-muted-foreground",
  "Missing from data room": "bg-red-50 text-red-700 border-red-200",
  "Not generated": "bg-muted text-muted-foreground",
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 py-4">
      <CardHeader className="px-4">
        <CardDescription className="text-xs">{label}</CardDescription>
        <CardTitle className="text-xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

export default async function FundPage({ params }: PageProps<"/funds/[slug]">) {
  const { slug } = await params
  const fund = getFund(slug)
  if (!fund) notFound()

  return (
    <TooltipProvider delayDuration={150}>
      <AppShell crumbs={[{ label: "Funds", href: "/funds" }, { label: fund.name }]}>
        <div className="bg-background flex h-11 items-center gap-3 border-b px-4">
          <Tabs defaultValue="overview">
            <TabsList className="h-8">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs" disabled title="Not part of this assessment">Performance</TabsTrigger>
              <TabsTrigger value="locations" className="text-xs" disabled title="Not part of this assessment">Locations</TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="text-muted-foreground ml-auto text-xs">As of {fund.asOf}</span>
        </div>
        <main className="bg-muted flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="tracking-display text-xl font-semibold">{fund.name}</h1>
                <p className="text-muted-foreground text-sm">
                  {fund.manager} · {fund.strategy} · {fund.vintage} vintage · {LP_NAME}
                </p>
              </div>
              <StatusBadge status={fund.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Commitment" value={formatMillions(fund.commitment)} />
              <Stat label="Called to date" value={formatMillions(fund.called)} />
              <Stat label="Net TVPI" value={formatMultiple(fund.tvpi)} />
              <Stat label="Net IRR" value={formatPercent(fund.netIrr)} />
            </div>

            <Card className="gap-0 py-0">
              <CardHeader className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
                <div>
                  <CardTitle className="text-sm">Documents and reports</CardTitle>
                  <CardDescription>Source documents from the data room and the notes generated from them.</CardDescription>
                </div>
                <FundExportButton fund={fund} />
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">Title</TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead className="hidden sm:table-cell">Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-5 text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fund.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="pl-5 font-medium">
                          {doc.href ? (
                            <Link href={doc.href} className="text-primary hover:underline" target={doc.external ? "_blank" : undefined} rel={doc.external ? "noopener noreferrer" : undefined}>
                              {doc.title}
                            </Link>
                          ) : (
                            doc.title
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{doc.kind}</TableCell>
                        <TableCell className="hidden tabular-nums sm:table-cell">{doc.period}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-medium", DOC_STATUS_STYLE[doc.status])}>{doc.status}</Badge>
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          {doc.href && (
                            <Link href={doc.href} className="text-primary inline-flex items-center gap-1 text-xs hover:underline" target={doc.external ? "_blank" : undefined} rel={doc.external ? "noopener noreferrer" : undefined}>
                              {doc.external ? "PDF" : "View"}
                              {doc.external && <ExternalLink className="size-3" aria-hidden />}
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <FundActivity fundSlug={fund.slug} />
          </div>
        </main>
      </AppShell>
    </TooltipProvider>
  )
}
