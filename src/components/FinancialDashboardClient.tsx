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
import SeparateFinancialAnalysisCard from './SeparateFinancialAnalysis'
import SaleSimulator from './SaleSimulator'
import SalesAnalysis from './SalesAnalysis'
import SeparateInventoryCard from './SeparateInventoryCard'
import InventoryDebugCard from './InventoryDebugCard'
import MigrationButton from './MigrationButton'
import TemporalAnalysisDashboard from './TemporalAnalysisDashboard'
import { DollarSign, Package, Users, BarChart3, Calendar } from 'lucide-react'
import { calculateEnhancedFinancialSummary, getSeparateInventoryStatus, calculateSeparateFinancialAnalysis } from '@/lib/business-logic'

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

  // Cargar datos del localStorage al inicializar CON MIGRACIÓN AUTOMÁTICA
  useEffect(() => {
    const savedIncomes = localStorage.getItem('refresquitos-incomes')
    const savedExpenses = localStorage.getItem('refresquitos-expenses')
    const savedProductions = localStorage.getItem('refresquitos-productions')
    const savedAbsences = localStorage.getItem('refresquitos-absences')
    const savedEmployeeCycles = localStorage.getItem('refresquitos-employee-cycles')

    // MIGRACIÓN AUTOMÁTICA DE INGRESOS
    if (savedIncomes) {
      const parsedIncomes = JSON.parse(savedIncomes)
      const migratedIncomes = parsedIncomes.map((income: any) => ({
        ...income,
        // Asignar producto basado en amount o defaultear a Refresco
        product: income.product || (income.amount / income.quantity === 1800 ? 'Helado' : 'Refresco')
      }))
      setIncomes(migratedIncomes)
      
      // Guardar datos migrados inmediatamente
      if (JSON.stringify(parsedIncomes) !== JSON.stringify(migratedIncomes)) {
        localStorage.setItem('refresquitos-incomes', JSON.stringify(migratedIncomes))
        console.log('✅ Ingresos migrados automáticamente con campo product')
      }
    }

    // MIGRACIÓN AUTOMÁTICA DE PRODUCCIONES
    if (savedProductions) {
      const parsedProductions = JSON.parse(savedProductions)
      const migratedProductions = parsedProductions.map((prod: any) => ({
        ...prod,
        // Asignar Refresco por defecto a producciones sin product
        product: prod.product || 'Refresco'
      }))
      setProductions(migratedProductions)
      
      // Guardar datos migrados inmediatamente
      if (JSON.stringify(parsedProductions) !== JSON.stringify(migratedProductions)) {
        localStorage.setItem('refresquitos-productions', JSON.stringify(migratedProductions))
        console.log('✅ Producciones migradas automáticamente con campo product')
      }
    }

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
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
  const addIncome = (incomeData: any) => {
    // Calcular precio según el producto
    const pricePerUnit = incomeData.product === 'Helado' ? 1800 : incomeData.product === 'Paca' ? 9000 : 1000
    const amount = incomeData.quantity * pricePerUnit
    
    // Convertir IncomeFormData a IncomeItem
    const newIncome: IncomeItem = {
      ...incomeData,
      id: generateId(),
      amount,
      createdAt: new Date().toISOString(),
    }
    setIncomes(prev => [newIncome, ...prev])
    toast({
      title: "Ingreso registrado",
      description: `Se registró una venta de ${incomeData.quantity} ${incomeData.product}s por ${formatCurrency(amount)}`,
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
    // Datos de prueba con productos separados
    const sampleProductions: ProductionItem[] = [
      {
        id: generateId(),
        date: '2025-01-10',
        quantity: 100,
        materialCosts: [
          { name: 'Leche x cantina (40litros)', cost: 15000 },
          { name: 'Azucar x BULTO', cost: 8000 },
          { name: 'Maracuya', cost: 5000 },
          { name: 'Bolsas para empacar refrescos grandes', cost: 2000 }
        ],
        directLaborCost: 5000,
        indirectCosts: 3000,
        totalCost: 38000,
        costPerUnit: 380,
        product: 'Refresco',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        date: '2025-01-11',
        quantity: 150,
        materialCosts: [
          { name: 'Leche x cantina (40litros)', cost: 20000 },
          { name: 'Azucar x BULTO', cost: 12000 },
          { name: 'Coco', cost: 8000 },
          { name: 'Crema de leche litro', cost: 6000 },
          { name: 'Vasos para helados', cost: 4000 }
        ],
        directLaborCost: 8000,
        indirectCosts: 5000,
        totalCost: 63000,
        costPerUnit: 420,
        product: 'Helado',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        date: '2025-01-12',
        quantity: 200,
        materialCosts: [
          { name: 'Leche x cantina (40litros)', cost: 25000 },
          { name: 'Azucar x BULTO', cost: 15000 },
          { name: 'Mora', cost: 8000 },
          { name: 'Bolsas para empacar refrescos grandes', cost: 3000 }
        ],
        directLaborCost: 10000,
        indirectCosts: 6000,
        totalCost: 67000,
        costPerUnit: 335,
        product: 'Refresco',
        createdAt: new Date().toISOString()
      }
    ]

    const sampleIncomes: IncomeItem[] = [
      {
        id: generateId(),
        amount: 50000, // 50 refrescos × $1,000
        quantity: 50,
        date: '2025-01-13',
        type: 'Venta Empleado',
        employee: 'César',
        product: 'Refresco',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        amount: 72000, // 40 helados × $1,800
        quantity: 40,
        date: '2025-01-13',
        type: 'Venta Empleado',
        employee: 'Yesid',
        product: 'Helado',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        amount: 100000, // 100 refrescos × $1,000
        quantity: 100,
        date: '2025-01-14',
        type: 'Venta Empleado',
        product: 'Refresco',
        createdAt: new Date().toISOString()
      }
    ]

    const sampleExpenses: ExpenseItem[] = [
      {
        id: generateId(),
        name: 'Servicios públicos',
        amount: 80000,
        date: '2025-01-10',
        category: 'Costos Fijos',
        type: 'Mensual',
        createdAt: new Date().toISOString()
      }
    ]

    // Guardar en localStorage
    const currentProductions = JSON.parse(localStorage.getItem('refresquitos-productions') || '[]')
    const currentIncomes = JSON.parse(localStorage.getItem('refresquitos-incomes') || '[]')
    const currentExpenses = JSON.parse(localStorage.getItem('refresquitos-expenses') || '[]')

    localStorage.setItem('refresquitos-productions', JSON.stringify([...currentProductions, ...sampleProductions]))
    localStorage.setItem('refresquitos-incomes', JSON.stringify([...currentIncomes, ...sampleIncomes]))
    localStorage.setItem('refresquitos-expenses', JSON.stringify([...currentExpenses, ...sampleExpenses]))

    // Recargar datos
    setProductions([...productions, ...sampleProductions])
    setIncomes([...incomes, ...sampleIncomes])
    setExpenses([...expenses, ...sampleExpenses])

    toast({
      title: "Datos agregados",
      description: "Se agregaron datos de prueba con productos separados (refrescos y helados)"
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

  // Función para migrar datos existentes sin campo product
  const migrateDataToSeparateProducts = () => {
    // Migrar producciones sin producto
    const migratedProductions = productions.map(prod => {
      if (!(prod as any).product) {
        return { ...prod, product: 'Refresco' as const }
      }
      return prod
    })
    
    // Migrar ingresos sin producto
    const migratedIncomes = incomes.map(income => {
      if (!(income as any).product) {
        return { ...income, product: 'Refresco' as const }
      }
      return income
    })
    
    setProductions(migratedProductions)
    setIncomes(migratedIncomes)
    
    toast({
      title: "Datos migrados",
      description: "Los datos existentes sin producto asignado han sido migrados como 'Refresco'",
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

  // Cálculo del análisis financiero separado por producto
  const separateFinancialAnalysis = calculateSeparateFinancialAnalysis(
    unifiedProductions,
    unifiedIncomes,
    unifiedExpenses
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
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="resumen" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Resumen</span>
              <span className="sm:hidden">Res</span>
            </TabsTrigger>
            <TabsTrigger value="temporal" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Análisis</span>
              <span className="sm:hidden">Ana</span>
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
            <InventoryDebugCard 
              productions={unifiedProductions} 
              incomes={unifiedIncomes} 
              inventoryStatus={separateInventoryStatus}
              onMigrateData={migrateDataToSeparateProducts}
            />
            <MigrationButton />
            <SeparateFinancialAnalysisCard analysis={separateFinancialAnalysis} />
            
            {/* DEBUG: Mostrar datos brutos */}
            <Card className="border-2 border-purple-300 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800">🔧 DEBUG: Datos del Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p><strong>Producciones totales:</strong> {unifiedProductions.length}</p>
                  <p><strong>Refrescos producidos:</strong> {unifiedProductions.filter(p => p.product === 'Refresco').length}</p>
                  <p><strong>Helados producidos:</strong> {unifiedProductions.filter(p => p.product === 'Helado').length}</p>
                  <p><strong>Pacas producidas:</strong> {unifiedProductions.filter(p => p.product === 'Paca').length}</p>
                  <p><strong>Ingresos totales:</strong> {unifiedIncomes.length}</p>
                  <p><strong>Ventas de refrescos:</strong> {unifiedIncomes.filter(i => i.product === 'Refresco').length}</p>
                  <p><strong>Ventas de helados:</strong> {unifiedIncomes.filter(i => i.product === 'Helado').length}</p>
                  <p><strong>Ventas de pacas:</strong> {unifiedIncomes.filter(i => i.product === 'Paca').length}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* INVENTARIO SEPARADO - DEBE APARECER AQUÍ */}
            <SeparateInventoryCard 
              inventoryStatus={separateInventoryStatus} 
              onForceRefresh={migrateDataToSeparateProducts}
            />
            
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

          <TabsContent value="temporal" className="space-y-6">
            <TemporalAnalysisDashboard 
              productions={unifiedProductions}
              incomes={unifiedIncomes}
              expenses={unifiedExpenses}
            />
          </TabsContent>

          <TabsContent value="ingresos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registrar Nuevo Ingreso</CardTitle>
                  <CardDescription>
                    Registra las ventas de refrescos ($1,000), helados ($1,800) y pacas ($9,000). El precio se calcula automáticamente según el producto.
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