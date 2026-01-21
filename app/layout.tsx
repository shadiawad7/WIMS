import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Player IQ Hub | Powered by WIMS Group",
  description:
    "Elevate your football IQ with professional coaching methodologies from elite coaches. Subscription-based video platform for serious players.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased relative min-h-screen gradient-warm-bg">
        <div className="fixed inset-0 dashboard-watermark pointer-events-none">
          <div className="dashboard-watermark-text">
            {"WIMS WIMS WIMS WIMS WIMS WIMS\nWIMS WIMS WIMS WIMS WIMS WIMS\nWIMS WIMS WIMS WIMS WIMS WIMS\nWIMS WIMS WIMS WIMS WIMS WIMS"}
          </div>
        </div>
        <div className="relative z-10">{children}</div>
        <Analytics />
      </body>
    </html>
  )
}
