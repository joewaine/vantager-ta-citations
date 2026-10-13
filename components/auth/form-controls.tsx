"use client"

import type { InputHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type FloatingFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  trailing?: ReactNode
}

// accounts.msci.com style: outlined box with the label sitting on the top border.
export function FloatingField({ id, label, error, trailing, className, required, ...props }: FloatingFieldProps) {
  return (
    <div>
      <div className={cn("relative border-2 border-[#5468d1] bg-white", error && "border-[#c0392b]")}>
        <label htmlFor={id} className="absolute -top-3 left-4 bg-white px-1 text-[15px] text-[#5468d1]">
          {label}
          {required && <span aria-hidden>*</span>}
        </label>
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("h-[68px] w-full bg-transparent px-5 font-sans text-[17px] outline-none", trailing && "pr-14", className)}
          {...props}
        />
        {trailing && <span className="absolute top-1/2 right-5 -translate-y-1/2">{trailing}</span>}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-[15px] text-[#c0392b]">
          {error}
        </p>
      )}
    </div>
  )
}

export function AuthButton({ pending, children }: { pending?: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-[68px] w-full rounded-full bg-[#1a3fd6] text-[19px] text-white transition-colors hover:bg-[#1636b8] disabled:opacity-70"
    >
      {pending ? "Signing in…" : children}
    </button>
  )
}
