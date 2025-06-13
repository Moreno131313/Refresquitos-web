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
import { useAuth } from './AuthProvider'
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
import { DollarSign, Package, Users, BarChart3 } from 'lucide-react'

export default function FinancialDashboardClient() {
  // Hook de autenticación
  const { isAuthenticated, isLoading, user, login, logout } = useAuth()
  
  // Estados principales
  const [incomes, setIncomes] = useState<IncomeItem[]>([])
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [productions, setProductions] = useState<ProductionItem[]>([])
  const [absences, setAbsences] = useState<AbsenceRecord[]>([])
  const [employeeCycleInfoList, setEmployeeCycleInfoList] = useState<EmployeeCycleInfo[]>([])
  const [activeTab, setActiveTab] = useState('resumen')
  
  const { toast } = useToast()

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedIncomes = localStorage.getItem('refresquitos-incomes')
    const savedExpenses = localStorage.getItem('refresquitos-expenses')
    const savedProductions = localStorage.getItem('refresquitos-productions')
    const savedAbsences = localStorage.getItem('refresquitos-absences')
    const savedEmployeeCycles = localStorage.getItem('refresquitos-employee-cycles')

    if (savedIncomes) setIncomes(JSON.parse(savedIncomes))
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
    if (savedProductions) setProductions(JSON.parse(savedProductions))
    if (savedAbsences) setAbsences(JSON.parse(savedAbsences))
    
    if (savedEmployeeCycles) {
      setEmployeeCycleInfoList(JSON.parse(savedEmployeeCycles))
    } else {
      // Inicializar con fechas actuales si no hay datos guardados
      const initialCycles: EmployeeCycleInfo[] = [
        { employee: 'César', cycleStartDate: getCurrentDate() },
        { employee: 'Yesid', cycleStartDate: getCurrentDate() }
      ]
      setEmployeeCycleInfoList(initialCycles)
    }
  }, [])

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    localStorage.setItem('refresquitos-incomes', JSON.stringify(incomes))
  }, [incomes])

  useEffect(() => {
    localStorage.setItem('refresquitos-expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('refresquitos-productions', JSON.stringify(productions))
  }, [productions])

  useEffect(() => {
    localStorage.setItem('refresquitos-absences', JSON.stringify(absences))
  }, [absences])

  useEffect(() => {
    localStorage.setItem('refresquitos-employee-cycles', JSON.stringify(employeeCycleInfoList))
  }, [employeeCycleInfoList])

  // Funciones para manejar ingresos
  const addIncome = (incomeData: Omit<IncomeItem, 'id' | 'createdAt' | 'amount'>) => {
    const amount = incomeData.quantity * 1000 // $1000 COP por unidad
    const newIncome: IncomeItem = {
      ...incomeData,
      id: generateId(),
      amount,
      createdAt: new Date().toISOString(),
    }
    setIncomes(prev => [newIncome, ...prev])
    toast({
      title: "Ingreso registrado",
      description: `Se registró una venta de ${incomeData.quantity} unidades por ${formatCurrency(amount)}`,
    })
  }

  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(item => item.id !== id))
    toast({
      title: "Ingreso eliminado",
      description: "El registro de ingreso ha sido eliminado",
    })
  }

  // Funciones para manejar gastos
  const addExpense = (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setExpenses(prev => [newExpense, ...prev])
    toast({
      title: "Gasto registrado",
      description: `Se registró un gasto de ${formatCurrency(expenseData.amount)}`,
    })
  }

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id))
    toast({
      title: "Gasto eliminado",
      description: "El registro de gasto ha sido eliminado",
    })
  }

  // Funciones para manejar producción
  const addProduction = (productionData: Omit<ProductionItem, 'id' | 'createdAt' | 'totalCost' | 'costPerUnit'>) => {
    const materialCostTotal = productionData.materialCosts.reduce((sum, material) => sum + material.cost, 0)
    const totalCost = materialCostTotal + productionData.directLaborCost + productionData.indirectCosts
    const costPerUnit = totalCost / productionData.quantity

    const newProduction: ProductionItem = {
      ...productionData,
      id: generateId(),
      totalCost,
      costPerUnit,
      createdAt: new Date().toISOString(),
    }
    setProductions(prev => [newProduction, ...prev])
    toast({
      title: "Lote de producción registrado",
      description: `Se registró un lote de ${productionData.quantity} unidades con costo total de ${formatCurrency(totalCost)}`,
    })
  }

  const deleteProduction = (id: string) => {
    setProductions(prev => prev.filter(item => item.id !== id))
    toast({
      title: "Lote eliminado",
      description: "El lote de producción ha sido eliminado",
    })
  }

  // Funciones para manejar ausencias
  const addAbsence = (absenceData: Omit<AbsenceRecord, 'id' | 'createdAt'>) => {
    const newAbsence: AbsenceRecord = {
      ...absenceData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setAbsences(prev => [newAbsence, ...prev])
    toast({
      title: "Ausencia registrada",
      description: `Se registró una ausencia de ${absenceData.employee}`,
    })
  }

  const deleteAbsence = (id: string) => {
    setAbsences(prev => prev.filter(item => item.id !== id))
    toast({
      title: "Ausencia eliminada",
      description: "El registro de ausencia ha sido eliminado",
    })
  }

  // Funciones para manejar ciclos de empleados
  const handleUpdateEmployeeCycleStart = (employee: 'César' | 'Yesid', newStartDate: string) => {
    console.log('📅 Actualizando fecha de inicio de ciclo:', {
      employee,
      newStartDate,
      timestamp: new Date().toISOString()
    })
    
    setEmployeeCycleInfoList(prev => {
      const updated = prev.map(cycle => 
        cycle.employee === employee 
          ? { ...cycle, cycleStartDate: newStartDate }
          : cycle
      )
      console.log('📊 Lista actualizada:', updated)
      return updated
    })
    
    toast({
      title: "Fecha de inicio actualizada",
      description: `Nueva fecha de inicio de ciclo para ${employee}: ${newStartDate}`
    })
  }

  const handleStartNewCycle = (employee: 'César' | 'Yesid', newStartDate: string) => {
    handleUpdateEmployeeCycleStart(employee, newStartDate)
    toast({
      title: "Nuevo ciclo iniciado",
      description: `Nuevo ciclo de evaluación iniciado para ${employee}`
    })
  }

  // Cálculos del resumen financiero
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

  // Cálculos del resumen de producción
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

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />
  }

  // Mostrar formulario de login si no está autenticado
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AppHeader 
        userEmail={user?.email}
        userName={user?.name}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FinancialSummaryCard summary={financialSummary} />
              <ProductionSummaryCard summary={productionSummary} />
            </div>
            <FinancialCharts incomes={incomes} expenses={expenses} />
          </TabsContent>

          <TabsContent value="ingresos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nuevo Ingreso</CardTitle>
                <CardDescription>
                  Registra las ventas de refrescos. El precio por unidad es de $1,000 COP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeForm onSubmit={addIncome} />
              </CardContent>
            </Card>
            <IncomeList incomes={incomes} onDelete={deleteIncome} />
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
                <ExpenseForm onSubmit={addExpense} />
              </CardContent>
            </Card>
            <ExpenseList expenses={expenses} onDelete={deleteExpense} />
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
                <ProductionForm onSubmit={addProduction} />
              </CardContent>
            </Card>
            <ProductionList productions={productions} onDelete={deleteProduction} />
          </TabsContent>

          <TabsContent value="empleados" className="space-y-6">
            <EmployeeDashboard 
              incomes={incomes}
              absences={absences}
              employeeCycleInfoList={employeeCycleInfoList}
              onAddAbsence={addAbsence}
              onDeleteAbsence={deleteAbsence}
              onUpdateEmployeeCycleStart={handleUpdateEmployeeCycleStart}
              onStartNewCycle={handleStartNewCycle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 