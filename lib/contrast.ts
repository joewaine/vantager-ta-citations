"use client"

import { useSyncExternalStore } from "react"

// High-contrast mode for washed-out displays. Stored per browser; the OS
// "prefers more contrast" setting turns it on by default until the viewer chooses.

export const CONTRAST_KEY = "msci-dp.contrast.v1"
export const CONTRAST_ATTRIBUTE = "data-contrast"

type Contrast = "normal" | "high"

const listeners = new Set<() => void>()

function stored(): Contrast | null {
  try {
    const value = window.localStorage.getItem(CONTRAST_KEY)
    return value === "high" || value === "normal" ? value : null
  } catch {
    return null
  }
}

export function currentContrast(): Contrast {
  if (typeof window === "undefined") return "normal"
  return stored() ?? (window.matchMedia("(prefers-contrast: more)").matches ? "high" : "normal")
}

export function applyContrast(mode: Contrast) {
  document.documentElement.setAttribute(CONTRAST_ATTRIBUTE, mode)
}

export function setContrast(mode: Contrast) {
  try {
    window.localStorage.setItem(CONTRAST_KEY, mode)
  } catch {
    // Private mode: apply for this page load only.
  }
  applyContrast(mode)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const media = window.matchMedia("(prefers-contrast: more)")
  media.addEventListener("change", listener)
  return () => {
    listeners.delete(listener)
    media.removeEventListener("change", listener)
  }
}

export function useContrast() {
  return useSyncExternalStore(subscribe, currentContrast, () => "normal" as Contrast)
}

/** Inline bootstrap so the attribute is set before first paint, avoiding a flash. */
export const CONTRAST_BOOTSTRAP = `(function(){try{var v=localStorage.getItem(${JSON.stringify(CONTRAST_KEY)});var m=v==="high"||v==="normal"?v:(matchMedia("(prefers-contrast: more)").matches?"high":"normal");document.documentElement.setAttribute(${JSON.stringify(CONTRAST_ATTRIBUTE)},m)}catch(e){}})();`
