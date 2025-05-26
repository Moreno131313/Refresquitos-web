import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  // Usar createLocalDate para evitar problemas de zona horaria
  const localDate = createLocalDate(date);
  return localDate.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Función para crear fecha local desde string YYYY-MM-DD
function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month es 0-indexed
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthName(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
}

// Función para calcular días trabajados en un ciclo
export function calculateWorkedDaysInCycle(
  incomes: any[], 
  employee: string, 
  cycleStartDate: string, 
  cycleEndDate?: string
): { daysWorked: number; actualEndDate?: string } {
  const startDate = createLocalDate(cycleStartDate)
  const endDate = cycleEndDate ? createLocalDate(cycleEndDate) : new Date()
  
  // Filtrar ventas del empleado en el rango de fechas
  const employeeSales = incomes.filter(income => 
    income.employee === employee &&
    createLocalDate(income.date) >= startDate &&
    createLocalDate(income.date) <= endDate
  )
  
  // Obtener días únicos con ventas
  const uniqueDays = new Set(employeeSales.map(sale => sale.date))
  const sortedDays = Array.from(uniqueDays).sort()
  
  const daysWorked = sortedDays.length
  
  // Si ya completó 30 días trabajados, encontrar la fecha del día 30
  let actualEndDate: string | undefined
  if (daysWorked >= 30) {
    actualEndDate = sortedDays[29] // El día 30 (índice 29)
  }
  
  return { daysWorked: Math.min(daysWorked, 30), actualEndDate }
}

// Función para calcular ausencias en un ciclo
export function calculateAbsencesInCycle(
  absences: any[], 
  employee: string, 
  cycleStartDate: string, 
  cycleEndDate?: string
): number {
  const startDate = createLocalDate(cycleStartDate)
  const endDate = cycleEndDate ? createLocalDate(cycleEndDate) : new Date()
  
  return absences.filter(absence => 
    absence.employee === employee &&
    createLocalDate(absence.date) >= startDate &&
    createLocalDate(absence.date) <= endDate
  ).length
}

// Función para calcular ventas totales en un ciclo
export function calculateSalesInCycle(
  incomes: any[], 
  employee: string, 
  cycleStartDate: string, 
  cycleEndDate?: string
): number {
  const startDate = createLocalDate(cycleStartDate)
  const endDate = cycleEndDate ? createLocalDate(cycleEndDate) : new Date()
  
  return incomes
    .filter(income => 
      income.employee === employee &&
      createLocalDate(income.date) >= startDate &&
      createLocalDate(income.date) <= endDate
    )
    .reduce((sum, income) => sum + income.amount, 0)
}

// Función para agregar días a una fecha
export function addDays(dateString: string, days: number): string {
  // Crear fecha usando los componentes para evitar problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month es 0-indexed
  date.setDate(date.getDate() + days)
  
  // Formatear manualmente para evitar problemas de zona horaria
  const newYear = date.getFullYear()
  const newMonth = String(date.getMonth() + 1).padStart(2, '0')
  const newDay = String(date.getDate()).padStart(2, '0')
  
  return `${newYear}-${newMonth}-${newDay}`
}

// Función de prueba para verificar el manejo de fechas
export function testDateHandling(dateString: string): { 
  original: string, 
  addOne: string, 
  formatted: string 
} {
  console.log('Testing date handling for:', dateString)
  const addedOne = addDays(dateString, 1)
  const formatted = formatDate(dateString)
  
  console.log('Original:', dateString)
  console.log('Add 1 day:', addedOne)
  console.log('Formatted:', formatted)
  
  return {
    original: dateString,
    addOne: addedOne,
    formatted: formatted
  }
} 