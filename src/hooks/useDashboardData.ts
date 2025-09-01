import { useState, useEffect } from 'react'
import { formatCurrency, generateId, getCurrentDate } from '@/lib/utils'
import { 
  IncomeItem, ExpenseItem, ProductionItem, AbsenceRecord 
} from '@/types/financials'
import { 
  Income, Expense, Production, Absence, EmployeeCycleInfo, FinancialSummary, ProductionSummary 
} from '@/types/unified'
import { calculateEnhancedFinancialSummary, getSeparateInventoryStatus, calculateSeparateFinancialAnalysis } from '@/lib/business-logic'
import { useToast } from '@/hooks/useToast'
import { v4 as uuidv4 } from 'uuid'

export function useDashboardData() {
  const [incomes, setIncomes] = useState<IncomeItem[]>([])
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [productions, setProductions] = useState<ProductionItem[]>([])
  const [absences, setAbsences] = useState<AbsenceRecord[]>([])
  const [employeeCycleInfoList, setEmployeeCycleInfoList] = useState<EmployeeCycleInfo[]>([])
  const [activeTab, setActiveTab] = useState('resumen')
  const { toast } = useToast()

  useEffect(() => {
    const savedIncomes = localStorage.getItem('refresquitos-incomes')
    const savedExpenses = localStorage.getItem('refresquitos-expenses')
    const savedProductions = localStorage.getItem('refresquitos-productions')
    const savedAbsences = localStorage.getItem('refresquitos-absences')
    const savedEmployeeCycles = localStorage.getItem('refresquitos-employee-cycles')

    if (savedIncomes) {
      const parsedIncomes = JSON.parse(savedIncomes)
      const migratedIncomes = parsedIncomes.map((income: any) => ({
        ...income,
        product: income.product || (income.amount / income.quantity === 1800 ? 'Helado' : 'Refresco')
      }))
      setIncomes(migratedIncomes)
      if (JSON.stringify(parsedIncomes) !== JSON.stringify(migratedIncomes)) {
        localStorage.setItem('refresquitos-incomes', JSON.stringify(migratedIncomes))
      }
    }
    if (savedProductions) {
      const parsedProductions = JSON.parse(savedProductions)
      const migratedProductions = parsedProductions.map((prod: any) => ({
        ...prod,
        product: prod.product || 'Refresco'
      }))
      setProductions(migratedProductions)
      if (JSON.stringify(parsedProductions) !== JSON.stringify(migratedProductions)) {
        localStorage.setItem('refresquitos-productions', JSON.stringify(migratedProductions))
      }
    }
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
    if (savedAbsences) setAbsences(JSON.parse(savedAbsences))
    if (savedEmployeeCycles) {
      // Migrar ciclos existentes para asegurar que tengan id
      const parsedCycles = JSON.parse(savedEmployeeCycles)
      const migratedCycles = parsedCycles.map((cycle: any) => ({
        ...cycle,
        id: cycle.id || generateId(),
      }))
      setEmployeeCycleInfoList(migratedCycles)
      if (JSON.stringify(parsedCycles) !== JSON.stringify(migratedCycles)) {
        localStorage.setItem('refresquitos-employee-cycles', JSON.stringify(migratedCycles))
      }
    } else {
      const initialCycles: EmployeeCycleInfo[] = [
        { id: generateId(), employee: 'César', cycleStartDate: getCurrentDate() },
        { id: generateId(), employee: 'Yesid', cycleStartDate: getCurrentDate() }
      ]
      setEmployeeCycleInfoList(initialCycles)
      localStorage.setItem('refresquitos-employee-cycles', JSON.stringify(initialCycles))
    }
  }, [])

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

  const addIncome = (incomeData: any) => {
    const pricePerUnit = incomeData.product === 'Helado' ? 1800 : incomeData.product === 'Paca' ? 9000 : 1000
    const amount = incomeData.quantity * pricePerUnit
    const newIncome: IncomeItem = {
      ...incomeData,
      id: generateId(),
      amount,
      createdAt: new Date().toISOString(),
    }
    setIncomes(prev => [newIncome, ...prev])
    toast({
      title: 'Ingreso registrado',
      description: `Se registró una venta de ${incomeData.quantity} ${incomeData.product}s por ${formatCurrency(amount)}`,
    })
  }
  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(item => item.id !== id))
    toast({
      title: 'Ingreso eliminado',
      description: 'El registro de ingreso ha sido eliminado',
    })
  }
  const addExpense = (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setExpenses(prev => [newExpense, ...prev])
    toast({
      title: 'Gasto registrado',
      description: `Se registró un gasto de ${formatCurrency(expenseData.amount)}`,
    })
  }
  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id))
    toast({
      title: 'Gasto eliminado',
      description: 'El registro de gasto ha sido eliminado',
    })
  }
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
      title: 'Lote de producción registrado',
      description: `Se registró un lote de ${productionData.quantity} unidades con costo total de ${formatCurrency(totalCost)}`,
    })
  }
  const deleteProduction = (id: string) => {
    setProductions(prev => prev.filter(item => item.id !== id))
    toast({
      title: 'Lote eliminado',
      description: 'El lote de producción ha sido eliminado',
    })
  }
  const addAbsence = (absenceData: Omit<AbsenceRecord, 'id' | 'createdAt'>) => {
    const newAbsence: AbsenceRecord = {
      ...absenceData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setAbsences(prev => [newAbsence, ...prev])
    toast({
      title: 'Ausencia registrada',
      description: `Se registró una ausencia de ${absenceData.employee}`,
    })
  }
  const deleteAbsence = (id: string) => {
    setAbsences(prev => prev.filter(item => item.id !== id))
    toast({
      title: 'Ausencia eliminada',
      description: 'El registro de ausencia ha sido eliminado',
    })
  }
  const addSampleData = () => {
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
        amount: 50000,
        quantity: 50,
        date: '2025-01-13',
        type: 'Venta Empleado',
        employee: 'César',
        product: 'Refresco',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        amount: 72000,
        quantity: 40,
        date: '2025-01-13',
        type: 'Venta Empleado',
        employee: 'Yesid',
        product: 'Helado',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        amount: 100000,
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
    const currentProductions = JSON.parse(localStorage.getItem('refresquitos-productions') || '[]')
    const currentIncomes = JSON.parse(localStorage.getItem('refresquitos-incomes') || '[]')
    const currentExpenses = JSON.parse(localStorage.getItem('refresquitos-expenses') || '[]')
    localStorage.setItem('refresquitos-productions', JSON.stringify([...currentProductions, ...sampleProductions]))
    localStorage.setItem('refresquitos-incomes', JSON.stringify([...currentIncomes, ...sampleIncomes]))
    localStorage.setItem('refresquitos-expenses', JSON.stringify([...currentExpenses, ...sampleExpenses]))
    setProductions([...productions, ...sampleProductions])
    setIncomes([...incomes, ...sampleIncomes])
    setExpenses([...expenses, ...sampleExpenses])
    toast({
      title: 'Datos agregados',
      description: 'Se agregaron datos de prueba con productos separados (refrescos y helados)'
    })
  }
  const handleUpdateEmployeeCycleStart = (employee: 'César' | 'Yesid', newStartDate: string) => {
    setEmployeeCycleInfoList(prev => {
      const updated = prev.map(cycle =>
        cycle.employee === employee
          ? { ...cycle, cycleStartDate: newStartDate }
          : cycle
      )
      return updated
    })
    toast({
      title: 'Fecha de inicio actualizada',
      description: `Nueva fecha de inicio de ciclo para ${employee}: ${newStartDate}`
    })
  }
  const handleStartNewCycle = (employee: 'César' | 'Yesid', newStartDate: string) => {
    handleUpdateEmployeeCycleStart(employee, newStartDate)
    toast({
      title: 'Nuevo ciclo iniciado',
      description: `Nuevo ciclo de evaluación iniciado para ${employee}`
    })
  }
  const migrateDataToSeparateProducts = () => {
    const migratedProductions = productions.map(prod => {
      if (!(prod as any).product) {
        return { ...prod, product: 'Refresco' as const }
      }
      return prod
    })
    const migratedIncomes = incomes.map(income => {
      if (!(income as any).product) {
        return { ...income, product: 'Refresco' as const }
      }
      return income
    })
    setProductions(migratedProductions)
    setIncomes(migratedIncomes)
    toast({
      title: 'Datos migrados',
      description: "Los datos existentes sin producto asignado han sido migrados como 'Refresco'",
    })
  }
  const unifiedProductions: Production[] = productions.map(prod => ({
    id: prod.id,
    date: prod.date,
    product: (prod as any).product || 'Refresco' as const,
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
    product: (income as any).product || 'Refresco' as const,
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
  const enhancedFinancialSummary = calculateEnhancedFinancialSummary(
    unifiedProductions,
    unifiedIncomes,
    unifiedExpenses
  )
  const separateInventoryStatus = getSeparateInventoryStatus(
    unifiedProductions,
    unifiedIncomes
  )
  const separateFinancialAnalysis = calculateSeparateFinancialAnalysis(
    unifiedProductions,
    unifiedIncomes,
    unifiedExpenses
  )
  const financialSummary: FinancialSummary = {
    totalIncome: enhancedFinancialSummary.totalRevenue,
    totalExpenses: enhancedFinancialSummary.totalCostOfGoodsSold + enhancedFinancialSummary.operatingExpenses,
    netProfit: enhancedFinancialSummary.netProfit,
    profitMargin: enhancedFinancialSummary.netProfitMargin,
    tithe: enhancedFinancialSummary.tithe,
    savings: enhancedFinancialSummary.savings,
    available: enhancedFinancialSummary.available,
  }
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

  // Nueva función para eliminar ciclos de empleados
  const deleteEmployeeCycle = (cycleId: string) => {
    setEmployeeCycleInfoList(prev => {
      const updated = prev.filter(cycle => cycle.id !== cycleId)
      localStorage.setItem('refresquitos-employee-cycles', JSON.stringify(updated))
      return updated
    })
    toast({
      title: 'Ciclo eliminado',
      description: 'El ciclo de empleado ha sido eliminado',
    })
  }
  return {
    incomes,
    expenses,
    productions,
    absences,
    employeeCycleInfoList,
    activeTab,
    setActiveTab,
    addIncome,
    deleteIncome,
    addExpense,
    deleteExpense,
    addProduction,
    deleteProduction,
    addAbsence,
    deleteAbsence,
    addSampleData,
    handleUpdateEmployeeCycleStart,
    handleStartNewCycle,
    migrateDataToSeparateProducts,
    unifiedProductions,
    unifiedIncomes,
    unifiedExpenses,
    enhancedFinancialSummary,
    separateInventoryStatus,
    separateFinancialAnalysis,
    financialSummary,
    productionSummary,
    deleteEmployeeCycle
  }
}
