"use client"

import { Contrast, LogOut } from "lucide-react"

import { signOut } from "@/app/login/actions"
import { setContrast, useContrast } from "@/lib/contrast"
import { initials, useViewerIdentity } from "@/lib/viewer-identity"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const identity = useViewerIdentity()
  const contrast = useContrast()
  const label = identity ? initials(identity.name) : "?"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Account menu"
          className="bg-white/15 text-primary-foreground hover:bg-white/25 hover:text-primary-foreground rounded-full text-[11px] font-semibold"
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-medium">{identity?.name ?? "Signed in"}</div>
          <div className="text-muted-foreground truncate text-xs">{identity?.email ?? ""}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={contrast === "high"}
          onCheckedChange={(checked) => setContrast(checked ? "high" : "normal")}
          onSelect={(event) => event.preventDefault()}
        >
          <Contrast />
          High contrast
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
