"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductionItem } from '@/types/financials'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProductionListProps {
  productions: ProductionItem[]
  onDelete: (id: string) => void
}

export default function ProductionList({ productions, onDelete }: ProductionListProps) {
  if (productions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No hay lotes de producción registrados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Producción</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {productions.map((production) => (
            <div key={production.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">Lote de {production.quantity} unidades</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(production.date)} • Costo por unidad: {formatCurrency(production.costPerUnit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{formatCurrency(production.totalCost)}</p>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(production.id)}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 