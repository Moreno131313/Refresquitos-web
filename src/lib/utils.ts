import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { APP_CONFIG, debugLog } from '@/config/app'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat(APP_CONFIG.business.locale, {
      style: 'currency',
      currency: APP_CONFIG.business.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  } catch (error) {
    debugLog('Error formatting currency:', error)
    return `${APP_CONFIG.business.currencySymbol}${amount.toLocaleString()}`
  }
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota'
  }

  return new Intl.DateTimeFormat(APP_CONFIG.business.locale, {
    ...defaultOptions,
    ...options
  }).format(dateObj)
}

function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month es 0-indexed
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
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

export function calculateWorkedDaysInCycle(
  incomes: any[], 
  employee: string, 
  cycleStartDate: string, 
  cycleEndDate?: string
): { daysWorked: number; actualEndDate?: string } {
  const startDate = createLocalDate(cycleStartDate)
  const endDate = cycleEndDate ? createLocalDate(cycleEndDate) : new Date()
  
  const employeeSales = incomes.filter(income => 
    income.employee === employee &&
    createLocalDate(income.date) >= startDate &&
    createLocalDate(income.date) <= endDate
  )
  
  const uniqueDays = new Set(employeeSales.map(sale => sale.date))
  const sortedDays = Array.from(uniqueDays).sort()
  
  const daysWorked = sortedDays.length
  
  let actualEndDate: string | undefined
  if (daysWorked >= 30) {
    actualEndDate = sortedDays[29]
  }
  
  return { daysWorked: Math.min(daysWorked, 30), actualEndDate }
}

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

export function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month es 0-indexed
  date.setDate(date.getDate() + days)
  
  const newYear = date.getFullYear()
  const newMonth = String(date.getMonth() + 1).padStart(2, '0')
  const newDay = String(date.getDate()).padStart(2, '0')
  
  return `${newYear}-${newMonth}-${newDay}`
}

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

export function getCurrentDateTime(): string {
  return new Date().toISOString()
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Hoy'
  if (diffInDays === 1) return 'Ayer'
  if (diffInDays < 7) return `Hace ${diffInDays} días`
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`
  return `Hace ${Math.floor(diffInDays / 365)} años`
}

export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffInMs = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24))
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat(APP_CONFIG.business.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

export function calculateProfitMargin(revenue: number, costs: number): number {
  if (revenue === 0) return 0
  return ((revenue - costs) / revenue) * 100
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value)
}

export function isValidDate(date: string): boolean {
  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime())
}

export function isNotEmpty(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export function generateShortId(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase()
}

export function generateRandomColor(): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => {
    const value = item[key]
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
}

export function saveToLocalStorage(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    debugLog(`Saved to localStorage: ${key}`)
    return true
  } catch (error) {
    debugLog(`Error saving to localStorage: ${key}`, error)
    return false
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item) as T
  } catch (error) {
    debugLog(`Error loading from localStorage: ${key}`, error)
    return defaultValue
  }
}

export function removeFromLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key)
    debugLog(`Removed from localStorage: ${key}`)
    return true
  } catch (error) {
    debugLog(`Error removing from localStorage: ${key}`, error)
    return false
  }
}

export function convertToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function handleError(error: unknown, context?: string): string {
  const message = error instanceof Error ? error.message : 'Error desconocido'
  const fullMessage = context ? `${context}: ${message}` : message
  
  debugLog('Error handled:', fullMessage, error)
  
  return fullMessage
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      debugLog(`Attempt ${attempt} failed:`, error)
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw lastError
} 