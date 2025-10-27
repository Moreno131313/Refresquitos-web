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
  ProductionSummary,
  DamagedProduct
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
    deleteEmployeeCycle,
    addDamagedProduct,
    deleteDamagedProduct,
    damagedProducts,
    cleanupOldDamagedProductIncomes
  } = useDashboardData()
  const { toast } = useToast()
  const [form, setForm] = useState({ product: '', quantity: 1, reason: '', date: '' });
  const [filter, setFilter] = useState({ from: '', to: '' });

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />
  }

  // Mostrar formulario de login si no está autenticado
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  const filteredDamaged = damagedProducts.filter(item => {
    if (filter.from && item.date < filter.from) return false;
    if (filter.to && item.date > filter.to) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AppHeader 
        userEmail={user?.email}
        userName={user?.name}
        onLogout={logout}
      />
      
      <div className="container mx-auto p-3 md:p-4 space-y-4 md:space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 h-auto p-1">
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
            <TabsTrigger value="novedades" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <Package className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Novedades</span>
              <span className="sm:hidden">Nov</span>
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

          <TabsContent value="novedades" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Registrar producto roto o dañado</h3>
              <Button 
                onClick={cleanupOldDamagedProductIncomes}
                variant="outline"
                size="sm"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              >
                🧹 Limpiar registros antiguos
              </Button>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!form.product || !form.quantity || !form.reason || !form.date) return;
                  addDamagedProduct({
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
              {filteredDamaged.length > 0 ? (
                <div className="mt-2">
                  <h3 className="font-semibold mb-2">Historial de productos dañados</h3>
                  <ul className="divide-y divide-gray-200">
                    {filteredDamaged.map((item, idx) => (
                      <li key={idx} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4">
                        <span className="font-medium">{item.product}</span>
                        <span className="text-sm">Cantidad: {item.quantity}</span>
                        <span className="text-sm">Motivo: {item.reason}</span>
                        <span className="text-xs text-gray-500">Fecha: {item.date}</span>
                        <button onClick={() => deleteDamagedProduct(idx)} className="ml-auto text-red-600 hover:underline text-xs">Eliminar</button>
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