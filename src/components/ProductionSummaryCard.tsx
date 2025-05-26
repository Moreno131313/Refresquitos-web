"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductionSummary } from '@/types/financials'
import { formatCurrency } from '@/lib/utils'
import { Package } from 'lucide-react'

interface ProductionSummaryCardProps {
  summary: ProductionSummary
}

export default function ProductionSummaryCard({ summary }: ProductionSummaryCardProps) {
  return (
    <Card className="refresquitos-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Package className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
          Resumen de Producción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm text-gray-600">Total Producido</p>
            <p className="text-lg md:text-2xl font-bold text-blue-600 leading-tight">
              {summary.totalProduced}
            </p>
            <p className="text-xs md:text-sm text-gray-500">unidades</p>
          </div>
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm text-gray-600">Inventario Actual</p>
            <p className="text-lg md:text-2xl font-bold text-green-600 leading-tight">
              {summary.currentInventory}
            </p>
            <p className="text-xs md:text-sm text-gray-500">unidades</p>
          </div>
        </div>
        
        <div className="border-t pt-3 md:pt-4">
          <div className="space-y-2 md:space-y-3">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Costo Total de Producción</p>
              <p className="text-lg md:text-xl font-bold text-purple-600 leading-tight">
                {formatCurrency(summary.totalProductionCost)}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Costo Promedio por Unidad</p>
              <p className="text-base md:text-lg font-semibold leading-tight">
                {formatCurrency(summary.averageCostPerUnit)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 