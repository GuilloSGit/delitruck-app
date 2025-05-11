import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileNavBar } from "@/components/mobile-nav-bar";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: `DeliTruck`,
  description: "Aplicación para gestionar ventas, productos, clientes y pedidos",
  icons: {
    icon: "/truck-logo.svg",
    shortcut: "/truck-logo.svg",
    apple: "/truck-logo.svg",
    other: [
      {
        rel: "icon",
        url: "/truck-logo.svg",
      },
      {
        rel: "shortcut",
        url: "/truck-logo.svg",
      },
      {
        rel: "apple",
        url: "/truck-logo.svg",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <MobileNavBar />
        <Analytics />
      </body>
    </html>
  )
}
