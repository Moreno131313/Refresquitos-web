'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar, TrendingUp, TrendingDown, Minus, BarChart3, PieChart, Target, DollarSign, Package, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  PeriodAnalysis, 
  AnnualAnalysis,
  SalesTypeBreakdown,
  EmployeeSalesAnalysis,
  generateMonthlyAnalysis,
  generateAnnualAnalysis,
  generatePeriodAnalysis,
  getAvailableYears,
  getAvailableMonths,
  getSalesTypeBreakdown,
  getEmployeeSalesAnalysis
} from '@/lib/business-logic'
import type { Production, Income, Expense } from '@/types/unified'

interface TemporalAnalysisDashboardProps {
  productions: Production[]
  incomes: Income[]
  expenses: Expense[]
}

type AnalysisType = 'monthly' | 'annual' | 'custom'

export default function TemporalAnalysisDashboard({ 
  productions, 
  incomes, 
  expenses 
}: TemporalAnalysisDashboardProps) {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('monthly')
  const [selectedYear, setSelectedYear] = useState<number>()
  const [selectedMonth, setSelectedMonth] = useState<number>()
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Obtener años y meses disponibles
  const availableYears = useMemo(() => getAvailableYears(incomes), [incomes])
  const availableMonths = useMemo(() => 
    selectedYear ? getAvailableMonths(selectedYear, incomes) : []
  , [selectedYear, incomes])

  // Inicializar con el año más reciente si no hay selección
  if (!selectedYear && availableYears.length > 0) {
    setSelectedYear(availableYears[0])
  }

  // Generar análisis basado en el tipo seleccionado
  const analysis = useMemo(() => {
    if (!selectedYear) return null

    switch (analysisType) {
      case 'monthly':
        if (!selectedMonth) return null
        return {
          type: 'monthly' as const,
          data: generateMonthlyAnalysis(selectedYear, selectedMonth, productions, incomes, expenses)
        }
      
      case 'annual':
        return {
          type: 'annual' as const,
          data: generateAnnualAnalysis(selectedYear, productions, incomes, expenses)
        }
      
      case 'custom':
        if (!customStartDate || !customEndDate) return null
        return {
          type: 'custom' as const,
          data: generatePeriodAnalysis(customStartDate, customEndDate, productions, incomes, expenses)
        }
      
      default:
        return null
    }
  }, [analysisType, selectedYear, selectedMonth, customStartDate, customEndDate, productions, incomes, expenses])

  const renderTrendIcon = (trend: 'CRECIENTE' | 'ESTABLE' | 'DECRECIENTE') => {
    switch (trend) {
      case 'CRECIENTE':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'DECRECIENTE':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />
    }
  }

  const getTrendColor = (trend: 'CRECIENTE' | 'ESTABLE' | 'DECRECIENTE') => {
    switch (trend) {
      case 'CRECIENTE':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'DECRECIENTE':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const renderSalesTypeBreakdown = (startDate: string, endDate: string) => {
    const salesTypes = getSalesTypeBreakdown(startDate, endDate, incomes)
    
    if (salesTypes.length === 0) {
      return null
    }

    const getProductIcon = (product: 'Refresco' | 'Helado') => {
      return product === 'Refresco' ? '🥤' : '🍦'
    }

    const getProductColor = (product: 'Refresco' | 'Helado') => {
      return product === 'Refresco' ? 'blue' : 'purple'
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            Resumen de Tipos de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesTypes.map((salesType, index) => {
              const productColor = getProductColor(salesType.product)
              const productIcon = getProductIcon(salesType.product)
              
              return (
                <div 
                  key={index} 
                  className={salesType.product === 'Refresco' 
                    ? 'bg-blue-50 border border-blue-200 rounded-lg p-4'
                    : 'bg-purple-50 border border-purple-200 rounded-lg p-4'
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{productIcon}</span>
                      <h4 className={salesType.product === 'Refresco' 
                        ? 'font-semibold text-blue-800'
                        : 'font-semibold text-purple-800'
                      }>
                        {salesType.type}
                      </h4>
                      <Badge className={salesType.product === 'Refresco'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-purple-100 text-purple-800 border-purple-300'
                      }>
                        {salesType.product}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="font-medium">
                      {salesType.percentage.toFixed(1)}% del total
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className={salesType.product === 'Refresco'
                        ? 'text-xl font-bold text-blue-800'
                        : 'text-xl font-bold text-purple-800'
                      }>
                        {formatCurrency(salesType.totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-600">Ingresos Totales</p>
                    </div>
                    
                    <div className="text-center">
                      <p className={salesType.product === 'Refresco'
                        ? 'text-xl font-bold text-blue-700'
                        : 'text-xl font-bold text-purple-700'
                      }>
                        {salesType.totalUnits}
                      </p>
                      <p className="text-xs text-gray-600">Unidades Vendidas</p>
                    </div>
                    
                    <div className="text-center">
                      <p className={salesType.product === 'Refresco'
                        ? 'text-lg font-semibold text-blue-700'
                        : 'text-lg font-semibold text-purple-700'
                      }>
                        {formatCurrency(salesType.averagePrice)}
                      </p>
                      <p className="text-xs text-gray-600">Precio Promedio</p>
                    </div>
                    
                    <div className="text-center">
                      <p className={salesType.product === 'Refresco'
                        ? 'text-lg font-semibold text-blue-700'
                        : 'text-lg font-semibold text-purple-700'
                      }>
                        {salesType.transactions}
                      </p>
                      <p className="text-xs text-gray-600">Transacciones</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Resumen General de Tipos de Ventas */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumen de Canales de Venta
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 mb-1">Canal Principal</p>
                <p className="font-bold text-green-600">
                  {salesTypes[0]?.type || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  {salesTypes[0] ? `${salesTypes[0].percentage.toFixed(1)}% del total` : ''}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Total de Canales</p>
                <p className="font-bold text-blue-600">
                  {salesTypes.length}
                </p>
                <p className="text-xs text-gray-500">
                  Tipos de venta activos
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Diversificación</p>
                <p className="font-bold text-purple-600">
                  {salesTypes.length > 1 ? 'Diversificado' : 'Concentrado'}
                </p>
                <p className="text-xs text-gray-500">
                  {salesTypes.length > 1 ? 'Múltiples canales' : 'Canal único'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEmployeeSalesAnalysis = (startDate: string, endDate: string) => {
    const employeesData = getEmployeeSalesAnalysis(startDate, endDate, incomes)
    
    if (employeesData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👥 Rendimiento por Empleado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <p>No hay ventas de empleados en este período</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👥 Rendimiento por Empleado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employeesData.map((employee, index) => (
              <div 
                key={employee.employee} 
                className={`${index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6`}
              >
                {/* Header del Empleado */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    👤 {employee.employee}
                    {index === 0 && <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Top Vendedor</span>}
                  </h4>
                  <Badge variant="outline" className="text-sm">
                    {employee.transactions} ventas
                  </Badge>
                </div>

                {/* Resumen General */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(employee.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-600">Ingresos Totales</p>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-2xl font-bold text-blue-600">
                      {employee.totalUnits}
                    </p>
                    <p className="text-xs text-gray-600">Unidades Vendidas</p>
                  </div>
                </div>

                {/* Desglose por Producto */}
                <div className="space-y-4">
                  {/* Refrescos */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-blue-800 flex items-center gap-2">
                        🥤 Refrescos
                      </h5>
                      <Badge className="bg-blue-100 text-blue-800">
                        {employee.productMix.refrescosPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-blue-600">Ingresos:</p>
                        <p className="font-bold text-blue-800">
                          {formatCurrency(employee.refrescos.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-600">Unidades:</p>
                        <p className="font-bold text-blue-800">
                          {employee.refrescos.units}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-600">Ventas:</p>
                        <p className="font-bold text-blue-800">
                          {employee.refrescos.transactions}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-600">Precio Prom:</p>
                        <p className="font-bold text-blue-800">
                          {formatCurrency(employee.refrescos.averagePrice)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Helados */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-purple-800 flex items-center gap-2">
                        🍦 Helados
                      </h5>
                      <Badge className="bg-purple-100 text-purple-800">
                        {employee.productMix.heladosPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-purple-600">Ingresos:</p>
                        <p className="font-bold text-purple-800">
                          {formatCurrency(employee.helados.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-600">Unidades:</p>
                        <p className="font-bold text-purple-800">
                          {employee.helados.units}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-600">Ventas:</p>
                        <p className="font-bold text-purple-800">
                          {employee.helados.transactions}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-600">Precio Prom:</p>
                        <p className="font-bold text-purple-800">
                          {formatCurrency(employee.helados.averagePrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas Adicionales */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Promedio por Venta</p>
                    <p className="text-lg font-bold text-gray-800">
                      {formatCurrency(employee.averageRevenuePerTransaction)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparativa entre Empleados */}
          {employeesData.length > 1 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                📊 Comparativa de Empleados
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Mejor Vendedor</p>
                  <p className="font-bold text-green-600">
                    {employeesData[0]?.employee || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(employeesData[0]?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Más Refrescos</p>
                  <p className="font-bold text-blue-600">
                    {employeesData.reduce((best, current) => 
                      current.refrescos.units > best.refrescos.units ? current : best
                    ).employee}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.max(...employeesData.map(e => e.refrescos.units))} unidades
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Más Helados</p>
                  <p className="font-bold text-purple-600">
                    {employeesData.reduce((best, current) => 
                      current.helados.units > best.helados.units ? current : best
                    ).employee}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.max(...employeesData.map(e => e.helados.units))} unidades
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Mejor Promedio</p>
                  <p className="font-bold text-indigo-600">
                    {employeesData.reduce((best, current) => 
                      current.averageRevenuePerTransaction > best.averageRevenuePerTransaction ? current : best
                    ).employee}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(Math.max(...employeesData.map(e => e.averageRevenuePerTransaction)))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderPeriodAnalysis = (data: PeriodAnalysis) => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{data.period}</h2>
        <p className="text-sm text-gray-600">
          {formatDate(data.startDate)} - {formatDate(data.endDate)}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(data.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ganancia Neta</p>
                <p className={`text-xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.netProfit)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unidades</p>
                <p className="text-xl font-bold text-purple-600">
                  {data.unitsSold.toLocaleString()}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Días Ventas</p>
                <p className="text-xl font-bold text-orange-600">
                  {data.salesDays}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Análisis de Rentabilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Ingresos Totales:</span>
              <span className="font-semibold">{formatCurrency(data.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Costo de Ventas (COGS):</span>
              <span className="font-semibold text-red-600">{formatCurrency(data.totalCOGS)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ganancia Bruta:</span>
              <span className="font-semibold text-green-600">{formatCurrency(data.grossProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gastos Operativos:</span>
              <span className="font-semibold text-orange-600">{formatCurrency(data.operatingExpenses)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-medium">Ganancia Neta:</span>
                <span className={`font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.netProfit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Margen Neto:</span>
                <span className={`font-medium ${data.netProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.netProfitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Desglose por Productos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">🥤 Refrescos</span>
                <Badge variant="outline">{data.refrescos.units} unidades</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingresos:</span>
                  <span className="font-medium">{formatCurrency(data.refrescos.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ganancia:</span>
                  <span className="font-medium text-green-600">{formatCurrency(data.refrescos.grossProfit)}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">🍦 Helados</span>
                <Badge variant="outline">{data.helados.units} unidades</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingresos:</span>
                  <span className="font-medium">{formatCurrency(data.helados.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ganancia:</span>
                  <span className="font-medium text-green-600">{formatCurrency(data.helados.grossProfit)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose Detallado de Ventas por Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Desglose Detallado de Ventas por Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Refrescos */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  🥤 Refrescos
                </h4>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {((data.refrescos.revenue / data.totalRevenue) * 100).toFixed(1)}% del total
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">Total de Ingresos:</span>
                  <span className="text-lg font-bold text-blue-800">
                    {formatCurrency(data.refrescos.revenue)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Unidades Vendidas:</span>
                  <span className="font-semibold text-blue-700">
                    {data.refrescos.units} unidades
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Precio Promedio:</span>
                  <span className="font-semibold text-blue-700">
                    {formatCurrency(data.refrescos.units > 0 ? data.refrescos.revenue / data.refrescos.units : 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Ganancia Bruta:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(data.refrescos.grossProfit)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Margen de Ganancia:</span>
                  <span className="font-semibold text-green-600">
                    {data.refrescos.revenue > 0 ? ((data.refrescos.grossProfit / data.refrescos.revenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Helados */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                  🍦 Helados
                </h4>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {((data.helados.revenue / data.totalRevenue) * 100).toFixed(1)}% del total
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-700">Total de Ingresos:</span>
                  <span className="text-lg font-bold text-purple-800">
                    {formatCurrency(data.helados.revenue)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Unidades Vendidas:</span>
                  <span className="font-semibold text-purple-700">
                    {data.helados.units} unidades
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Precio Promedio:</span>
                  <span className="font-semibold text-purple-700">
                    {formatCurrency(data.helados.units > 0 ? data.helados.revenue / data.helados.units : 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Ganancia Bruta:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(data.helados.grossProfit)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Margen de Ganancia:</span>
                  <span className="font-semibold text-green-600">
                    {data.helados.revenue > 0 ? ((data.helados.grossProfit / data.helados.revenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Comparativo */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumen Comparativo
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 mb-1">Producto más Rentable</p>
                <p className="font-bold text-green-600">
                  {data.refrescos.grossProfit > data.helados.grossProfit ? '🥤 Refrescos' : '🍦 Helados'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(Math.max(data.refrescos.grossProfit, data.helados.grossProfit))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Mayor Volumen de Ventas</p>
                <p className="font-bold text-blue-600">
                  {data.refrescos.units > data.helados.units ? '🥤 Refrescos' : '🍦 Helados'}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.max(data.refrescos.units, data.helados.units)} unidades
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Mayor Ingresos</p>
                <p className="font-bold text-purple-600">
                  {data.refrescos.revenue > data.helados.revenue ? '🥤 Refrescos' : '🍦 Helados'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(Math.max(data.refrescos.revenue, data.helados.revenue))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Tipos de Ventas */}
      {renderSalesTypeBreakdown(data.startDate, data.endDate)}

      {/* Rendimiento por Empleado */}
      {renderEmployeeSalesAnalysis(data.startDate, data.endDate)}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Métricas de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.averageRevenuePerDay)}
              </p>
              <p className="text-sm text-gray-600">Promedio por Día</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {data.averageUnitsPerDay.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Unidades por Día</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {data.grossProfitMargin.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Margen Bruto</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {data.netProfitMargin.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Margen Neto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnnualAnalysis = (data: AnnualAnalysis) => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Análisis Anual {data.year}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          {renderTrendIcon(data.yearlyTotals.growthTrend)}
          <Badge className={getTrendColor(data.yearlyTotals.growthTrend)}>
            {data.yearlyTotals.growthTrend}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(data.yearlyTotals.totalRevenue)}
              </p>
              <p className="text-sm text-gray-600">Ingresos Anuales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-3xl font-bold ${data.yearlyTotals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.yearlyTotals.netProfit)}
              </p>
              <p className="text-sm text-gray-600">Ganancia Neta</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {data.yearlyTotals.totalUnitsSold.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Unidades Vendidas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {data.yearlyTotals.salesDays}
              </p>
              <p className="text-sm text-gray-600">Días de Ventas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.yearlyTotals.bestMonth && data.yearlyTotals.worstMonth && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Mejor Mes</span>
              </div>
              <p className="text-lg font-bold text-green-700">{data.yearlyTotals.bestMonth}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Mes de Menor Rendimiento</span>
              </div>
              <p className="text-lg font-bold text-red-700">{data.yearlyTotals.worstMonth}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Desglose Detallado Anual de Ventas por Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Desglose Anual Detallado de Ventas por Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Refrescos */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                  🥤 Refrescos
                </h4>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm">
                  {data.productBreakdown.refrescos.percentage.toFixed(1)}% del total
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">Total de Ingresos Anuales:</span>
                  <span className="text-xl font-bold text-blue-800">
                    {formatCurrency(data.productBreakdown.refrescos.totalRevenue)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Unidades Vendidas:</span>
                  <span className="font-semibold text-blue-700">
                    {data.productBreakdown.refrescos.totalUnits.toLocaleString()} unidades
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Precio Promedio:</span>
                  <span className="font-semibold text-blue-700">
                    {formatCurrency(data.productBreakdown.refrescos.totalUnits > 0 ? 
                      data.productBreakdown.refrescos.totalRevenue / data.productBreakdown.refrescos.totalUnits : 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Ganancia Bruta Anual:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(data.productBreakdown.refrescos.grossProfit)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Margen de Ganancia:</span>
                  <span className="font-semibold text-green-600">
                    {data.productBreakdown.refrescos.totalRevenue > 0 ? 
                      ((data.productBreakdown.refrescos.grossProfit / data.productBreakdown.refrescos.totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Promedio Mensual:</span>
                  <span className="font-medium text-blue-700">
                    {formatCurrency(data.productBreakdown.refrescos.totalRevenue / 12)}
                  </span>
                </div>
              </div>
            </div>

            {/* Helados */}
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                  🍦 Helados
                </h4>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-sm">
                  {data.productBreakdown.helados.percentage.toFixed(1)}% del total
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-700">Total de Ingresos Anuales:</span>
                  <span className="text-xl font-bold text-purple-800">
                    {formatCurrency(data.productBreakdown.helados.totalRevenue)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Unidades Vendidas:</span>
                  <span className="font-semibold text-purple-700">
                    {data.productBreakdown.helados.totalUnits.toLocaleString()} unidades
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Precio Promedio:</span>
                  <span className="font-semibold text-purple-700">
                    {formatCurrency(data.productBreakdown.helados.totalUnits > 0 ? 
                      data.productBreakdown.helados.totalRevenue / data.productBreakdown.helados.totalUnits : 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Ganancia Bruta Anual:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(data.productBreakdown.helados.grossProfit)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Margen de Ganancia:</span>
                  <span className="font-semibold text-green-600">
                    {data.productBreakdown.helados.totalRevenue > 0 ? 
                      ((data.productBreakdown.helados.grossProfit / data.productBreakdown.helados.totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Promedio Mensual:</span>
                  <span className="font-medium text-purple-700">
                    {formatCurrency(data.productBreakdown.helados.totalRevenue / 12)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Comparativo Anual */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análisis Comparativo Anual
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 mb-1">Producto más Rentable</p>
                <p className="font-bold text-green-600">
                  {data.productBreakdown.refrescos.grossProfit > data.productBreakdown.helados.grossProfit ? '🥤 Refrescos' : '🍦 Helados'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(Math.max(data.productBreakdown.refrescos.grossProfit, data.productBreakdown.helados.grossProfit))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Mayor Volumen Anual</p>
                <p className="font-bold text-blue-600">
                  {data.productBreakdown.refrescos.totalUnits > data.productBreakdown.helados.totalUnits ? '🥤 Refrescos' : '🍦 Helados'}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.max(data.productBreakdown.refrescos.totalUnits, data.productBreakdown.helados.totalUnits).toLocaleString()} unidades
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Mayores Ingresos</p>
                <p className="font-bold text-purple-600">
                  {data.productBreakdown.refrescos.totalRevenue > data.productBreakdown.helados.totalRevenue ? '🥤 Refrescos' : '🍦 Helados'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(Math.max(data.productBreakdown.refrescos.totalRevenue, data.productBreakdown.helados.totalRevenue))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Mejor Margen</p>
                <p className="font-bold text-indigo-600">
                  {(data.productBreakdown.refrescos.grossProfit / data.productBreakdown.refrescos.totalRevenue) > 
                   (data.productBreakdown.helados.grossProfit / data.productBreakdown.helados.totalRevenue) ? '🥤 Refrescos' : '🍦 Helados'}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.max(
                    (data.productBreakdown.refrescos.grossProfit / data.productBreakdown.refrescos.totalRevenue) * 100,
                    (data.productBreakdown.helados.grossProfit / data.productBreakdown.helados.totalRevenue) * 100
                  ).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Tipos de Ventas Anual */}
      {renderSalesTypeBreakdown(`${data.year}-01-01`, `${data.year}-12-31`)}

      {/* Rendimiento Anual por Empleado */}
      {renderEmployeeSalesAnalysis(`${data.year}-01-01`, `${data.year}-12-31`)}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Resumen Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.monthlyBreakdown
              .filter(month => month.totalRevenue > 0)
              .map((month, index) => (
                <Card key={index} className="border">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900 mb-2">{month.period}</h4>
                      <p className="text-lg font-bold text-green-600 mb-1">
                        {formatCurrency(month.totalRevenue)}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {month.unitsSold} unidades
                      </p>
                      <Badge 
                        variant={month.netProfit >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {month.netProfitMargin.toFixed(1)}% margen
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Análisis Temporal de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={analysisType === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisType('monthly')}
            >
              Mensual
            </Button>
            <Button
              variant={analysisType === 'annual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisType('annual')}
            >
              Anual
            </Button>
            <Button
              variant={analysisType === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisType('custom')}
            >
              Período Personalizado
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Año
              </label>
              <Select
                value={selectedYear?.toString()}
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {analysisType === 'monthly' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Mes
                </label>
                <Select
                  value={selectedMonth?.toString()}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(month => (
                      <SelectItem 
                        key={month.month} 
                        value={month.month.toString()}
                        disabled={!month.hasSales}
                      >
                        {month.name} {!month.hasSales && '(Sin ventas)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {analysisType === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          {analysis.type === 'annual' 
            ? renderAnnualAnalysis(analysis.data as AnnualAnalysis)
            : renderPeriodAnalysis(analysis.data as PeriodAnalysis)
          }
        </>
      )}

      {!analysis && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Selecciona un período para analizar</p>
              <p className="text-sm">
                Elige el tipo de análisis y las fechas para generar un reporte detallado de ventas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 