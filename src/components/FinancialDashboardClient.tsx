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
  AbsenceRecord
} from '@/types/financials'
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
import EnhancedFinancialSummaryCard from './EnhancedFinancialSummary'
import SaleSimulator from './SaleSimulator'
import SalesAnalysis from './SalesAnalysis'
import SeparateInventoryCard from './SeparateInventoryCard'
import { DollarSign, Package, Users, BarChart3 } from 'lucide-react'
import { calculateEnhancedFinancialSummary, getSeparateInventoryStatus } from '@/lib/business-logic'

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
    // Calcular precio según el producto
    const pricePerUnit = (incomeData as any).product === 'Helado' ? 1800 : 1000
    const amount = incomeData.quantity * pricePerUnit
    const newIncome: IncomeItem = {
      ...incomeData,
      id: generateId(),
      amount,
      createdAt: new Date().toISOString(),
    }
    setIncomes(prev => [newIncome, ...prev])
    toast({
      title: "Ingreso registrado",
      description: `Se registró una venta de ${incomeData.quantity} ${(incomeData as any).product || 'Refresco'}s por ${formatCurrency(amount)}`,
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

  // Función para agregar datos de prueba
  const addSampleData = () => {
    // Agregar producciones de prueba
    const sampleProductions = [
      {
        id: generateId(),
        date: '2024-01-15',
                 product: 'Refresco' as const,
         quantity: 100,
        materialCosts: [
          { name: 'Leche x cantina (40litros)', cost: 50000 },
          { name: 'Azucar x BULTO', cost: 30000 }
        ],
        directLaborCost: 20000,
        indirectCosts: 10000,
        totalCost: 110000,
        costPerUnit: 1100,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        date: '2024-01-16',
                 product: 'Helado' as const,
         quantity: 50,
        materialCosts: [
          { name: 'Leche x cantina (40litros)', cost: 40000 },
          { name: 'Coco', cost: 25000 }
        ],
        directLaborCost: 15000,
        indirectCosts: 8000,
        totalCost: 88000,
        costPerUnit: 1760,
        createdAt: new Date().toISOString()
      }
    ]

    // Agregar ventas de prueba
    const sampleIncomes = [
      {
        id: generateId(),
        amount: 30000,
        quantity: 30,
        date: '2024-01-17',
        type: 'Venta Empleado' as const,
                 product: 'Refresco' as const,
         employee: 'César' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        amount: 36000,
        quantity: 20,
        date: '2024-01-18',
        type: 'Venta Empleado' as const,
                 product: 'Helado' as const,
         employee: 'Yesid' as const,
        createdAt: new Date().toISOString()
      }
    ]

    setProductions(prev => [...sampleProductions, ...prev])
    setIncomes(prev => [...sampleIncomes, ...prev])
    
    toast({
      title: "Datos de prueba agregados",
      description: "Se agregaron producciones y ventas de refrescos y helados para probar el inventario separado",
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

  // Convertir tipos legacy a tipos unificados
  const unifiedProductions: Production[] = productions.map(prod => ({
    id: prod.id,
    date: prod.date,
    product: (prod as any).product || 'Refresco' as const, // Usar el producto si existe, sino defaultear a Refresco
    quantity: prod.quantity,
    materialCosts: prod.materialCosts,
    directLaborCost: prod.directLaborCost,
    indirectCosts: prod.indirectCosts,
    totalCost: prod.totalCost,
    costPerUnit: prod.costPerUnit,
    createdAt: prod.createdAt
  }))

  const unifiedIncomes: Income[] = incomes.map(income => ({
    id: income.id,
    amount: income.amount,
    quantity: income.quantity,
    date: income.date,
    type: income.type,
    product: (income as any).product || 'Refresco' as const, // Usar el producto si existe, sino defaultear a Refresco
    employee: income.employee,
    createdAt: income.createdAt
  }))

  const unifiedExpenses: Expense[] = expenses.map(expense => ({
    id: expense.id,
    name: expense.name,
    amount: expense.amount,
    date: expense.date,
    category: expense.category,
    type: expense.type,
    createdAt: expense.createdAt
  }))

  // Cálculos del resumen financiero mejorado
  const enhancedFinancialSummary = calculateEnhancedFinancialSummary(
    unifiedProductions,
    unifiedIncomes,
    unifiedExpenses
  )

  // Cálculo del inventario separado por producto
  const separateInventoryStatus = getSeparateInventoryStatus(
    unifiedProductions,
    unifiedIncomes
  )

  // Mantener compatibilidad con el resumen anterior
  const financialSummary: FinancialSummary = {
    totalIncome: enhancedFinancialSummary.totalRevenue,
    totalExpenses: enhancedFinancialSummary.totalCostOfGoodsSold + enhancedFinancialSummary.operatingExpenses,
    netProfit: enhancedFinancialSummary.netProfit,
    profitMargin: enhancedFinancialSummary.netProfitMargin,
    tithe: enhancedFinancialSummary.tithe,
    savings: enhancedFinancialSummary.savings,
    available: enhancedFinancialSummary.available,
  }

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
            <EnhancedFinancialSummaryCard summary={enhancedFinancialSummary} />
            <SeparateInventoryCard inventoryStatus={separateInventoryStatus} />
            
            {/* Botón para datos de prueba - solo mostrar si no hay datos */}
            {productions.length === 0 && incomes.length === 0 && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No hay datos para mostrar</h3>
                  <p className="text-gray-600 mb-4">
                    Agrega algunos datos de prueba para ver el inventario separado funcionando
                  </p>
                  <Button onClick={addSampleData} variant="outline">
                    Agregar Datos de Prueba
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <SalesAnalysis productions={unifiedProductions} incomes={unifiedIncomes} />
            <FinancialCharts incomes={incomes} expenses={expenses} />
          </TabsContent>

          <TabsContent value="ingresos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registrar Nuevo Ingreso</CardTitle>
                  <CardDescription>
                    Registra las ventas de refrescos ($1,000) y helados ($1,800). El precio se calcula automáticamente según el producto.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IncomeForm onSubmit={addIncome} />
                </CardContent>
              </Card>
              <SaleSimulator 
                productions={unifiedProductions} 
                incomes={unifiedIncomes} 
                onProceedWithSale={(quantity) => {
                  // Auto-llenar el formulario con la cantidad simulada
                  toast({
                    title: "Cantidad sugerida",
                    description: `Usa ${quantity} unidades en el formulario de venta`,
                  })
                }}
              />
            </div>
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