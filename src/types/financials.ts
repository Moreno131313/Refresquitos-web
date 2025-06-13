// Re-export unified types for backward compatibility
export type {
  Income as IncomeItem,
  Expense as ExpenseItem,
  Production as ProductionItem,
  Absence as AbsenceRecord,
  EmployeeCycle,
  EmployeeCycleInfo,
  EmployeePerformance,
  EmployeeCyclePerformance,
  FinancialSummary,
  ProductionSummary,
  MaterialCost,
  MaterialName
} from '@/types/unified'

export { MATERIAL_NAMES } from '@/types/unified'

// Import for use in legacy types
import type { MaterialCost } from '@/types/unified'

// Legacy types for backward compatibility (deprecated - use unified types instead)
export interface LegacyIncomeItem {
  id: string
  amount: number
  quantity: number
  date: string
  type: 'Venta Empleado' | 'Pedido Puerto López' | 'Pedido Puerto Gaitán' | 'Paca Villavicencio'
  employee?: 'César' | 'Yesid'
  createdAt: string
}

export interface LegacyExpenseItem {
  id: string
  name: string
  amount: number
  date: string
  category: 'Costos Fijos' | 'Materia Prima Directa' | 'Mano de Obra Directa' | 'Costos Indirectos de Fabricación' | 'Gastos Administrativos' | 'Gastos de Ventas' | 'Otros'
  type: string
  createdAt: string
}

export interface LegacyProductionItem {
  id: string
  date: string
  quantity: number
  materialCosts: MaterialCost[]
  directLaborCost: number
  indirectCosts: number
  totalCost: number
  costPerUnit: number
  createdAt: string
}

export interface LegacyAbsenceRecord {
  id: string
  employee: 'César' | 'Yesid'
  date: string
  reason?: string
  createdAt: string
} 