"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

import { formatMillions, formatMultiple, formatPercent, fundHref, type Fund, type FundStatus } from "@/lib/funds"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const STATUS_FILTERS: Array<FundStatus | "All"> = ["All", "Active", "Harvesting", "In diligence", "Fundraising"]

const STATUS_STYLE: Record<FundStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Harvesting: "bg-sky-50 text-sky-700 border-sky-200",
  "In diligence": "bg-amber-50 text-amber-700 border-amber-200",
  Fundraising: "bg-violet-50 text-violet-700 border-violet-200",
}

export function StatusBadge({ status }: { status: FundStatus }) {
  return <Badge variant="outline" className={cn("font-medium", STATUS_STYLE[status])}>{status}</Badge>
}

export function FundsTable({ funds }: { funds: Fund[] }) {
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get("q") ?? "")
  const [status, setStatus] = useState<FundStatus | "All">("All")

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return funds.filter(
      (fund) =>
        (status === "All" || fund.status === status) &&
        (!needle || `${fund.name} ${fund.manager} ${fund.strategy}`.toLowerCase().includes(needle)),
    )
  }, [funds, query, status])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search funds"
          aria-label="Search funds"
          className="h-8 w-full rounded-full sm:w-56"
        />
        {STATUS_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            aria-pressed={status === option}
            className={cn(
              "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
              status === option ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent",
            )}
          >
            {option}
          </button>
        ))}
        <span className="text-muted-foreground ml-auto text-xs tabular-nums">{visible.length} of {funds.length} funds</span>
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableCaption className="pb-3 text-xs">Meridian Public Employees Trust positions. Fictional data for assessment use.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Fund</TableHead>
              <TableHead className="hidden md:table-cell">Strategy</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Vintage</TableHead>
              <TableHead className="text-right">Commitment</TableHead>
              <TableHead className="hidden text-right md:table-cell">Called</TableHead>
              <TableHead className="hidden text-right md:table-cell">NAV</TableHead>
              <TableHead className="text-right">TVPI</TableHead>
              <TableHead className="text-right">Net IRR</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Documents</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((fund) => (
              <TableRow key={fund.slug}>
                <TableCell>
                  <Link href={fundHref(fund.slug)} className="text-primary font-medium hover:underline">{fund.name}</Link>
                  <div className="text-muted-foreground text-xs">{fund.manager}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{fund.strategy}</TableCell>
                <TableCell className="hidden text-right tabular-nums lg:table-cell">{fund.vintage}</TableCell>
                <TableCell className="text-right tabular-nums">{formatMillions(fund.commitment)}</TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">{formatMillions(fund.called)}</TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">{formatMillions(fund.nav)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatMultiple(fund.tvpi)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatPercent(fund.netIrr)}</TableCell>
                <TableCell><StatusBadge status={fund.status} /></TableCell>
                <TableCell className="hidden text-right tabular-nums lg:table-cell">{fund.documents.length}</TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-muted-foreground py-8 text-center">No funds match.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
