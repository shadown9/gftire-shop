"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirestore } from "@/hooks/useFirestore"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedLayout from "@/components/ProtectedLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Package, Users, FileText, AlertCircle, DollarSign } from "lucide-react"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { LowStockAlert } from "@/components/dashboard/LowStockAlert"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/Product"
import type { Client } from "@/types/Client"
import type { Invoice } from "@/types/Invoice"

interface DashboardStats {
  totalProducts: number
  totalClients: number
  totalInvoices: number
  totalSales: number
  recentProducts: Product[]
  recentClients: Client[]
  recentInvoices: Invoice[]
}

export default function Dashboard() {
  const router = useRouter()
  const { userData } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalClients: 0,
    totalInvoices: 0,
    totalSales: 0,
    recentProducts: [],
    recentClients: [],
    recentInvoices: [],
  })

  const {
    data: products,
    loading: loadingProducts,
    error: productsError,
    fetchAll: fetchProducts,
  } = useFirestore<Product>({ collectionName: "products" })

  const {
    data: clients,
    loading: loadingClients,
    error: clientsError,
    fetchAll: fetchClients,
  } = useFirestore<Client>({ collectionName: "clients" })

  const {
    data: invoices,
    loading: loadingInvoices,
    error: invoicesError,
    fetchAll: fetchInvoices,
  } = useFirestore<Invoice>({ collectionName: "invoices" })

  useEffect(() => {
    console.log("Fetching data...")
    fetchProducts()
    fetchClients()
    fetchInvoices()
  }, [fetchProducts, fetchClients, fetchInvoices])

  useEffect(() => {
    console.log("Updating stats...")
    if (!loadingProducts && !loadingClients && !loadingInvoices) {
      const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
      console.log("Total sales calculated:", totalSales)

      setStats({
        totalProducts: products.length,
        totalClients: clients.length,
        totalInvoices: invoices.length,
        totalSales,
        recentProducts: products.slice(-5),
        recentClients: clients.slice(-5),
        recentInvoices: invoices.slice(-5),
      })
      console.log("Stats updated")
    }
  }, [products, clients, invoices, loadingProducts, loadingClients, loadingInvoices])

  const error = productsError || clientsError || invoicesError
  const loading = loadingProducts || loadingClients || loadingInvoices

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-full overflow-x-hidden space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600">Panel de Control</h1>
          <p className="text-gray-600">Bienvenido, {userData?.name}</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <LowStockAlert products={products} />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" onClick={() => router.push("/productos")}>
            <Card className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Productos</CardTitle>
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs sm:text-sm text-blue-100">en inventario</p>
              </CardContent>
            </Card>
          </Button>

          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" onClick={() => router.push("/clientes")}>
            <Card className="w-full bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalClients}</div>
                <p className="text-xs sm:text-sm text-green-100">registrados</p>
              </CardContent>
            </Card>
          </Button>

          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" onClick={() => router.push("/facturas")}>
            <Card className="w-full bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Facturas</CardTitle>
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalInvoices}</div>
                <p className="text-xs sm:text-sm text-purple-100">emitidas</p>
              </CardContent>
            </Card>
          </Button>

          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" onClick={() => router.push("/reportes")}>
            <Card className="w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Ventas</CardTitle>
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-2xl sm:text-3xl font-bold">${stats.totalSales.toFixed(2)}</div>
                <p className="text-xs sm:text-sm text-orange-100">total</p>
              </CardContent>
            </Card>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-blue-600">Tendencia de Ventas</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-4">
              <SalesChart invoices={invoices} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-600">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActions />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-600">Productos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentProducts.map((product) => (
                    <Button
                      key={product.id}
                      variant="ghost"
                      className="w-full p-0 h-auto hover:bg-gray-100"
                      onClick={() => router.push(`/productos?id=${product.id}`)}
                    >
                      <div className="flex items-center w-full bg-gray-50 p-2 rounded-lg">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            Stock: {product.stock} | ${product.price}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

