"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductionSummary } from '@/types/financials'
import { formatCurrency } from '@/lib/utils'

interface ProductionSummaryCardProps {
  summary: ProductionSummary
}

export default function ProductionSummaryCard({ summary }: ProductionSummaryCardProps) {
  return (
    <Card className="refresquitos-card">
      <CardHeader>
        <CardTitle>Resumen de Producción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Producido</p>
            <p className="text-2xl font-bold text-blue-600">
              {summary.totalProduced} unidades
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Inventario Actual</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.currentInventory} unidades
            </p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Costo Total de Producción</p>
            <p className="text-xl font-bold text-purple-600">
              {formatCurrency(summary.totalProductionCost)}
            </p>
          </div>
          <div className="space-y-2 mt-2">
            <p className="text-sm text-gray-600">Costo Promedio por Unidad</p>
            <p className="text-lg font-semibold">
              {formatCurrency(summary.averageCostPerUnit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 