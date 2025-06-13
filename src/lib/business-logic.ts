// Lógica de Negocio - Refresquitos Manager
// Cálculo de costos, ganancias e inventario

import { 
  Income, 
  Production, 
  Expense,
  Absence,
  EmployeeCycleDetail,
  EmployeeSalesDetail,
  EmployeeBonus,
  PRODUCT_CONFIG
} from '@/types/unified'

// Constantes de negocio actualizadas
export const BUSINESS_CONFIG = {
  PRODUCTS: PRODUCT_CONFIG,
  CURRENCY: 'COP',
} as const

// Interfaz para el lote de inventario (FIFO)
export interface InventoryBatch {
  id: string
  productionDate: string
  quantity: number
  remainingQuantity: number
  costPerUnit: number
  totalCost: number
  product: 'Refresco' | 'Helado' // Agregado para separar por producto
}

// Interfaz para inventario separado por producto
export interface SeparateInventoryStatus {
  refrescos: {
    totalProduced: number
    totalSold: number
    currentInventory: number
    inventoryBatches: InventoryBatch[]
    totalInventoryValue: number
    averageCostInInventory: number
  }
  helados: {
    totalProduced: number
    totalSold: number
    currentInventory: number
    inventoryBatches: InventoryBatch[]
    totalInventoryValue: number
    averageCostInInventory: number
  }
  combined: {
    totalProduced: number
    totalSold: number
    currentInventory: number
    totalInventoryValue: number
    averageCostInInventory: number
  }
}

// Interfaz para el cálculo de ventas detallado
export interface SaleCalculation {
  saleId: string
  date: string
  quantitySold: number
  totalRevenue: number
  totalCost: number
  grossProfit: number
  grossProfitMargin: number
  batches: Array<{
    batchId: string
    quantityFromBatch: number
    costPerUnit: number
    subtotalCost: number
  }>
}

// Interfaz para resumen financiero mejorado
export interface EnhancedFinancialSummary {
  // Ingresos
  totalRevenue: number
  
  // Costos
  totalCostOfGoodsSold: number // COGS
  grossProfit: number
  grossProfitMargin: number
  
  // Gastos operativos
  operatingExpenses: number
  netProfit: number
  netProfitMargin: number
  
  // Distribución
  tithe: number
  savings: number
  available: number
  
  // Inventario
  currentInventoryValue: number
  averageCostPerUnit: number
}

// Función para obtener el precio de un producto
export function getProductPrice(product: 'Refresco' | 'Helado'): number {
  if (!product) {
    console.warn('getProductPrice: product is undefined, defaulting to Refresco')
    return BUSINESS_CONFIG.PRODUCTS.Refresco.price
  }
  
  const productConfig = BUSINESS_CONFIG.PRODUCTS[product]
  if (!productConfig) {
    console.warn(`getProductPrice: No config found for product "${product}", defaulting to Refresco`)
    return BUSINESS_CONFIG.PRODUCTS.Refresco.price
  }
  
  return productConfig.price
}

/**
 * Convierte producciones en lotes de inventario ordenados por fecha (FIFO)
 */
export function createInventoryBatches(productions: Production[]): InventoryBatch[] {
  return productions
    .map(prod => ({
      id: prod.id,
      productionDate: prod.date,
      quantity: prod.quantity,
      remainingQuantity: prod.quantity,
      costPerUnit: prod.costPerUnit,
      totalCost: prod.totalCost,
      product: prod.product as 'Refresco' | 'Helado'
    }))
    .sort((a, b) => new Date(a.productionDate).getTime() - new Date(b.productionDate).getTime())
}

/**
 * Calcula el costo de una venta usando método FIFO
 */
export function calculateSaleCost(
  sale: Income,
  availableBatches: InventoryBatch[]
): SaleCalculation {
  let quantityToSell = sale.quantity
  let totalCost = 0
  const usedBatches: SaleCalculation['batches'] = []
  
  // Crear copia de lotes para no mutar el original
  const batchesCopy = availableBatches.map(batch => ({ ...batch }))
  
  for (const batch of batchesCopy) {
    if (quantityToSell <= 0) break
    
    const quantityFromThisBatch = Math.min(quantityToSell, batch.remainingQuantity)
    const subtotalCost = quantityFromThisBatch * batch.costPerUnit
    
    if (quantityFromThisBatch > 0) {
      usedBatches.push({
        batchId: batch.id,
        quantityFromBatch: quantityFromThisBatch,
        costPerUnit: batch.costPerUnit,
        subtotalCost
      })
      
      totalCost += subtotalCost
      batch.remainingQuantity -= quantityFromThisBatch
      quantityToSell -= quantityFromThisBatch
    }
  }
  
  // Asegurar que el producto tenga un valor válido
  const productType = sale.product || 'Refresco'
  const totalRevenue = sale.quantity * getProductPrice(productType as 'Refresco' | 'Helado')
  const grossProfit = totalRevenue - totalCost
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
  
  return {
    saleId: sale.id,
    date: sale.date,
    quantitySold: sale.quantity,
    totalRevenue,
    totalCost,
    grossProfit,
    grossProfitMargin,
    batches: usedBatches
  }
}

/**
 * Procesa todas las ventas con método FIFO y calcula costos reales
 */
export function processAllSales(
  productions: Production[],
  incomes: Income[]
): {
  salesCalculations: SaleCalculation[]
  finalInventoryBatches: InventoryBatch[]
  totalCOGS: number
  totalGrossProfit: number
} {
  // Crear lotes de inventario
  const inventoryBatches = createInventoryBatches(productions)
  
  // Ordenar ventas por fecha
  const sortedIncomes = [...incomes].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  const salesCalculations: SaleCalculation[] = []
  let totalCOGS = 0
  let totalGrossProfit = 0
  
  // Procesar cada venta
  for (const sale of sortedIncomes) {
    const saleCalculation = calculateSaleCost(sale, inventoryBatches)
    salesCalculations.push(saleCalculation)
    totalCOGS += saleCalculation.totalCost
    totalGrossProfit += saleCalculation.grossProfit
    
    // Actualizar lotes de inventario restando las cantidades vendidas
    for (const usedBatch of saleCalculation.batches) {
      const batch = inventoryBatches.find(b => b.id === usedBatch.batchId)
      if (batch) {
        batch.remainingQuantity -= usedBatch.quantityFromBatch
      }
    }
  }
  
  return {
    salesCalculations,
    finalInventoryBatches: inventoryBatches,
    totalCOGS,
    totalGrossProfit
  }
}

/**
 * Calcula el resumen financiero mejorado con COGS real
 */
export function calculateEnhancedFinancialSummary(
  productions: Production[],
  incomes: Income[],
  expenses: Expense[]
): EnhancedFinancialSummary {
  // Procesar todas las ventas con FIFO
  const { totalCOGS, totalGrossProfit, finalInventoryBatches } = processAllSales(productions, incomes)
  
  // Calcular totales
  const totalRevenue = incomes.reduce((sum, income) => sum + income.amount, 0)
  const grossProfit = totalGrossProfit
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
  
  // Gastos operativos (excluyendo costos de producción que ya están en COGS)
  const operatingExpenses = expenses
    .filter(expense => 
      expense.category !== 'Materia Prima Directa' && 
      expense.category !== 'Mano de Obra Directa' &&
      expense.category !== 'Costos Indirectos de Fabricación'
    )
    .reduce((sum, expense) => sum + expense.amount, 0)
  
  const netProfit = grossProfit - operatingExpenses
  const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  
  // Distribución
  const tithe = Math.max(0, netProfit * 0.1)
  const savings = Math.max(0, netProfit * 0.2)
  const available = netProfit - tithe - savings
  
  // Valor del inventario actual
  const currentInventoryValue = finalInventoryBatches.reduce(
    (sum, batch) => sum + (batch.remainingQuantity * batch.costPerUnit), 0
  )
  
  // Costo promedio ponderado
  const totalProduced = productions.reduce((sum, prod) => sum + prod.quantity, 0)
  const totalProductionCost = productions.reduce((sum, prod) => sum + prod.totalCost, 0)
  const averageCostPerUnit = totalProduced > 0 ? totalProductionCost / totalProduced : 0
  
  return {
    totalRevenue,
    totalCostOfGoodsSold: totalCOGS,
    grossProfit,
    grossProfitMargin,
    operatingExpenses,
    netProfit,
    netProfitMargin,
    tithe,
    savings,
    available,
    currentInventoryValue,
    averageCostPerUnit
  }
}

/**
 * Obtiene información detallada del inventario actual
 */
export function getCurrentInventoryStatus(
  productions: Production[],
  incomes: Income[]
): {
  totalProduced: number
  totalSold: number
  currentInventory: number
  inventoryBatches: InventoryBatch[]
  totalInventoryValue: number
  averageCostInInventory: number
} {
  const { finalInventoryBatches } = processAllSales(productions, incomes)
  
  const totalProduced = productions.reduce((sum, prod) => sum + prod.quantity, 0)
  const totalSold = incomes.reduce((sum, income) => sum + income.quantity, 0)
  const currentInventory = finalInventoryBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0)
  
  const totalInventoryValue = finalInventoryBatches.reduce(
    (sum, batch) => sum + (batch.remainingQuantity * batch.costPerUnit), 0
  )
  
  const averageCostInInventory = currentInventory > 0 ? totalInventoryValue / currentInventory : 0
  
  return {
    totalProduced,
    totalSold,
    currentInventory,
    inventoryBatches: finalInventoryBatches.filter(batch => batch.remainingQuantity > 0),
    totalInventoryValue,
    averageCostInInventory
  }
}

/**
 * Obtiene información detallada del inventario separado por producto
 */
export function getSeparateInventoryStatus(
  productions: Production[],
  incomes: Income[]
): SeparateInventoryStatus {
  // Separar producciones por producto
  const refrescoProductions = productions.filter(p => p.product === 'Refresco')
  const heladoProductions = productions.filter(p => p.product === 'Helado')
  
  // Separar ventas por producto
  const refrescoSales = incomes.filter(i => i.product === 'Refresco')
  const heladoSales = incomes.filter(i => i.product === 'Helado')
  
  // Calcular inventario de refrescos
  const refrescoInventory = getCurrentInventoryStatus(refrescoProductions, refrescoSales)
  
  // Calcular inventario de helados
  const heladoInventory = getCurrentInventoryStatus(heladoProductions, heladoSales)
  
  // Calcular totales combinados
  const combinedTotalProduced = refrescoInventory.totalProduced + heladoInventory.totalProduced
  const combinedTotalSold = refrescoInventory.totalSold + heladoInventory.totalSold
  const combinedCurrentInventory = refrescoInventory.currentInventory + heladoInventory.currentInventory
  const combinedTotalInventoryValue = refrescoInventory.totalInventoryValue + heladoInventory.totalInventoryValue
  const combinedAverageCostInInventory = combinedCurrentInventory > 0 ? 
    combinedTotalInventoryValue / combinedCurrentInventory : 0
  
  return {
    refrescos: {
      totalProduced: refrescoInventory.totalProduced,
      totalSold: refrescoInventory.totalSold,
      currentInventory: refrescoInventory.currentInventory,
      inventoryBatches: refrescoInventory.inventoryBatches,
      totalInventoryValue: refrescoInventory.totalInventoryValue,
      averageCostInInventory: refrescoInventory.averageCostInInventory
    },
    helados: {
      totalProduced: heladoInventory.totalProduced,
      totalSold: heladoInventory.totalSold,
      currentInventory: heladoInventory.currentInventory,
      inventoryBatches: heladoInventory.inventoryBatches,
      totalInventoryValue: heladoInventory.totalInventoryValue,
      averageCostInInventory: heladoInventory.averageCostInInventory
    },
    combined: {
      totalProduced: combinedTotalProduced,
      totalSold: combinedTotalSold,
      currentInventory: combinedCurrentInventory,
      totalInventoryValue: combinedTotalInventoryValue,
      averageCostInInventory: combinedAverageCostInInventory
    }
  }
}

/**
 * Calcula la rentabilidad potencial de una venta para un producto específico
 */
export function calculatePotentialSaleByProduct(
  quantity: number,
  product: 'Refresco' | 'Helado',
  productions: Production[],
  incomes: Income[]
): {
  canSell: boolean
  revenue: number
  estimatedCost: number
  estimatedProfit: number
  profitMargin: number
  inventoryAfterSale: number
} {
  // Filtrar por producto específico
  const productProductions = productions.filter(p => p.product === product)
  const productSales = incomes.filter(i => i.product === product)
  
  const inventoryStatus = getCurrentInventoryStatus(productProductions, productSales)
  const canSell = quantity <= inventoryStatus.currentInventory
  
  const revenue = quantity * getProductPrice(product)
  
  // Simular venta para calcular costo real
  const simulatedSale: Income = {
    id: 'temp',
    amount: revenue,
    quantity,
    date: new Date().toISOString(),
    type: 'Venta Empleado',
    product: product,
    createdAt: new Date().toISOString()
  }
  
  const costCalculation = calculateSaleCost(simulatedSale, inventoryStatus.inventoryBatches)
  const estimatedCost = costCalculation.totalCost
  const estimatedProfit = revenue - estimatedCost
  const profitMargin = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0
  
  return {
    canSell,
    revenue,
    estimatedCost,
    estimatedProfit,
    profitMargin,
    inventoryAfterSale: inventoryStatus.currentInventory - quantity
  }
}

// ===== SISTEMA DE BONOS DE EMPLEADOS =====

/**
 * Calcula el detalle completo del ciclo de un empleado
 */
export function calculateEmployeeCycleDetail(
  employee: 'César' | 'Yesid',
  cycleStartDate: string,
  incomes: Income[],
  absences: Absence[],
  cycleEndDate?: string
): EmployeeCycleDetail {
  const startDate = new Date(cycleStartDate)
  const endDate = cycleEndDate ? new Date(cycleEndDate) : new Date()
  
  // Filtrar ventas del empleado en el período
  const employeeSales = incomes.filter(income => 
    income.employee === employee &&
    new Date(income.date) >= startDate &&
    new Date(income.date) <= endDate
  )
  
  // Agrupar ventas por fecha
  const salesByDate: EmployeeSalesDetail[] = []
  const salesMap = new Map<string, { units: number; revenue: number; types: Set<string> }>()
  
  employeeSales.forEach(sale => {
    const date = sale.date
    const existing = salesMap.get(date) || { units: 0, revenue: 0, types: new Set() }
    existing.units += sale.quantity
    existing.revenue += sale.amount
    existing.types.add(sale.product)
    salesMap.set(date, existing)
  })
  
  // Convertir a array y ordenar por fecha
  salesMap.forEach((data, date) => {
    salesByDate.push({
      date,
      units: data.units,
      revenue: data.revenue,
      product: Array.from(data.types).join(', ')
    })
  })
  
  salesByDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Calcular métricas
  const daysWorked = salesByDate.length
  const totalUnits = salesByDate.reduce((sum, day) => sum + day.units, 0)
  const totalRevenue = salesByDate.reduce((sum, day) => sum + day.revenue, 0)
  
  // Contar ausencias en el período
  const employeeAbsences = absences.filter(absence =>
    absence.employee === employee &&
    new Date(absence.date) >= startDate &&
    new Date(absence.date) <= endDate
  ).length
  
  // Determinar si el ciclo está completo (30 días trabajados)
  const isComplete = daysWorked >= 30
  
  // Calcular promedio de unidades por día
  const averageUnitsPerDay = daysWorked > 0 ? totalUnits / Math.min(daysWorked, 30) : 0
  
  // Determinar elegibilidad para bono (basado solo en ausencias)
  const bonusEligible = employeeAbsences <= 4
  
  // Calcular monto del bono (solo si está completo Y es elegible)
  const bonusAmount = (isComplete && bonusEligible) ? Math.round(averageUnitsPerDay * 1000) : 0
  
  return {
    employee,
    cycleStartDate,
    cycleEndDate: isComplete && salesByDate.length >= 30 ? salesByDate[29].date : undefined,
    daysWorked: Math.min(daysWorked, 30),
    totalUnits,
    totalRevenue,
    absences: employeeAbsences,
    salesByDate,
    averageUnitsPerDay,
    bonusEligible,
    bonusAmount,
    isComplete
  }
}

/**
 * Genera un bono para un empleado cuando completa su ciclo
 */
export function generateEmployeeBonus(
  cycleDetail: EmployeeCycleDetail
): EmployeeBonus | null {
  // Solo generar bono si está completo (30 días) Y es elegible (máximo 4 ausencias)
  if (!cycleDetail.isComplete || !cycleDetail.bonusEligible || !cycleDetail.cycleEndDate) {
    return null
  }
  
  return {
    id: `bonus-${cycleDetail.employee}-${cycleDetail.cycleStartDate}`,
    employee: cycleDetail.employee,
    cycleStartDate: cycleDetail.cycleStartDate,
    cycleEndDate: cycleDetail.cycleEndDate,
    totalUnits: cycleDetail.totalUnits,
    totalRevenue: cycleDetail.totalRevenue,
    workingDays: cycleDetail.daysWorked,
    absences: cycleDetail.absences,
    averageUnitsPerDay: cycleDetail.averageUnitsPerDay,
    bonusAmount: cycleDetail.bonusAmount,
    isPaid: false,
    createdAt: new Date().toISOString()
  }
}

/**
 * Calcula el historial de ventas de un empleado por períodos
 */
export function getEmployeeSalesHistory(
  employee: 'César' | 'Yesid',
  incomes: Income[],
  periodDays: number = 30
): Array<{
  period: string
  startDate: string
  endDate: string
  totalUnits: number
  totalRevenue: number
  daysWorked: number
  averageUnitsPerDay: number
}> {
  const employeeSales = incomes
    .filter(income => income.employee === employee)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  if (employeeSales.length === 0) return []
  
  const periods: Array<{
    period: string
    startDate: string
    endDate: string
    totalUnits: number
    totalRevenue: number
    daysWorked: number
    averageUnitsPerDay: number
  }> = []
  
  // Agrupar por períodos de 30 días
  const firstSaleDate = new Date(employeeSales[0].date)
  let currentPeriodStart = new Date(firstSaleDate)
  
  while (currentPeriodStart <= new Date()) {
    const currentPeriodEnd = new Date(currentPeriodStart)
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + periodDays - 1)
    
    const periodSales = employeeSales.filter(sale => {
      const saleDate = new Date(sale.date)
      return saleDate >= currentPeriodStart && saleDate <= currentPeriodEnd
    })
    
    if (periodSales.length > 0) {
      const uniqueDays = new Set(periodSales.map(sale => sale.date))
      const totalUnits = periodSales.reduce((sum, sale) => sum + sale.quantity, 0)
      const totalRevenue = periodSales.reduce((sum, sale) => sum + sale.amount, 0)
      const daysWorked = uniqueDays.size
      const averageUnitsPerDay = daysWorked > 0 ? totalUnits / daysWorked : 0
      
      periods.push({
        period: `${currentPeriodStart.toISOString().split('T')[0]} - ${currentPeriodEnd.toISOString().split('T')[0]}`,
        startDate: currentPeriodStart.toISOString().split('T')[0],
        endDate: currentPeriodEnd.toISOString().split('T')[0],
        totalUnits,
        totalRevenue,
        daysWorked,
        averageUnitsPerDay
      })
    }
    
    // Avanzar al siguiente período
    currentPeriodStart.setDate(currentPeriodStart.getDate() + periodDays)
  }
  
  return periods.reverse() // Más reciente primero
} 