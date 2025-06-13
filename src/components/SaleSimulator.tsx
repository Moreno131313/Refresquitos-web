"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  Package,
  DollarSign,
  Target
} from 'lucide-react'
import { calculatePotentialSaleByProduct } from '@/lib/business-logic'
import { Production, Income } from '@/types/unified'

interface SaleSimulatorProps {
  productions: Production[]
  incomes: Income[]
  onProceedWithSale?: (quantity: number) => void
}

export default function SaleSimulator({ productions, incomes, onProceedWithSale }: SaleSimulatorProps) {
  const [quantity, setQuantity] = useState<number>(1)
  const [product, setProduct] = useState<'Refresco' | 'Helado'>('Refresco')
  const [simulation, setSimulation] = useState<ReturnType<typeof calculatePotentialSaleByProduct> | null>(null)

  const handleSimulate = () => {
    if (quantity > 0) {
      const result = calculatePotentialSaleByProduct(quantity, product, productions, incomes)
      setSimulation(result)
    }
  }

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0
    setQuantity(num)
    if (num > 0) {
      const result = calculatePotentialSaleByProduct(num, product, productions, incomes)
      setSimulation(result)
    } else {
      setSimulation(null)
    }
  }

  const handleProductChange = (newProduct: 'Refresco' | 'Helado') => {
    setProduct(newProduct)
    if (quantity > 0) {
      const result = calculatePotentialSaleByProduct(quantity, newProduct, productions, incomes)
      setSimulation(result)
    }
  }

  const getProfitColor = () => {
    if (!simulation) return 'text-gray-600'
    if (simulation.estimatedProfit > 0) return 'text-green-600'
    if (simulation.estimatedProfit === 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProfitBadgeVariant = () => {
    if (!simulation) return 'secondary'
    if (simulation.estimatedProfit > 0) return 'default'
    if (simulation.estimatedProfit === 0) return 'outline'
    return 'destructive'
  }

  return (
    <Card className="refresquitos-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Calculator className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
          Simulador de Venta
        </CardTitle>
        <p className="text-sm text-gray-600">
          Calcula la ganancia antes de registrar la venta
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de Producto */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Producto</label>
          <div className="flex gap-2">
            <Button
              variant={product === 'Refresco' ? 'default' : 'outline'}
              onClick={() => handleProductChange('Refresco')}
              className="flex-1"
            >
              Refresco ($1,000)
            </Button>
            <Button
              variant={product === 'Helado' ? 'default' : 'outline'}
              onClick={() => handleProductChange('Helado')}
              className="flex-1"
            >
              Helado ($1,800)
            </Button>
          </div>
        </div>

        {/* Input de Cantidad */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cantidad a Vender</label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              placeholder="Ingresa la cantidad"
              className="flex-1"
            />
            <Button onClick={handleSimulate} variant="outline">
              Simular
            </Button>
          </div>
        </div>

        {/* Resultados de la Simulación */}
        {simulation && (
          <div className="space-y-4 border-t pt-4">
            {/* Alerta si no hay suficiente inventario */}
            {!simulation.canSell && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  ⚠️ No hay suficiente inventario. Solo quedan {simulation.inventoryAfterSale + quantity} unidades.
                </span>
              </div>
            )}

            {/* Detalles de la Venta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Ingresos</span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(simulation.revenue)}
                </p>
                <p className="text-xs text-gray-500">
                  {quantity} × ${product === 'Helado' ? '1,800' : '1,000'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Costos</span>
                </div>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(simulation.estimatedCost)}
                </p>
                <p className="text-xs text-gray-500">
                  Costo promedio FIFO
                </p>
              </div>
            </div>

            {/* Ganancia Estimada */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Ganancia Estimada</span>
                </div>
                {simulation.estimatedProfit > 0 && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
              </div>
              
              <p className={`text-2xl font-bold ${getProfitColor()}`}>
                {formatCurrency(simulation.estimatedProfit)}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getProfitBadgeVariant()}>
                  Margen: {simulation.profitMargin.toFixed(1)}%
                </Badge>
                <Badge variant="outline">
                  Por unidad: {formatCurrency(simulation.estimatedProfit / quantity)}
                </Badge>
              </div>
            </div>

            {/* Inventario Restante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Inventario Después de la Venta</span>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {simulation.inventoryAfterSale} unidades
              </p>
            </div>

            {/* Botón para Proceder */}
            {simulation.canSell && onProceedWithSale && (
              <Button 
                onClick={() => onProceedWithSale(quantity)}
                className="w-full"
                disabled={!simulation.canSell}
              >
                Proceder con la Venta
              </Button>
            )}
          </div>
        )}

        {/* Mensaje si no hay simulación */}
        {!simulation && (
          <div className="text-center py-6 text-gray-500">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ingresa una cantidad para simular la venta</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 