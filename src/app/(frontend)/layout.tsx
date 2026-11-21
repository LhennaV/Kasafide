import React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import Script from "next/script"
import { BodyCustomCode, renderHeadCustomCode } from "@/lib/make-custom-code"
import {
  makeSiteSettings,
  sanitizeHtmlAttribute,
} from "@/lib/make-site-settings"
import "./styles.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
})

const defaultTitle = "Kasafide – Verified Homes in Sta. Maria, Bulacan"
const title = makeSiteSettings.title ?? defaultTitle
const description =
  makeSiteSettings.description ??
  "Kasafide is a verified housing rental and listing platform for Sta. Maria, Bulacan. Every seller is ID-checked and every listing is reviewed before it goes live."
const favicon = makeSiteSettings.icons?.icon ?? "/assets/img/kasafide-favicon.svg"
const socialImage = makeSiteSettings.openGraph?.image ?? "/assets/img/og-image.png"
const googleAnalyticsId = sanitizeHtmlAttribute(
  makeSiteSettings.analytics?.googleAnalyticsId,
)

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
  title,
  description,
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Kasafide",
    statusBarStyle: "black-translucent",
  },
  robots:
    makeSiteSettings.robots?.index === false
      ? { follow: false, index: false }
      : undefined,
  icons: {
    icon: favicon,
    apple: "/assets/img/apple-touch-icon.png",
  },
  openGraph: {
    title,
    description,
    images: socialImage ? [socialImage] : undefined,
  },
  twitter: socialImage
    ? {
        card: "summary_large_image",
        images: [socialImage],
      }
    : undefined,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const language = sanitizeHtmlAttribute(makeSiteSettings.language) || "en"
  const addBypassLinks = makeSiteSettings.accessibility?.addBypassLinks === true
  const customScripts = makeSiteSettings.customScripts

  return (
    <html
      lang={language}
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
            __html: `(function(){try{var t=localStorage.getItem('kf_theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
        {renderHeadCustomCode(customScripts?.headStart, "head-start")}
        {renderHeadCustomCode(customScripts?.headEnd, "head-end")}
      </head>
      <body className="min-h-screen antialiased">
        <BodyCustomCode html={customScripts?.bodyStart} />
        {addBypassLinks && (
          <a className="figma-bypass-link" href="#root">
            Skip to content
          </a>
        )}
        <div id="root" tabIndex={-1}>
          {children}
        </div>
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="figma-google-analytics" strategy="afterInteractive">
              {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(googleAnalyticsId)});
`}
            </Script>
          </>
        )}
        <BodyCustomCode html={customScripts?.bodyEnd} />
      </body>
    </html>
  )
}
