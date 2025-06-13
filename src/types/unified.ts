// Tipos unificados para Firebase y localStorage
// Estos tipos reemplazan los tipos duplicados y resuelven inconsistencias

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
}

export interface Income extends BaseEntity {
  amount: number
  quantity: number
  date: string
  type: 'Venta Empleado' | 'Pedido Puerto López' | 'Pedido Puerto Gaitán' | 'Paca Villavicencio'
  product: 'Refresco' | 'Helado'
  employee?: 'César' | 'Yesid'
  description?: string
  userId?: string // Para Firebase
}

export interface Expense extends BaseEntity {
  name: string
  amount: number
  date: string
  category: 'Costos Fijos' | 'Materia Prima Directa' | 'Mano de Obra Directa' | 'Costos Indirectos de Fabricación' | 'Gastos Administrativos' | 'Gastos de Ventas' | 'Otros'
  type: string
  description?: string
  userId?: string // Para Firebase
}

export interface MaterialCost {
  name: string
  cost: number
}

export interface Production extends BaseEntity {
  date: string
  product: 'Refresco' | 'Helado'
  quantity: number
  materialCosts: MaterialCost[]
  directLaborCost: number
  indirectCosts: number
  totalCost: number
  costPerUnit: number
  userId?: string // Para Firebase
}

export interface Absence extends BaseEntity {
  employee: 'César' | 'Yesid'
  date: string
  reason?: string
  userId?: string // Para Firebase
}

export interface EmployeeCycle extends BaseEntity {
  employee: 'César' | 'Yesid'
  startDate: string
  endDate?: string
  isActive: boolean
  userId?: string // Para Firebase
}

export interface EmployeeCycleInfo {
  employee: 'César' | 'Yesid'
  cycleStartDate: string
}

export interface EmployeePerformance {
  employee: 'César' | 'Yesid'
  month: string
  totalSales: number
  salesDays: number
  absences: number
  bonusEligible: boolean
}

export interface EmployeeCyclePerformance {
  employee: 'César' | 'Yesid'
  cycleStartDate: string
  cycleEndDate?: string
  daysWorked: number
  totalSales: number
  absencesInCycle: number
  bonusEligible: boolean | 'PENDING'
  isComplete: boolean
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  tithe: number
  savings: number
  available: number
}

export interface ProductionSummary {
  totalProduced: number
  totalProductionCost: number
  averageCostPerUnit: number
  currentInventory: number
}

// Props para componentes
export interface DataMigrationProps {
  userId: string
  onMigrationComplete: () => void
}

// Tipos para formularios (sin id, createdAt, etc.)
export type IncomeFormData = Omit<Income, 'id' | 'createdAt' | 'updatedAt' | 'amount'>
export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
export type ProductionFormData = Omit<Production, 'id' | 'createdAt' | 'updatedAt' | 'totalCost' | 'costPerUnit'>
export type AbsenceFormData = Omit<Absence, 'id' | 'createdAt' | 'updatedAt'>
export type EmployeeCycleFormData = Omit<EmployeeCycle, 'id' | 'createdAt' | 'updatedAt'>

// Lista de materiales actualizada
export const MATERIAL_NAMES = [
  // Materiales para Refrescos
  'Leche x cantina (40litros)',
  'Leche x cantina (20 litros)',
  'Azucar x BULTO',
  'Azucar x kilo',
  'Maracuya',
  'Mora',
  'Esencia vainilla blanca *Galon',
  'Esencia de Chicle*500ml',
  'Esencia de Arequipe*500ml',
  'Esencia de Vainilla blanca levapan *500ml',
  'Esencia de Leche condensada *500ml',
  'Galletas oreo *12und',
  'CMC *500Gr',
  'Bolsas para empacar refrescos grandes',
  'Bolsa para empacar refrescos pequeños',
  'Colante azul',
  'Colorante pardo C11',
  'Bolsas para Fabricar refrescos grandes',
  'Bolsas para fabricar refrescos pequeños',
  
  // Materiales para Helados
  'Coco',
  'Mani entero',
  'Mani partido',
  'Crema de leche litro',
  'Mantequilla vegetal',
  'Taxi',
  'Bolsas de papel',
  'Arequipe',
  'Vasos para helados',
  'Bolsas para helados',
  'Palillos',
  'Uvas pasas',
  'Esencia de ron con pasas'
] as const

export type MaterialName = typeof MATERIAL_NAMES[number]

// Configuración de productos
export const PRODUCT_CONFIG = {
  Refresco: {
    price: 1000,
    materials: [
      'Leche x cantina (40litros)',
      'Leche x cantina (20 litros)',
      'Azucar x BULTO',
      'Azucar x kilo',
      'Maracuya',
      'Mora',
      'Esencia vainilla blanca *Galon',
      'Esencia de Chicle*500ml',
      'Esencia de Arequipe*500ml',
      'Esencia de Vainilla blanca levapan *500ml',
      'Esencia de Leche condensada *500ml',
      'Galletas oreo *12und',
      'CMC *500Gr',
      'Bolsas para empacar refrescos grandes',
      'Bolsa para empacar refrescos pequeños',
      'Colante azul',
      'Colorante pardo C11',
      'Bolsas para Fabricar refrescos grandes',
      'Bolsas para fabricar refrescos pequeños'
    ]
  },
  Helado: {
    price: 1800,
    materials: [
      'Leche x cantina (40litros)',
      'Leche x cantina (20 litros)',
      'Azucar x BULTO',
      'Azucar x kilo',
      'Coco',
      'Mani entero',
      'Mani partido',
      'Crema de leche litro',
      'Mantequilla vegetal',
      'Taxi',
      'Bolsas de papel',
      'Arequipe',
      'Vasos para helados',
      'Bolsas para helados',
      'Palillos',
      'Uvas pasas',
      'Esencia de vainilla blanca *Galon',
      'Esencia de ron con pasas'
    ]
  }
} as const

export type ProductType = keyof typeof PRODUCT_CONFIG

// Nuevos tipos para el sistema de bonos
export interface EmployeeBonus extends BaseEntity {
  employee: 'César' | 'Yesid'
  cycleStartDate: string
  cycleEndDate: string
  totalUnits: number
  totalRevenue: number
  workingDays: number
  absences: number
  averageUnitsPerDay: number
  bonusAmount: number
  isPaid: boolean
  paidDate?: string
  notes?: string
  userId?: string // Para Firebase
}

export interface EmployeeSalesDetail {
  date: string
  units: number
  revenue: number
  product: string
}

export interface EmployeeCycleDetail {
  employee: 'César' | 'Yesid'
  cycleStartDate: string
  cycleEndDate?: string
  daysWorked: number
  totalUnits: number
  totalRevenue: number
  absences: number
  salesByDate: EmployeeSalesDetail[]
  averageUnitsPerDay: number
  bonusEligible: boolean
  bonusAmount: number
  isComplete: boolean
} 