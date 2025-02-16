"use client"

import { useState } from "react"
import type { Client } from "@/types/Client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ClientListProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (clientId: string) => void
}

type SortField = keyof Client
type SortOrder = "asc" | "desc"

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const sortedClients = [...clients].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1
    if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClients = sortedClients.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
              Nombre <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
              Email <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead onClick={() => handleSort("phone")} className="cursor-pointer">
              Teléfono <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentClients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/clientes/${client.id}`)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Facturas
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(client)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(client.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ClientList

