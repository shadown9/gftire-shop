import { jsPDF } from "jspdf"
import { autoTable } from "jspdf-autotable"
import type { Invoice } from "@/types/Invoice"

export function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF()

  // Add company logo or name
  doc.setFontSize(20)
  doc.text("GF Tire Shop", 14, 22)

  // Add invoice details
  doc.setFontSize(12)
  doc.text(`Factura #: ${invoice.invoiceNumber}`, 14, 30)
  doc.text(`Fecha: ${new Date(invoice.date).toLocaleDateString()}`, 14, 36)
  doc.text(`Cliente: ${invoice.client.name}`, 14, 42)
  doc.text(`Email: ${invoice.client.email || "No disponible"}`, 14, 48)

  // Add invoice items
  autoTable(doc, {
    startY: 60,
    head: [["Producto", "Cantidad", "Precio Unitario", "Total"]],
    body: invoice.items.map((item) => [
      item.productName,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`,
    ]),
    foot: [["", "", "Total", `$${invoice.total.toFixed(2)}`]],
  })

  // Save the PDF
  doc.save(`factura_${invoice.invoiceNumber}.pdf`)
}

