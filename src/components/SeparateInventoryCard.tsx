"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SeparateInventoryStatus } from '@/lib/business-logic'
import { formatCurrency } from '@/lib/utils'
import { Package, Snowflake, Coffee } from 'lucide-react'

interface SeparateInventoryCardProps {
  inventoryStatus: SeparateInventoryStatus
}

export default function SeparateInventoryCard({ inventoryStatus }: SeparateInventoryCardProps) {
  return (
    <Card className="refresquitos-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Package className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
          Inventario por Producto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inventario de Refrescos */}
        <div className="border rounded-lg p-4 bg-blue-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Coffee className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Refrescos</h3>
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              $1,000 c/u
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Producido</p>
              <p className="text-lg font-bold text-blue-600">
                {inventoryStatus.refrescos.totalProduced}
              </p>
              <p className="text-xs text-gray-500">unidades</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Vendido</p>
              <p className="text-lg font-bold text-red-600">
                {inventoryStatus.refrescos.totalSold}
              </p>
              <p className="text-xs text-gray-500">unidades</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600">En Stock</p>
              <p className="text-lg font-bold text-green-600">
                {inventoryStatus.refrescos.currentInventory}
              </p>
              <p className="text-xs text-gray-500">unidades</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Valor Stock</p>
              <p className="text-sm font-semibold text-purple-600">
                {formatCurrency(inventoryStatus.refrescos.totalInventoryValue)}
              </p>
              <p className="text-xs text-gray-500">
                {formatCurrency(inventoryStatus.refrescos.averageCostInInventory)} c/u
              </p>
            </div>
          </div>
        </div>

        {/* Inventario de Helados */}
        <div className="border rounded-lg p-4 bg-orange-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Snowflake className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Helados</h3>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              $1,800 c/u
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Producido</p>
              <p className="text-lg font-bold text-blue-600">
                {inventoryStatus.helados.totalProduced}
              </p>
              <p className="text-xs text-gray-500">unidades</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Vendido</p>
              <p className="text-lg font-bold text-red-600">
                {inventoryStatus.helados.totalSold}
              </p>
              <p className="text-xs text-gray-500">unidades</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600">En Stock</p>
              <p className="text-lg font-bold text-green-600">
                {inventoryStatus.helados.currentInventory}
              </p>
              <p className="text-xs text-gray-500">unidades</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Valor Stock</p>
              <p className="text-sm font-semibold text-purple-600">
                {formatCurrency(inventoryStatus.helados.totalInventoryValue)}
              </p>
              <p className="text-xs text-gray-500">
                {formatCurrency(inventoryStatus.helados.averageCostInInventory)} c/u
              </p>
            </div>
          </div>
        </div>

        {/* Resumen Total */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-gray-600 font-medium">Total Producido</p>
              <p className="text-xl font-bold text-blue-600">
                {inventoryStatus.combined.totalProduced}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600 font-medium">Total Vendido</p>
              <p className="text-xl font-bold text-red-600">
                {inventoryStatus.combined.totalSold}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600 font-medium">Total en Stock</p>
              <p className="text-xl font-bold text-green-600">
                {inventoryStatus.combined.currentInventory}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600 font-medium">Valor Total</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(inventoryStatus.combined.totalInventoryValue)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 