"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Package,
  Calculator,
  Target
} from 'lucide-react'
import { processAllSales, SaleCalculation } from '@/lib/business-logic'
import { Production, Income } from '@/types/unified'

interface SalesAnalysisProps {
  productions: Production[]
  incomes: Income[]
}

export default function SalesAnalysis({ productions, incomes }: SalesAnalysisProps) {
  const { salesCalculations, totalCOGS, totalGrossProfit } = processAllSales(productions, incomes)
  
  const averageGrossProfitMargin = salesCalculations.length > 0 
    ? salesCalculations.reduce((sum, sale) => sum + sale.grossProfitMargin, 0) / salesCalculations.length
    : 0

  const profitableSales = salesCalculations.filter(sale => sale.grossProfit > 0).length
  const breakEvenSales = salesCalculations.filter(sale => sale.grossProfit === 0).length
  const losingSales = salesCalculations.filter(sale => sale.grossProfit < 0).length

  if (salesCalculations.length === 0) {
    return (
      <Card className="refresquitos-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Análisis de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay ventas registradas para analizar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen del Análisis */}
      <Card className="refresquitos-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Análisis de Ventas - Resumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total de Ventas</p>
              <p className="text-2xl font-bold text-blue-600">{salesCalculations.length}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">COGS Total</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalCOGS)}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Ganancia Bruta Total</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalGrossProfit)}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Margen Promedio</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-purple-600">{averageGrossProfitMargin.toFixed(1)}%</p>
                {averageGrossProfitMargin > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{profitableSales}</p>
                <p className="text-sm text-gray-600">Ventas Rentables</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{breakEvenSales}</p>
                <p className="text-sm text-gray-600">Punto de Equilibrio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{losingSales}</p>
                <p className="text-sm text-gray-600">Ventas con Pérdida</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Ventas */}
      <Card className="refresquitos-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-600" />
            Detalle de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesCalculations.slice(0, 10).map((sale) => (
              <div key={sale.saleId} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{formatDate(sale.date)}</p>
                    <p className="text-sm text-gray-600">{sale.quantitySold} unidades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(sale.totalRevenue)}
                    </p>
                    <p className="text-sm text-gray-600">Ingresos</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Costo (FIFO)</p>
                    <p className="font-semibold text-red-600">{formatCurrency(sale.totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ganancia Bruta</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${
                        sale.grossProfit > 0 ? 'text-green-600' : 
                        sale.grossProfit === 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(sale.grossProfit)}
                      </p>
                      <Badge variant={
                        sale.grossProfit > 0 ? 'default' : 
                        sale.grossProfit === 0 ? 'outline' : 'destructive'
                      }>
                        {sale.grossProfitMargin.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Desglose por lotes */}
                {sale.batches.length > 1 && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Desglose por Lotes:</p>
                    <div className="space-y-1">
                      {sale.batches.map((batch, index) => (
                        <div key={index} className="flex justify-between text-xs text-gray-600">
                          <span>{batch.quantityFromBatch} unidades @ {formatCurrency(batch.costPerUnit)}</span>
                          <span>{formatCurrency(batch.subtotalCost)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {salesCalculations.length > 10 && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Mostrando las 10 ventas más recientes de {salesCalculations.length} total</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 