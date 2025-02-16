"use client"

import { useState, useEffect } from "react"
import { useFirestore } from "@/hooks/useFirestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Barcode, Download, Search, ShoppingCart } from "lucide-react"
import ProductScanModal from "@/components/ProductScanModal"
import { generateInvoicePDF } from "@/lib/pdfGenerator"
import type { Invoice, InvoiceItem } from "@/types/Invoice"
import type { Client } from "@/types/Client"
import type { Product } from "@/types/Product"

interface InvoiceFormProps {
  onSubmit: (invoiceData: Omit<Invoice, "id">) => Promise<void>
}

export default function InvoiceForm({ onSubmit }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)
  const { toast } = useToast()

  const { data: clientsData, fetchAll: fetchClients } = useFirestore<Client>({ collectionName: "clients" })
  const { data: productsData, fetchAll: fetchProducts } = useFirestore<Product>({ collectionName: "products" })

  useEffect(() => {
    fetchClients()
    fetchProducts()
  }, [fetchClients, fetchProducts])

  useEffect(() => {
    if (clientsData) setClients(clientsData)
    if (productsData) setProducts(productsData)
  }, [clientsData, productsData])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = (product: Product) => {
    const existingItem = invoiceItems.find((item) => item.productId === product.id)
    if (existingItem) {
      setInvoiceItems(
        invoiceItems.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setInvoiceItems([
        ...invoiceItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price || 0,
        },
      ])
    }
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.productId !== productId))
    } else {
      setInvoiceItems(
        invoiceItems.map((item) => (item.productId === productId ? { ...item, quantity: newQuantity } : item)),
      )
    }
  }

  const calculateTotal = () => {
    return invoiceItems.reduce((total, item) => total + item.quantity * item.price, 0)
  }

  const checkMissingDetails = (): string | null => {
    if (!selectedClient) {
      return "Por favor, seleccione un cliente"
    }
    if (invoiceItems.length === 0) {
      return "Por favor, añada al menos un producto"
    }
    return null
  }

  const resetForm = () => {
    setInvoiceItems([])
    setSelectedClient("")
    setSearchTerm("")
  }

  const handleSubmit = async () => {
    const missingDetails = checkMissingDetails()
    if (missingDetails) {
      toast({
        variant: "destructive",
        description: missingDetails,
      })
      return
    }

    const selectedClientData = clients.find((c) => c.id === selectedClient)
    if (!selectedClientData) {
      toast({
        variant: "destructive",
        description: "Cliente seleccionado no encontrado",
      })
      return
    }

    const invoiceData: Omit<Invoice, "id"> = {
      invoiceNumber: `INV-${Date.now()}`,
      clientId: selectedClient,
      client: selectedClientData,
      date: new Date().toISOString(),
      items: invoiceItems,
      total: calculateTotal(),
    }

    try {
      await onSubmit(invoiceData)
      toast({
        description: "Factura guardada correctamente",
        duration: 3000,
      })
      // Resetear el formulario
      resetForm()
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error al guardar la factura",
      })
    }
  }

  const handleScannedCode = (code: string) => {
    const product = products.find((p) => p.barcode === code)
    if (product) {
      handleAddProduct(product)
    } else {
      toast({
        variant: "destructive",
        description: "Producto no encontrado",
      })
    }
    setIsScanModalOpen(false)
  }

  const handleDownloadPDF = () => {
    const missingDetails = checkMissingDetails()
    if (missingDetails) {
      toast({
        variant: "destructive",
        description: missingDetails,
      })
      return
    }

    const selectedClientData = clients.find((c) => c.id === selectedClient)
    if (!selectedClientData) return

    const invoiceData: Invoice = {
      id: "preview",
      invoiceNumber: `INV-${Date.now()}`,
      clientId: selectedClient,
      client: selectedClientData,
      date: new Date().toISOString(),
      items: invoiceItems,
      total: calculateTotal(),
    }

    try {
      generateInvoicePDF(invoiceData)
      toast({
        description: "Factura descargada correctamente",
        duration: 3000,
      })
      // Resetear el formulario
      resetForm()
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error al descargar la factura",
      })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="px-4">
        <h1 className="text-2xl font-bold">Facturas</h1>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 px-4 overflow-hidden">
        {/* Panel izquierdo - Productos Disponibles */}
        <Card className="flex flex-col h-full overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Productos Disponibles</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsScanModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Barcode className="mr-2 h-4 w-4" />
                Escanear
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
              <Input
                placeholder="Buscar por nombre o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  className="w-full p-3 h-auto flex items-start text-left"
                  onClick={() => handleAddProduct(product)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    {product.barcode && <div className="text-xs text-muted-foreground">Código: {product.barcode}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">${product.price?.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Stock: {product.stock}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Panel derecho - Factura */}
        <Card className="flex flex-col h-full overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Productos en la Factura
              </h2>
            </div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Seleccionar Cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-center py-2">Cantidad</th>
                  <th className="text-right py-2">Precio</th>
                  <th className="text-right py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      No hay productos en la factura
                    </td>
                  </tr>
                ) : (
                  invoiceItems.map((item) => (
                    <tr key={item.productId} className="border-b">
                      <td className="py-2">{item.productName}</td>
                      <td className="py-2">
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="text-right py-2">${item.price.toFixed(2)}</td>
                      <td className="text-right py-2">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Barra inferior fija */}
      <div className="mt-4 px-4 py-3 border-t bg-white">
        <div className="flex justify-between items-center max-w-full mx-auto">
          <div>
            <div className="text-sm text-muted-foreground">Total a Pagar</div>
            <div className="text-2xl font-bold">${calculateTotal().toFixed(2)}</div>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => handleDownloadPDF()}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
            <Button onClick={() => handleSubmit()}>Guardar Factura</Button>
          </div>
        </div>
      </div>

      <ProductScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onCodeScanned={handleScannedCode}
      />
    </div>
  )
}

