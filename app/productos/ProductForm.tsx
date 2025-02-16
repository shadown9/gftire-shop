"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useFirestore } from "@/hooks/useFirestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import type { Product } from "@/types/Product"
import { Barcode, Loader2, AlertCircle, Upload, ZoomIn, ZoomOut } from "lucide-react"
import ProductScanModal from "@/components/ProductScanModal"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

interface ProductFormProps {
  product: Product | null
  barcode?: string
  onClose: () => void
  onSubmit: (productData: Omit<Product, "id">, image: File | null) => Promise<void>
}

const ProductForm: React.FC<ProductFormProps> = ({ product, barcode, onClose, onSubmit }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [barcodeState, setBarcode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)
  const [existingProduct, setExistingProduct] = useState<Product | null>(null)
  const [showExistingProductAlert, setShowExistingProductAlert] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(true)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(product)
  const [crop, setCrop] = useState<Crop>()
  const [zoom, setZoom] = useState(1)
  const { toast } = useToast()
  const { query } = useFirestore<Product>({ collectionName: "products" })

  useEffect(() => {
    const productToUse = currentProduct || product
    if (productToUse) {
      setName(productToUse.name)
      setDescription(productToUse.description || "")
      setPrice(productToUse.price ? productToUse.price.toString() : "")
      setStock(productToUse.stock ? productToUse.stock.toString() : "")
      setBarcode(productToUse.barcode || "")
      setImagePreview(productToUse.imageUrl || null)
    } else if (barcode) {
      setBarcode(barcode)
    }
  }, [currentProduct, product, barcode])

  useEffect(() => {
    return () => {
      if (imagePreview && !imagePreview.startsWith("http")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const checkExistingProduct = async (code: string) => {
    try {
      const products = await query([
        {
          field: "barcode",
          operator: "==",
          value: code,
        },
      ])

      if (products && products.length > 0) {
        setExistingProduct(products[0])
        setShowExistingProductAlert(true)
        setShowForm(false)
        return true
      }
      return false
    } catch (err) {
      console.error("Error checking existing product:", err)
      return false
    }
  }

  const handleScannedCode = async (code: string) => {
    setIsScanModalOpen(false)
    const exists = await checkExistingProduct(code)
    if (!exists) {
      setBarcode(code)
      setShowExistingProductAlert(false)
      setShowForm(true)
    }
  }

  const handleEditExisting = () => {
    if (existingProduct) {
      setCurrentProduct(existingProduct)
      setShowExistingProductAlert(false)
      setShowForm(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const productData = {
        name,
        description,
        price: price ? Number.parseFloat(price) : 0,
        stock: stock ? Number.parseInt(stock) : 0,
        imageUrl: currentProduct?.imageUrl || "",
        barcode: barcodeState,
      }

      await onSubmit(productData, image)
      toast({
        description: currentProduct ? "Producto actualizado correctamente" : "Producto creado correctamente",
      })
      handleClose()
    } catch (err: any) {
      console.error("Error al guardar el producto:", err)
      toast({
        variant: "destructive",
        description: err.message || "Error al guardar el producto. Por favor, intente de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleImageFile(file)
  }, [])

  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        description: "La imagen no debe superar los 5MB",
      })
      return
    }

    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!validImageTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        description: "El archivo debe ser una imagen válida (JPEG, PNG, GIF, WebP o SVG)",
      })
      return
    }

    setImage(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    toast({
      description: `Imagen "${file.name}" seleccionada correctamente`,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0])
    }
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setShowForm(true)
    setShowExistingProductAlert(false)
    onClose()
  }

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClose()
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentProduct ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
            <DialogDescription>
              {currentProduct ? "Modifica los datos del producto" : "Ingresa los datos del nuevo producto"}
            </DialogDescription>
          </DialogHeader>

          {showExistingProductAlert && existingProduct && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Producto Existente</AlertTitle>
              <AlertDescription className="mt-2">
                Ya existe un producto con este código de barras:
                <div className="font-medium mt-1">{existingProduct.name}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={handleEditExisting}>
                    Editar Existente
                  </Button>
                  <Button size="sm" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Código de Barras</Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        value={barcodeState}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => setIsScanModalOpen(true)}>
                        <Barcode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div
                  className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-64">
                      <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={1}>
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Vista previa"
                          className="w-full h-full object-contain"
                          style={{ transform: `scale(${zoom})` }}
                        />
                      </ReactCrop>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                        <ZoomOut className="h-4 w-4" />
                        <Slider
                          value={[zoom]}
                          min={0.5}
                          max={3}
                          step={0.1}
                          onValueChange={([value]) => setZoom(value)}
                        />
                        <ZoomIn className="h-4 w-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        Arrastra y suelta una imagen aquí o haz clic para seleccionar
                      </p>
                    </div>
                  )}
                  <Input
                    id="image"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <Label htmlFor="image" className="mt-4 cursor-pointer">
                    <Button type="button" variant="outline">
                      {imagePreview ? "Cambiar imagen" : "Seleccionar imagen"}
                    </Button>
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ProductScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onCodeScanned={handleScannedCode}
      />
    </>
  )
}

export default ProductForm

