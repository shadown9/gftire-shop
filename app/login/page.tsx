"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useNotifications } from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type React from "react"
import { Loader2 } from "@/components/ui/loader"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { error: showError } = useNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("User authenticated:", userCredential.user)
      console.log("Authentication successful, redirecting to dashboard")
      router.push("/dashboard")
      console.log("Router.push completed")
    } catch (error: any) {
      console.error("Error during login or redirection:", error)
      showError(error.code === "auth/wrong-password" ? "Contraseña incorrecta" : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
        <div className="absolute inset-0 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl" />
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-300/20 rounded-full blur-xl" />

          {/* Abstract Shapes */}
          <div className="absolute top-10 right-10 w-20 h-20 border-4 border-white/10 rounded-lg transform rotate-45" />
          <div className="absolute bottom-20 left-20 w-16 h-16 border-4 border-white/10 rounded-full" />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center px-12">
            <div className="relative mb-8">
              <span className="text-8xl font-bold text-white tracking-widest">GF</span>
              <span
                className="absolute top-0 left-0 text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse tracking-widest"
                style={{ filter: "blur(4px)" }}
              >
                GF
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">¡Bienvenido de nuevo!</h1>
            <p className="text-lg text-blue-100">Accede a tu cuenta para gestionar tu inventario y más.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-blue-50">
        <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Iniciar Sesión</h2>
            <p className="mt-2 text-sm text-gray-600">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

