"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Package,
  Target,
  PiggyBank,
  Heart,
  Wallet
} from 'lucide-react'
import { EnhancedFinancialSummary } from '@/lib/business-logic'

interface EnhancedFinancialSummaryProps {
  summary: EnhancedFinancialSummary
}

export default function EnhancedFinancialSummaryCard({ summary }: EnhancedFinancialSummaryProps) {
  const isGrossProfit = summary.grossProfit > 0
  const isNetProfit = summary.netProfit > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Resumen de Ingresos y Costos */}
      <Card className="refresquitos-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calculator className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            Análisis de Rentabilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ingresos */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Ingresos Totales</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(summary.totalRevenue)}
            </p>
          </div>

          {/* Costo de Productos Vendidos */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Costo de Productos Vendidos (COGS)</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(summary.totalCostOfGoodsSold)}
            </p>
          </div>

          {/* Ganancia Bruta */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Ganancia Bruta</p>
              {isGrossProfit ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className={`text-2xl font-bold ${isGrossProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.grossProfit)}
            </p>
            <Badge variant={isGrossProfit ? "default" : "destructive"} className="mt-2">
              Margen: {summary.grossProfitMargin.toFixed(1)}%
            </Badge>
          </div>

          {/* Gastos Operativos */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Gastos Operativos</p>
            <p className="text-lg font-semibold text-orange-600">
              {formatCurrency(summary.operatingExpenses)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resultado Neto y Distribución */}
      <Card className="refresquitos-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Target className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            Resultado Neto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Utilidad Neta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Utilidad Neta</p>
              {isNetProfit ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className={`text-3xl font-bold ${isNetProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netProfit)}
            </p>
            <Badge variant={isNetProfit ? "default" : "destructive"}>
              Margen: {summary.netProfitMargin.toFixed(1)}%
            </Badge>
          </div>

          {/* Distribución */}
          {summary.netProfit > 0 && (
            <div className="border-t pt-3 space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Distribución de Utilidad</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Diezmo (10%)</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(summary.tithe)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Ahorro (20%)</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(summary.savings)}</span>
                </div>
                
                <div className="flex items-center justify-between border-t pt-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold">Disponible</span>
                  </div>
                  <span className="font-bold text-green-600">{formatCurrency(summary.available)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Inventario */}
      <Card className="refresquitos-card md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Package className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
            Estado del Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Valor del Inventario</p>
              <p className="text-xl font-bold text-indigo-600">
                {formatCurrency(summary.currentInventoryValue)}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Costo Promedio por Unidad</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(summary.averageCostPerUnit)}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Ganancia por Venta</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(1000 - summary.averageCostPerUnit)}
              </p>
              <p className="text-xs text-gray-500">
                Por unidad vendida a $1,000
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 