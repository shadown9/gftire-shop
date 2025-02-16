import { jsPDF } from "jspdf"
import { format } from "date-fns"

export function exportToPDF(reportData: any, dateRange: { from: Date; to: Date } | undefined) {
  const doc = new jsPDF()

  // Título del reporte
  doc.setFontSize(18)
  doc.text("Reporte de Ventas", 14, 22)

  // Fecha del reporte
  doc.setFontSize(11)
  doc.text(`Generado el: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30)

  if (dateRange) {
    doc.text(`Período: ${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`, 14, 38)
  }

  // Resumen de ventas
  doc.setFontSize(14)
  doc.text("Resumen de Ventas", 14, 50)
  doc.autoTable({
    startY: 55,
    head: [["Fecha", "Total"]],
    body: reportData.salesData.map((item: any) => [item.date, `$${item.total.toFixed(2)}`]),
  })

  // Productos más vendidos
  doc.addPage()
  doc.setFontSize(14)
  doc.text("Productos Más Vendidos", 14, 20)
  doc.autoTable({
    startY: 25,
    head: [["Producto", "Cantidad", "Ingresos"]],
    body: reportData.topProducts.map((item: any) => [item.name, item.quantity, `$${item.revenue.toFixed(2)}`]),
  })

  // Análisis de clientes
  doc.addPage()
  doc.setFontSize(14)
  doc.text("Análisis de Clientes", 14, 20)
  doc.autoTable({
    startY: 25,
    head: [["Cliente", "Ventas Totales"]],
    body: reportData.customerData.map((item: any) => [item.name, `$${item.value.toFixed(2)}`]),
  })

  // Estado del inventario
  doc.addPage()
  doc.setFontSize(14)
  doc.text("Estado del Inventario", 14, 20)
  doc.autoTable({
    startY: 25,
    head: [["Producto", "Stock Actual", "Punto de Reorden"]],
    body: reportData.inventoryData.map((item: any) => [item.name, item.stock, item.reorderPoint]),
  })

  // Guardar el PDF
  doc.save("reporte_ventas.pdf")
}

