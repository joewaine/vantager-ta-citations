"use client"

import { useActionState } from "react"

import { submitIdentifier, type FormState } from "@/app/login/actions"
import { AuthButton, FloatingField } from "@/components/auth/form-controls"

export function IdentifierForm({ initialEmail }: { initialEmail?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitIdentifier, {})

  return (
    <form action={action} className="space-y-7" noValidate>
      <FloatingField id="email" name="email" type="email" label="Email address" required defaultValue={initialEmail} autoComplete="username" autoFocus error={state.error} />
      <AuthButton pending={pending}>Sign In</AuthButton>
      <p className="text-[15px] leading-snug">
        By clicking &lsquo;Sign In&rsquo; I agree to MSCI&rsquo;s &lsquo;Terms of Use&rsquo; below. Don&rsquo;t have an account?{" "}
        <span className="text-[#1a3fd6]">Create an account</span>
      </p>
    </form>
  )
}
