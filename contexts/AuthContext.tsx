"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { type User as FirebaseUser, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import type { User } from "@/types/User"

interface AuthContextType {
  user: FirebaseUser | null
  userData: User | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ["/login"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchUserData = useCallback(async (user: FirebaseUser) => {
    try {
      if (!db) throw new Error("Firestore no está inicializado")

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as User
        return userData
      }

      const newUserData: User = {
        id: user.uid,
        email: user.email || "",
        role: "user",
        name: user.displayName || user.email?.split("@")[0] || "Usuario",
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "users", user.uid), newUserData)
      return newUserData
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Error al obtener datos del usuario")
      return null
    }
  }, [])

  useEffect(() => {
    if (!auth) {
      setError("Firebase Auth no está inicializado")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          setUser(authUser)
          const data = await fetchUserData(authUser)
          if (data) {
            setUserData(data)
            setError(null)
          }
        } else {
          setUser(null)
          setUserData(null)
          // Solo redirigir si no estamos en una ruta pública
          if (!PUBLIC_ROUTES.includes(window.location.pathname)) {
            router.replace("/login")
          }
        }
      } catch (err) {
        console.error("Auth error:", err)
        setError("Error de autenticación")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [fetchUserData, router])

  const logout = async () => {
    try {
      if (!auth) throw new Error("Auth no está inicializado")
      await signOut(auth)
      router.replace("/login")
    } catch (err) {
      console.error("Logout error:", err)
      setError("Error al cerrar sesión")
    }
  }

  return <AuthContext.Provider value={{ user, userData, loading, error, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")
  }
  return context
}

