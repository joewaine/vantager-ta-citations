import type { SourceBadgeProps } from "@/lib/sources"

export function SourceBadge({ sourceNumber }: SourceBadgeProps) {
  return <sup className="text-muted-foreground">[{sourceNumber}]</sup>
}
