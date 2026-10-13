"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { submitPassword, type FormState } from "@/app/login/actions"
import { PENDING_EMAIL_COOKIE } from "@/lib/session"
import { AuthButton, FloatingField } from "@/components/auth/form-controls"

function readPendingEmail() {
  if (typeof document === "undefined") return null
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${PENDING_EMAIL_COOKIE}=`))
  return match ? decodeURIComponent(match.slice(PENDING_EMAIL_COOKIE.length + 1)) : null
}

export function PasswordForm({ initialPassword }: { initialPassword?: string }) {
  const router = useRouter()
  const [state, action, pending] = useActionState<FormState, FormData>(submitPassword, {})
  const [reveal, setReveal] = useState(false)
  const [email] = useState(readPendingEmail)

  // No identifier step completed: send the user back rather than show an empty box.
  useEffect(() => {
    if (email === null) router.replace("/login/identifier")
  }, [email, router])

  return (
    <form action={action} className="space-y-6" noValidate>
      <div className="flex h-[72px] items-center justify-between border border-[#8a8a8a] px-5 text-[17px]">
        <span className="truncate">{email ?? ""}</span>
        <Link href="/login/identifier" className="text-[#1a3fd6] hover:underline">Edit</Link>
      </div>
      <FloatingField
        id="password"
        name="password"
        type={reveal ? "text" : "password"}
        label="Password"
        required
        defaultValue={initialPassword}
        autoComplete="current-password"
        autoFocus
        error={state.error}
        trailing={
          <button type="button" onClick={() => setReveal((r) => !r)} aria-label={reveal ? "Hide password" : "Show password"} className="text-[#333] hover:text-black">
            {reveal ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        }
      />
      <Link href="/login/reset" className="block text-[17px] text-[#1a3fd6] hover:underline">Reset password</Link>
      <AuthButton pending={pending}>Sign In</AuthButton>
      <p className="text-[15px] leading-snug">
        By clicking &lsquo;Sign In&rsquo; I agree to MSCI&rsquo;s &lsquo;Terms of Use&rsquo; below. Don&rsquo;t have an account?{" "}
        <span className="text-[#1a3fd6]">Create an account</span>
      </p>
    </form>
  )
}
