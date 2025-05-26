"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FinancialSummary } from '@/types/financials'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react'

interface FinancialSummaryCardProps {
  summary: FinancialSummary
}

export default function FinancialSummaryCard({ summary }: FinancialSummaryCardProps) {
  const isProfit = summary.netProfit > 0

  return (
    <Card className="refresquitos-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
          Resumen Financiero
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm text-gray-600">Ingresos Totales</p>
            <p className="text-lg md:text-2xl font-bold text-green-600 leading-tight">
              {formatCurrency(summary.totalIncome)}
            </p>
          </div>
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm text-gray-600">Gastos Totales</p>
            <p className="text-lg md:text-2xl font-bold text-red-600 leading-tight">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </div>
        </div>

        <div className="border-t pt-3 md:pt-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <p className="text-xs md:text-sm text-gray-600">Utilidad Neta</p>
            {isProfit ? (
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
            )}
          </div>
          <p className={`text-xl md:text-3xl font-bold leading-tight ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.netProfit)}
          </p>
        </div>

        {summary.netProfit > 0 && (
          <div className="space-y-2 md:space-y-3 border-t pt-3 md:pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600">Diezmo (10%)</span>
              <span className="text-sm md:text-base font-semibold">{formatCurrency(summary.tithe)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                <PiggyBank className="h-3 w-3 md:h-4 md:w-4" />
                Ahorro (20%)
              </span>
              <span className="text-sm md:text-base font-semibold">{formatCurrency(summary.savings)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-xs md:text-sm font-medium">Disponible</span>
              <span className="text-sm md:text-base font-bold text-blue-600">{formatCurrency(summary.available)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 