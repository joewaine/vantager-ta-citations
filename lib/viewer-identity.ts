"use client"

import { useSyncExternalStore } from "react"

import { USER_COOKIE } from "@/lib/session"

export type ViewerIdentity = { email: string; name: string; loginAt?: number }

function readCookie(): ViewerIdentity | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${USER_COOKIE}=`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match.slice(USER_COOKIE.length + 1))) as ViewerIdentity
  } catch {
    return null
  }
}

let cachedRaw: string | null = null
let cached: ViewerIdentity | null = null

function snapshot() {
  const raw = typeof document === "undefined" ? null : document.cookie
  if (raw === cachedRaw) return cached
  cachedRaw = raw
  cached = readCookie()
  return cached
}

// Cookies have no change event; re-read on focus, which covers sign-in/out in another tab.
function subscribe(listener: () => void) {
  window.addEventListener("focus", listener)
  return () => window.removeEventListener("focus", listener)
}

export function useViewerIdentity() {
  return useSyncExternalStore(subscribe, snapshot, () => null)
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
