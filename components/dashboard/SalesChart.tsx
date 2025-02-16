"use client"

import { useState, useMemo } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import type { Invoice } from "@/types/Invoice"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface SalesChartProps {
  invoices: Invoice[]
}

type TimeRange = "7days" | "30days" | "90days" | "all"

export function SalesChart({ invoices }: SalesChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days")

  // Memoizar los cálculos para evitar recálculos innecesarios
  const { salesByDate, sortedDates, totalSales, averageSale, salesGrowth, previousPeriodSales } = useMemo(() => {
    const filterInvoicesByDate = (days: number) => {
      if (days === 0) return invoices
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      return invoices.filter((invoice) => new Date(invoice.date) >= cutoffDate)
    }

    const filteredInvoices = (() => {
      switch (timeRange) {
        case "7days":
          return filterInvoicesByDate(7)
        case "30days":
          return filterInvoicesByDate(30)
        case "90days":
          return filterInvoicesByDate(90)
        case "all":
          return filterInvoicesByDate(0)
        default:
          return invoices
      }
    })()

    // Calcular ventas por fecha
    const salesByDate = filteredInvoices.reduce(
      (acc, invoice) => {
        const date = new Date(invoice.date).toLocaleDateString()
        acc[date] = (acc[date] || 0) + invoice.total
        return acc
      },
      {} as Record<string, number>,
    )

    // Ordenar fechas
    const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    // Calcular estadísticas
    const totalSales = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const averageSale = filteredInvoices.length > 0 ? totalSales / filteredInvoices.length : 0

    // Calcular ventas del período anterior
    const previousPeriodSales = invoices
      .filter((invoice) => {
        const invoiceDate = new Date(invoice.date)
        const startDate = new Date()
        const endDate = new Date()

        switch (timeRange) {
          case "7days":
            startDate.setDate(startDate.getDate() - 14)
            endDate.setDate(endDate.getDate() - 7)
            break
          case "30days":
            startDate.setDate(startDate.getDate() - 60)
            endDate.setDate(endDate.getDate() - 30)
            break
          case "90days":
            startDate.setDate(startDate.getDate() - 180)
            endDate.setDate(endDate.getDate() - 90)
            break
          default:
            return false
        }
        return invoiceDate >= startDate && invoiceDate <= endDate
      })
      .reduce((sum, invoice) => sum + invoice.total, 0)

    const salesGrowth = previousPeriodSales ? ((totalSales - previousPeriodSales) / previousPeriodSales) * 100 : 0

    return {
      salesByDate,
      sortedDates,
      totalSales,
      averageSale,
      salesGrowth,
      previousPeriodSales,
    }
  }, [invoices, timeRange])

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Ventas Diarias",
        data: sortedDates.map((date) => salesByDate[date]),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context: any) => `$ ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          callback: (value: number) => `$${value.toFixed(2)}`,
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  }

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Tendencia de Ventas</CardTitle>
            <CardDescription className="text-blue-100">Análisis de ventas en el tiempo</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 días</SelectItem>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="90days">Últimos 90 días</SelectItem>
              <SelectItem value="all">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <DollarSign className="h-4 w-4" />
              <span>Ventas Totales</span>
            </div>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <DollarSign className="h-4 w-4" />
              <span>Venta Promedio</span>
            </div>
            <div className="text-2xl font-bold">${averageSale.toFixed(2)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              {salesGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span>Crecimiento</span>
            </div>
            <div className={`text-2xl font-bold ${salesGrowth >= 0 ? "text-green-400" : "text-red-400"}`}>
              {isNaN(salesGrowth) || !isFinite(salesGrowth) ? "0.0" : salesGrowth.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}

