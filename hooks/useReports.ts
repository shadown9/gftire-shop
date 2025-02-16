import { useState } from "react"
import { useFirestore } from "./useFirestore"
import type { Invoice } from "@/types/Invoice"
import type { Product } from "@/types/Product"
import type { Client } from "@/types/Client"

interface ReportData {
  salesData: { date: string; total: number }[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  customerData: { name: string; value: number }[]
  inventoryData: { name: string; stock: number; reorderPoint: number }[]
}

interface DateRange {
  from: Date
  to: Date
}

export function useReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const {
    data: invoices,
    loading: loadingInvoices,
    error: invoicesError,
  } = useFirestore<Invoice>({ collectionName: "invoices" })
  const {
    data: products,
    loading: loadingProducts,
    error: productsError,
  } = useFirestore<Product>({ collectionName: "products" })
  const {
    data: clients,
    loading: loadingClients,
    error: clientsError,
  } = useFirestore<Client>({ collectionName: "clients" })

  const generateReport = (dateRange: DateRange) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date)
      return invoiceDate >= dateRange.from && invoiceDate <= dateRange.to
    })

    // Generar datos de ventas
    const salesData = filteredInvoices
      .reduce(
        (acc, invoice) => {
          const date = new Date(invoice.date).toISOString().split("T")[0]
          const existingEntry = acc.find((entry) => entry.date === date)
          if (existingEntry) {
            existingEntry.total += invoice.total
          } else {
            acc.push({ date, total: invoice.total })
          }
          return acc
        },
        [] as { date: string; total: number }[],
      )
      .sort((a, b) => a.date.localeCompare(b.date))

    // Generar datos de productos más vendidos
    const productSales = filteredInvoices
      .flatMap((invoice) => invoice.items)
      .reduce(
        (acc, item) => {
          if (!acc[item.productId]) {
            acc[item.productId] = { quantity: 0, revenue: 0 }
          }
          acc[item.productId].quantity += item.quantity
          acc[item.productId].revenue += item.quantity * item.price
          return acc
        },
        {} as Record<string, { quantity: number; revenue: number }>,
      )

    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => ({
        name: products.find((p) => p.id === productId)?.name || "Producto Desconocido",
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Generar datos de análisis de clientes
    const customerSales = filteredInvoices.reduce(
      (acc, invoice) => {
        if (!acc[invoice.clientId]) {
          acc[invoice.clientId] = 0
        }
        acc[invoice.clientId] += invoice.total
        return acc
      },
      {} as Record<string, number>,
    )

    const customerData = Object.entries(customerSales)
      .map(([clientId, value]) => ({
        name: clients.find((c) => c.id === clientId)?.name || "Cliente Desconocido",
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Generar datos de estado del inventario
    const inventoryData = products
      .map((product) => ({
        name: product.name,
        stock: product.stock || 0,
        reorderPoint: product.reorderPoint || 0,
      }))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 20)

    setReportData({
      salesData,
      topProducts,
      customerData,
      inventoryData,
    })
  }

  const loading = loadingInvoices || loadingProducts || loadingClients
  const error = invoicesError || productsError || clientsError

  return {
    reportData,
    loading,
    error,
    generateReport,
  }
}

