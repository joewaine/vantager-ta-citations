import { AccountsShell } from "@/components/auth/accounts-shell"
import { PasswordForm } from "@/components/auth/password-form"

export const metadata = { title: "Sign In | MSCI" }

export default function PasswordPage() {
  return (
    <AccountsShell title="Sign In">
      <PasswordForm />
    </AccountsShell>
  )
}
