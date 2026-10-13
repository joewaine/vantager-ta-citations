import Link from "next/link"

import { AccountsShell } from "@/components/auth/accounts-shell"

export const metadata = { title: "Reset password | MSCI" }

export default function ResetPage() {
  return (
    <AccountsShell title="Reset password">
      <p className="text-[17px] leading-relaxed">
        Password reset is not available in this assessment build. There is no user directory behind this
        sign-in; a single demo account is accepted, documented in NOTES.md.
      </p>
      <Link href="/login/password" className="mt-8 block text-[17px] text-[#1a3fd6] hover:underline">
        Back to sign in
      </Link>
    </AccountsShell>
  )
}
