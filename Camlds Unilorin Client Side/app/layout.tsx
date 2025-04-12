import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { PageTransition } from "@/components/page-transition"
import { Suspense } from "react"
import { EventAlertProvider } from "@/lib/event-alert-context"
import { FormsProvider } from "@/lib/forms-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CAMLDS Unilorin",
  description: "Tech Community for CAMLDS Unilorin",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <FormsProvider>
              <EventAlertProvider>
                <div className="flex min-h-screen flex-col mx-4">
                  <Suspense
                    fallback={
                      <div className="flex-1 flex items-center justify-center">
                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    }
                  >
                    <PageTransition />
                    {children}
                  </Suspense>
                </div>
                <Toaster />
              </EventAlertProvider>
            </FormsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'