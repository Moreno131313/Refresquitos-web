"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { 
  Income,
  Expense,
  Production,
  Absence,
  EmployeeCycleInfo,
  EmployeeBonus,
  IncomeFormData,
  ExpenseFormData,
  ProductionFormData,
  AbsenceFormData,
  FinancialSummary,
  ProductionSummary
} from '@/types/unified'
import { formatCurrency, generateId, getCurrentDate } from '@/lib/utils'
import AppHeader from './AppHeader'
import LoginForm from './LoginForm'
import LoadingScreen from './LoadingScreen'
import { useAuth } from './AuthProvider'
import { useFirebaseData } from '@/hooks/useFirebaseData'
import DataMigration from './DataMigration'
import IncomeForm from './IncomeForm'
import ExpenseForm from './ExpenseForm'
import ProductionForm from './ProductionForm'
import EnhancedEmployeeDashboard from './EnhancedEmployeeDashboard'
import EnhancedFinancialSummaryCard from './EnhancedFinancialSummary'
import SaleSimulator from './SaleSimulator'
import SalesAnalysis from './SalesAnalysis'
import IncomeList from './IncomeList'
import ExpenseList from './ExpenseList'
import ProductionList from './ProductionList'
import FinancialCharts from './FinancialCharts'
import { DollarSign, Package, Users, BarChart3, Cloud, CloudOff } from 'lucide-react'
import { calculateEnhancedFinancialSummary } from '@/lib/business-logic'
import { LoginScreen } from './LoginScreen'
import { Badge } from '@/components/ui/badge'

export default function FinancialDashboardWithFirebase() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const {
    incomes,
    expenses,
    productions,
    absences,
    employeeCycles,
    employeeCycleInfoList,
    bonuses,
    loading: firebaseLoading,
    error: firebaseError,
    addIncome: firebaseAddIncome,
    addExpense: firebaseAddExpense,
    addProduction: firebaseAddProduction,
    addAbsence: firebaseAddAbsence,
    addBonus: firebaseAddBonus,
    updateEmployeeCycleStart: firebaseUpdateEmployeeCycleStart,
    markBonusPaid: firebaseMarkBonusPaid,
    deleteIncome: firebaseDeleteIncome,
    deleteExpense: firebaseDeleteExpense,
    deleteProduction: firebaseDeleteProduction,
    deleteAbsence: firebaseDeleteAbsence
  } = useFirebaseData()

  const [activeTab, setActiveTab] = useState('resumen')
  const [showMigration, setShowMigration] = useState(false)
  const { toast } = useToast()

  // Debug logging
  console.log('🔍 FinancialDashboard: Estado de renderizado:', {
    user,
    authLoading,
    firebaseLoading,
    firebaseError,
    showMigration,
    userExists: !!user,
    userEmail: user?.email,
    userName: user?.name
  })

  // Check for local data on mount
  useEffect(() => {
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

    if (user && hasLocalData()) {
      console.log('📦 FinancialDashboard: Datos locales encontrados, mostrando migración')
      setShowMigration(true)
    } else {
      console.log('📦 FinancialDashboard: No hay datos locales o no hay usuario')
    }
  }, [user])

  // Show loading while checking authentication
  if (authLoading) {
    console.log('⏳ FinancialDashboard: Mostrando loading de autenticación')
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
    console.log('🔐 FinancialDashboard: Usuario no autenticado, mostrando LoginScreen')
    return <LoginScreen />
  }

  // Show data migration if user has local data
  if (showMigration) {
    console.log('📦 FinancialDashboard: Mostrando migración de datos')
    return (
      <DataMigration 
        userId={user.email || ''}
        onMigrationComplete={() => setShowMigration(false)}
      />
    )
  }

  console.log('🎉 FinancialDashboard: Renderizando dashboard principal')

  // Wrapper functions to handle form submissions
  const handleAddIncome = (incomeData: IncomeFormData) => {
    firebaseAddIncome(incomeData).catch(error => {
      toast({
        title: "Error",
        description: "No se pudo agregar el ingreso",
        variant: "destructive"
      })
    })
  }

  const handleAddExpense = (expenseData: ExpenseFormData) => {
    firebaseAddExpense(expenseData).catch(error => {
      toast({
        title: "Error",
        description: "No se pudo agregar el gasto",
        variant: "destructive"
      })
    })
  }

  const handleAddProduction = (productionData: ProductionFormData) => {
    firebaseAddProduction(productionData).catch(error => {
      toast({
        title: "Error",
        description: "No se pudo agregar la producción",
        variant: "destructive"
      })
    })
  }

  const handleAddAbsence = (absenceData: AbsenceFormData) => {
    firebaseAddAbsence(absenceData).catch(error => {
      toast({
        title: "Error",
        description: "No se pudo agregar la ausencia",
        variant: "destructive"
      })
    })
  }

  const handleUpdateEmployeeCycleStart = (employee: 'César' | 'Yesid', newStartDate: string) => {
    firebaseUpdateEmployeeCycleStart(employee, newStartDate).catch(error => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el ciclo del empleado",
        variant: "destructive"
      })
    })
  }

  const handleStartNewCycle = (employee: 'César' | 'Yesid', newStartDate: string) => {
    handleUpdateEmployeeCycleStart(employee, newStartDate)
    toast({
      title: "Nuevo ciclo iniciado",
      description: `Nuevo ciclo de evaluación iniciado para ${employee}`
    })
  }

  // Calculate financial summary
  const financialSummary: FinancialSummary = {
    totalIncome: incomes.reduce((sum, income) => sum + income.amount, 0),
    totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    netProfit: 0,
    profitMargin: 0,
    tithe: 0,
    savings: 0,
    available: 0,
  }

  financialSummary.netProfit = financialSummary.totalIncome - financialSummary.totalExpenses
  financialSummary.profitMargin = financialSummary.totalIncome > 0 
    ? (financialSummary.netProfit / financialSummary.totalIncome) * 100 
    : 0
  financialSummary.tithe = financialSummary.netProfit * 0.1
  financialSummary.savings = financialSummary.netProfit * 0.2
  financialSummary.available = financialSummary.netProfit - financialSummary.tithe - financialSummary.savings

  // Calculate production summary
  const productionSummary: ProductionSummary = {
    totalProduced: productions.reduce((sum, prod) => sum + prod.quantity, 0),
    totalProductionCost: productions.reduce((sum, prod) => sum + prod.totalCost, 0),
    averageCostPerUnit: 0,
    currentInventory: 0,
  }

  const totalSold = incomes.reduce((sum, income) => sum + income.quantity, 0)
  productionSummary.currentInventory = productionSummary.totalProduced - totalSold
  productionSummary.averageCostPerUnit = productionSummary.totalProduced > 0 
    ? productionSummary.totalProductionCost / productionSummary.totalProduced 
    : 0

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AppHeader 
        userEmail={user?.email}
        userName={user?.name || user?.email}
        onLogout={logout}
      />
      
      <div className="container mx-auto p-3 md:p-4 space-y-4 md:space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="resumen" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Resumen</span>
              <span className="sm:hidden">Res</span>
            </TabsTrigger>
            <TabsTrigger value="ingresos" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Ingresos</span>
              <span className="sm:hidden">Ing</span>
            </TabsTrigger>
            <TabsTrigger value="gastos" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Gastos</span>
              <span className="sm:hidden">Gas</span>
            </TabsTrigger>
            <TabsTrigger value="produccion" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <Package className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Producción</span>
              <span className="sm:hidden">Prod</span>
            </TabsTrigger>
            <TabsTrigger value="empleados" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Empleados</span>
              <span className="sm:hidden">Emp</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="space-y-6">
            <EnhancedFinancialSummaryCard 
              summary={calculateEnhancedFinancialSummary(productions, incomes, expenses)}
            />
            <FinancialCharts incomes={incomes} expenses={expenses} />
          </TabsContent>

          <TabsContent value="ingresos" className="space-y-6">
            <SaleSimulator 
              productions={productions}
              incomes={incomes}
            />
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nuevo Ingreso</CardTitle>
                <CardDescription>
                  Registra las ventas de refrescos. El precio por unidad es de $1,000 COP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeForm onSubmit={handleAddIncome} />
              </CardContent>
            </Card>
            <SalesAnalysis 
              incomes={incomes}
              productions={productions}
            />
            <IncomeList incomes={incomes} onDelete={firebaseDeleteIncome} />
          </TabsContent>

          <TabsContent value="gastos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nuevo Gasto</CardTitle>
                <CardDescription>
                  Registra todos los gastos del negocio organizados por categorías.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseForm onSubmit={handleAddExpense} />
              </CardContent>
            </Card>
            <ExpenseList expenses={expenses} onDelete={firebaseDeleteExpense} />
          </TabsContent>

          <TabsContent value="produccion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Lote de Producción</CardTitle>
                <CardDescription>
                  Registra cada lote de producción con todos los costos asociados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductionForm onSubmit={handleAddProduction} />
              </CardContent>
            </Card>
            <ProductionList productions={productions} onDelete={firebaseDeleteProduction} />
          </TabsContent>

          <TabsContent value="empleados" className="space-y-6">
            <EnhancedEmployeeDashboard 
              incomes={incomes}
              absences={absences}
              employeeCycleInfoList={employeeCycleInfoList}
              bonuses={bonuses}
              onAddAbsence={handleAddAbsence}
              onDeleteAbsence={firebaseDeleteAbsence}
              onUpdateEmployeeCycleStart={handleUpdateEmployeeCycleStart}
              onStartNewCycle={handleStartNewCycle}
              onAddBonus={firebaseAddBonus}
              onMarkBonusPaid={firebaseMarkBonusPaid}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 