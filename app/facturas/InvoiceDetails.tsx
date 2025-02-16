import type React from "react"
import type { Invoice } from "@/types/Invoice"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Download, X } from "lucide-react"
import { generateInvoicePDF } from "@/lib/pdfGenerator"
import InvoicePreview from "./InvoicePreview"

interface InvoiceDetailsProps {
  invoice: Invoice
  onClose: () => void
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice, onClose }) => {
  const handleDownloadPDF = () => {
    generateInvoicePDF(invoice)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Factura</DialogTitle>
        </DialogHeader>
        <InvoicePreview invoice={invoice} />
        <DialogFooter>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default InvoiceDetails

