"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/types/User"

interface UserFormProps {
  user: User | null
  onClose: () => void
  onSubmit: (userData: Omit<User, "id">) => Promise<void>
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSubmit }) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "user">("user")

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userData = {
      name,
      email,
      role,
    }
    await onSubmit(userData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{user ? "Editar Usuario" : "Agregar Usuario"}</h3>
          <form onSubmit={handleSubmit} className="mt-2 text-left">
            <div className="mb-4">
              <Label htmlFor="name">Nombre</Label>
              <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="mb-4">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-4">
              <Label htmlFor="role">Rol</Label>
              <Select value={role} onValueChange={(value: "admin" | "user") => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserForm

