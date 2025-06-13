'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db, isFirebaseAvailable } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'
import { 
  Income, 
  Expense, 
  Production, 
  Absence, 
  EmployeeCycle,
  EmployeeCycleInfo,
  EmployeeBonus,
  IncomeFormData,
  ExpenseFormData,
  ProductionFormData,
  AbsenceFormData,
  EmployeeCycleFormData
} from '@/types/unified'

export function useFirebaseData() {
  const { user } = useAuth()
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [productions, setProductions] = useState<Production[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [employeeCycles, setEmployeeCycles] = useState<EmployeeCycle[]>([])
  const [bonuses, setBonuses] = useState<EmployeeBonus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Computed property for employeeCycleInfoList
  const employeeCycleInfoList: EmployeeCycleInfo[] = useMemo(() => {
    const activeCycles = employeeCycles.filter(cycle => cycle.isActive)
    
    // Si no hay ciclos activos, crear ciclos por defecto
    if (activeCycles.length === 0 && user?.email) {
      const today = new Date().toISOString().split('T')[0]
      return [
        { employee: 'César', cycleStartDate: today },
        { employee: 'Yesid', cycleStartDate: today }
      ]
    }
    
    return activeCycles.map(cycle => ({
      employee: cycle.employee,
      cycleStartDate: cycle.startDate
    }))
  }, [employeeCycles, user?.email])

  // Get user-specific collection path - memoized to avoid dependency issues
  const getUserCollection = useCallback((collectionName: string) => {
    if (!user?.email || !isFirebaseAvailable()) return null
    return collection(db, 'users', user.email, collectionName)
  }, [user?.email])

  useEffect(() => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    if (!isFirebaseAvailable()) {
      console.log('Firebase not available, using localStorage fallback')
      setLoading(false)
      return
    }

    const unsubscribes: (() => void)[] = []

    try {
      // Subscribe to incomes
      const incomesCollection = collection(db, 'users', user.email, 'incomes')
      const incomesQuery = query(incomesCollection, orderBy('date', 'desc'))
      const unsubIncomes = onSnapshot(incomesQuery, (snapshot) => {
        const incomesData = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            product: data.product || 'Refresco', // Migración automática
            createdAt: data.createdAt || new Date().toISOString()
          }
        }) as Income[]
        setIncomes(incomesData)
      })
      unsubscribes.push(unsubIncomes)

      // Subscribe to expenses
      const expensesCollection = collection(db, 'users', user.email, 'expenses')
      const expensesQuery = query(expensesCollection, orderBy('date', 'desc'))
      const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
        const expensesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || new Date().toISOString()
        })) as Expense[]
        setExpenses(expensesData)
      })
      unsubscribes.push(unsubExpenses)

      // Subscribe to productions
      const productionsCollection = collection(db, 'users', user.email, 'productions')
      const productionsQuery = query(productionsCollection, orderBy('date', 'desc'))
      const unsubProductions = onSnapshot(productionsQuery, (snapshot) => {
        const productionsData = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            product: data.product || 'Refresco', // Migración automática
            createdAt: data.createdAt || new Date().toISOString()
          }
        }) as Production[]
        setProductions(productionsData)
      })
      unsubscribes.push(unsubProductions)

      // Subscribe to absences
      const absencesCollection = collection(db, 'users', user.email, 'absences')
      const absencesQuery = query(absencesCollection, orderBy('date', 'desc'))
      const unsubAbsences = onSnapshot(absencesQuery, (snapshot) => {
        const absencesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || new Date().toISOString()
        })) as Absence[]
        setAbsences(absencesData)
      })
      unsubscribes.push(unsubAbsences)

      // Subscribe to employee cycles
      const cyclesCollection = collection(db, 'users', user.email, 'employeeCycles')
      const cyclesQuery = query(cyclesCollection, orderBy('startDate', 'desc'))
      const unsubCycles = onSnapshot(cyclesQuery, (snapshot) => {
        const cyclesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || new Date().toISOString()
        })) as EmployeeCycle[]
        setEmployeeCycles(cyclesData)
        
        // Inicializar ciclos automáticamente si no existen
        const activeCycles = cyclesData.filter(cycle => cycle.isActive)
        if (activeCycles.length === 0) {
          const today = new Date().toISOString().split('T')[0]
          
          // Crear ciclos para César y Yesid
          const initializeCycles = async () => {
            try {
              await addDoc(cyclesCollection, {
                employee: 'César',
                startDate: today,
                isActive: true,
                createdAt: new Date().toISOString()
              })
              
              await addDoc(cyclesCollection, {
                employee: 'Yesid',
                startDate: today,
                isActive: true,
                createdAt: new Date().toISOString()
              })
              
              console.log('✅ Ciclos de empleados inicializados automáticamente')
            } catch (error) {
              console.error('Error inicializando ciclos:', error)
            }
          }
          
          initializeCycles()
        }
      })
      unsubscribes.push(unsubCycles)

      // Subscribe to bonuses
      const bonusesCollection = collection(db, 'users', user.email, 'bonuses')
      const bonusesQuery = query(bonusesCollection, orderBy('cycleStartDate', 'desc'))
      const unsubBonuses = onSnapshot(bonusesQuery, (snapshot) => {
        const bonusesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || new Date().toISOString()
        })) as EmployeeBonus[]
        setBonuses(bonusesData)
      })
      unsubscribes.push(unsubBonuses)

      setLoading(false)
    } catch (err) {
      console.error('Error setting up Firebase listeners:', err)
      setError('Error connecting to database')
      setLoading(false)
    }

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [user?.email])

  // Add functions
  const addIncome = async (incomeData: IncomeFormData) => {
    const collection = getUserCollection('incomes')
    if (!collection) throw new Error('User not authenticated')
    
    // Calcular el precio basado en el producto
    const pricePerUnit = incomeData.product === 'Helado' ? 1800 : 1000
    const amount = incomeData.quantity * pricePerUnit
    
    const income: Omit<Income, 'id'> = {
      ...incomeData,
      amount,
      createdAt: new Date().toISOString(),
      date: incomeData.date || new Date().toISOString().split('T')[0]
    }
    
    await addDoc(collection, income)
  }

  const addExpense = async (expenseData: ExpenseFormData) => {
    const collection = getUserCollection('expenses')
    if (!collection) throw new Error('User not authenticated')
    
    const expense: Omit<Expense, 'id'> = {
      ...expenseData,
      createdAt: new Date().toISOString(),
      date: expenseData.date || new Date().toISOString().split('T')[0]
    }
    
    await addDoc(collection, expense)
  }

  const addProduction = async (productionData: ProductionFormData) => {
    const collection = getUserCollection('productions')
    if (!collection) throw new Error('User not authenticated')
    
    const materialCostTotal = productionData.materialCosts.reduce((sum, material) => sum + material.cost, 0)
    const totalCost = materialCostTotal + productionData.directLaborCost + productionData.indirectCosts
    const costPerUnit = totalCost / productionData.quantity

    const production: Omit<Production, 'id'> = {
      ...productionData,
      totalCost,
      costPerUnit,
      createdAt: new Date().toISOString(),
      date: productionData.date || new Date().toISOString().split('T')[0]
    }
    
    await addDoc(collection, production)
  }

  const addAbsence = async (absenceData: AbsenceFormData) => {
    const collection = getUserCollection('absences')
    if (!collection) throw new Error('User not authenticated')
    
    const absence: Omit<Absence, 'id'> = {
      ...absenceData,
      createdAt: new Date().toISOString(),
      date: absenceData.date || new Date().toISOString().split('T')[0]
    }
    
    await addDoc(collection, absence)
  }

  const addEmployeeCycle = async (cycleData: EmployeeCycleFormData) => {
    const collection = getUserCollection('employeeCycles')
    if (!collection) throw new Error('User not authenticated')
    
    const cycle: Omit<EmployeeCycle, 'id'> = {
      ...cycleData,
      createdAt: new Date().toISOString()
    }
    
    await addDoc(collection, cycle)
  }

  // Update functions
  const updateEmployeeCycleStart = async (employee: 'César' | 'Yesid', newStartDate: string) => {
    const activeCycle = employeeCycles.find(cycle => 
      cycle.employee === employee && cycle.isActive
    )
    
    if (activeCycle) {
      const cycleDoc = doc(db, 'users', user?.email || '', 'employeeCycles', activeCycle.id)
      await updateDoc(cycleDoc, {
        startDate: newStartDate,
        updatedAt: new Date().toISOString()
      })
    } else {
      // Create new cycle if none exists
      await addEmployeeCycle({
        employee,
        startDate: newStartDate,
        isActive: true
      })
    }
  }

  // Delete functions
  const deleteIncome = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const incomeDoc = doc(db, 'users', user.email, 'incomes', id)
    await deleteDoc(incomeDoc)
  }

  const deleteExpense = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const expenseDoc = doc(db, 'users', user.email, 'expenses', id)
    await deleteDoc(expenseDoc)
  }

  const deleteProduction = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const productionDoc = doc(db, 'users', user.email, 'productions', id)
    await deleteDoc(productionDoc)
  }

  const deleteAbsence = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const absenceDoc = doc(db, 'users', user.email, 'absences', id)
    await deleteDoc(absenceDoc)
  }

  const deleteEmployeeCycle = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const cycleDoc = doc(db, 'users', user.email, 'employeeCycles', id)
    await deleteDoc(cycleDoc)
  }

  // Bonus functions
  const addBonus = async (bonusData: Omit<EmployeeBonus, 'id' | 'createdAt'>) => {
    const collection = getUserCollection('bonuses')
    if (!collection) throw new Error('User not authenticated')
    
    const bonus: Omit<EmployeeBonus, 'id'> = {
      ...bonusData,
      createdAt: new Date().toISOString()
    }
    
    await addDoc(collection, bonus)
  }

  const markBonusPaid = async (bonusId: string, paidDate: string, notes?: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const bonusDoc = doc(db, 'users', user.email, 'bonuses', bonusId)
    await updateDoc(bonusDoc, {
      isPaid: true,
      paidDate,
      notes,
      updatedAt: new Date().toISOString()
    })
  }

  const deleteBonus = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const bonusDoc = doc(db, 'users', user.email, 'bonuses', id)
    await deleteDoc(bonusDoc)
  }

  return {
    incomes,
    expenses,
    productions,
    absences,
    employeeCycles,
    employeeCycleInfoList,
    bonuses,
    loading,
    error,
    addIncome,
    addExpense,
    addProduction,
    addAbsence,
    addEmployeeCycle,
    addBonus,
    updateEmployeeCycleStart,
    markBonusPaid,
    deleteIncome,
    deleteExpense,
    deleteProduction,
    deleteAbsence,
    deleteEmployeeCycle,
    deleteBonus
  }
} 