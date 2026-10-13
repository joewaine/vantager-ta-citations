"use server"

import { cookies } from "next/headers"

import { NOTES } from "@/lib/notes"
import { SESSION_COOKIE, SHARE_TTL_SECONDS, signShare, verifySession } from "@/lib/session"

export type ShareLink = { token: string; expiresAt: string }

/** Mints an expiring, signed link to one memo. Only a signed-in viewer may create one. */
export async function createShareToken(memoHref: string): Promise<ShareLink> {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value
  const session = sessionToken ? await verifySession(sessionToken) : null
  if (!session) throw new Error("Sign in to share a note")
  if (!NOTES.some((note) => note.memoHref === memoHref)) throw new Error("Unknown note")
  const exp = Math.floor(Date.now() / 1000) + SHARE_TTL_SECONDS
  const token = await signShare({ memoHref, exp, by: session.email })
  return { token, expiresAt: new Date(exp * 1000).toISOString() }
}
