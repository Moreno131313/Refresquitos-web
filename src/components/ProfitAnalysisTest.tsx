"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { calculatePotentialSaleByProduct, getProductPrice } from '@/lib/business-logic'
import { Production, Income } from '@/types/unified'
import { TrendingUp, Calculator, Package } from 'lucide-react'

interface ProfitAnalysisTestProps {
  productions: Production[]
  incomes: Income[]
}

export default function ProfitAnalysisTest({ productions, incomes }: ProfitAnalysisTestProps) {
  // Datos de prueba
  const testProductions: Production[] = [
    {
      id: 'test-1',
      date: '2024-01-15',
      product: 'Refresco',
      quantity: 100,
      materialCosts: [
        { name: 'Leche', cost: 50000 },
        { name: 'Azúcar', cost: 30000 }
      ],
      directLaborCost: 20000,
      indirectCosts: 10000,
      totalCost: 110000,
      costPerUnit: 1100,
      createdAt: new Date().toISOString()
    }
  ]

  const testSale = calculatePotentialSaleByProduct(10, 'Refresco', testProductions, [])
  const refrescoPrice = getProductPrice('Refresco')
  const heladoPrice = getProductPrice('Helado')

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Calculator className="h-5 w-5" />
          🧪 Prueba de Cálculo de Ganancias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Precios de Productos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded border">
            <h4 className="font-semibold text-blue-800">Refresco</h4>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(refrescoPrice)}</p>
            <Badge variant="outline">Precio por unidad</Badge>
          </div>
          <div className="p-3 bg-white rounded border">
            <h4 className="font-semibold text-orange-800">Helado</h4>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(heladoPrice)}</p>
            <Badge variant="outline">Precio por unidad</Badge>
          </div>
        </div>

        {/* Prueba de Venta */}
        <div className="p-4 bg-white rounded border">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Simulación: Venta de 10 Refrescos
          </h4>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Ingresos</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(testSale.revenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Costos</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(testSale.estimatedCost)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ganancia</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(testSale.estimatedProfit)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            <Badge variant="default">
              Margen: {testSale.profitMargin.toFixed(1)}%
            </Badge>
            <Badge variant="outline">
              Por unidad: {formatCurrency(testSale.estimatedProfit / 10)}
            </Badge>
          </div>
        </div>

        {/* Fórmula Explicada */}
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">📊 Fórmula de Cálculo</h4>
          <div className="text-sm space-y-1">
            <p><strong>Ganancia por unidad = Precio de venta - Costo de producción</strong></p>
            <p>• Refresco: $1,000 - Costo promedio FIFO</p>
            <p>• Helado: $1,800 - Costo promedio FIFO</p>
            <p className="mt-2 font-semibold text-green-700">
              ✅ Sistema usando método FIFO (First In, First Out) para costos reales
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 