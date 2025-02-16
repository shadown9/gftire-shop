"use client"

import { useState } from "react"
import { useReports } from "@/hooks/useReports"
import { useNotifications } from "@/hooks/useNotifications"
import ProtectedLayout from "@/components/ProtectedLayout"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, FileDown } from "lucide-react"
import { SalesOverviewChart } from "@/components/reports/SalesOverviewChart"
import { TopProductsChart } from "@/components/reports/TopProductsChart"
import { CustomerAnalysisChart } from "@/components/reports/CustomerAnalysisChart"
import { InventoryStatusChart } from "@/components/reports/InventoryStatusChart"
import { exportToPDF } from "@/lib/pdfExport"

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)
  const { reportData, loading, error, generateReport } = useReports()
  const { error: showError } = useNotifications()

  const handleGenerateReport = () => {
    if (!dateRange) {
      showError("Por favor, seleccione un rango de fechas")
      return
    }
    generateReport(dateRange)
  }

  const handleExportPDF = () => {
    if (reportData) {
      exportToPDF(reportData, dateRange)
    } else {
      showError("No hay datos para exportar")
    }
  }

  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Reportes y Análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
              <DateRangePicker onChange={setDateRange} />
              <div className="flex space-x-2">
                <Button onClick={handleGenerateReport} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? "Generando..." : "Generar Reporte"}
                </Button>
                <Button onClick={handleExportPDF} disabled={!reportData || loading} variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {reportData && (
              <Tabs defaultValue="sales" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sales">Ventas</TabsTrigger>
                  <TabsTrigger value="products">Productos</TabsTrigger>
                  <TabsTrigger value="customers">Clientes</TabsTrigger>
                  <TabsTrigger value="inventory">Inventario</TabsTrigger>
                </TabsList>
                <TabsContent value="sales">
                  <SalesOverviewChart data={reportData.salesData} />
                </TabsContent>
                <TabsContent value="products">
                  <TopProductsChart data={reportData.topProducts} />
                </TabsContent>
                <TabsContent value="customers">
                  <CustomerAnalysisChart data={reportData.customerData} />
                </TabsContent>
                <TabsContent value="inventory">
                  <InventoryStatusChart data={reportData.inventoryData} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}

