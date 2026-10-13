// HMAC-signed session tokens. Runs in both the Node runtime (server actions) and the
// edge runtime (request proxy), so only Web Crypto is used.

export const SESSION_COOKIE = "dp_session"
export const PENDING_EMAIL_COOKIE = "dp_login_email"
export const RETURN_TO_COOKIE = "dp_login_next"
/** Display-only identity for client components; not httpOnly, never trusted for auth. */
export const USER_COOKIE = "dp_user"
export const SESSION_TTL_SECONDS = 12 * 60 * 60

export type SessionPayload = { email: string; name: string; iat: number }

// Assessment build: a fixed fallback keeps `pnpm dev` zero-config. Set AUTH_SECRET in real deployments.
const DEV_FALLBACK_SECRET = "assessment-only-secret-not-for-production"
const secret = () => process.env.AUTH_SECRET || DEV_FALLBACK_SECRET

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array) {
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(text: string) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function hmacKey() {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
}

/** Signs any JSON payload as `<base64url body>.<base64url hmac>`. */
export async function signPayload<T>(payload: T) {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(body)))
  return `${body}.${toBase64Url(signature)}`
}

/** Returns the payload only if the signature verifies; callers check expiry themselves. */
export async function verifyPayload<T>(token: string): Promise<T | null> {
  const [body, signature] = token.split(".")
  if (!body || !signature) return null
  try {
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(), fromBase64Url(signature), encoder.encode(body))
    if (!valid) return null
    return JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as T
  } catch {
    return null
  }
}

export const signSession = (payload: SessionPayload) => signPayload(payload)

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const payload = await verifyPayload<SessionPayload>(token)
  if (!payload?.email) return null
  const ageSeconds = Date.now() / 1000 - payload.iat
  return ageSeconds > SESSION_TTL_SECONDS ? null : payload
}

// Share links: a signed memo reference with an absolute expiry, readable without a session.
export const SHARE_TTL_SECONDS = 7 * 24 * 60 * 60
export type SharePayload = { memoHref: string; exp: number; by: string }

export const signShare = (payload: SharePayload) => signPayload(payload)

export async function verifyShare(token: string): Promise<SharePayload | null> {
  const payload = await verifyPayload<SharePayload>(token)
  if (!payload?.memoHref || typeof payload.exp !== "number") return null
  return payload.exp * 1000 < Date.now() ? null : payload
}
