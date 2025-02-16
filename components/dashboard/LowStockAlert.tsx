import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Product } from "@/types/Product"

interface LowStockAlertProps {
  products: Product[]
  threshold?: number
}

export function LowStockAlert({ products, threshold = 5 }: LowStockAlertProps) {
  const lowStockProducts = products.filter((product) => product.stock <= threshold)

  if (lowStockProducts.length === 0) {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Productos con Stock Bajo</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {lowStockProducts.map((product) => (
            <li key={product.id}>
              {product.name} - {product.stock} unidades restantes
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

