import type { ReactNode } from "react"

import { MsciLogo } from "@/components/auth/msci-logo"

// Modeled on accounts.msci.com: photographic backdrop, square white panel, serif type,
// dark footer bar. The gradient sits under the photo so the page still reads if it fails to load.

const FOOTER_LINKS = ["Terms of Use", "Privacy Notice", "Cookies", "Contact Us"]

export function AccountsShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col font-serif text-[#1b1b1b]" style={{
      backgroundImage: "url(/login-bg.jpg), linear-gradient(180deg, #a9b7b0 0%, #3d5a4c 45%, #1e3328 100%)",
      backgroundSize: "cover, auto",
      backgroundPosition: "center, center",
    }}>
      <main className="flex flex-1 items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
        <section className="w-full max-w-[556px] bg-white px-6 py-10 shadow-2xl sm:px-14 sm:py-16">
          <div className="flex justify-center">
            <MsciLogo size={52} />
          </div>
          <h1 className="mt-8 text-center text-[26px] font-normal sm:mt-10 sm:text-[28px]">{title}</h1>
          <div className="mt-8 sm:mt-10">{children}</div>
        </section>
      </main>
      <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-[#2a2a2a]/85 px-4 py-2.5 text-center text-[12px] text-white/85 sm:justify-between sm:text-[13px]">
        <span>© Copyright 2026 MSCI Inc. All rights reserved.</span>
        <span className="flex gap-1">
          {FOOTER_LINKS.map((label, index) => (
            <span key={label}>
              <span className="cursor-default">{label}</span>
              {index < FOOTER_LINKS.length - 1 && <span className="mx-1 opacity-60">|</span>}
            </span>
          ))}
        </span>
      </footer>
    </div>
  )
}
