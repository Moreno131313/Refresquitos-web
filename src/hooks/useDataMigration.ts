import { useEffect, useState } from 'react'
import { IncomeItem, ProductionItem } from '@/lib/types'

export function useDataMigration(
  incomes: IncomeItem[], 
  productions: ProductionItem[],
  setIncomes: (incomes: IncomeItem[]) => void,
  setProductions: (productions: ProductionItem[]) => void
) {
  const [migrationCompleted, setMigrationCompleted] = useState(false)

  const performMigration = () => {
    console.log('🔧 INICIANDO MIGRACIÓN AUTOMÁTICA DE DATOS...')
    
    let needsMigration = false

    // Migrar ingresos
    const migratedIncomes = incomes.map(income => {
      if (!(income as any).product) {
        needsMigration = true
        const pricePerUnit = income.quantity > 0 ? income.amount / income.quantity : 1000
        const detectedProduct = pricePerUnit >= 1500 ? 'Helado' : 'Refresco'
        console.log(`🔄 Migrando ingreso: ${income.amount}/${income.quantity} = ${pricePerUnit} → ${detectedProduct}`)
        return { ...income, product: detectedProduct }
      }
      return income
    })

    // Migrar producciones
    const migratedProductions = productions.map(production => {
      if (!(production as any).product) {
        needsMigration = true
        console.log(`🔄 Migrando producción: ${production.quantity} unidades → Refresco`)
        return { ...production, product: 'Refresco' }
      }
      return production
    })

    if (needsMigration) {
      console.log('✅ APLICANDO MIGRACIÓN...')
      setIncomes(migratedIncomes)
      setProductions(migratedProductions)
      setMigrationCompleted(true)
      
      // Guardar inmediatamente en localStorage
      localStorage.setItem('refresquitos-incomes', JSON.stringify(migratedIncomes))
      localStorage.setItem('refresquitos-productions', JSON.stringify(migratedProductions))
      
      console.log('🎉 MIGRACIÓN COMPLETADA Y GUARDADA')
    } else {
      console.log('ℹ️ No se requiere migración, todos los datos tienen campo product')
    }
  }

  // Ejecutar migración cuando los datos cambien
  useEffect(() => {
    if (incomes.length > 0 || productions.length > 0) {
      const hasIncomeWithoutProduct = incomes.some(income => !(income as any).product)
      const hasProductionWithoutProduct = productions.some(prod => !(prod as any).product)
      
      if (hasIncomeWithoutProduct || hasProductionWithoutProduct) {
        console.log('🔍 DETECTADOS DATOS SIN CAMPO PRODUCT, INICIANDO MIGRACIÓN...')
        performMigration()
      }
    }
  }, [incomes.length, productions.length])

  return {
    migrationCompleted,
    performMigration
  }
} 