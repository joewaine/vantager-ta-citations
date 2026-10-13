import Image from "next/image"

import { cn } from "@/lib/utils"

export function MsciLogo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-label="MSCI">
      <span className="font-sans font-bold tracking-tight text-[#0c2340]" style={{ fontSize: size * 0.9, lineHeight: 1 }}>
        MSCI
      </span>
      <Image src="/msci-globe.png" alt="" width={size} height={size} priority />
    </span>
  )
}
