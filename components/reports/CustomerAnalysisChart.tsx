"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CustomerData {
  name: string
  value: number
}

interface CustomerAnalysisChartProps {
  data: CustomerData[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function CustomerAnalysisChart({ data }: CustomerAnalysisChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Clientes</CardTitle>
        <CardDescription>Distribución de ventas por tipo de cliente</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={150} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

