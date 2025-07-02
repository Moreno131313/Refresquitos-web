"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SeparateInventoryStatus } from '@/lib/business-logic'
import { formatCurrency } from '@/lib/utils'
import { Package, Snowflake, Coffee, AlertCircle, Box } from 'lucide-react'

interface SeparateInventoryCardProps {
  inventoryStatus: SeparateInventoryStatus
  onForceRefresh?: () => void
}

export default function SeparateInventoryCard({ inventoryStatus, onForceRefresh }: SeparateInventoryCardProps) {
  // DEBUG: Mostrar siempre el inventario separado
  console.log('🔍 Inventario Separado:', inventoryStatus)

  // Verificación de datos de forma segura
  const refrescosData = inventoryStatus?.refrescos || {
    totalProduced: 0,
    totalSold: 0,
    currentInventory: 0,
    totalInventoryValue: 0,
    averageCostInInventory: 0
  }

  const heladosData = inventoryStatus?.helados || {
    totalProduced: 0,
    totalSold: 0,
    currentInventory: 0,
    totalInventoryValue: 0,
    averageCostInInventory: 0
  }

  const pacasData = inventoryStatus?.pacas || {
    totalProduced: 0,
    totalSold: 0,
    currentInventory: 0,
    totalInventoryValue: 0,
    averageCostInInventory: 0
  }

  const combinedData = inventoryStatus?.combined || {
    totalProduced: 0,
    totalSold: 0,
    currentInventory: 0,
    totalInventoryValue: 0,
    averageCostInInventory: 0
  }

  // Si hay datos combinados pero no separados, mostrar error de migración
  if (combinedData.totalProduced > 0 && refrescosData.totalProduced === 0 && heladosData.totalProduced === 0 && pacasData.totalProduced === 0) {
    return (
      <Card className="border-2 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            ⚠️ Datos Necesitan Migración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-700">
            Tienes {combinedData.totalProduced} unidades producidas pero no están separadas por producto.
          </p>
          {onForceRefresh && (
            <Button onClick={onForceRefresh} className="bg-red-600 hover:bg-red-700 text-white">
              🔄 Migrar Datos Ahora
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Package className="h-6 w-6 text-blue-600" />
          📦 Inventario por Producto
        </CardTitle>
        <p className="text-gray-600">
          Refrescos vs Helados vs Pacas - Inventario separado con costos individuales
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* SECCIÓN REFRESCOS */}
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Coffee className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-800">🥤 REFRESCOS</h3>
            </div>
            <Badge className="bg-blue-600 text-white">$1,000 c/u</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">PRODUCIDO</p>
              <p className="text-3xl font-bold text-blue-600">{refrescosData.totalProduced}</p>
            </div>
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">VENDIDO</p>
              <p className="text-3xl font-bold text-red-600">{refrescosData.totalSold}</p>
            </div>
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">STOCK</p>
              <p className="text-3xl font-bold text-green-600">{refrescosData.currentInventory}</p>
            </div>
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">VALOR</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(refrescosData.totalInventoryValue)}</p>
            </div>
          </div>

          {refrescosData.currentInventory > 0 && (
            <div className="bg-green-100 p-3 rounded border border-green-300">
              <p className="text-green-800 font-semibold">
                💰 Costo promedio: {formatCurrency(refrescosData.averageCostInInventory)} c/u
              </p>
              <p className="text-green-700">
                Ganancia por refresco: {formatCurrency(1000 - refrescosData.averageCostInInventory)}
              </p>
            </div>
          )}
        </div>

        {/* SECCIÓN HELADOS */}
        <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Snowflake className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-purple-800">🍦 HELADOS</h3>
            </div>
            <Badge className="bg-purple-600 text-white">$1,800 c/u</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">PRODUCIDO</p>
              <p className="text-3xl font-bold text-blue-600">{heladosData.totalProduced}</p>
            </div>
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">VENDIDO</p>
              <p className="text-3xl font-bold text-red-600">{heladosData.totalSold}</p>
            </div>
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">STOCK</p>
              <p className="text-3xl font-bold text-green-600">{heladosData.currentInventory}</p>
            </div>
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">VALOR</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(heladosData.totalInventoryValue)}</p>
            </div>
          </div>

          {heladosData.currentInventory > 0 && (
            <div className="bg-green-100 p-3 rounded border border-green-300">
              <p className="text-green-800 font-semibold">
                💰 Costo promedio: {formatCurrency(heladosData.averageCostInInventory)} c/u
              </p>
              <p className="text-green-700">
                Ganancia por helado: {formatCurrency(1800 - heladosData.averageCostInInventory)}
              </p>
            </div>
          )}
        </div>

        {/* SECCIÓN PACAS */}
        <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Box className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-bold text-orange-800">📦 PACAS</h3>
            </div>
            <Badge className="bg-orange-600 text-white">$9,000 c/u</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">PRODUCIDO</p>
              <p className="text-3xl font-bold text-blue-600">{pacasData.totalProduced}</p>
            </div>
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">VENDIDO</p>
              <p className="text-3xl font-bold text-red-600">{pacasData.totalSold}</p>
            </div>
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">STOCK</p>
              <p className="text-3xl font-bold text-green-600">{pacasData.currentInventory}</p>
            </div>
            <div className="text-center p-3 bg-white rounded border-2">
              <p className="text-sm font-semibold text-gray-700">VALOR</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(pacasData.totalInventoryValue)}</p>
            </div>
          </div>

          {pacasData.currentInventory > 0 && (
            <div className="bg-green-100 p-3 rounded border border-green-300">
              <p className="text-green-800 font-semibold">
                💰 Costo promedio: {formatCurrency(pacasData.averageCostInInventory)} c/u
              </p>
              <p className="text-green-700">
                Ganancia por paca: {formatCurrency(9000 - pacasData.averageCostInInventory)}
              </p>
            </div>
          )}
        </div>

        {/* RESUMEN TOTAL */}
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
          <h4 className="text-lg font-bold text-gray-800 mb-3">📊 Resumen Total</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded">
              <p className="text-sm text-gray-600">TOTAL PRODUCIDO</p>
              <p className="text-2xl font-bold text-blue-600">{combinedData.totalProduced}</p>
              <p className="text-xs text-gray-500">{refrescosData.totalProduced} + {heladosData.totalProduced} + {pacasData.totalProduced}</p>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <p className="text-sm text-gray-600">TOTAL VENDIDO</p>
              <p className="text-2xl font-bold text-red-600">{combinedData.totalSold}</p>
              <p className="text-xs text-gray-500">{refrescosData.totalSold} + {heladosData.totalSold} + {pacasData.totalSold}</p>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <p className="text-sm text-gray-600">TOTAL STOCK</p>
              <p className="text-2xl font-bold text-green-600">{combinedData.currentInventory}</p>
              <p className="text-xs text-gray-500">{refrescosData.currentInventory} + {heladosData.currentInventory} + {pacasData.currentInventory}</p>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <p className="text-sm text-gray-600">VALOR TOTAL</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(combinedData.totalInventoryValue)}</p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
} 