// Utility functions for data migration

interface LegacyIncomeItem {
  id: string
  amount: number
  quantity: number
  date: string
  type: string
  employee?: string
  createdAt: string
  product?: 'Refresco' | 'Helado' | 'Paca'
}

interface LegacyProductionItem {
  id: string
  date: string
  quantity: number
  materialCosts: Array<{ name: string; cost: number }>
  directLaborCost: number
  indirectCosts: number
  totalCost: number
  costPerUnit: number
  createdAt: string
  product?: 'Refresco' | 'Helado' | 'Paca'
}

export function migrateLocalStorageData(): { migrated: boolean; message: string } {
  console.log('🔧 INICIANDO MIGRACIÓN COMPLETA DE DATOS...')
  
  try {
    let migrationOccurred = false
    
    // Migrar ingresos (incomes)
    const savedIncomes = localStorage.getItem('refresquitos-incomes')
    if (savedIncomes) {
      const incomes: LegacyIncomeItem[] = JSON.parse(savedIncomes)
      const migratedIncomes = incomes.map(income => {
        if (!income.product) {
          migrationOccurred = true
          // Detectar producto por precio por unidad
          const pricePerUnit = income.quantity > 0 ? income.amount / income.quantity : 1000
          const detectedProduct = pricePerUnit >= 1500 ? 'Helado' : 'Refresco'
          console.log(`🔄 Migrando ingreso ID ${income.id}: $${income.amount}/${income.quantity} = $${pricePerUnit} → ${detectedProduct}`)
          return { ...income, product: detectedProduct }
        }
        return income
      })
      
      if (migrationOccurred) {
        localStorage.setItem('refresquitos-incomes', JSON.stringify(migratedIncomes))
        console.log(`✅ ${migratedIncomes.length} ingresos migrados`)
      }
    }
    
    // Migrar producciones (productions)
    const savedProductions = localStorage.getItem('refresquitos-productions')
    if (savedProductions) {
      const productions: LegacyProductionItem[] = JSON.parse(savedProductions)
      const migratedProductions = productions.map(production => {
        if (!production.product) {
          migrationOccurred = true
          console.log(`🔄 Migrando producción ID ${production.id}: ${production.quantity} unidades → Refresco`)
          return { ...production, product: 'Refresco' as const }
        }
        return production
      })
      
      if (migrationOccurred) {
        localStorage.setItem('refresquitos-productions', JSON.stringify(migratedProductions))
        console.log(`✅ ${migratedProductions.length} producciones migradas`)
      }
    }
    
    if (migrationOccurred) {
      console.log('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE')
      return { 
        migrated: true, 
        message: 'Datos migrados exitosamente. El inventario ahora está separado por producto.' 
      }
    } else {
      console.log('ℹ️ No se requiere migración, todos los datos ya tienen campo product')
      return { 
        migrated: false, 
        message: 'No se requiere migración, los datos ya están actualizados.' 
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    return { 
      migrated: false, 
      message: `Error durante la migración: ${error}` 
    }
  }
}

export function clearAllData(): void {
  console.log('🗑️ ELIMINANDO TODOS LOS DATOS...')
  localStorage.removeItem('refresquitos-incomes')
  localStorage.removeItem('refresquitos-expenses')
  localStorage.removeItem('refresquitos-productions')
  localStorage.removeItem('refresquitos-absences')
  localStorage.removeItem('refresquitos-employee-cycles')
  console.log('✅ Todos los datos eliminados')
}

export function debugLocalStorageData(): void {
  console.log('🔍 DEBUG: Analizando datos en localStorage...')
  
  const keys = ['refresquitos-incomes', 'refresquitos-productions', 'refresquitos-expenses']
  
  keys.forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      const parsed = JSON.parse(data)
      console.log(`📋 ${key}:`, parsed)
      
      if (key === 'refresquitos-incomes') {
        const withProduct = parsed.filter((item: any) => item.product).length
        const withoutProduct = parsed.length - withProduct
        console.log(`  → Con producto: ${withProduct}, Sin producto: ${withoutProduct}`)
      }
      
      if (key === 'refresquitos-productions') {
        const withProduct = parsed.filter((item: any) => item.product).length
        const withoutProduct = parsed.length - withProduct
        console.log(`  → Con producto: ${withProduct}, Sin producto: ${withoutProduct}`)
      }
    } else {
      console.log(`📋 ${key}: No data`)
    }
  })
}

// Función global para ejecutar desde consola del navegador
if (typeof window !== 'undefined') {
  (window as any).migrateFresquitos = migrateLocalStorageData;
  (window as any).debugFresquitos = debugLocalStorageData;
  (window as any).clearFresquitos = clearAllData;
} 