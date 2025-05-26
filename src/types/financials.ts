export interface IncomeItem {
  id: string;
  date: string;
  quantity: number;
  amount: number;
  type: 'Venta Empleado' | 'Pedido Puerto López' | 'Pedido Puerto Gaitán' | 'Paca Villavicencio';
  employee?: 'César' | 'Yesid';
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  category: 'Costos Fijos' | 'Materia Prima Directa' | 'Mano de Obra Directa' | 'Costos Indirectos de Fabricación' | 'Gastos Administrativos' | 'Gastos de Ventas' | 'Otros';
  type: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface MaterialCost {
  name: string;
  cost: number;
}

export interface ProductionItem {
  id: string;
  date: string;
  quantity: number;
  materialCosts: MaterialCost[];
  directLaborCost: number;
  indirectCosts: number;
  totalCost: number;
  costPerUnit: number;
  createdAt: string;
}

export interface AbsenceRecord {
  id: string;
  employee: 'César' | 'Yesid';
  date: string;
  reason?: string;
  createdAt: string;
}

export interface EmployeePerformance {
  employee: 'César' | 'Yesid';
  month: string;
  totalSales: number;
  salesDays: number;
  absences: number;
  bonusEligible: boolean;
}

export interface EmployeeCycleInfo {
  employee: 'César' | 'Yesid';
  cycleStartDate: string; // YYYY-MM-DD format
}

export interface EmployeeCyclePerformance {
  employee: 'César' | 'Yesid';
  cycleStartDate: string;
  cycleEndDate?: string; // Fecha cuando completó 30 días trabajados
  daysWorked: number; // Días únicos con ventas
  totalSales: number;
  absencesInCycle: number;
  bonusEligible: boolean | 'PENDING'; // PENDING si el ciclo no está completo
  isComplete: boolean; // true si ya completó 30 días trabajados
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  tithe: number;
  savings: number;
  available: number;
}

export interface ProductionSummary {
  totalProduced: number;
  totalProductionCost: number;
  averageCostPerUnit: number;
  currentInventory: number;
}

export const MATERIAL_NAMES = [
  'Azúcar',
  'Agua',
  'Colorante',
  'Saborizante',
  'Conservante',
  'Acidulante',
  'Edulcorante',
  'Vitaminas',
  'Minerales',
  'Envase plástico',
  'Tapa',
  'Etiqueta',
  'Pegamento',
  'Caja de cartón',
  'Plástico de empaque',
  'Gas para carbonatación',
  'Limpiador industrial',
  'Desinfectante',
  'Combustible'
] as const;

export type MaterialName = typeof MATERIAL_NAMES[number]; 