"use client"

import { useState, useEffect, useCallback } from "react"
import { useFirestore } from "@/hooks/useFirestore"
import { useNotifications } from "@/hooks/useNotifications"
import ProtectedLayout from "@/components/ProtectedLayout"
import ProductForm from "./ProductForm"
import ProductList from "./ProductList"
import ProductDetails from "./ProductDetails"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Plus, Search, Grid } from "lucide-react"
import type { Product } from "@/types/Product"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { ProductFilterCards } from "./ProductFilterCards"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface ProductFilter {
  id: string
  name: string
  query: string
}

const DEFAULT_FILTERS: ProductFilter[] = [
  { id: "1", name: "Gomas Nuevas", query: "gomas nuevas" },
  { id: "2", name: "Gomas Usadas", query: "gomas usadas" },
  { id: "3", name: "Aros", query: "aros" },
  { id: "4", name: "Baterías", query: "baterias" },
  { id: "5", name: "Aceite", query: "aceite" },
  { id: "6", name: "Filtros", query: "filtros" },
  { id: "7", name: "Frenos", query: "frenos" },
  { id: "8", name: "Suspensión", query: "suspension" },
  { id: "9", name: "Luces", query: "luces" },
  { id: "10", name: "Accesorios", query: "accesorios" },
]

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const { success, error: showError } = useNotifications()
  const [filters, setFilters] = useLocalStorage<ProductFilter[]>("product-filters", DEFAULT_FILTERS)

  const { data, loading, error, fetchAll, add, update, remove } = useFirestore<Product>({ collectionName: "products" })

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAll()
        // Verificar duplicados
        const uniqueProducts = Array.from(new Set(data.map((p) => p.id)))
          .map((id) => data.find((p) => p.id === id))
          .filter((p): p is Product => p !== undefined)

        setProducts(uniqueProducts)
        setFilteredProducts(uniqueProducts)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchData()
  }, [fetchAll, data])

  useEffect(() => {
    const lowercasedSearch = searchTerm.toLowerCase()
    let filtered = products

    if (selectedFilter !== null) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(selectedFilter.toLowerCase()))
    }

    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedSearch) ||
        product.description?.toLowerCase().includes(lowercasedSearch) ||
        product.barcode?.toLowerCase().includes(lowercasedSearch),
    )

    setFilteredProducts(filtered)
  }, [searchTerm, selectedFilter, products])

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }, [])

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }, [])

  const handleViewProduct = useCallback((product: Product) => {
    setViewingProduct(product)
  }, [])

  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
        try {
          await remove(productId)
          setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId))
          success("Producto eliminado correctamente")
        } catch (err: any) {
          console.error("Error deleting product:", err)
          showError(err.message || "Error al eliminar el producto")
        }
      }
    },
    [remove, success, showError],
  )

  const uploadImage = useCallback(
    async (file: File, crop: { width: number; height: number; x: number; y: number }): Promise<string> => {
      try {
        const storage = getStorage()
        const timestamp = Date.now()
        const fileName = `${timestamp}-${file.name}`
        const storageRef = ref(storage, `product-images/${fileName}`)

        // Crear un canvas para recortar la imagen
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        return new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = crop.width
            canvas.height = crop.height
            ctx?.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)

            canvas.toBlob(async (blob) => {
              if (blob) {
                await uploadBytes(storageRef, blob)
                const downloadURL = await getDownloadURL(storageRef)
                resolve(downloadURL)
              } else {
                reject(new Error("Error al procesar la imagen"))
              }
            }, file.type)
          }
          img.onerror = () => reject(new Error("Error al cargar la imagen"))
          img.src = URL.createObjectURL(file)
        })
      } catch (err: any) {
        console.error("Error uploading image:", err)
        throw new Error(err.message || "Error al subir la imagen")
      }
    },
    [],
  )

  const handleFormSubmit = useCallback(
    async (
      productData: Omit<Product, "id">,
      image: File | null,
      crop?: { width: number; height: number; x: number; y: number },
    ) => {
      try {
        let imageUrl = productData.imageUrl

        if (image && crop) {
          imageUrl = await uploadImage(image, crop)
        }

        const finalProductData = {
          ...productData,
          imageUrl: imageUrl || "",
        }

        if (editingProduct) {
          await update(editingProduct.id, finalProductData)
          setProducts((prevProducts) =>
            prevProducts.map((p) => (p.id === editingProduct.id ? { ...finalProductData, id: editingProduct.id } : p)),
          )
          success("Producto actualizado correctamente")
        } else {
          const newProduct = await add(finalProductData)
          setProducts((prevProducts) => [...prevProducts, newProduct])
          success("Producto añadido correctamente")
        }

        setIsFormOpen(false)
        setEditingProduct(null)
      } catch (err: any) {
        console.error("Error saving product:", err)
        showError(err.message || "Error al guardar el producto")
      }
    },
    [editingProduct, update, add, success, showError, uploadImage],
  )

  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Productos</h1>
            <p className="text-sm text-gray-600">Administra el inventario de productos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedFilter(null)}>
              <Grid className="mr-2 h-4 w-4" />
              Ver todos ({products.length})
            </Button>
            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" /> Agregar Producto
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ProductFilterCards
          products={products}
          onFilterSelect={setSelectedFilter}
          selectedFilter={selectedFilter}
          filters={filters}
          onUpdateFilters={setFilters}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <ProductList
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onView={handleViewProduct}
          />
        )}

        {isFormOpen && (
          <ProductForm product={editingProduct} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} />
        )}

        {viewingProduct && <ProductDetails product={viewingProduct} onClose={() => setViewingProduct(null)} />}
      </div>
    </ProtectedLayout>
  )
}

