"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface InventoryData {
  name: string
  stock: number
  reorderPoint: number
}

interface InventoryStatusChartProps {
  data: InventoryData[]
}

export function InventoryStatusChart({ data }: InventoryStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado del Inventario</CardTitle>
        <CardDescription>Niveles de stock actuales vs puntos de reorden</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="stock" fill="#8884d8" name="Stock Actual" />
            <Bar dataKey="reorderPoint" fill="#82ca9d" name="Punto de Reorden" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

