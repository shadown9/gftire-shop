"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useFirestore } from "@/hooks/useFirestore"
import { useNotifications } from "@/hooks/useNotifications"
import ProtectedLayout from "@/components/ProtectedLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  Loader2,
  Download,
  Search,
  Eye,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  User,
} from "lucide-react"
import type { Client } from "@/types/Client"
import type { Invoice } from "@/types/Invoice"
import { generateInvoicePDF } from "@/lib/pdfGenerator"
import InvoiceDetails from "@/app/facturas/InvoiceDetails"
import { DateRangePicker } from "@/components/ui/date-range-picker"

export default function ClientDetailPage() {
  console.log("Client details page rendering")
  const { id } = useParams()
  const [client, setClient] = useState<Client | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const { error: showError } = useNotifications()

  const {
    data: clientData,
    loading: loadingClient,
    error: clientError,
    fetchOne: fetchClient,
  } = useFirestore<Client>({ collectionName: "clients" })

  const {
    data: invoicesData,
    loading: loadingInvoices,
    error: invoicesError,
    fetchAll: fetchInvoices,
  } = useFirestore<Invoice>({ collectionName: "invoices" })

  // Calculate total spent by client
  const totalSpent = invoices.reduce((sum, invoice) => sum + invoice.total, 0)

  useEffect(() => {
    console.log("Fetching client data...")
    if (id) {
      fetchClient(id as string)
      fetchInvoices()
    }
  }, [id, fetchClient, fetchInvoices])

  useEffect(() => {
    console.log("Client data updated:", clientData)
    if (clientData) {
      setClient(clientData)
    }
  }, [clientData])

  useEffect(() => {
    console.log("Invoices data updated:", invoicesData)
    if (invoicesData) {
      const clientInvoices = invoicesData.filter((invoice) => invoice.clientId === id)
      setInvoices(clientInvoices)
      setFilteredInvoices(clientInvoices)
    }
  }, [invoicesData, id])

  useEffect(() => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter((invoice) => invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.date)
        return invoiceDate >= dateRange.from && invoiceDate <= dateRange.to
      })
    }

    setFilteredInvoices(filtered)
  }, [searchTerm, dateRange, invoices])

  const handleDownloadInvoice = (invoice: Invoice) => {
    try {
      generateInvoicePDF(invoice)
    } catch (error) {
      console.error("Error generating PDF:", error)
      showError("Error al generar el PDF de la factura")
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  if (loadingClient || loadingInvoices) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg text-gray-600">Cargando datos del cliente y facturas...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (clientError || invoicesError) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{clientError?.message || invoicesError?.message}</AlertDescription>
          </Alert>
        </div>
      </ProtectedLayout>
    )
  }

  if (!client) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cliente no encontrado</AlertTitle>
            <AlertDescription>No se pudo encontrar la información del cliente.</AlertDescription>
          </Alert>
        </div>
      </ProtectedLayout>
    )
  }

  try {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Client Details Card */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
                  <User className="h-8 w-8" />
                  Detalles del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {client.name ? client.name.charAt(0).toUpperCase() : "?"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-3xl font-bold text-primary">{client.name}</h2>
                          {invoices[0]?.client.name && invoices[0].client.name !== client.name && (
                            <span className="text-lg font-bold text-muted-foreground">({invoices[0].client.name})</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Cliente desde {new Date().getFullYear()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-4 rounded-lg border p-4">
                      <Mail className="h-5 w-5 text-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Email</p>
                        <p className="text-sm">{client.email || "No disponible"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 rounded-lg border p-4">
                      <Phone className="h-5 w-5 text-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Teléfono</p>
                        <p className="text-sm">{client.phone || "No disponible"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 rounded-lg border p-4 md:col-span-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Dirección</p>
                        <p className="text-sm">{client.address || "No disponible"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Estadísticas del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 rounded-lg border p-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Total Facturas</p>
                      <p className="text-2xl font-bold">{invoices.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg border p-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Promedio por Factura</p>
                      <p className="text-2xl font-bold">
                        ${invoices.length > 0 ? (totalSpent / invoices.length).toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Card */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold">Facturas del Cliente</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar facturas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DateRangePicker onChange={setDateRange} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número de Factura</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">No se encontraron facturas</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewInvoice(invoice)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedInvoice && <InvoiceDetails invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
        </div>
      </ProtectedLayout>
    )
  } catch (error) {
    console.error("Error rendering client details:", error)
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Ha ocurrido un error al cargar los detalles del cliente. Por favor, intente de nuevo.
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedLayout>
    )
  }
}

