"use client"

import { useSyncExternalStore } from "react"

/**
 * Minimal localStorage-backed store with a React subscription. Snapshots are cached by
 * raw string so useSyncExternalStore gets a stable reference until the value changes.
 * Storage is per browser; nothing leaves the machine.
 */
export function createLocalStore<T>(key: string, empty: T) {
  let cachedRaw: string | null = null
  let cached: T = empty
  const listeners = new Set<() => void>()

  const read = (): T => {
    if (typeof window === "undefined") return empty
    let raw: string | null
    try {
      raw = window.localStorage.getItem(key)
    } catch {
      return cached
    }
    if (raw === cachedRaw) return cached
    cachedRaw = raw
    try {
      cached = raw ? (JSON.parse(raw) as T) : empty
    } catch {
      cached = empty
    }
    return cached
  }

  const write = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Private mode or quota: keep the in-memory value so the UI still responds.
      cachedRaw = null
      cached = value
    }
    listeners.forEach((listener) => listener())
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) listener()
    }
    window.addEventListener("storage", onStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener("storage", onStorage)
    }
  }

  const useValue = () => useSyncExternalStore(subscribe, read, () => empty)

  return {
    read,
    write,
    update: (fn: (current: T) => T) => write(fn(read())),
    useValue,
  }
}

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
