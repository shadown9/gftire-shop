"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Verificar si es un error de redirección
    if (error && typeof error === "object" && ("__v0__redirect" in error || "digest" in error)) {
      return { hasError: false, error: null }
    }
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Solo registrar errores que no sean de redirección
    if (!(error && typeof error === "object" && ("__v0__redirect" in error || "digest" in error))) {
      console.error("Uncaught error:", error, errorInfo)
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error en la aplicación</AlertTitle>
              <AlertDescription className="mt-2">
                {this.state.error?.message || "Ha ocurrido un error inesperado."}
              </AlertDescription>
            </Alert>
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Recargar aplicación
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

