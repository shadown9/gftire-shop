import type React from "react"
import { useState } from "react"
import type { Invoice } from "@/types/Invoice"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Eye } from "lucide-react"

interface InvoiceListProps {
  invoices: Invoice[]
  onViewInvoice: (invoice: Invoice) => void
}

type SortField = "invoiceNumber" | "date" | "total" | "clientName"
type SortOrder = "asc" | "desc"

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onViewInvoice }) => {
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (sortField === "date") {
      return sortOrder === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    } else if (sortField === "total") {
      return sortOrder === "asc" ? a.total - b.total : b.total - a.total
    } else if (sortField === "clientName") {
      return sortOrder === "asc"
        ? (a.client?.name || "").localeCompare(b.client?.name || "")
        : (b.client?.name || "").localeCompare(a.client?.name || "")
    } else {
      return sortOrder === "asc"
        ? a.invoiceNumber.localeCompare(b.invoiceNumber)
        : b.invoiceNumber.localeCompare(a.invoiceNumber)
    }
  })

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">
            <Button variant="ghost" onClick={() => toggleSort("invoiceNumber")}>
              Número de Factura
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => toggleSort("clientName")}>
              Cliente
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => toggleSort("date")}>
              Fecha
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => toggleSort("total")}>
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedInvoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
            <TableCell>{invoice.client?.name || "Cliente no disponible"}</TableCell>
            <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
            <TableCell>${invoice.total.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => onViewInvoice(invoice)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default InvoiceList

