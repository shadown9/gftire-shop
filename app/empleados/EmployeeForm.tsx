"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Employee } from "@/types/Employee"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface EmployeeFormProps {
  employee: Employee | null
  onClose: () => void
  onSubmit: (employeeData: Omit<Employee, "id">) => Promise<void>
}

const permissions = [
  "ver_productos",
  "editar_productos",
  "ver_clientes",
  "editar_clientes",
  "ver_facturas",
  "crear_facturas",
  "ver_reportes",
]

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSubmit }) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [position, setPosition] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  useEffect(() => {
    if (employee) {
      setName(employee.name)
      setEmail(employee.email)
      setPosition(employee.position)
      setSelectedPermissions(employee.permissions)
    }
  }, [employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const employeeData = {
      name,
      email,
      position,
      permissions: selectedPermissions,
    }
    await onSubmit(employeeData)
  }

  const handlePermissionChange = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {employee ? "Editar Empleado" : "Agregar Empleado"}
          </h3>
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
              <Label htmlFor="position">Puesto</Label>
              <Input
                type="text"
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Label>Permisos</Label>
              <div className="mt-2 space-y-2">
                {permissions.map((permission) => (
                  <div key={permission} className="flex items-center">
                    <Checkbox
                      id={permission}
                      checked={selectedPermissions.includes(permission)}
                      onCheckedChange={() => handlePermissionChange(permission)}
                    />
                    <label htmlFor={permission} className="ml-2 text-sm text-gray-700">
                      {permission.replace("_", " ")}
                    </label>
                  </div>
                ))}
              </div>
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

export default EmployeeForm

