"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { 
  IncomeItem, 
  ExpenseItem, 
  ProductionItem, 
  AbsenceRecord,
  FinancialSummary,
  ProductionSummary,
  EmployeeCycleInfo
} from '@/types/financials'
import { formatCurrency, generateId, getCurrentDate } from '@/lib/utils'
import AppHeader from './AppHeader'
import LoginForm from './LoginForm'
import LoadingScreen from './LoadingScreen'
import { useAuth } from '@/hooks/useAuth'
import { useFirebaseData } from '@/hooks/useFirebaseData'
import DataMigration from './DataMigration'
import IncomeForm from './IncomeForm'
import ExpenseForm from './ExpenseForm'
import ProductionForm from './ProductionForm'
import EmployeeDashboard from './EmployeeDashboard'
import FinancialSummaryCard from './FinancialSummaryCard'
import ProductionSummaryCard from './ProductionSummaryCard'
import IncomeList from './IncomeList'
import ExpenseList from './ExpenseList'
import ProductionList from './ProductionList'
import FinancialCharts from './FinancialCharts'
import { DollarSign, Package, Users, BarChart3, Cloud, CloudOff } from 'lucide-react'
import { LoginScreen } from './LoginScreen'
import { Badge } from '@/components/ui/badge'

export default function FinancialDashboardWithFirebase() {
  const { user, loading: authLoading, logout } = useAuth()
  const {
    incomes,
    expenses,
    productions,
    absences,
    employeeCycleInfoList,
    loading: firebaseLoading,
    error: firebaseError,
    addIncome: firebaseAddIncome,
    addExpense: firebaseAddExpense,
    addProduction: firebaseAddProduction,
    addAbsence: firebaseAddAbsence,
    updateEmployeeCycleStart: firebaseUpdateEmployeeCycleStart,
    deleteIncome: firebaseDeleteIncome,
    deleteExpense: firebaseDeleteExpense,
    deleteProduction: firebaseDeleteProduction,
    deleteAbsence: firebaseDeleteAbsence
  } = useFirebaseData()

  const [activeTab, setActiveTab] = useState('resumen')
  const { toast } = useToast()

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />
  }

  // Show data migration if user has local data
  const hasLocalData = () => {
    try {
      const localIncomes = localStorage.getItem('refresquitos-incomes')
      const localExpenses = localStorage.getItem('refresquitos-expenses')
      const localProductions = localStorage.getItem('refresquitos-productions')
      const localAbsences = localStorage.getItem('refresquitos-absences')
      const localCycles = localStorage.getItem('refresquitos-employee-cycles')
      
      return !!(localIncomes || localExpenses || localProductions || localAbsences || localCycles)
    } catch {
      return false
    }
  }

  if (hasLocalData()) {
    return <DataMigration />
  }

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalIncome - totalExpenses
  const totalProduced = productions.reduce((sum, prod) => sum + prod.quantity, 0)
  const currentInventory = Math.max(0, totalProduced - incomes.length) // Assuming 1 income = 1 unit sold

  if (firebaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (firebaseError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">Error: {firebaseError}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info and logout */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🥤 Refresquitos Manager</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user.displayName || user.email}</p>
            </div>
            <Button 
              onClick={logout}
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="resumen">📊 Res</TabsTrigger>
            <TabsTrigger value="ingresos">💰 Ing</TabsTrigger>
            <TabsTrigger value="gastos">💸 Gas</TabsTrigger>
            <TabsTrigger value="produccion">🏭 Prod</TabsTrigger>
            <TabsTrigger value="empleados">👥 Emp</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💰 Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalIncome.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Gastos Totales</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Utilidad Neta</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netProfit.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Production Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏭 Resumen de Producción
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Producido</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalProduced} unidades
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Inventario Actual</p>
                  <p className="text-2xl font-bold text-green-600">
                    {currentInventory} unidades
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Costo Promedio por Unidad</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${totalProduced > 0 ? Math.round(productions.reduce((sum, prod) => sum + prod.totalCost, 0) / totalProduced) : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingresos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>💰 Gestión de Ingresos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => addIncome({ amount: 1000, date: new Date().toISOString().split('T')[0], description: 'Venta' })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    + Agregar Venta ($1000)
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {incomes.map((income) => (
                    <div key={income.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">${income.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{income.date}</p>
                        {income.description && <p className="text-sm text-gray-500">{income.description}</p>}
                      </div>
                      <Button 
                        onClick={() => firebaseDeleteIncome(income.id)}
                        variant="destructive" 
                        size="sm"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gastos" className="space-y-6">
            <ExpenseForm onAddExpense={firebaseAddExpense} />
            <ExpenseList expenses={expenses} onDeleteExpense={firebaseDeleteExpense} />
          </TabsContent>

          <TabsContent value="produccion" className="space-y-6">
            <ProductionForm onAddProduction={firebaseAddProduction} />
            <ProductionList productions={productions} onDeleteProduction={firebaseDeleteProduction} />
          </TabsContent>

          <TabsContent value="empleados" className="space-y-6">
            <EmployeeDashboard
              incomes={incomes}
              absences={absences}
              employeeCycleInfoList={employeeCycleInfoList}
              onAddAbsence={firebaseAddAbsence}
              onDeleteAbsence={firebaseDeleteAbsence}
              onUpdateEmployeeCycleStart={firebaseUpdateEmployeeCycleStart}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 