import Link from "next/link"

import { MsciLogo } from "@/components/auth/msci-logo"

export const metadata = { title: "Login | MSCI Diligence Platform" }

// Step 1, modeled on diligence.msci.com/login: a single "Continue with MSCI" handoff.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f3f4f6] px-4 py-10 sm:py-16">
      <MsciLogo size={36} className="mb-12" />
      <section className="w-full max-w-[536px] rounded-xl bg-white px-5 py-9 text-center shadow-md sm:px-8 sm:py-12">
        <h1 className="tracking-display text-[27px] font-semibold text-[#1b1b1b]">Welcome back</h1>
        <p className="text-muted-foreground mt-2 text-[17px]">Login with your MSCI account</p>
        <Link
          href="/login/identifier"
          className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-[#1f3d9e] text-[17px] font-medium text-white transition-colors hover:bg-[#1a3488]"
        >
          Continue with MSCI
        </Link>
      </section>
      <p className="text-muted-foreground mt-10 max-w-md text-center text-[17px] leading-relaxed">
        By clicking continue, you agree to our <span className="underline">Terms of Use</span> and{" "}
        <span className="underline">Privacy Policy</span>.
      </p>
      <p className="text-muted-foreground mt-10 text-xs">Assessment build. Sign-in is simulated: any email and password will do.</p>
    </main>
  )
}
