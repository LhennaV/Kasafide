import React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import Script from "next/script"
import { InstantDemoBar } from "@/components/kasafide/InstantDemoBar"
import { SystemTheme } from "@/components/kasafide/SystemTheme"
import { THEME_INIT_SCRIPT } from "@/lib/theme-script"
import "./styles.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
})

const defaultTitle = "Kasafide – Verified Homes in Sta. Maria, Bulacan"
const defaultDescription =
  "Kasafide is a verified housing rental and listing platform for Sta. Maria, Bulacan. Every seller is ID-checked and every listing is reviewed before it goes live."
const favicon = "/assets/img/kasafide-favicon.svg"
const socialImage = "/assets/img/og-image.png"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#5B3A8E",
}

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: defaultTitle,
  description: defaultDescription,
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Kasafide",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: favicon,
    apple: "/assets/img/apple-touch-icon.png",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [socialImage],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={plusJakartaSans.variable}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: THEME_INIT_SCRIPT,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-[var(--bg)] text-[var(--text)]">
        <a className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:p-3 focus:bg-[var(--primary)] focus:text-[var(--on-primary)] focus:rounded-md" href="#root">
          Skip to content
        </a>
        <div id="root" tabIndex={-1}>
          {children}
        </div>
        <InstantDemoBar />
        <SystemTheme />
      </body>
    </html>
  )
}
