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

export default function FinancialDashboardWithFirebase() {
  // Hook de autenticación
  const { isAuthenticated, isLoading, user, login, logout } = useAuth()
  
  // Estados para migración
  const [showMigration, setShowMigration] = useState(false)
  const [migrationChecked, setMigrationChecked] = useState(false)
  
  // Hook de Firebase (solo si está autenticado)
  const userId = user?.email || 'default-user'
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
  } = useFirebaseData(isAuthenticated ? userId : '')
  
  const [activeTab, setActiveTab] = useState('resumen')
  const { toast } = useToast()

  // Verificar si hay datos locales para migrar
  useEffect(() => {
    if (isAuthenticated && !migrationChecked) {
      const hasLocalData = 
        localStorage.getItem('refresquitos-incomes') ||
        localStorage.getItem('refresquitos-expenses') ||
        localStorage.getItem('refresquitos-productions') ||
        localStorage.getItem('refresquitos-absences') ||
        localStorage.getItem('refresquitos-employee-cycles')
      
      if (hasLocalData) {
        setShowMigration(true)
      }
      setMigrationChecked(true)
    }
  }, [isAuthenticated, migrationChecked])

  // Funciones para manejar ingresos
  const addIncome = async (incomeData: Omit<IncomeItem, 'id' | 'createdAt' | 'amount'>) => {
    try {
      const amount = incomeData.quantity * 1000 // $1000 COP por unidad
      const newIncome = {
        ...incomeData,
        amount,
        date: incomeData.date,
        employee: incomeData.employee,
        quantity: incomeData.quantity,
        description: incomeData.description || ''
      }
      
      await firebaseAddIncome(newIncome)
      toast({
        title: "Ingreso registrado",
        description: `Se registró una venta de ${incomeData.quantity} unidades por ${formatCurrency(amount)}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el ingreso. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const deleteIncome = async (id: string) => {
    try {
      await firebaseDeleteIncome(id)
      toast({
        title: "Ingreso eliminado",
        description: "El registro de ingreso ha sido eliminado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el ingreso. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Funciones para manejar gastos
  const addExpense = async (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    try {
      await firebaseAddExpense(expenseData)
      toast({
        title: "Gasto registrado",
        description: `Se registró un gasto de ${formatCurrency(expenseData.amount)}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el gasto. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      await firebaseDeleteExpense(id)
      toast({
        title: "Gasto eliminado",
        description: "El registro de gasto ha sido eliminado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Funciones para manejar producción
  const addProduction = async (productionData: Omit<ProductionItem, 'id' | 'createdAt' | 'totalCost' | 'costPerUnit'>) => {
    try {
      const materialCostTotal = productionData.materialCosts.reduce((sum, material) => sum + material.cost, 0)
      const totalCost = materialCostTotal + productionData.directLaborCost + productionData.indirectCosts
      const costPerUnit = totalCost / productionData.quantity

      const newProduction = {
        ...productionData,
        totalCost,
        costPerUnit
      }
      
      await firebaseAddProduction(newProduction)
      toast({
        title: "Lote de producción registrado",
        description: `Se registró un lote de ${productionData.quantity} unidades con costo total de ${formatCurrency(totalCost)}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar la producción. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const deleteProduction = async (id: string) => {
    try {
      await firebaseDeleteProduction(id)
      toast({
        title: "Lote eliminado",
        description: "El lote de producción ha sido eliminado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la producción. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Funciones para manejar ausencias
  const addAbsence = async (absenceData: Omit<AbsenceRecord, 'id' | 'createdAt'>) => {
    try {
      await firebaseAddAbsence(absenceData)
      toast({
        title: "Ausencia registrada",
        description: `Se registró una ausencia de ${absenceData.employee}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar la ausencia. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const deleteAbsence = async (id: string) => {
    try {
      await firebaseDeleteAbsence(id)
      toast({
        title: "Ausencia eliminada",
        description: "El registro de ausencia ha sido eliminado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la ausencia. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Funciones para manejar ciclos de empleados
  const handleUpdateEmployeeCycleStart = async (employee: 'César' | 'Yesid', newStartDate: string) => {
    try {
      await firebaseUpdateEmployeeCycleStart(employee, newStartDate)
      toast({
        title: "Fecha de inicio actualizada",
        description: `Nueva fecha de inicio de ciclo para ${employee}: ${newStartDate}`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la fecha del ciclo. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handleStartNewCycle = async (employee: 'César' | 'Yesid', newStartDate: string) => {
    try {
      await firebaseUpdateEmployeeCycleStart(employee, newStartDate)
      toast({
        title: "Nuevo ciclo iniciado",
        description: `Se inició un nuevo ciclo para ${employee} desde ${newStartDate}`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el nuevo ciclo. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Cálculos de resumen financiero
  const calculateFinancialSummary = () => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const netProfit = totalIncome - totalExpenses
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin
    }
  }

  // Cálculos de resumen de producción
  const calculateProductionSummary = () => {
    const totalProduced = productions.reduce((sum, production) => sum + production.quantity, 0)
    const totalProductionCost = productions.reduce((sum, production) => sum + production.totalCost, 0)
    const averageCostPerUnit = totalProduced > 0 ? totalProductionCost / totalProduced : 0
    const currentInventory = totalProduced - incomes.reduce((sum, income) => sum + income.quantity, 0)

    return {
      totalProduced,
      totalProductionCost,
      averageCostPerUnit,
      currentInventory
    }
  }

  // Mostrar pantalla de carga durante autenticación
  if (isLoading) {
    return <LoadingScreen />
  }

  // Mostrar formulario de login si no está autenticado
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  // Mostrar migración de datos si es necesario
  if (showMigration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <DataMigration 
            userId={userId}
            onMigrationComplete={() => setShowMigration(false)}
          />
        </div>
      </div>
    )
  }

  // Mostrar pantalla de carga de Firebase
  if (firebaseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AppHeader onLogout={logout} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <LoadingScreen />
        </div>
      </div>
    )
  }

  // Mostrar error de Firebase
  if (firebaseError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AppHeader onLogout={logout} />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <CloudOff className="h-5 w-5" />
                Error de Conexión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                No se pudo conectar con la base de datos en la nube. Verifica tu conexión a internet.
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const financialSummary = calculateFinancialSummary()
  const productionSummary = calculateProductionSummary()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader onLogout={logout} />
      
      {/* Indicador de estado de la nube */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <Cloud className="h-4 w-4" />
          <span>Sincronizado con la nube</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="resumen" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
              <span className="sm:hidden">Res</span>
            </TabsTrigger>
            <TabsTrigger value="ingresos" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Ingresos</span>
              <span className="sm:hidden">Ing</span>
            </TabsTrigger>
            <TabsTrigger value="gastos" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Gastos</span>
              <span className="sm:hidden">Gas</span>
            </TabsTrigger>
            <TabsTrigger value="produccion" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Producción</span>
              <span className="sm:hidden">Prod</span>
            </TabsTrigger>
            <TabsTrigger value="empleados" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Empleados</span>
              <span className="sm:hidden">Emp</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FinancialSummaryCard summary={financialSummary} />
              <ProductionSummaryCard summary={productionSummary} />
            </div>
            <FinancialCharts 
              incomes={incomes}
              expenses={expenses}
              productions={productions}
            />
          </TabsContent>

          <TabsContent value="ingresos" className="space-y-6">
            <IncomeForm onAddIncome={addIncome} />
            <IncomeList incomes={incomes} onDeleteIncome={deleteIncome} />
          </TabsContent>

          <TabsContent value="gastos" className="space-y-6">
            <ExpenseForm onAddExpense={addExpense} />
            <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
          </TabsContent>

          <TabsContent value="produccion" className="space-y-6">
            <ProductionForm onAddProduction={addProduction} />
            <ProductionList productions={productions} onDeleteProduction={deleteProduction} />
          </TabsContent>

          <TabsContent value="empleados" className="space-y-6">
            <EmployeeDashboard
              incomes={incomes}
              absences={absences}
              employeeCycleInfoList={employeeCycleInfoList}
              onAddAbsence={addAbsence}
              onDeleteAbsence={deleteAbsence}
              onUpdateEmployeeCycleStart={handleUpdateEmployeeCycleStart}
              onStartNewEmployeeCycle={handleStartNewCycle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 