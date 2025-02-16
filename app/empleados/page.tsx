"use client"

import { useState, useEffect } from "react"
import { useFirestore } from "@/hooks/useFirestore"
import { useNotifications } from "@/hooks/useNotifications"
import ProtectedLayout from "@/components/ProtectedLayout"
import EmployeeForm from "./EmployeeForm"
import EmployeeList from "./EmployeeList"
import type { Employee } from "@/types/Employee"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Plus } from "lucide-react"

export default function EmpleadosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const { userData } = useAuth()
  const router = useRouter()
  const { success, error: showError } = useNotifications()

  const {
    data: employees,
    loading,
    error,
    fetchAll,
    add,
    update,
    remove,
  } = useFirestore<Employee>({ collectionName: "employees" })

  useEffect(() => {
    if (userData?.role !== "admin") {
      router.push("/unauthorized")
    } else {
      fetchAll()
    }
  }, [userData, router, fetchAll])

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setIsFormOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsFormOpen(true)
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este empleado?")) {
      try {
        await remove(employeeId)
        success("Empleado eliminado correctamente")
      } catch (err: any) {
        console.error("Error deleting employee:", err)
        showError(err.message || "Error al eliminar el empleado")
      }
    }
  }

  const handleFormSubmit = async (employeeData: Omit<Employee, "id">) => {
    try {
      if (editingEmployee) {
        await update(editingEmployee.id, employeeData)
        success("Empleado actualizado correctamente")
      } else {
        await add(employeeData)
        success("Empleado añadido correctamente")
      }
      setIsFormOpen(false)
      setEditingEmployee(null)
    } catch (err: any) {
      console.error("Error saving employee:", err)
      showError(err.message || "Error al guardar el empleado")
    }
  }

  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
          <Button onClick={handleAddEmployee}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Empleado
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
            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Cargando empleados...</p>
          </div>
        ) : (
          <EmployeeList employees={employees} onEdit={handleEditEmployee} onDelete={handleDeleteEmployee} />
        )}
        {isFormOpen && (
          <EmployeeForm employee={editingEmployee} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} />
        )}
      </div>
    </ProtectedLayout>
  )
}

