"use client"

import { useState, useEffect } from "react"
import { useFirestore } from "@/hooks/useFirestore"
import { useNotifications } from "@/hooks/useNotifications"
import ProtectedLayout from "@/components/ProtectedLayout"
import ClientForm from "./ClientForm"
import ClientList from "./ClientList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Plus, Search } from "lucide-react"
import type { Client } from "@/types/Client"

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { success, error: showError } = useNotifications()

  const { data, loading, error, fetchAll, add, update, remove } = useFirestore<Client>({ collectionName: "clients" })

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    if (!loading) {
      setClients(data)
      setFilteredClients(data)
      setIsLoading(false)
    }
  }, [data, loading])

  useEffect(() => {
    const lowercasedSearch = searchTerm.toLowerCase()
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowercasedSearch) ||
        client.email?.toLowerCase().includes(lowercasedSearch) ||
        client.phone?.toLowerCase().includes(lowercasedSearch),
    )
    setFilteredClients(filtered)
  }, [searchTerm, clients])

  const handleAddClient = () => {
    setEditingClient(null)
    setIsFormOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsFormOpen(true)
  }

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        await remove(clientId)
        setClients((prevClients) => prevClients.filter((client) => client.id !== clientId))
        success("Cliente eliminado correctamente")
      } catch (err: any) {
        console.error("Error deleting client:", err)
        showError(err.message || "Error al eliminar el cliente")
      }
    }
  }

  const handleFormSubmit = async (clientData: Omit<Client, "id">) => {
    try {
      if (editingClient) {
        await update(editingClient.id, clientData)
        setClients((prevClients) =>
          prevClients.map((c) => (c.id === editingClient.id ? { ...clientData, id: editingClient.id } : c)),
        )
        success("Cliente actualizado correctamente")
      } else {
        const newClient = await add(clientData)
        setClients((prevClients) => [...prevClients, newClient])
        success("Cliente añadido correctamente")
      }

      setIsFormOpen(false)
      setEditingClient(null)
    } catch (err: any) {
      console.error("Error saving client:", err)
      showError(err.message || "Error al guardar el cliente")
    }
  }

  return (
    <ProtectedLayout>
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Gestión de Clientes</CardTitle>
          <Button onClick={handleAddClient}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-5 h-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <ClientList clients={filteredClients} onEdit={handleEditClient} onDelete={handleDeleteClient} />
          )}

          {isFormOpen && (
            <ClientForm client={editingClient} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} />
          )}
        </CardContent>
      </Card>
    </ProtectedLayout>
  )
}

