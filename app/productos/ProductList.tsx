import type React from "react"
import Image from "next/image"
import type { Product } from "@/types/Product"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Edit, Trash2 } from "lucide-react"

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onView: (product: Product) => void
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, onView }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product) => {
        // Generar una key única combinando id y timestamp si es necesario
        const uniqueKey = `${product.id}-${Date.now()}`
        return (
          <Card key={uniqueKey} className="flex flex-col h-full">
            <CardContent className="p-3 flex flex-col h-full">
              <div className="relative aspect-square mb-2 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={`Imagen de ${product.name}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              <h3 className="text-sm font-semibold line-clamp-1 mb-1">{product.name}</h3>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-grow">
                {product.description || "Sin descripción"}
              </p>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-bold">${product.price?.toFixed(2)}</span>
                <span className="text-gray-500">Stock: {product.stock}</span>
              </div>
              <div className="flex justify-between gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 px-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(product)
                  }}
                  aria-label={`Ver detalles de ${product.name}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 px-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(product)
                  }}
                  aria-label={`Editar ${product.name}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 px-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(product.id)
                  }}
                  aria-label={`Eliminar ${product.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ProductList

