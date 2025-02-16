import type React from "react"
import type { Employee } from "@/types/Employee"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface EmployeeListProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (employeeId: string) => void
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Puesto</TableHead>
          <TableHead>Permisos</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>{employee.name}</TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell>{employee.position}</TableCell>
            <TableCell>{employee.permissions.join(", ")}</TableCell>
            <TableCell>
              <Button variant="outline" className="mr-2" onClick={() => onEdit(employee)}>
                Editar
              </Button>
              <Button variant="destructive" onClick={() => onDelete(employee.id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default EmployeeList

