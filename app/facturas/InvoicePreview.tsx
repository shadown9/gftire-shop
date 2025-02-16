import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Invoice } from "@/types/Invoice"

interface InvoicePreviewProps {
  invoice: Omit<Invoice, "id">
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Factura #{invoice.invoiceNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Detalles de la Factura</h3>
            <p>
              <strong>Fecha:</strong> {new Date(invoice.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Cliente</h3>
            <p>
              <strong>Nombre:</strong> {invoice.client.name}
            </p>
            <p>
              <strong>Email:</strong> {invoice.client.email || "No disponible"}
            </p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio Unitario</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.productName}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-right mt-4">
          <p className="text-lg font-bold">Total: ${invoice.total.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default InvoicePreview

