"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IncomeItem } from '@/types/financials'
import { formatCurrency, formatDate } from '@/lib/utils'

interface IncomeListProps {
  incomes: IncomeItem[]
  onDelete: (id: string) => void
}

export default function IncomeList({ incomes, onDelete }: IncomeListProps) {
  if (incomes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No hay ingresos registrados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Ingresos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incomes.map((income) => (
            <div key={income.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{income.type}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(income.date)} • {income.quantity} unidades
                      {income.employee && ` • ${income.employee}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(income.amount)}</p>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(income.id)}
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