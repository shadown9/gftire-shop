"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ProductData {
  name: string
  quantity: number
  revenue: number
}

interface TopProductsChartProps {
  data: ProductData[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>Top 10 productos por cantidad y ingresos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="quantity" fill="#8884d8" name="Cantidad" />
            <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Ingresos" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

