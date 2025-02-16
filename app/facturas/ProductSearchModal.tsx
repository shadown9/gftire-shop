"use client"
import { Search, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Product } from "@/types/Product"
import { useState, useEffect } from "react"

interface ProductSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: Product) => void
  products: Product[]
}

export function ProductSearchModal({ isOpen, onClose, onSelect, products }: ProductSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calcular productos para la página actual
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Resetear la página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                className="pl-9 w-full"
                placeholder="Buscar por nombre, código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentProducts.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
                onClick={() => {
                  onSelect(product)
                  onClose()
                }}
              >
                <div className="font-medium line-clamp-2 text-left">{product.name}</div>
                <div className="text-sm text-muted-foreground">
                  {product.barcode && <div>Código: {product.barcode}</div>}
                  <div>Stock: {product.stock}</div>
                  <div className="font-semibold text-primary">${product.price?.toFixed(2)}</div>
                </div>
              </Button>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron productos que coincidan con la búsqueda.
            </div>
          )}
        </ScrollArea>

        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} de{" "}
              {filteredProducts.length} productos
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

