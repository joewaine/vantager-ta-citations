"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { authenticate } from "@/lib/auth.server"
import { PENDING_EMAIL_COOKIE, RETURN_TO_COOKIE, SESSION_COOKIE, SESSION_TTL_SECONDS, USER_COOKIE, signSession } from "@/lib/session"

export type FormState = { error?: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PENDING_TTL_SECONDS = 10 * 60
const secure = process.env.NODE_ENV === "production"

export async function submitIdentifier(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." }
  const jar = await cookies()
  jar.set(PENDING_EMAIL_COOKIE, email, { path: "/", sameSite: "lax", secure, maxAge: PENDING_TTL_SECONDS })
  redirect("/login/password")
}

// Only same-origin paths are honoured as a return target.
function safeReturnPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("/.") || value.startsWith("/login")) return "/funds"
  return value
}

export async function submitPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const jar = await cookies()
  const email = jar.get(PENDING_EMAIL_COOKIE)?.value
  if (!email) redirect("/login/identifier")
  const password = String(formData.get("password") ?? "")
  const user = authenticate(email, password)
  if (!user) return { error: "Incorrect email or password." }

  const iat = Math.floor(Date.now() / 1000)
  const token = await signSession({ ...user, iat })
  jar.set(SESSION_COOKIE, token, { httpOnly: true, path: "/", sameSite: "lax", secure, maxAge: SESSION_TTL_SECONDS })
  // Display-only copy of the identity for client components; the signed cookie is the authority.
  // loginAt lets per-login UI state (notification read marks) start fresh each sign-in.
  jar.set(USER_COOKIE, JSON.stringify({ ...user, loginAt: iat }), { path: "/", sameSite: "lax", secure, maxAge: SESSION_TTL_SECONDS })
  jar.delete(PENDING_EMAIL_COOKIE)
  const returnTo = safeReturnPath(jar.get(RETURN_TO_COOKIE)?.value)
  jar.delete(RETURN_TO_COOKIE)
  redirect(returnTo)
}

export async function signOut() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  jar.delete(USER_COOKIE)
  redirect("/login")
}
