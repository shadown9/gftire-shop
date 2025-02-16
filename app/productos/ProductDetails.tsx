import type React from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/Product"

interface ProductDetailsProps {
  product: Product
  onClose: () => void
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalles del Producto: {product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative h-64 w-full">
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={`Imagen de ${product.name}`}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Precio:</span>
            <span className="col-span-3">${product.price?.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Stock:</span>
            <span className="col-span-3">{product.stock}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Código:</span>
            <span className="col-span-3">{product.barcode || "N/A"}</span>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <span className="font-bold">Descripción:</span>
            <p className="col-span-3">{product.description || "Sin descripción"}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} aria-label="Cerrar detalles del producto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetails

