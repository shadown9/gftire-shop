"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Edit2, Check, X } from "lucide-react"
import type { Product } from "@/types/Product"
import type { ProductFilter } from "./types"

interface ProductFilterCardsProps {
  products: Product[]
  onFilterSelect: (filter: string | null) => void
  selectedFilter: string | null
  filters: ProductFilter[]
  onUpdateFilters: (filters: ProductFilter[]) => void
}

export function ProductFilterCards({
  products,
  onFilterSelect,
  selectedFilter,
  filters,
  onUpdateFilters,
}: ProductFilterCardsProps) {
  const [editingFilter, setEditingFilter] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  // Count products in each filter
  const filterCounts = filters.reduce(
    (acc, filter) => {
      acc[filter.id] = products.filter((product) =>
        product.name.toLowerCase().includes(filter.query.toLowerCase()),
      ).length
      return acc
    },
    {} as Record<string, number>,
  )

  const handleEditStart = (filter: ProductFilter) => {
    setEditingFilter(filter.id)
    setEditValue(filter.name)
  }

  const handleEditSave = (filterId: string) => {
    const updatedFilters = filters.map((filter) => {
      if (filter.id === filterId) {
        return {
          ...filter,
          name: editValue,
          query: editValue.toLowerCase(),
        }
      }
      return filter
    })
    onUpdateFilters(updatedFilters)
    setEditingFilter(null)
  }

  const handleEditCancel = () => {
    setEditingFilter(null)
    setEditValue("")
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
      {/* Filtros existentes */}
      {filters.map((filter) => (
        <Card key={filter.id} className="relative group">
          <div
            className={`w-full h-auto p-4 flex flex-col items-center gap-2 rounded-md border ${
              selectedFilter === filter.query
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => {
              // Solo activar el filtrado si no estamos en modo edición
              if (editingFilter !== filter.id) {
                onFilterSelect(selectedFilter === filter.query ? null : filter.query)
              }
            }}
          >
            <Package className="h-5 w-5" />
            <div className="text-center">
              {editingFilter === filter.id ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full text-center bg-background text-foreground"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    // Si presiona Enter, guardar cambios
                    if (e.key === "Enter") {
                      handleEditSave(filter.id)
                    }
                    // Si presiona Escape, cancelar edición
                    if (e.key === "Escape") {
                      handleEditCancel()
                    }
                  }}
                />
              ) : (
                <>
                  <div className="font-medium capitalize">{filter.name}</div>
                  <div className="text-sm text-muted-foreground">{filterCounts[filter.id]} productos</div>
                </>
              )}
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {editingFilter === filter.id ? (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditSave(filter.id)
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditCancel()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditStart(filter)
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

