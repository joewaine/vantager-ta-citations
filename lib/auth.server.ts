// Server-only: never import from a client component.
// Assessment build: there is no user directory. Any syntactically valid email with any
// non-empty password signs in. The demo account keeps a fixed display name; every other
// address gets a name derived from its local part ("ana.ruiz@x.com" -> "Ana Ruiz").

export const DEMO_ACCOUNT = {
  email: "joe@joewaine.co",
  name: "Joe Waine",
  /** Prefilled on the password step so a reviewer only has to click through. Any value works. */
  password: "assessment",
} as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? ""
  const words = local.split(/[._\-+]+/).filter(Boolean)
  const titled = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  return titled.join(" ") || email
}

export function authenticate(email: string, password: string) {
  const normalized = email.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(normalized) || password.length === 0) return null
  if (normalized === DEMO_ACCOUNT.email) return { email: DEMO_ACCOUNT.email, name: DEMO_ACCOUNT.name }
  return { email: normalized, name: nameFromEmail(normalized) }
}
