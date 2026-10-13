import { AccountsShell } from "@/components/auth/accounts-shell"
import { IdentifierForm } from "@/components/auth/identifier-form"

export const metadata = { title: "Sign In | MSCI" }

export default function IdentifierPage() {
  return (
    <AccountsShell title="Sign In">
      <IdentifierForm />
    </AccountsShell>
  )
}
