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
  ProductionSummary,
  DamagedProduct
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
import SeparateFinancialAnalysisCard from './SeparateFinancialAnalysis'
import SaleSimulator from './SaleSimulator'
import SalesAnalysis from './SalesAnalysis'
import IncomeList from './IncomeList'
import ExpenseList from './ExpenseList'
import ProductionList from './ProductionList'
import FinancialCharts from './FinancialCharts'
import SeparateInventoryCard from './SeparateInventoryCard'
import InventoryDebugCard from './InventoryDebugCard'
import TemporalAnalysisDashboard from './TemporalAnalysisDashboard'
import { DollarSign, Package, Users, BarChart3, Cloud, CloudOff, Calendar } from 'lucide-react'
import { calculateEnhancedFinancialSummary, getSeparateInventoryStatus, calculateSeparateFinancialAnalysis } from '@/lib/business-logic'
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
    deleteAbsence: firebaseDeleteAbsence,
    deleteEmployeeCycle: firebaseDeleteEmployeeCycle,
    addDamagedProduct,
    deleteDamagedProduct,
    damagedProducts
  } = useFirebaseData()

  const [activeTab, setActiveTab] = useState('resumen')
  const [showMigration, setShowMigration] = useState(false)
  const { toast } = useToast()

  // TEMPORAL: Cargar datos directamente de localStorage para testing
  const [localData, setLocalData] = useState({
    productions: [] as Production[],
    incomes: [] as Income[],
    expenses: [] as Expense[]
  })

  const [form, setForm] = useState({ product: '', quantity: 1, reason: '', date: '' });
  const [filter, setFilter] = useState({ from: '', to: '' });

  useEffect(() => {
    try {
      const localProductions = localStorage.getItem('refresquitos-productions')
      const localIncomes = localStorage.getItem('refresquitos-incomes')
      const localExpenses = localStorage.getItem('refresquitos-expenses')

      setLocalData({
        productions: localProductions ? JSON.parse(localProductions) : [],
        incomes: localIncomes ? JSON.parse(localIncomes) : [],
        expenses: localExpenses ? JSON.parse(localExpenses) : []
      })
      
      console.log('📦 Datos localStorage cargados:', {
        productions: localProductions ? JSON.parse(localProductions).length : 0,
        incomes: localIncomes ? JSON.parse(localIncomes).length : 0,
        expenses: localExpenses ? JSON.parse(localExpenses).length : 0
      })
    } catch (error) {
      console.error('Error cargando datos localStorage:', error)
    }
  }, [user])

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
      // FORZAR que NO muestre la migración para probar el inventario
      // setShowMigration(true)
      setShowMigration(false)
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

  // TEMPORAL: Usar datos de localStorage para testing
  const finalIncomes = localData.incomes.length > 0 ? localData.incomes : incomes
  const finalProductions = localData.productions.length > 0 ? localData.productions : productions  
  const finalExpenses = localData.expenses.length > 0 ? localData.expenses : expenses

  console.log('📊 Datos finales a usar:', {
    incomes: finalIncomes.length,
    productions: finalProductions.length,
    expenses: finalExpenses.length
  })

  // Wrapper functions to handle form submissions
  const handleAddIncome = (incomeData: IncomeFormData) => {
    console.log('📊 Intentando agregar ingreso:', incomeData)
    
    firebaseAddIncome(incomeData).catch(error => {
      console.error('❌ Error agregando ingreso:', error)
      toast({
        title: "Error",
        description: error?.message || "No se pudo agregar el ingreso",
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
    totalIncome: finalIncomes.reduce((sum, income) => sum + income.amount, 0),
    totalExpenses: finalExpenses.reduce((sum, expense) => sum + expense.amount, 0),
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
    totalProduced: finalProductions.reduce((sum, prod) => sum + prod.quantity, 0),
    totalProductionCost: finalProductions.reduce((sum, prod) => sum + prod.totalCost, 0),
    averageCostPerUnit: 0,
    currentInventory: 0,
  }

  const totalSold = finalIncomes.reduce((sum, income) => sum + income.quantity, 0)
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

  const filteredDamaged = damagedProducts && damagedProducts.filter(item => {
    if (filter.from && item.date < filter.from) return false;
    if (filter.to && item.date > filter.to) return false;
    return true;
  });

  const handleCleanupOldIncomes = async () => {
    const confirmed = window.confirm('¿Estás seguro de que quieres limpiar registros antiguos de productos dañados de la base de datos? Esto solucionará el problema de inventario.');
    
    if (confirmed) {
      try {
        await cleanupOldDamagedProductIncomes();
        toast({
          title: "Limpieza completada",
          description: "Se eliminaron los registros antiguos que causaban problemas de inventario.",
        });
      } catch (error) {
        toast({
          title: "Error en la limpieza",
          description: "Hubo un problema al limpiar los registros antiguos.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AppHeader 
        userEmail={user?.email}
        userName={user?.name || user?.email}
        onLogout={logout}
      />
      
      <div className="container mx-auto p-3 md:p-4 space-y-4 md:space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 h-auto p-1">
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
            <TabsTrigger value="novedades" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <Package className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Novedades</span>
              <span className="sm:hidden">Nov</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="space-y-6">
            <SeparateInventoryCard 
              inventoryStatus={getSeparateInventoryStatus(finalProductions, finalIncomes)}
            />
            <InventoryDebugCard 
              productions={finalProductions}
              incomes={finalIncomes}
              inventoryStatus={getSeparateInventoryStatus(finalProductions, finalIncomes)}
            />
            <SeparateFinancialAnalysisCard 
              analysis={calculateSeparateFinancialAnalysis(finalProductions, finalIncomes, finalExpenses)}
            />
            <FinancialCharts incomes={finalIncomes} expenses={finalExpenses} />
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <TemporalAnalysisDashboard 
              productions={finalProductions}
              incomes={finalIncomes}
              expenses={finalExpenses}
            />
          </TabsContent>

          <TabsContent value="ingresos" className="space-y-6">
            <SaleSimulator 
              productions={finalProductions}
              incomes={finalIncomes}
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
              incomes={finalIncomes}
              productions={finalProductions}
            />
            <IncomeList incomes={finalIncomes} onDelete={firebaseDeleteIncome} />
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
            <ExpenseList expenses={finalExpenses} onDelete={firebaseDeleteExpense} />
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
            <ProductionList productions={finalProductions} onDelete={firebaseDeleteProduction} />
          </TabsContent>

          <TabsContent value="empleados" className="space-y-6">
            <EnhancedEmployeeDashboard 
              incomes={finalIncomes}
              absences={absences}
              employeeCycleInfoList={employeeCycleInfoList}
              bonuses={bonuses}
              onAddAbsence={handleAddAbsence}
              onDeleteAbsence={firebaseDeleteAbsence}
              onUpdateEmployeeCycleStart={handleUpdateEmployeeCycleStart}
              onStartNewCycle={handleStartNewCycle}
              onAddBonus={firebaseAddBonus}
              onMarkBonusPaid={firebaseMarkBonusPaid}
              deleteEmployeeCycle={firebaseDeleteEmployeeCycle}
            />
          </TabsContent>

          <TabsContent value="novedades" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Registrar producto roto o dañado</h3>
                             <Button 
                 onClick={handleCleanupOldIncomes}
                 variant="outline"
                 size="sm"
                 className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
               >
                 🧹 Limpiar registros antiguos
               </Button>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  if (!form.product || !form.quantity || !form.reason || !form.date) return;
                  await addDamagedProduct({
                    product: form.product,
                    quantity: Number(form.quantity),
                    reason: form.reason,
                    date: form.date,
                    createdAt: new Date().toISOString(),
                  });
                  setForm({ product: '', quantity: 1, reason: '', date: '' });
                }}
                className="flex flex-col gap-2 mb-4"
              >
                <label className="font-medium">Producto</label>
                <select className="border rounded p-2" required value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))}>
                  <option value="">Selecciona</option>
                  <option value="Refresco">Refresco</option>
                  <option value="Helado">Helado</option>
                  <option value="Paca">Paca</option>
                </select>
                <label className="font-medium">Cantidad</label>
                <input type="number" min="1" className="border rounded p-2" required value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                <label className="font-medium">Motivo</label>
                <select className="border rounded p-2" required value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}>
                  <option value="">Selecciona</option>
                  <option value="Roto">Roto</option>
                  <option value="Dañado">Dañado</option>
                </select>
                <label className="font-medium">Fecha</label>
                <input type="date" className="border rounded p-2" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                <button type="submit" className="bg-blue-600 text-white rounded p-2 mt-2">Registrar</button>
              </form>
              <div className="flex gap-2 mb-2">
                <label className="text-xs">Desde:</label>
                <input type="date" value={filter.from} onChange={e => setFilter(f => ({ ...f, from: e.target.value }))} className="border rounded p-1 text-xs" />
                <label className="text-xs">Hasta:</label>
                <input type="date" value={filter.to} onChange={e => setFilter(f => ({ ...f, to: e.target.value }))} className="border rounded p-1 text-xs" />
              </div>
              {filteredDamaged && filteredDamaged.length > 0 ? (
                <div className="mt-2">
                  <h3 className="font-semibold mb-2">Historial de productos dañados</h3>
                  <ul className="divide-y divide-gray-200">
                    {filteredDamaged.map((item, idx) => (
                      <li key={item.id || idx} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4">
                        <span className="font-medium">{item.product}</span>
                        <span className="text-sm">Cantidad: {item.quantity}</span>
                        <span className="text-sm">Motivo: {item.reason}</span>
                        <span className="text-xs text-gray-500">Fecha: {item.date}</span>
                        <button onClick={() => deleteDamagedProduct(item.id)} className="ml-auto text-red-600 hover:underline text-xs">Eliminar</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">No hay productos dañados en el rango seleccionado.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 