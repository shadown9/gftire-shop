"use client"

import { useState, useEffect } from "react"
import { useFirestore } from "@/hooks/useFirestore"
import { useNotifications } from "@/hooks/useNotifications"
import ProtectedLayout from "@/components/ProtectedLayout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Plus } from "lucide-react"
import UserForm from "./UserForm"
import type { User } from "@/types/User"

export default function UsuariosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { success, error: showError } = useNotifications()

  const { data: users, loading, error, fetchAll, add, update, remove } = useFirestore<User>({ collectionName: "users" })

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleAddUser = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await remove(userId)
        success("Usuario eliminado correctamente")
      } catch (err: any) {
        console.error("Error deleting user:", err)
        showError(err.message || "Error al eliminar el usuario")
      }
    }
  }

  const handleFormSubmit = async (userData: Omit<User, "id">) => {
    try {
      if (editingUser) {
        await update(editingUser.id, userData)
        success("Usuario actualizado correctamente")
      } else {
        await add(userData)
        success("Usuario añadido correctamente")
      }
      setIsFormOpen(false)
      setEditingUser(null)
    } catch (err: any) {
      console.error("Error saving user:", err)
      showError(err.message || "Error al guardar el usuario")
    }
  }

  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <Button onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Usuario
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleEditUser(user)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {isFormOpen && <UserForm user={editingUser} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} />}
      </div>
    </ProtectedLayout>
  )
}

