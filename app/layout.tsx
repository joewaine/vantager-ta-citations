import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"

import { CONTRAST_BOOTSTRAP } from "@/lib/contrast"

// MSCI's web properties and the Diligence Platform use Inter for all UI text.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Halyard Growth Partners III: Q2 2026 monitoring note | MSCI Diligence Platform",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Sets data-contrast before first paint; see lib/contrast.ts. */}
        <script dangerouslySetInnerHTML={{ __html: CONTRAST_BOOTSTRAP }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
