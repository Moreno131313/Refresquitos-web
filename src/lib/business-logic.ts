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
  product: 'Refresco' | 'Helado' | 'Paca' // Agregado para separar por producto
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
  pacas: {
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

// Interface para análisis financiero separado por producto
export interface SeparateFinancialAnalysis {
  refrescos: {
    totalRevenue: number
    totalCOGS: number
    grossProfit: number
    grossProfitMargin: number
    unitsSold: number
    averageRevenuePerUnit: number
    averageCostPerUnit: number
    averageProfitPerUnit: number
  }
  helados: {
    totalRevenue: number
    totalCOGS: number
    grossProfit: number
    grossProfitMargin: number
    unitsSold: number
    averageRevenuePerUnit: number
    averageCostPerUnit: number
    averageProfitPerUnit: number
  }
  pacas: {
    totalRevenue: number
    totalCOGS: number
    grossProfit: number
    grossProfitMargin: number
    unitsSold: number
    averageRevenuePerUnit: number
    averageCostPerUnit: number
    averageProfitPerUnit: number
  }
  combined: {
    totalRevenue: number
    totalCOGS: number
    grossProfit: number
    grossProfitMargin: number
    totalUnitsSold: number
    operatingExpenses: number
    netProfit: number
    netProfitMargin: number
    tithe: number
    savings: number
    available: number
  }
}

// Función para obtener el precio de un producto
export function getProductPrice(product: 'Refresco' | 'Helado' | 'Paca'): number {
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
      product: prod.product as 'Refresco' | 'Helado' | 'Paca'
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
  const totalRevenue = sale.quantity * getProductPrice(productType as 'Refresco' | 'Helado' | 'Paca')
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
 * Calcula el costo de una venta usando método FIFO separado por producto
 */
export function calculateSaleCostByProduct(
  sale: Income,
  availableBatches: InventoryBatch[]
): SaleCalculation {
  let quantityToSell = sale.quantity
  let totalCost = 0
  const usedBatches: SaleCalculation['batches'] = []
  
  // Obtener el producto de la venta
  const saleProduct = sale.product || 'Refresco'
  
  // Filtrar lotes solo del producto que se está vendiendo
  const productBatches = availableBatches.filter(batch => batch.product === saleProduct)
  
  // Crear copia de lotes para no mutar el original
  const batchesCopy = productBatches.map(batch => ({ ...batch }))
  
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
  
  // Si no hay suficiente inventario del producto específico, usar costo promedio
  if (quantityToSell > 0) {
    const avgCost = productBatches.length > 0 
      ? productBatches.reduce((sum: number, batch: InventoryBatch) => sum + batch.costPerUnit, 0) / productBatches.length
      : 0
    totalCost += quantityToSell * avgCost
  }
  
  const productType = saleProduct as 'Refresco' | 'Helado' | 'Paca'
  const totalRevenue = sale.quantity * getProductPrice(productType)
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
 * Procesa todas las ventas con método FIFO separado por producto
 */
export function processAllSalesByProduct(
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
    const saleCalculation = calculateSaleCostByProduct(sale, inventoryBatches)
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
    (sum: number, batch: InventoryBatch) => sum + (batch.remainingQuantity * batch.costPerUnit), 0
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
  // Separar por producto
  const refrescoProductions = productions.filter(p => p.product === 'Refresco')
  const heladoProductions = productions.filter(p => p.product === 'Helado')
  const pacaProductions = productions.filter(p => p.product === 'Paca')
  
  const refrescoSales = incomes.filter(i => i.product === 'Refresco')
  const heladoSales = incomes.filter(i => i.product === 'Helado')
  const pacaSales = incomes.filter(i => i.product === 'Paca')
  
  // Calcular inventario para cada producto
  const refrescoInventory = getCurrentInventoryStatus(refrescoProductions, refrescoSales)
  const heladoInventory = getCurrentInventoryStatus(heladoProductions, heladoSales)
  const pacaInventory = getCurrentInventoryStatus(pacaProductions, pacaSales)
  
  // Calcular totales combinados
  const combinedTotalProduced = refrescoInventory.totalProduced + heladoInventory.totalProduced + pacaInventory.totalProduced
  const combinedTotalSold = refrescoInventory.totalSold + heladoInventory.totalSold + pacaInventory.totalSold
  const combinedCurrentInventory = refrescoInventory.currentInventory + heladoInventory.currentInventory + pacaInventory.currentInventory
  const combinedTotalInventoryValue = refrescoInventory.totalInventoryValue + heladoInventory.totalInventoryValue + pacaInventory.totalInventoryValue
  const combinedAverageCostInInventory = combinedCurrentInventory > 0 ? combinedTotalInventoryValue / combinedCurrentInventory : 0
  
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
    pacas: {
      totalProduced: pacaInventory.totalProduced,
      totalSold: pacaInventory.totalSold,
      currentInventory: pacaInventory.currentInventory,
      inventoryBatches: pacaInventory.inventoryBatches,
      totalInventoryValue: pacaInventory.totalInventoryValue,
      averageCostInInventory: pacaInventory.averageCostInInventory
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
  product: 'Refresco' | 'Helado' | 'Paca',
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

/**
 * Calcula análisis financiero separado por producto
 */
export function calculateSeparateFinancialAnalysis(
  productions: Production[],
  incomes: Income[],
  expenses: Expense[]
): SeparateFinancialAnalysis {
  // Separar producciones por producto
  const refrescoProductions = productions.filter(p => p.product === 'Refresco')
  const heladoProductions = productions.filter(p => p.product === 'Helado')
  const pacaProductions = productions.filter(p => p.product === 'Paca')
  
  // Separar ventas por producto
  const refrescoSales = incomes.filter(i => i.product === 'Refresco')
  const heladoSales = incomes.filter(i => i.product === 'Helado')
  const pacaSales = incomes.filter(i => i.product === 'Paca')
  
  // Procesar ventas de refrescos
  const refrescoAnalysis = processAllSalesByProduct(refrescoProductions, refrescoSales)
  const refrescoRevenue = refrescoSales.reduce((sum, sale) => sum + sale.amount, 0)
  const refrescoUnitsSold = refrescoSales.reduce((sum, sale) => sum + sale.quantity, 0)
  
  // Procesar ventas de helados
  const heladoAnalysis = processAllSalesByProduct(heladoProductions, heladoSales)
  const heladoRevenue = heladoSales.reduce((sum, sale) => sum + sale.amount, 0)
  const heladoUnitsSold = heladoSales.reduce((sum, sale) => sum + sale.quantity, 0)
  
  // Procesar ventas de pacas
  const pacaAnalysis = processAllSalesByProduct(pacaProductions, pacaSales)
  const pacaRevenue = pacaSales.reduce((sum, sale) => sum + sale.amount, 0)
  const pacaUnitsSold = pacaSales.reduce((sum, sale) => sum + sale.quantity, 0)
  
  // Calcular métricas de refrescos
  const refrescoGrossProfit = refrescoAnalysis.totalGrossProfit
  const refrescoGrossProfitMargin = refrescoRevenue > 0 ? (refrescoGrossProfit / refrescoRevenue) * 100 : 0
  const refrescoAvgRevenuePerUnit = refrescoUnitsSold > 0 ? refrescoRevenue / refrescoUnitsSold : 0
  const refrescoAvgCostPerUnit = refrescoUnitsSold > 0 ? refrescoAnalysis.totalCOGS / refrescoUnitsSold : 0
  const refrescoAvgProfitPerUnit = refrescoUnitsSold > 0 ? refrescoGrossProfit / refrescoUnitsSold : 0
  
  // Calcular métricas de helados
  const heladoGrossProfit = heladoAnalysis.totalGrossProfit
  const heladoGrossProfitMargin = heladoRevenue > 0 ? (heladoGrossProfit / heladoRevenue) * 100 : 0
  const heladoAvgRevenuePerUnit = heladoUnitsSold > 0 ? heladoRevenue / heladoUnitsSold : 0
  const heladoAvgCostPerUnit = heladoUnitsSold > 0 ? heladoAnalysis.totalCOGS / heladoUnitsSold : 0
  const heladoAvgProfitPerUnit = heladoUnitsSold > 0 ? heladoGrossProfit / heladoUnitsSold : 0
  
  // Calcular métricas de pacas
  const pacaGrossProfit = pacaAnalysis.totalGrossProfit
  const pacaGrossProfitMargin = pacaRevenue > 0 ? (pacaGrossProfit / pacaRevenue) * 100 : 0
  const pacaAvgRevenuePerUnit = pacaUnitsSold > 0 ? pacaRevenue / pacaUnitsSold : 0
  const pacaAvgCostPerUnit = pacaUnitsSold > 0 ? pacaAnalysis.totalCOGS / pacaUnitsSold : 0
  const pacaAvgProfitPerUnit = pacaUnitsSold > 0 ? pacaGrossProfit / pacaUnitsSold : 0
  
  // Calcular totales combinados
  const combinedRevenue = refrescoRevenue + heladoRevenue + pacaRevenue
  const combinedCOGS = refrescoAnalysis.totalCOGS + heladoAnalysis.totalCOGS + pacaAnalysis.totalCOGS
  const combinedGrossProfit = refrescoGrossProfit + heladoGrossProfit + pacaGrossProfit
  const combinedGrossProfitMargin = combinedRevenue > 0 ? (combinedGrossProfit / combinedRevenue) * 100 : 0
  const combinedUnitsSold = refrescoUnitsSold + heladoUnitsSold + pacaUnitsSold
  
  // Calcular gastos operativos (excluir costos directos de fabricación)
  const operatingExpenses = expenses
    .filter(expense => 
      expense.category !== 'Materia Prima Directa' && 
      expense.category !== 'Mano de Obra Directa' &&
      expense.category !== 'Costos Indirectos de Fabricación'
    )
    .reduce((sum, expense) => sum + expense.amount, 0)
  
  const netProfit = combinedGrossProfit - operatingExpenses
  const netProfitMargin = combinedRevenue > 0 ? (netProfit / combinedRevenue) * 100 : 0
  
  // Calcular distribución (diezmo, ahorro, disponible)
  const tithe = netProfit * 0.1 // 10% diezmo
  const savings = netProfit * 0.2 // 20% ahorro
  const available = netProfit - tithe - savings // Resto disponible
  
  return {
    refrescos: {
      totalRevenue: refrescoRevenue,
      totalCOGS: refrescoAnalysis.totalCOGS,
      grossProfit: refrescoGrossProfit,
      grossProfitMargin: refrescoGrossProfitMargin,
      unitsSold: refrescoUnitsSold,
      averageRevenuePerUnit: refrescoAvgRevenuePerUnit,
      averageCostPerUnit: refrescoAvgCostPerUnit,
      averageProfitPerUnit: refrescoAvgProfitPerUnit
    },
    helados: {
      totalRevenue: heladoRevenue,
      totalCOGS: heladoAnalysis.totalCOGS,
      grossProfit: heladoGrossProfit,
      grossProfitMargin: heladoGrossProfitMargin,
      unitsSold: heladoUnitsSold,
      averageRevenuePerUnit: heladoAvgRevenuePerUnit,
      averageCostPerUnit: heladoAvgCostPerUnit,
      averageProfitPerUnit: heladoAvgProfitPerUnit
    },
    pacas: {
      totalRevenue: pacaRevenue,
      totalCOGS: pacaAnalysis.totalCOGS,
      grossProfit: pacaGrossProfit,
      grossProfitMargin: pacaGrossProfitMargin,
      unitsSold: pacaUnitsSold,
      averageRevenuePerUnit: pacaAvgRevenuePerUnit,
      averageCostPerUnit: pacaAvgCostPerUnit,
      averageProfitPerUnit: pacaAvgProfitPerUnit
    },
    combined: {
      totalRevenue: combinedRevenue,
      totalCOGS: combinedCOGS,
      grossProfit: combinedGrossProfit,
      grossProfitMargin: combinedGrossProfitMargin,
      totalUnitsSold: combinedUnitsSold,
      operatingExpenses,
      netProfit,
      netProfitMargin,
      tithe,
      savings,
      available
    }
  }
}

// ===== SISTEMA DE ANÁLISIS TEMPORAL =====

/**
 * Interface para análisis de un período específico
 */
export interface PeriodAnalysis {
  period: string
  startDate: string
  endDate: string
  totalRevenue: number
  totalCOGS: number
  grossProfit: number
  grossProfitMargin: number
  operatingExpenses: number
  netProfit: number
  netProfitMargin: number
  unitsSold: number
  salesDays: number
  averageRevenuePerDay: number
  averageUnitsPerDay: number
  refrescos: {
    revenue: number
    units: number
    cogs: number
    grossProfit: number
  }
  helados: {
    revenue: number
    units: number
    cogs: number
    grossProfit: number
  }
  pacas: {
    revenue: number
    units: number
    cogs: number
    grossProfit: number
  }
}

/**
 * Interface para análisis anual
 */
export interface AnnualAnalysis {
  year: number
  monthlyBreakdown: PeriodAnalysis[]
  yearlyTotals: {
    totalRevenue: number
    totalCOGS: number
    grossProfit: number
    grossProfitMargin: number
    operatingExpenses: number
    netProfit: number
    netProfitMargin: number
    totalUnitsSold: number
    salesDays: number
    averageRevenuePerMonth: number
    averageUnitsPerMonth: number
    bestMonth: string
    worstMonth: string
    growthTrend: 'CRECIENTE' | 'ESTABLE' | 'DECRECIENTE'
  }
  productBreakdown: {
    refrescos: {
      totalRevenue: number
      totalUnits: number
      totalCOGS: number
      grossProfit: number
      percentage: number
    }
    helados: {
      totalRevenue: number
      totalUnits: number
      totalCOGS: number
      grossProfit: number
      percentage: number
    }
    pacas: {
      totalRevenue: number
      totalUnits: number
      totalCOGS: number
      grossProfit: number
      percentage: number
    }
  }
}

/**
 * Filtra datos por rango de fechas
 */
function filterDataByDateRange<T extends { date: string }>(
  data: T[],
  startDate: string,
  endDate: string
): T[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999) // Incluir todo el día final
  
  return data.filter(item => {
    const itemDate = new Date(item.date)
    return itemDate >= start && itemDate <= end
  })
}

/**
 * Genera análisis de un período específico (mes específico o rango de fechas)
 */
export function generatePeriodAnalysis(
  startDate: string,
  endDate: string,
  productions: Production[],
  incomes: Income[],
  expenses: Expense[]
): PeriodAnalysis {
  // Filtrar datos por período
  const periodIncomes = filterDataByDateRange(incomes, startDate, endDate)
  const periodExpenses = filterDataByDateRange(expenses, startDate, endDate)
  
  // Separar ventas por producto
  const refrescoSales = periodIncomes.filter(i => i.product === 'Refresco')
  const heladoSales = periodIncomes.filter(i => i.product === 'Helado')
  const pacaSales = periodIncomes.filter(i => i.product === 'Paca')
  
  // Calcular métricas de refrescos
  const refrescoRevenue = refrescoSales.reduce((sum, sale) => sum + sale.amount, 0)
  const refrescoUnits = refrescoSales.reduce((sum, sale) => sum + sale.quantity, 0)
  
  // Calcular métricas de helados
  const heladoRevenue = heladoSales.reduce((sum, sale) => sum + sale.amount, 0)
  const heladoUnits = heladoSales.reduce((sum, sale) => sum + sale.quantity, 0)
  
  // Calcular métricas de pacas
  const pacaRevenue = pacaSales.reduce((sum, sale) => sum + sale.amount, 0)
  const pacaUnits = pacaSales.reduce((sum, sale) => sum + sale.quantity, 0)
  
  // Calcular COGS usando FIFO para el período
  const refrescoProductions = productions.filter(p => p.product === 'Refresco')
  const heladoProductions = productions.filter(p => p.product === 'Helado')
  const pacaProductions = productions.filter(p => p.product === 'Paca')
  
  const refrescoAnalysis = processAllSalesByProduct(refrescoProductions, refrescoSales)
  const heladoAnalysis = processAllSalesByProduct(heladoProductions, heladoSales)
  const pacaAnalysis = processAllSalesByProduct(pacaProductions, pacaSales)
  
  // Totales
  const totalRevenue = refrescoRevenue + heladoRevenue + pacaRevenue
  const totalCOGS = refrescoAnalysis.totalCOGS + heladoAnalysis.totalCOGS + pacaAnalysis.totalCOGS
  const grossProfit = totalRevenue - totalCOGS
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
  
  // Gastos operativos del período
  const operatingExpenses = periodExpenses
    .filter(expense => 
      expense.category !== 'Materia Prima Directa' && 
      expense.category !== 'Mano de Obra Directa' &&
      expense.category !== 'Costos Indirectos de Fabricación'
    )
    .reduce((sum, expense) => sum + expense.amount, 0)
  
  const netProfit = grossProfit - operatingExpenses
  const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  
  const unitsSold = refrescoUnits + heladoUnits + pacaUnits
  const uniqueSalesDays = new Set(periodIncomes.map(sale => sale.date)).size
  const averageRevenuePerDay = uniqueSalesDays > 0 ? totalRevenue / uniqueSalesDays : 0
  const averageUnitsPerDay = uniqueSalesDays > 0 ? unitsSold / uniqueSalesDays : 0
  
  // Generar nombre del período
  const start = new Date(startDate)
  const end = new Date(endDate)
  const periodName = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
    ? `${start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    : `${start.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${end.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
  
  return {
    period: periodName,
    startDate,
    endDate,
    totalRevenue,
    totalCOGS,
    grossProfit,
    grossProfitMargin,
    operatingExpenses,
    netProfit,
    netProfitMargin,
    unitsSold,
    salesDays: uniqueSalesDays,
    averageRevenuePerDay,
    averageUnitsPerDay,
    refrescos: {
      revenue: refrescoRevenue,
      units: refrescoUnits,
      cogs: refrescoAnalysis.totalCOGS,
      grossProfit: refrescoRevenue - refrescoAnalysis.totalCOGS
    },
    helados: {
      revenue: heladoRevenue,
      units: heladoUnits,
      cogs: heladoAnalysis.totalCOGS,
      grossProfit: heladoRevenue - heladoAnalysis.totalCOGS
    },
    pacas: {
      revenue: pacaRevenue,
      units: pacaUnits,
      cogs: pacaAnalysis.totalCOGS,
      grossProfit: pacaRevenue - pacaAnalysis.totalCOGS
    }
  }
}

/**
 * Genera análisis mensual para un mes específico
 */
export function generateMonthlyAnalysis(
  year: number,
  month: number, // 1-12
  productions: Production[],
  incomes: Income[],
  expenses: Expense[]
): PeriodAnalysis {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`
  
  return generatePeriodAnalysis(startDate, endDate, productions, incomes, expenses)
}

/**
 * Genera análisis anual completo
 */
export function generateAnnualAnalysis(
  year: number,
  productions: Production[],
  incomes: Income[],
  expenses: Expense[]
): AnnualAnalysis {
  const monthlyBreakdown: PeriodAnalysis[] = []
  
  // Generar análisis para cada mes
  for (let month = 1; month <= 12; month++) {
    const monthAnalysis = generateMonthlyAnalysis(year, month, productions, incomes, expenses)
    monthlyBreakdown.push(monthAnalysis)
  }
  
  // Calcular totales anuales
  const yearlyTotals = {
    totalRevenue: monthlyBreakdown.reduce((sum, month) => sum + month.totalRevenue, 0),
    totalCOGS: monthlyBreakdown.reduce((sum, month) => sum + month.totalCOGS, 0),
    grossProfit: monthlyBreakdown.reduce((sum, month) => sum + month.grossProfit, 0),
    grossProfitMargin: 0,
    operatingExpenses: monthlyBreakdown.reduce((sum, month) => sum + month.operatingExpenses, 0),
    netProfit: monthlyBreakdown.reduce((sum, month) => sum + month.netProfit, 0),
    netProfitMargin: 0,
    totalUnitsSold: monthlyBreakdown.reduce((sum, month) => sum + month.unitsSold, 0),
    salesDays: monthlyBreakdown.reduce((sum, month) => sum + month.salesDays, 0),
    averageRevenuePerMonth: 0,
    averageUnitsPerMonth: 0,
    bestMonth: '',
    worstMonth: '',
    growthTrend: 'ESTABLE' as 'CRECIENTE' | 'ESTABLE' | 'DECRECIENTE'
  }
  
  // Calcular porcentajes
  yearlyTotals.grossProfitMargin = yearlyTotals.totalRevenue > 0 
    ? (yearlyTotals.grossProfit / yearlyTotals.totalRevenue) * 100 : 0
  yearlyTotals.netProfitMargin = yearlyTotals.totalRevenue > 0 
    ? (yearlyTotals.netProfit / yearlyTotals.totalRevenue) * 100 : 0
  
  // Calcular promedios
  const monthsWithSales = monthlyBreakdown.filter(m => m.totalRevenue > 0).length
  yearlyTotals.averageRevenuePerMonth = monthsWithSales > 0 
    ? yearlyTotals.totalRevenue / monthsWithSales : 0
  yearlyTotals.averageUnitsPerMonth = monthsWithSales > 0 
    ? yearlyTotals.totalUnitsSold / monthsWithSales : 0
  
  // Encontrar mejor y peor mes
  const monthsWithData = monthlyBreakdown.filter(m => m.totalRevenue > 0)
  if (monthsWithData.length > 0) {
    const bestMonth = monthsWithData.reduce((best, current) => 
      current.netProfit > best.netProfit ? current : best
    )
    const worstMonth = monthsWithData.reduce((worst, current) => 
      current.netProfit < worst.netProfit ? current : worst
    )
    
    yearlyTotals.bestMonth = bestMonth.period
    yearlyTotals.worstMonth = worstMonth.period
  }
  
  // Determinar tendencia de crecimiento
  if (monthsWithData.length >= 3) {
    const firstHalf = monthsWithData.slice(0, Math.floor(monthsWithData.length / 2))
    const secondHalf = monthsWithData.slice(Math.floor(monthsWithData.length / 2))
    
    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.totalRevenue, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.totalRevenue, 0) / secondHalf.length
    
    const growthRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
    
    if (growthRate > 5) {
      yearlyTotals.growthTrend = 'CRECIENTE' as const
    } else if (growthRate < -5) {
      yearlyTotals.growthTrend = 'DECRECIENTE' as const
    } else {
      yearlyTotals.growthTrend = 'ESTABLE' as const
    }
  }
  
  // Desglose por productos
  const productBreakdown = {
    refrescos: {
      totalRevenue: monthlyBreakdown.reduce((sum, month) => sum + month.refrescos.revenue, 0),
      totalUnits: monthlyBreakdown.reduce((sum, month) => sum + month.refrescos.units, 0),
      totalCOGS: monthlyBreakdown.reduce((sum, month) => sum + month.refrescos.cogs, 0),
      grossProfit: monthlyBreakdown.reduce((sum, month) => sum + month.refrescos.grossProfit, 0),
      percentage: 0
    },
    helados: {
      totalRevenue: monthlyBreakdown.reduce((sum, month) => sum + month.helados.revenue, 0),
      totalUnits: monthlyBreakdown.reduce((sum, month) => sum + month.helados.units, 0),
      totalCOGS: monthlyBreakdown.reduce((sum, month) => sum + month.helados.cogs, 0),
      grossProfit: monthlyBreakdown.reduce((sum, month) => sum + month.helados.grossProfit, 0),
      percentage: 0
    },
    pacas: {
      totalRevenue: monthlyBreakdown.reduce((sum, month) => sum + month.pacas.revenue, 0),
      totalUnits: monthlyBreakdown.reduce((sum, month) => sum + month.pacas.units, 0),
      totalCOGS: monthlyBreakdown.reduce((sum, month) => sum + month.pacas.cogs, 0),
      grossProfit: monthlyBreakdown.reduce((sum, month) => sum + month.pacas.grossProfit, 0),
      percentage: 0
    }
  }
  
  // Calcular porcentajes de participación
  if (yearlyTotals.totalRevenue > 0) {
    productBreakdown.refrescos.percentage = (productBreakdown.refrescos.totalRevenue / yearlyTotals.totalRevenue) * 100
    productBreakdown.helados.percentage = (productBreakdown.helados.totalRevenue / yearlyTotals.totalRevenue) * 100
    productBreakdown.pacas.percentage = (productBreakdown.pacas.totalRevenue / yearlyTotals.totalRevenue) * 100
  }
  
  return {
    year,
    monthlyBreakdown,
    yearlyTotals,
    productBreakdown
  }
}

/**
 * Obtiene lista de años disponibles en los datos
 */
export function getAvailableYears(incomes: Income[]): number[] {
  const years = new Set<number>()
  
  incomes.forEach(income => {
    const year = new Date(income.date).getFullYear()
    years.add(year)
  })
  
  return Array.from(years).sort((a, b) => b - a) // Más reciente primero
}

/**
 * Obtiene lista de meses disponibles para un año específico
 */
export function getAvailableMonths(year: number, incomes: Income[]): Array<{
  month: number
  name: string
  hasSales: boolean
}> {
  const monthsWithSales = new Set<number>()
  
  incomes.forEach(income => {
    const incomeDate = new Date(income.date)
    if (incomeDate.getFullYear() === year) {
      monthsWithSales.add(incomeDate.getMonth() + 1)
    }
  })
  
  const months = []
  for (let i = 1; i <= 12; i++) {
    months.push({
      month: i,
      name: new Date(year, i - 1, 1).toLocaleDateString('es-ES', { month: 'long' }),
      hasSales: monthsWithSales.has(i)
    })
  }
  
  return months
}

// Interface para el análisis de tipos de ventas
export interface SalesTypeBreakdown {
  type: string
  totalRevenue: number
  totalUnits: number
  averagePrice: number
  percentage: number
  product: 'Refresco' | 'Helado' | 'Paca'
  transactions: number
}

// Función para obtener el desglose de tipos de ventas en un período
export function getSalesTypeBreakdown(
  startDate: string,
  endDate: string,
  incomes: Income[]
): SalesTypeBreakdown[] {
  const filteredIncomes = filterDataByDateRange(incomes, startDate, endDate)
  
  if (filteredIncomes.length === 0) {
    return []
  }

  // Agrupar por tipo de venta
  const groupedByType = filteredIncomes.reduce((acc, income) => {
    const key = `${income.type}-${income.product}`
    
    if (!acc[key]) {
      acc[key] = {
        type: income.type,
        product: income.product,
        totalRevenue: 0,
        totalUnits: 0,
        transactions: 0
      }
    }
    
    acc[key].totalRevenue += income.amount
    acc[key].totalUnits += income.quantity
    acc[key].transactions += 1
    
    return acc
  }, {} as Record<string, any>)

  const totalRevenue = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)

  // Convertir a array y calcular métricas
  return Object.values(groupedByType).map((group: any): SalesTypeBreakdown => ({
    type: group.type,
    product: group.product,
    totalRevenue: group.totalRevenue,
    totalUnits: group.totalUnits,
    averagePrice: group.totalUnits > 0 ? group.totalRevenue / group.totalUnits : 0,
    percentage: totalRevenue > 0 ? (group.totalRevenue / totalRevenue) * 100 : 0,
    transactions: group.transactions
  })).sort((a, b) => b.totalRevenue - a.totalRevenue) // Ordenar por ingresos descendente
}

// Interface para el análisis de ventas por empleado
export interface EmployeeSalesAnalysis {
  employee: 'César' | 'Yesid'
  totalRevenue: number
  totalUnits: number
  transactions: number
  refrescos: {
    revenue: number
    units: number
    transactions: number
    averagePrice: number
  }
  helados: {
    revenue: number
    units: number
    transactions: number
    averagePrice: number
  }
  pacas: {
    revenue: number
    units: number
    transactions: number
    averagePrice: number
  }
  averageRevenuePerTransaction: number
  productMix: {
    refrescosPercentage: number
    heladosPercentage: number
    pacasPercentage: number
  }
}

// Función para obtener el análisis de ventas por empleado en un período
export function getEmployeeSalesAnalysis(
  startDate: string,
  endDate: string,
  incomes: Income[]
): EmployeeSalesAnalysis[] {
  const filteredIncomes = filterDataByDateRange(incomes, startDate, endDate)
  
  // Filtrar solo ventas de empleados
  const employeeSales = filteredIncomes.filter(income => 
    income.type === 'Venta Empleado' && income.employee
  )

  if (employeeSales.length === 0) {
    return []
  }

  // Agrupar por empleado
  const employeeGroups = employeeSales.reduce((acc, income) => {
    const employee = income.employee!
    
    if (!acc[employee]) {
      acc[employee] = {
        employee,
        sales: []
      }
    }
    
    acc[employee].sales.push(income)
    return acc
  }, {} as Record<string, { employee: 'César' | 'Yesid', sales: Income[] }>)

  // Calcular métricas para cada empleado
  return Object.values(employeeGroups).map(group => {
    const { employee, sales } = group
    
    // Totales generales
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0)
    const totalUnits = sales.reduce((sum, sale) => sum + sale.quantity, 0)
    const transactions = sales.length

    // Desglose por producto
    const refrescoSales = sales.filter(sale => sale.product === 'Refresco')
    const heladoSales = sales.filter(sale => sale.product === 'Helado')
    const pacaSales = sales.filter(sale => sale.product === 'Paca')

    const refrescos = {
      revenue: refrescoSales.reduce((sum, sale) => sum + sale.amount, 0),
      units: refrescoSales.reduce((sum, sale) => sum + sale.quantity, 0),
      transactions: refrescoSales.length,
      averagePrice: 0
    }
    refrescos.averagePrice = refrescos.units > 0 ? refrescos.revenue / refrescos.units : 0

    const helados = {
      revenue: heladoSales.reduce((sum, sale) => sum + sale.amount, 0),
      units: heladoSales.reduce((sum, sale) => sum + sale.quantity, 0),
      transactions: heladoSales.length,
      averagePrice: 0
    }
    helados.averagePrice = helados.units > 0 ? helados.revenue / helados.units : 0

    const pacas = {
      revenue: pacaSales.reduce((sum, sale) => sum + sale.amount, 0),
      units: pacaSales.reduce((sum, sale) => sum + sale.quantity, 0),
      transactions: pacaSales.length,
      averagePrice: 0
    }
    pacas.averagePrice = pacas.units > 0 ? pacas.revenue / pacas.units : 0

    // Métricas adicionales
    const averageRevenuePerTransaction = transactions > 0 ? totalRevenue / transactions : 0
    
    const productMix = {
      refrescosPercentage: totalRevenue > 0 ? (refrescos.revenue / totalRevenue) * 100 : 0,
      heladosPercentage: totalRevenue > 0 ? (helados.revenue / totalRevenue) * 100 : 0,
      pacasPercentage: totalRevenue > 0 ? (pacas.revenue / totalRevenue) * 100 : 0
    }

    return {
      employee,
      totalRevenue,
      totalUnits,
      transactions,
      refrescos,
      helados,
      pacas,
      averageRevenuePerTransaction,
      productMix
    }
  }).sort((a, b) => b.totalRevenue - a.totalRevenue) // Ordenar por ingresos descendente
}