import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toast"
import ErrorBoundary from "@/components/ErrorBoundary"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "GF Tire Shop - Sistema de Control de Inventario",
  description: "Sistema de control de inventario para GF Tire Shop",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-blue-50`}>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'