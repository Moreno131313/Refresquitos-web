"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Production, Income } from '@/types/unified'
import { SeparateInventoryStatus } from '@/lib/business-logic'
import { Bug, Database } from 'lucide-react'

interface InventoryDebugCardProps {
  productions: Production[]
  incomes: Income[]
  inventoryStatus: SeparateInventoryStatus
  onMigrateData?: () => void
}

export default function InventoryDebugCard({ 
  productions, 
  incomes, 
  inventoryStatus,
  onMigrateData
}: InventoryDebugCardProps) {
  // Contar productos por tipo
  const refrescoProductions = productions.filter(p => p.product === 'Refresco')
  const heladoProductions = productions.filter(p => p.product === 'Helado')
  const pacaProductions = productions.filter(p => p.product === 'Paca')
  const unknownProductions = productions.filter(p => !p.product || (p.product !== 'Refresco' && p.product !== 'Helado' && p.product !== 'Paca'))
  
  const refrescoSales = incomes.filter(i => i.product === 'Refresco')
  const heladoSales = incomes.filter(i => i.product === 'Helado')
  const pacaSales = incomes.filter(i => i.product === 'Paca')
  const unknownSales = incomes.filter(i => !i.product || (i.product !== 'Refresco' && i.product !== 'Helado' && i.product !== 'Paca'))

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          🔍 Información de Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen de Datos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-700">📦 Producciones</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Refrescos:</span>
                <Badge variant="secondary">{refrescoProductions.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Helados:</span>
                <Badge variant="secondary">{heladoProductions.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pacas:</span>
                <Badge variant="secondary">{pacaProductions.length}</Badge>
              </div>
              {unknownProductions.length > 0 && (
                <div className="flex justify-between">
                  <span>Sin clasificar:</span>
                  <Badge variant="destructive">{unknownProductions.length}</Badge>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <Badge>{productions.length}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-blue-700">💰 Ventas</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Refrescos:</span>
                <Badge variant="secondary">{refrescoSales.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Helados:</span>
                <Badge variant="secondary">{heladoSales.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pacas:</span>
                <Badge variant="secondary">{pacaSales.length}</Badge>
              </div>
              {unknownSales.length > 0 && (
                <div className="flex justify-between">
                  <span>Sin clasificar:</span>
                  <Badge variant="destructive">{unknownSales.length}</Badge>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <Badge>{incomes.length}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Ejemplos de Datos */}
        <div className="space-y-3">
          {refrescoProductions.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-700 mb-2">🥤 Última Producción de Refrescos</h5>
              <div className="text-sm space-y-1">
                <p><strong>Fecha:</strong> {refrescoProductions[0].date}</p>
                <p><strong>Cantidad:</strong> {refrescoProductions[0].quantity} unidades</p>
                <p><strong>Costo por unidad:</strong> ${refrescoProductions[0].costPerUnit?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          )}

          {heladoProductions.length > 0 && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <h5 className="font-semibold text-purple-700 mb-2">🍦 Última Producción de Helados</h5>
              <div className="text-sm space-y-1">
                <p><strong>Fecha:</strong> {heladoProductions[0].date}</p>
                <p><strong>Cantidad:</strong> {heladoProductions[0].quantity} unidades</p>
                <p><strong>Costo por unidad:</strong> ${heladoProductions[0].costPerUnit?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          )}

          {pacaProductions.length > 0 && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <h5 className="font-semibold text-orange-700 mb-2">📦 Última Producción de Pacas</h5>
              <div className="text-sm space-y-1">
                <p><strong>Fecha:</strong> {pacaProductions[0].date}</p>
                <p><strong>Cantidad:</strong> {pacaProductions[0].quantity} unidades</p>
                <p><strong>Costo por unidad:</strong> ${pacaProductions[0].costPerUnit?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status del Inventario */}
        <div className="bg-green-50 p-3 rounded-lg">
          <h5 className="font-semibold text-green-700 mb-2">📊 Estado del Inventario Separado</h5>
          <div className="text-sm">
            <p><strong>Inventario funcionando:</strong> {inventoryStatus.refrescos.totalProduced > 0 || inventoryStatus.helados.totalProduced > 0 || inventoryStatus.pacas.totalProduced > 0 ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Datos migrados:</strong> {unknownProductions.length === 0 && unknownSales.length === 0 ? '✅ Sí' : '⚠️ Parcialmente'}</p>
          </div>
        </div>

        {/* Advertencias */}
        {(unknownProductions.length > 0 || unknownSales.length > 0) && (
          <div className="bg-yellow-50 p-3 rounded-lg border-yellow-200">
            <h5 className="font-semibold text-yellow-700 mb-2">⚠️ Datos por Migrar</h5>
            <div className="text-sm">
              <p>Algunos registros no tienen el campo 'product' definido y aparecerán como 'Refresco' por defecto.</p>
              {unknownProductions.length > 0 && <p>• {unknownProductions.length} producciones sin clasificar</p>}
              {unknownSales.length > 0 && <p>• {unknownSales.length} ventas sin clasificar</p>}
            </div>
            {onMigrateData && (
              <Button onClick={onMigrateData} className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs">
                🔄 Migrar Datos
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 