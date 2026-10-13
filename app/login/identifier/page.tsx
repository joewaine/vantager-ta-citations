import { DEMO_ACCOUNT } from "@/lib/auth.server"
import { AccountsShell } from "@/components/auth/accounts-shell"
import { IdentifierForm } from "@/components/auth/identifier-form"

export const metadata = { title: "Sign In | MSCI" }

export default function IdentifierPage() {
  return (
    <AccountsShell title="Sign In">
      {/* Prefilled so a reviewer can click straight through; any address works. */}
      <IdentifierForm initialEmail={DEMO_ACCOUNT.email} />
    </AccountsShell>
  )
}
