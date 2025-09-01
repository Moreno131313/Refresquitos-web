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
import { DollarSign, Package, Users, BarChart3, Calendar, FileText } from 'lucide-react'
import { calculateEnhancedFinancialSummary, getSeparateInventoryStatus, calculateSeparateFinancialAnalysis } from '@/lib/business-logic'
import { useDashboardData } from '../hooks/useDashboardData'

export default function FinancialDashboardClient() {
  // Hook de autenticación
  const { isAuthenticated, isLoading, user, login, logout } = useAuth()
  // Extraer toda la lógica de estado y handlers a un custom hook
  const {
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
  } = useDashboardData()
  const { toast } = useToast()

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
            <TabsTrigger value="factura" asChild className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <a href="/factura" className="flex items-center gap-1">
                <FileText className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Factura</span>
                <span className="sm:hidden">Fact</span>
              </a>
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
                  <p><strong>Refrescos producidos:</strong> {unifiedProductions.filter((p: Production) => p.product === 'Refresco').length}</p>
                  <p><strong>Helados producidos:</strong> {unifiedProductions.filter((p: Production) => p.product === 'Helado').length}</p>
                  <p><strong>Pacas producidas:</strong> {unifiedProductions.filter((p: Production) => p.product === 'Paca').length}</p>
                  <p><strong>Ingresos totales:</strong> {unifiedIncomes.length}</p>
                  <p><strong>Ventas de refrescos:</strong> {unifiedIncomes.filter((i: Income) => i.product === 'Refresco').length}</p>
                  <p><strong>Ventas de helados:</strong> {unifiedIncomes.filter((i: Income) => i.product === 'Helado').length}</p>
                  <p><strong>Ventas de pacas:</strong> {unifiedIncomes.filter((i: Income) => i.product === 'Paca').length}</p>
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
              deleteEmployeeCycle={deleteEmployeeCycle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 