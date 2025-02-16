"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Users, Package, FileBarChart } from "lucide-react"

export function QuickActions() {
  const router = useRouter()

  const handleNewInvoice = () => {
    router.push("/facturas?action=new")
  }

  const handleNewProduct = () => {
    router.push("/productos?action=new")
  }

  const handleNewClient = () => {
    router.push("/clientes?action=new")
  }

  const handleViewReports = () => {
    router.push("/reportes")
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button onClick={handleNewInvoice} variant="outline" className="flex items-center justify-center p-3 h-auto">
        <div className="flex flex-col items-center gap-1">
          <Plus className="h-4 w-4" />
          <span className="text-xs">Nueva Factura</span>
        </div>
      </Button>

      <Button onClick={handleNewProduct} variant="outline" className="flex items-center justify-center p-3 h-auto">
        <div className="flex flex-col items-center gap-1">
          <Package className="h-4 w-4" />
          <span className="text-xs">Nuevo Producto</span>
        </div>
      </Button>

      <Button onClick={handleNewClient} variant="outline" className="flex items-center justify-center p-3 h-auto">
        <div className="flex flex-col items-center gap-1">
          <Users className="h-4 w-4" />
          <span className="text-xs">Nuevo Cliente</span>
        </div>
      </Button>

      <Button onClick={handleViewReports} variant="outline" className="flex items-center justify-center p-3 h-auto">
        <div className="flex flex-col items-center gap-1">
          <FileBarChart className="h-4 w-4" />
          <span className="text-xs">Ver Reportes</span>
        </div>
      </Button>
    </div>
  )
}

