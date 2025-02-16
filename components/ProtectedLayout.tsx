"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Navigation from "./Navigation"
import { Loader2 } from "lucide-react"
import type React from "react"

interface ProtectedLayoutProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedLayout({ children, allowedRoles = [] }: ProtectedLayoutProps) {
  const { user, userData, loading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(userData?.role || "")) {
        router.replace("/unauthorized")
      }
    }
  }, [user, userData, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error de autenticación</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(userData?.role || ""))) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

