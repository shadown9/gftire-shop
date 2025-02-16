"use client"
import { useFirestore } from "@/hooks/useFirestore"
import { useToast } from "@/components/ui/use-toast"
import ProtectedLayout from "@/components/ProtectedLayout"
import InvoiceForm from "./InvoiceForm"
import type { Invoice } from "@/types/Invoice"

export default function FacturasPage() {
  const { add } = useFirestore<Invoice>({ collectionName: "invoices" })
  const { toast } = useToast()

  const handleFormSubmit = async (invoiceData: Omit<Invoice, "id">) => {
    try {
      await add(invoiceData)
      toast({
        description: "Factura creada correctamente",
      })
    } catch (err: any) {
      console.error("Error saving invoice:", err)
      toast({
        variant: "destructive",
        description: err.message || "Error al guardar la factura",
      })
    }
  }

  return (
    <ProtectedLayout>
      <InvoiceForm onSubmit={handleFormSubmit} />
    </ProtectedLayout>
  )
}

