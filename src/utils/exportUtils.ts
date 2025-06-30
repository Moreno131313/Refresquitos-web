import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PeriodAnalysis, AnnualAnalysis, SalesTypeBreakdown, EmployeeSalesAnalysis } from '@/lib/business-logic'
import type { Production, Income, Expense } from '@/types/unified'

// Tipos para los datos de exportación
export interface ExportData {
  type: 'monthly' | 'annual' | 'custom'
  title: string
  period: string
  analysis: PeriodAnalysis | AnnualAnalysis
  salesBreakdown?: SalesTypeBreakdown[]
  employeeAnalysis?: EmployeeSalesAnalysis[]
  productions: Production[]
  incomes: Income[]
  expenses: Expense[]
}

// Función para exportar a PDF
export const exportToPDF = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Elemento no encontrado')
    }

    // Configurar opciones para una mejor captura
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Agregar la primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Si la imagen es más alta que una página, agregar páginas adicionales
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Error al generar PDF:', error)
    return false
  }
}

// Función para exportar a Excel con múltiples hojas
export const exportToExcel = (data: ExportData, filename: string) => {
  try {
    // Validar datos de entrada
    if (!data || !data.analysis) {
      throw new Error('Datos de análisis no válidos')
    }

    const workbook = XLSX.utils.book_new()

    // Hoja 1: Resumen Ejecutivo con estilos
    const summaryData = createSummarySheet(data)
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    applySummaryStyles(summarySheet, summaryData.length)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen Ejecutivo')

    // Hoja 2: Análisis Financiero con estilos
    const financialData = createFinancialSheet(data)
    const financialSheet = XLSX.utils.aoa_to_sheet(financialData)
    applyFinancialStyles(financialSheet, financialData.length)
    XLSX.utils.book_append_sheet(workbook, financialSheet, 'Análisis Financiero')

    // Hoja 3: Dashboard de Métricas
    const dashboardData = createDashboardSheet(data)
    const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData)
    applyDashboardStyles(dashboardSheet, dashboardData.length)
    XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard Métricas')

    // Hoja 4: Desglose por Productos (si existe y tiene datos)
    if (data.salesBreakdown && Array.isArray(data.salesBreakdown) && data.salesBreakdown.length > 0) {
      const productData = createProductBreakdownSheet(data.salesBreakdown)
      const productSheet = XLSX.utils.aoa_to_sheet(productData)
      applyProductStyles(productSheet, productData.length)
      XLSX.utils.book_append_sheet(workbook, productSheet, 'Productos')
    }

    // Hoja 5: Análisis de Empleados (si existe y tiene datos)
    if (data.employeeAnalysis && Array.isArray(data.employeeAnalysis) && data.employeeAnalysis.length > 0) {
      const employeeData = createEmployeeAnalysisSheet(data.employeeAnalysis)
      const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData)
      applyEmployeeStyles(employeeSheet, employeeData.length)
      XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Rendimiento Empleados')
    }

    // Hoja 6: Datos de Ingresos
    const incomeData = createIncomeSheet(data.incomes || [])
    const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData)
    applyDataStyles(incomeSheet, incomeData.length, 'success')
    XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Registro Ingresos')

    // Hoja 7: Datos de Gastos
    const expenseData = createExpenseSheet(data.expenses || [])
    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData)
    applyDataStyles(expenseSheet, expenseData.length, 'warning')
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Registro Gastos')

    // Hoja 8: Datos de Producción
    const productionData = createProductionSheet(data.productions || [])
    const productionSheet = XLSX.utils.aoa_to_sheet(productionData)
    applyDataStyles(productionSheet, productionData.length, 'info')
    XLSX.utils.book_append_sheet(workbook, productionSheet, 'Registro Producción')

    // Guardar el archivo con validación adicional
    if (!filename || typeof filename !== 'string') {
      filename = generateFilename('xlsx', data.type || 'custom', data.period || 'general')
    }
    
    XLSX.writeFile(workbook, filename)
    return true
  } catch (error) {
    console.error('Error al generar Excel:', error)
    return false
  }
}

// Función auxiliar para validar y formatear números
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value == null || value === undefined) return defaultValue
  const num = typeof value === 'string' ? parseFloat(value) : Number(value)
  return isNaN(num) || !isFinite(num) ? defaultValue : num
}

// Función auxiliar para calcular porcentajes seguros
const safePercentage = (value: number, total: number): string => {
  const safeVal = safeNumber(value)
  const safeTotal = safeNumber(total)
  
  if (safeTotal === 0) return '0.00%'
  
  const percentage = (safeVal / safeTotal) * 100
  return `${safeNumber(percentage).toFixed(2)}%`
}

// Función para crear la hoja de resumen
const createSummarySheet = (data: ExportData): any[][] => {
  const analysis = data.analysis
  
  // Función auxiliar para extraer valores según el tipo de análisis
  const getAnalysisValue = (key: string): number => {
    if ('yearlyTotals' in analysis) {
      // Es AnnualAnalysis
      const annualAnalysis = analysis as AnnualAnalysis
      switch (key) {
        case 'totalRevenue': return safeNumber(annualAnalysis.yearlyTotals.totalRevenue)
        case 'totalExpenses': return safeNumber(annualAnalysis.yearlyTotals.operatingExpenses)
        case 'netProfit': return safeNumber(annualAnalysis.yearlyTotals.netProfit)
        case 'netProfitMargin': return safeNumber(annualAnalysis.yearlyTotals.netProfitMargin)
        case 'totalUnitsSold': return safeNumber(annualAnalysis.yearlyTotals.totalUnitsSold)
        case 'grossProfit': return safeNumber(annualAnalysis.yearlyTotals.grossProfit)
        case 'totalCOGS': return safeNumber(annualAnalysis.yearlyTotals.totalCOGS)
        default: return 0
      }
    } else {
      // Es PeriodAnalysis
      const periodAnalysis = analysis as PeriodAnalysis
      switch (key) {
        case 'totalRevenue': return safeNumber(periodAnalysis.totalRevenue)
        case 'totalExpenses': return safeNumber(periodAnalysis.operatingExpenses)
        case 'netProfit': return safeNumber(periodAnalysis.netProfit)
        case 'netProfitMargin': return safeNumber(periodAnalysis.netProfitMargin)
        case 'totalUnitsSold': return safeNumber(periodAnalysis.unitsSold)
        case 'grossProfit': return safeNumber(periodAnalysis.grossProfit)
        case 'totalCOGS': return safeNumber(periodAnalysis.totalCOGS)
        default: return 0
      }
    }
  }

  const getTrend = (): string => {
    if ('yearlyTotals' in analysis) {
      const annualAnalysis = analysis as AnnualAnalysis
      return annualAnalysis.yearlyTotals.growthTrend || 'N/A'
    }
    return 'N/A'
  }
  
  // Validar y extraer valores seguros
  const totalRevenue = getAnalysisValue('totalRevenue')
  const totalExpenses = getAnalysisValue('totalExpenses')
  const netProfit = getAnalysisValue('netProfit')
  const netProfitMargin = getAnalysisValue('netProfitMargin')
  const totalUnitsSold = getAnalysisValue('totalUnitsSold')
  const totalCOGS = getAnalysisValue('totalCOGS')
  
  // Calcular valores derivados de manera segura
  const averageCostPerUnit = totalUnitsSold > 0 ? totalCOGS / totalUnitsSold : 0
  const averageRevenuePerUnit = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : 0
  
  return [
    ['REPORTE DE ANÁLISIS - REFRESQUITOS'],
    [''],
    ['Tipo de Análisis:', data.type === 'monthly' ? 'Mensual' : data.type === 'annual' ? 'Anual' : 'Período Personalizado'],
    ['Período:', data.period || 'N/A'],
    ['Fecha de Generación:', formatDate(new Date().toISOString())],
    [''],
    ['RESUMEN EJECUTIVO'],
    [''],
    ['Métricas Principales'],
    ['Ingresos Totales:', formatCurrency(totalRevenue)],
    ['Gastos Totales:', formatCurrency(totalExpenses)],
    ['Ganancia Neta:', formatCurrency(netProfit)],
    ['Margen de Ganancia:', `${netProfitMargin.toFixed(2)}%`],
    [''],
    ['Métricas de Producción'],
    ['Unidades Producidas:', 'N/A'],
    ['Unidades Vendidas:', totalUnitsSold > 0 ? totalUnitsSold.toString() : 'N/A'],
    ['Costo Promedio por Unidad:', formatCurrency(averageCostPerUnit)],
    ['Precio Promedio de Venta:', formatCurrency(averageRevenuePerUnit)],
    [''],
    ['Estado del Período'],
    ['Tendencia:', getTrend()],
    ['Estado Financiero:', netProfit > 0 ? 'RENTABLE' : netProfit === 0 ? 'PUNTO DE EQUILIBRIO' : 'PÉRDIDA']
  ]
}

// Función para crear la hoja de análisis financiero
const createFinancialSheet = (data: ExportData): any[][] => {
  const analysis = data.analysis
  
  // Función auxiliar para extraer valores según el tipo de análisis
  const getAnalysisValue = (key: string): number => {
    if ('yearlyTotals' in analysis) {
      // Es AnnualAnalysis
      const annualAnalysis = analysis as AnnualAnalysis
      switch (key) {
        case 'totalRevenue': return safeNumber(annualAnalysis.yearlyTotals.totalRevenue)
        case 'totalCOGS': return safeNumber(annualAnalysis.yearlyTotals.totalCOGS)
        case 'grossProfit': return safeNumber(annualAnalysis.yearlyTotals.grossProfit)
        case 'operatingExpenses': return safeNumber(annualAnalysis.yearlyTotals.operatingExpenses)
        case 'netProfit': return safeNumber(annualAnalysis.yearlyTotals.netProfit)
        case 'grossProfitMargin': return safeNumber(annualAnalysis.yearlyTotals.grossProfitMargin)
        case 'netProfitMargin': return safeNumber(annualAnalysis.yearlyTotals.netProfitMargin)
        default: return 0
      }
    } else {
      // Es PeriodAnalysis
      const periodAnalysis = analysis as PeriodAnalysis
      switch (key) {
        case 'totalRevenue': return safeNumber(periodAnalysis.totalRevenue)
        case 'totalCOGS': return safeNumber(periodAnalysis.totalCOGS)
        case 'grossProfit': return safeNumber(periodAnalysis.grossProfit)
        case 'operatingExpenses': return safeNumber(periodAnalysis.operatingExpenses)
        case 'netProfit': return safeNumber(periodAnalysis.netProfit)
        case 'grossProfitMargin': return safeNumber(periodAnalysis.grossProfitMargin)
        case 'netProfitMargin': return safeNumber(periodAnalysis.netProfitMargin)
        default: return 0
      }
    }
  }
  
  // Validar y extraer valores seguros
  const totalRevenue = getAnalysisValue('totalRevenue')
  const totalCOGS = getAnalysisValue('totalCOGS')
  const grossProfit = getAnalysisValue('grossProfit')
  const operatingExpenses = getAnalysisValue('operatingExpenses')
  const netProfit = getAnalysisValue('netProfit')
  const grossProfitMargin = getAnalysisValue('grossProfitMargin')
  const netProfitMargin = getAnalysisValue('netProfitMargin')
  
  const sheet = [
    ['ANÁLISIS FINANCIERO DETALLADO'],
    [''],
    ['Ingresos y Costos'],
    ['Concepto', 'Valor', 'Porcentaje del Total'],
    ['Ingresos Totales', formatCurrency(totalRevenue), '100.00%'],
    ['COGS Total', formatCurrency(totalCOGS), safePercentage(totalCOGS, totalRevenue)],
    ['Ganancia Bruta', formatCurrency(grossProfit), safePercentage(grossProfit, totalRevenue)],
    ['Gastos Operativos', formatCurrency(operatingExpenses), safePercentage(operatingExpenses, totalRevenue)],
    ['Ganancia Neta', formatCurrency(netProfit), safePercentage(netProfit, totalRevenue)],
    [''],
    ['Márgenes de Rentabilidad'],
    ['Margen Bruto', `${grossProfitMargin.toFixed(2)}%`],
    ['Margen Neto', `${netProfitMargin.toFixed(2)}%`],
    [''],
  ]

  // Agregar análisis mensual si está disponible (solo para análisis anual)
  if ('yearlyTotals' in analysis) {
    const annualAnalysis = analysis as AnnualAnalysis
    if (annualAnalysis.monthlyBreakdown && Array.isArray(annualAnalysis.monthlyBreakdown)) {
      sheet.push(['DESGLOSE MENSUAL'])
      sheet.push(['Mes', 'Ingresos', 'Gastos', 'Ganancia Neta', 'Margen %'])
      
      annualAnalysis.monthlyBreakdown.forEach(month => {
        if (month && typeof month === 'object') {
          const monthRevenue = safeNumber(month.totalRevenue)
          const monthExpenses = safeNumber(month.operatingExpenses)
          const monthProfit = safeNumber(month.netProfit)
          const monthMargin = safeNumber(month.netProfitMargin)
          
          sheet.push([
            month.period || 'N/A',
            formatCurrency(monthRevenue),
            formatCurrency(monthExpenses),
            formatCurrency(monthProfit),
            `${monthMargin.toFixed(2)}%`
          ])
        }
      })
    }
  }

  return sheet
}

// Función para crear la hoja de desglose por productos
const createProductBreakdownSheet = (salesBreakdown: SalesTypeBreakdown[]): any[][] => {
  const sheet = [
    ['DESGLOSE POR TIPOS DE PRODUCTOS'],
    [''],
    ['Tipo de Producto', 'Producto', 'Ingresos Totales', 'Unidades Vendidas', 'Precio Promedio', '% del Total'],
    ['']
  ]

  salesBreakdown.forEach(item => {
    sheet.push([
      item.type,
      item.product,
      formatCurrency(item.totalRevenue),
      item.totalUnits.toString(),
      formatCurrency(item.averagePrice),
      `${item.percentage.toFixed(2)}%`
    ])
  })

  return sheet
}

// Función para crear la hoja de análisis de empleados
const createEmployeeAnalysisSheet = (employeeAnalysis: EmployeeSalesAnalysis[]): any[][] => {
  const sheet = [
    ['ANÁLISIS DE RENDIMIENTO POR EMPLEADO'],
    [''],
    ['Empleado', 'Transacciones', 'Ingresos Generados', 'Unidades Vendidas', 'Promedio por Transacción'],
    ['']
  ]

  employeeAnalysis.forEach(emp => {
    sheet.push([
      emp.employee,
      emp.transactions.toString(),
      formatCurrency(emp.totalRevenue),
      emp.totalUnits.toString(),
      formatCurrency(emp.averageRevenuePerTransaction)
    ])
  })

  return sheet
}

// Función para crear la hoja de ingresos
const createIncomeSheet = (incomes: Income[]): any[][] => {
  const sheet = [
    ['REGISTRO DE INGRESOS'],
    [''],
    ['Fecha', 'Tipo', 'Producto', 'Cantidad', 'Monto Total', 'Empleado'],
    ['']
  ]

  incomes.forEach(income => {
    sheet.push([
      formatDate(income.date),
      income.type,
      income.product,
      income.quantity.toString(),
      formatCurrency(income.amount),
      income.employee || 'N/A'
    ])
  })

  return sheet
}

// Función para crear la hoja de gastos
const createExpenseSheet = (expenses: Expense[]): any[][] => {
  const sheet = [
    ['REGISTRO DE GASTOS'],
    [''],
    ['Fecha', 'Nombre', 'Monto', 'Categoría'],
    ['']
  ]

  expenses.forEach(expense => {
    sheet.push([
      formatDate(expense.date),
      expense.name,
      formatCurrency(expense.amount),
      expense.category || 'N/A'
    ])
  })

  return sheet
}

// Función para crear la hoja de producción
const createProductionSheet = (productions: Production[]): any[][] => {
  const sheet = [
    ['REGISTRO DE PRODUCCIÓN'],
    [''],
    ['Fecha', 'Producto', 'Cantidad', 'Costo por Unidad', 'Costo Total'],
    ['']
  ]

  productions.forEach(production => {
    sheet.push([
      formatDate(production.date),
      production.product,
      production.quantity.toString(),
      formatCurrency(production.costPerUnit),
      formatCurrency(production.totalCost)
    ])
  })

  return sheet
}

// Función para generar nombre de archivo con timestamp
export const generateFilename = (type: string, analysisType: string, period: string): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
  const cleanPeriod = period.replace(/[/\s:]/g, '-')
  return `refresquitos-${analysisType}-${cleanPeriod}-${timestamp}.${type}`
}

// Función para aplicar estilos al resumen ejecutivo
const applySummaryStyles = (sheet: any, rowCount: number) => {
  if (!sheet['!cols']) sheet['!cols'] = []
  
  // Configurar ancho de columnas
  sheet['!cols'][0] = { wch: 30 }
  sheet['!cols'][1] = { wch: 20 }
  
  // Configurar filas
  if (!sheet['!rows']) sheet['!rows'] = []
  
  // Título principal
  if (sheet['A1']) {
    sheet['A1'].s = {
      font: { bold: true, size: 16, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1f4e79' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  }

  // Aplicar estilos a encabezados de sección
  const headerRows = [7, 9, 15, 21] // Filas que contienen encabezados
  headerRows.forEach(row => {
    const cellRef = `A${row}`
    if (sheet[cellRef]) {
      sheet[cellRef].s = {
        font: { bold: true, size: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2e75b6' } },
        alignment: { horizontal: 'left', vertical: 'center' }
      }
    }
  })

  // Estilos para valores monetarios
  for (let row = 1; row <= rowCount; row++) {
    const cellB = sheet[`B${row}`]
    if (cellB && typeof cellB.v === 'string' && cellB.v.includes('$')) {
      cellB.s = {
        font: { bold: true, color: { rgb: '0d5829' } },
        alignment: { horizontal: 'right' }
      }
    }
  }

  // Merge del título
  if (!sheet['!merges']) sheet['!merges'] = []
  sheet['!merges'].push({ s: { c: 0, r: 0 }, e: { c: 1, r: 0 } })
}

// Función para aplicar estilos al análisis financiero
const applyFinancialStyles = (sheet: any, rowCount: number) => {
  if (!sheet['!cols']) sheet['!cols'] = []
  
  // Configurar ancho de columnas
  sheet['!cols'][0] = { wch: 25 }
  sheet['!cols'][1] = { wch: 18 }
  sheet['!cols'][2] = { wch: 15 }
  
  // Título principal
  if (sheet['A1']) {
    sheet['A1'].s = {
      font: { bold: true, size: 16, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0d5829' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  }

  // Encabezados de tabla
  const headerRow = 4
  for (let col = 0; col < 3; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: col })
    if (sheet[cellRef]) {
      sheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472c4' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      }
    }
  }

  // Aplicar bordes y colores alternados a las filas de datos
  for (let row = 5; row <= 9; row++) {
    const isEvenRow = (row - 5) % 2 === 0
    const bgColor = isEvenRow ? 'f8f9fa' : 'ffffff'
    
    for (let col = 0; col < 3; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col })
      if (sheet[cellRef]) {
        sheet[cellRef].s = {
          fill: { fgColor: { rgb: bgColor } },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { horizontal: col === 1 || col === 2 ? 'right' : 'left' }
        }
      }
    }
  }

  // Merge del título
  if (!sheet['!merges']) sheet['!merges'] = []
  sheet['!merges'].push({ s: { c: 0, r: 0 }, e: { c: 2, r: 0 } })
}

// Función para crear hoja de dashboard con métricas visuales
const createDashboardSheet = (data: ExportData): any[][] => {
  const analysis = data.analysis
  
  const getAnalysisValue = (key: string): number => {
    if ('yearlyTotals' in analysis) {
      const annualAnalysis = analysis as AnnualAnalysis
      switch (key) {
        case 'totalRevenue': return safeNumber(annualAnalysis.yearlyTotals.totalRevenue)
        case 'netProfit': return safeNumber(annualAnalysis.yearlyTotals.netProfit)
        case 'grossProfit': return safeNumber(annualAnalysis.yearlyTotals.grossProfit)
        case 'operatingExpenses': return safeNumber(annualAnalysis.yearlyTotals.operatingExpenses)
        case 'netProfitMargin': return safeNumber(annualAnalysis.yearlyTotals.netProfitMargin)
        case 'totalUnitsSold': return safeNumber(annualAnalysis.yearlyTotals.totalUnitsSold)
        default: return 0
      }
    } else {
      const periodAnalysis = analysis as PeriodAnalysis
      switch (key) {
        case 'totalRevenue': return safeNumber(periodAnalysis.totalRevenue)
        case 'netProfit': return safeNumber(periodAnalysis.netProfit)
        case 'grossProfit': return safeNumber(periodAnalysis.grossProfit)
        case 'operatingExpenses': return safeNumber(periodAnalysis.operatingExpenses)
        case 'netProfitMargin': return safeNumber(periodAnalysis.netProfitMargin)
        case 'totalUnitsSold': return safeNumber(periodAnalysis.unitsSold)
        default: return 0
      }
    }
  }

  const totalRevenue = getAnalysisValue('totalRevenue')
  const netProfit = getAnalysisValue('netProfit')
  const grossProfit = getAnalysisValue('grossProfit')
  const operatingExpenses = getAnalysisValue('operatingExpenses')
  const netProfitMargin = getAnalysisValue('netProfitMargin')
  const totalUnitsSold = getAnalysisValue('totalUnitsSold')

  const profitabilityStatus = netProfit > 0 ? 'RENTABLE' : netProfit === 0 ? 'EQUILIBRIO' : 'PÉRDIDA'
  const profitabilityIcon = netProfit > 0 ? '✅' : netProfit === 0 ? '⚠️' : '❌'

  return [
    ['🏢 DASHBOARD REFRESQUITOS - MÉTRICAS CLAVE'],
    [''],
    ['📊 INDICADORES PRINCIPALES'],
    [''],
    ['Métrica', 'Valor', 'Estado', 'Indicador'],
    ['💰 Ingresos Totales', formatCurrency(totalRevenue), totalRevenue > 0 ? 'Positivo' : 'Sin ventas', totalRevenue > 0 ? '📈' : '📉'],
    ['💵 Ganancia Neta', formatCurrency(netProfit), profitabilityStatus, profitabilityIcon],
    ['💎 Ganancia Bruta', formatCurrency(grossProfit), grossProfit > 0 ? 'Positivo' : 'Negativo', grossProfit > 0 ? '💚' : '💔'],
    ['💸 Gastos Operativos', formatCurrency(operatingExpenses), operatingExpenses > 0 ? 'Con gastos' : 'Sin gastos', '💼'],
    ['📈 Margen Neto', `${netProfitMargin.toFixed(2)}%`, netProfitMargin > 10 ? 'Excelente' : netProfitMargin > 5 ? 'Bueno' : 'Mejorable', netProfitMargin > 10 ? '🌟' : netProfitMargin > 5 ? '👍' : '⚡'],
    ['📦 Unidades Vendidas', totalUnitsSold.toString(), totalUnitsSold > 0 ? 'Con ventas' : 'Sin ventas', totalUnitsSold > 0 ? '📦' : '📭'],
    [''],
    ['🎯 ANÁLISIS DE RENDIMIENTO'],
    [''],
    ['Aspecto', 'Calificación', 'Comentario'],
    ['Rentabilidad', netProfitMargin > 15 ? 'Excelente' : netProfitMargin > 8 ? 'Buena' : netProfitMargin > 0 ? 'Aceptable' : 'Deficiente', 
     netProfitMargin > 15 ? 'Margen excepcional' : netProfitMargin > 8 ? 'Buen rendimiento' : netProfitMargin > 0 ? 'Puede mejorar' : 'Requiere atención'],
    ['Volumen de Ventas', totalUnitsSold > 1000 ? 'Alto' : totalUnitsSold > 500 ? 'Medio' : totalUnitsSold > 0 ? 'Bajo' : 'Nulo',
     totalUnitsSold > 1000 ? 'Excelente movimiento' : totalUnitsSold > 500 ? 'Buen volumen' : totalUnitsSold > 0 ? 'Incrementar ventas' : 'Activar ventas'],
    ['Control de Gastos', operatingExpenses < totalRevenue * 0.3 ? 'Excelente' : operatingExpenses < totalRevenue * 0.5 ? 'Bueno' : 'Mejorable',
     operatingExpenses < totalRevenue * 0.3 ? 'Gastos controlados' : operatingExpenses < totalRevenue * 0.5 ? 'Gastos razonables' : 'Revisar gastos'],
    [''],
    ['📋 RECOMENDACIONES'],
    [''],
    ['1. ' + (netProfitMargin < 10 ? 'Optimizar costos de producción y gastos operativos' : 'Mantener eficiencia operativa actual')],
    ['2. ' + (totalUnitsSold < 500 ? 'Implementar estrategias de incremento de ventas' : 'Sostener volumen de ventas')],
    ['3. ' + (operatingExpenses > totalRevenue * 0.4 ? 'Revisar y reducir gastos no esenciales' : 'Continuar control de gastos')],
    ['4. Analizar tendencias mensuales para identificar patrones estacionales'],
    ['5. Evaluar rentabilidad por producto para optimizar mix de ventas']
  ]
}

// Función para aplicar estilos al dashboard
const applyDashboardStyles = (sheet: any, rowCount: number) => {
  if (!sheet['!cols']) sheet['!cols'] = []
  
  // Configurar ancho de columnas
  sheet['!cols'][0] = { wch: 25 }
  sheet['!cols'][1] = { wch: 20 }
  sheet['!cols'][2] = { wch: 15 }
  sheet['!cols'][3] = { wch: 12 }
  
  // Título principal con estilo llamativo
  if (sheet['A1']) {
    sheet['A1'].s = {
      font: { bold: true, size: 18, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2e75b6' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  }

  // Encabezados de sección con colores diferentes
  if (sheet['A3']) {
    sheet['A3'].s = {
      font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0d5829' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  if (sheet['A13']) {
    sheet['A13'].s = {
      font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '7030a0' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  if (sheet['A20']) {
    sheet['A20'].s = {
      font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'c55a11' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  // Encabezados de tabla
  const tableHeaders = [5, 15]
  tableHeaders.forEach(headerRow => {
    for (let col = 0; col < 4; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: col })
      if (sheet[cellRef]) {
        sheet[cellRef].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '4472c4' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'medium' },
            bottom: { style: 'medium' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
      }
    }
  })

  // Filas de datos con colores alternados
  const dataRanges = [
    { start: 6, end: 11 }, // Métricas principales
    { start: 16, end: 18 }  // Análisis de rendimiento
  ]

  dataRanges.forEach(range => {
    for (let row = range.start; row <= range.end; row++) {
      const isEvenRow = (row - range.start) % 2 === 0
      const bgColor = isEvenRow ? 'f0f8ff' : 'ffffff'
      
      for (let col = 0; col < 4; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col })
        if (sheet[cellRef]) {
          sheet[cellRef].s = {
            fill: { fgColor: { rgb: bgColor } },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            },
            alignment: { horizontal: col === 1 ? 'right' : 'left', vertical: 'center' }
          }
        }
      }
    }
  })

  // Merge celdas del título
  if (!sheet['!merges']) sheet['!merges'] = []
  sheet['!merges'].push({ s: { c: 0, r: 0 }, e: { c: 3, r: 0 } })
  sheet['!merges'].push({ s: { c: 0, r: 2 }, e: { c: 3, r: 2 } })
  sheet['!merges'].push({ s: { c: 0, r: 12 }, e: { c: 3, r: 12 } })
  sheet['!merges'].push({ s: { c: 0, r: 19 }, e: { c: 3, r: 19 } })
}

// Función para aplicar estilos a productos
const applyProductStyles = (sheet: any, rowCount: number) => {
  if (!sheet['!cols']) sheet['!cols'] = []
  
  // Configurar ancho de columnas
  sheet['!cols'][0] = { wch: 15 }
  sheet['!cols'][1] = { wch: 15 }
  sheet['!cols'][2] = { wch: 18 }
  sheet['!cols'][3] = { wch: 15 }
  sheet['!cols'][4] = { wch: 18 }
  sheet['!cols'][5] = { wch: 12 }
  
  applyTableStyles(sheet, rowCount, '70ad47')
}

// Función para aplicar estilos a empleados
const applyEmployeeStyles = (sheet: any, rowCount: number) => {
  if (!sheet['!cols']) sheet['!cols'] = []
  
  // Configurar ancho de columnas
  sheet['!cols'][0] = { wch: 15 }
  sheet['!cols'][1] = { wch: 15 }
  sheet['!cols'][2] = { wch: 20 }
  sheet['!cols'][3] = { wch: 18 }
  sheet['!cols'][4] = { wch: 22 }
  
  applyTableStyles(sheet, rowCount, 'ffc000')
}

// Función para aplicar estilos a datos
const applyDataStyles = (sheet: any, rowCount: number, theme: 'success' | 'warning' | 'info') => {
  const colors = {
    success: '70ad47',
    warning: 'ff6600',
    info: '4472c4'
  }
  
  applyTableStyles(sheet, rowCount, colors[theme])
}

// Función genérica para aplicar estilos de tabla
const applyTableStyles = (sheet: any, rowCount: number, headerColor: string) => {
  // Título principal
  if (sheet['A1']) {
    sheet['A1'].s = {
      font: { bold: true, size: 16, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: headerColor } },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  }

  // Encabezados de tabla (fila 3)
  if (rowCount > 3) {
    const colCount = Object.keys(sheet).filter(key => key.startsWith('A')).length
    
    for (let col = 0; col < 10; col++) { // Asumimos máximo 10 columnas
      const cellRef = XLSX.utils.encode_cell({ r: 2, c: col })
      if (sheet[cellRef]) {
        sheet[cellRef].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: headerColor } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'medium' },
            bottom: { style: 'medium' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
      }
    }

    // Filas de datos con colores alternados
    for (let row = 5; row <= rowCount; row++) {
      const isEvenRow = (row - 5) % 2 === 0
      const bgColor = isEvenRow ? 'f8f9fa' : 'ffffff'
      
      for (let col = 0; col < 10; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col })
        if (sheet[cellRef]) {
          sheet[cellRef].s = {
            fill: { fgColor: { rgb: bgColor } },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            },
            alignment: { horizontal: 'left', vertical: 'center' }
          }
        }
      }
    }
  }
} 