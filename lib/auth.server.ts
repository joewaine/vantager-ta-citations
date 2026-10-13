// Server-only: holds the demo credential. Never import from a client component.
// There is no user store in this assessment build; one demo account is accepted.

export const DEMO_ACCOUNT = {
  email: "joe@joewaine.co",
  password: "testDemo",
  name: "Joe Waine",
} as const

function constantTimeEqual(a: string, b: string) {
  const aBytes = new TextEncoder().encode(a)
  const bBytes = new TextEncoder().encode(b)
  let diff = aBytes.length ^ bBytes.length
  for (let i = 0; i < Math.max(aBytes.length, bBytes.length); i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0)
  }
  return diff === 0
}

export function authenticate(email: string, password: string) {
  const emailMatches = constantTimeEqual(email.trim().toLowerCase(), DEMO_ACCOUNT.email)
  const passwordMatches = constantTimeEqual(password, DEMO_ACCOUNT.password)
  return emailMatches && passwordMatches ? { email: DEMO_ACCOUNT.email, name: DEMO_ACCOUNT.name } : null
}
