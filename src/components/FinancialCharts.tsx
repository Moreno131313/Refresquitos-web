"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IncomeItem, ExpenseItem } from '@/types/financials'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'

interface FinancialChartsProps {
  incomes: IncomeItem[]
  expenses: ExpenseItem[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']

export default function FinancialCharts({ incomes, expenses }: FinancialChartsProps) {
  // Datos para gráfico de ingresos por tipo
  const incomeData = useMemo(() => {
    const incomeByType = incomes.reduce((acc, income) => {
      acc[income.type] = (acc[income.type] || 0) + income.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(incomeByType).map(([type, amount]) => ({
      name: type,
      amount,
      formattedAmount: formatCurrency(amount)
    }))
  }, [incomes])

  // Datos para gráfico de gastos por categoría
  const expenseData = useMemo(() => {
    const expenseByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(expenseByCategory).map(([category, amount]) => ({
      name: category,
      amount,
      formattedAmount: formatCurrency(amount)
    }))
  }, [expenses])

  // Datos para gráfico de ventas por empleado
  const salesByEmployee = useMemo(() => {
    const employeeSales = incomes
      .filter(income => income.employee)
      .reduce((acc, income) => {
        const employee = income.employee!
        acc[employee] = (acc[employee] || 0) + income.amount
        return acc
      }, {} as Record<string, number>)

    return Object.entries(employeeSales).map(([employee, amount]) => ({
      name: employee,
      amount,
      formattedAmount: formatCurrency(amount)
    }))
  }, [incomes])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Ingresos por Tipo */}
      <Card className="refresquitos-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Ingresos por Tipo de Venta
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No hay datos de ingresos para mostrar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Gastos por Categoría */}
      <Card className="refresquitos-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-red-600" />
            Gastos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Monto']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No hay datos de gastos para mostrar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Ventas por Empleado */}
      {salesByEmployee.length > 0 && (
        <Card className="refresquitos-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Ventas por Empleado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByEmployee}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 