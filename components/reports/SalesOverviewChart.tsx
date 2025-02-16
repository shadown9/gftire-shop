"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SalesData {
  date: string
  total: number
}

interface SalesOverviewChartProps {
  data: SalesData[]
}

export function SalesOverviewChart({ data }: SalesOverviewChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Ventas</CardTitle>
        <CardDescription>Tendencia de ventas en el período seleccionado</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

