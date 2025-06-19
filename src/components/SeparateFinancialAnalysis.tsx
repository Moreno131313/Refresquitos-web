"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  DollarSign,
  Package
} from 'lucide-react'
import { SeparateFinancialAnalysis } from '@/lib/business-logic'

interface SeparateFinancialAnalysisProps {
  analysis: SeparateFinancialAnalysis
}

export default function SeparateFinancialAnalysisCard({ analysis }: SeparateFinancialAnalysisProps) {
  const { refrescos, helados, combined } = analysis

  const RefrescoCard = () => (
    <Card className="refresquitos-card border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-blue-600" />
          🥤 REFRESCOS - Análisis de Rentabilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Ingresos Totales</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(refrescos.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500">
              {refrescos.unitsSold} unidades vendidas
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">COGS Total</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(refrescos.totalCOGS)}
            </p>
            <p className="text-xs text-gray-500">
              Promedio: {formatCurrency(refrescos.averageCostPerUnit)} c/u
            </p>
          </div>
        </div>

        {/* Ganancia bruta */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Ganancia Bruta</p>
            {refrescos.grossProfit > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <p className={`text-2xl font-bold ${refrescos.grossProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(refrescos.grossProfit)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={refrescos.grossProfit > 0 ? "default" : "destructive"}>
              Margen: {refrescos.grossProfitMargin.toFixed(1)}%
            </Badge>
            <Badge variant="outline">
              Por unidad: {formatCurrency(refrescos.averageProfitPerUnit)}
            </Badge>
          </div>
        </div>

        {/* Precio promedio */}
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <p className="text-sm font-medium text-blue-700">💰 Precio Promedio de Venta</p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(refrescos.averageRevenuePerUnit)} por unidad
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const HeladoCard = () => (
    <Card className="refresquitos-card border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-purple-600" />
          🍦 HELADOS - Análisis de Rentabilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Ingresos Totales</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(helados.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500">
              {helados.unitsSold} unidades vendidas
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">COGS Total</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(helados.totalCOGS)}
            </p>
            <p className="text-xs text-gray-500">
              Promedio: {formatCurrency(helados.averageCostPerUnit)} c/u
            </p>
          </div>
        </div>

        {/* Ganancia bruta */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Ganancia Bruta</p>
            {helados.grossProfit > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <p className={`text-2xl font-bold ${helados.grossProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(helados.grossProfit)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={helados.grossProfit > 0 ? "default" : "destructive"}>
              Margen: {helados.grossProfitMargin.toFixed(1)}%
            </Badge>
            <Badge variant="outline">
              Por unidad: {formatCurrency(helados.averageProfitPerUnit)}
            </Badge>
          </div>
        </div>

        {/* Precio promedio */}
        <div className="bg-purple-50 p-3 rounded border border-purple-200">
          <p className="text-sm font-medium text-purple-700">💰 Precio Promedio de Venta</p>
          <p className="text-lg font-bold text-purple-600">
            {formatCurrency(helados.averageRevenuePerUnit)} por unidad
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const CombinedSummaryCard = () => (
    <Card className="refresquitos-card border-2 border-gray-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-gray-600" />
          📊 RESUMEN TOTAL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-gray-600">Ingresos Totales</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(combined.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500">
              {combined.totalUnitsSold} unidades
            </p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-gray-600">COGS Total</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(combined.totalCOGS)}
            </p>
            <p className="text-xs text-gray-500">
              Costo real FIFO
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-gray-600">Ganancia Bruta</p>
            <p className={`text-2xl font-bold ${combined.grossProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(combined.grossProfit)}
            </p>
            <Badge variant={combined.grossProfit > 0 ? "default" : "destructive"} className="mt-1">
              {combined.grossProfitMargin.toFixed(1)}%
            </Badge>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded border border-orange-200">
            <p className="text-sm text-gray-600">Gastos Operativos</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(combined.operatingExpenses)}
            </p>
            <p className="text-xs text-gray-500">
              Gastos no productivos
            </p>
          </div>
        </div>

        {/* Comparación por producto */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-semibold text-gray-700 mb-3">Comparación por Producto</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-700">🥤 Refrescos</p>
              <p className="font-bold text-blue-600">
                {refrescos.unitsSold} vendidos
              </p>
              <p className="text-xs text-blue-600">
                {((refrescos.unitsSold / combined.totalUnitsSold) * 100).toFixed(1)}% del total
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <p className="text-sm text-purple-700">🍦 Helados</p>
              <p className="font-bold text-purple-600">
                {helados.unitsSold} vendidos
              </p>
              <p className="text-xs text-purple-600">
                {((helados.unitsSold / combined.totalUnitsSold) * 100).toFixed(1)}% del total
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const NetResultCard = () => (
    <Card className="refresquitos-card border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-6 w-6 text-green-600" />
          💰 RESULTADO NETO FINAL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resultado Neto */}
          <div className="text-center p-6 bg-white rounded-lg border-2 border-green-200">
            <p className="text-lg font-semibold text-gray-700 mb-2">Ganancia Neta</p>
            <p className={`text-4xl font-bold mb-3 ${combined.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(combined.netProfit)}
            </p>
            <Badge variant={combined.netProfit > 0 ? "default" : "destructive"} className="text-lg px-4 py-2">
              Margen: {combined.netProfitMargin.toFixed(1)}%
            </Badge>
            <p className="text-sm text-gray-500 mt-2">
              Después de todos los gastos
            </p>
          </div>

          {/* Distribución de Utilidad */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-center">Distribución de Utilidad</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                <div className="flex items-center gap-2">
                  <span>❤️</span>
                  <span className="font-medium text-red-700">Diezmo (10%)</span>
                </div>
                <span className="font-bold text-red-600">{formatCurrency(combined.tithe)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2">
                  <span>🏦</span>
                  <span className="font-medium text-blue-700">Ahorro (20%)</span>
                </div>
                <span className="font-bold text-blue-600">{formatCurrency(combined.savings)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded border-2 border-green-300">
                <div className="flex items-center gap-2">
                  <span>💵</span>
                  <span className="font-medium text-green-700">Disponible</span>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(combined.available)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Análisis individual por producto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RefrescoCard />
        <HeladoCard />
      </div>
      
      {/* Resumen total */}
      <CombinedSummaryCard />
      
      {/* Resultado neto final */}
      <NetResultCard />
    </div>
  )
} 