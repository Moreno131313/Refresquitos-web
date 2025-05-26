'use client'

import { useState, useEffect } from 'react'
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
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'
import { 
  IncomeItem, 
  ExpenseItem, 
  ProductionItem, 
  AbsenceRecord, 
  EmployeeCycleInfo 
} from '@/types/financials'

export interface Income {
  id: string
  amount: number
  date: string
  description?: string
}

export interface Expense {
  id: string
  amount: number
  date: string
  description: string
  category?: string
}

export interface Production {
  id: string
  date: string
  quantity: number
  materials: {
    [key: string]: number
  }
  totalCost: number
}

export interface Absence {
  id: string
  employeeName: string
  date: string
  reason?: string
}

export interface EmployeeCycle {
  id: string
  employeeName: string
  startDate: string
  endDate: string
  isActive: boolean
}

export function useFirebaseData() {
  const { user } = useAuth()
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [productions, setProductions] = useState<Production[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [employeeCycles, setEmployeeCycles] = useState<EmployeeCycle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get user-specific collection path
  const getUserCollection = (collectionName: string) => {
    if (!user?.email) return null
    return collection(db, 'users', user.email, collectionName)
  }

  useEffect(() => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    const unsubscribes: (() => void)[] = []

    try {
      // Subscribe to incomes
      const incomesCollection = getUserCollection('incomes')
      if (incomesCollection) {
        const incomesQuery = query(incomesCollection, orderBy('date', 'desc'))
        const unsubIncomes = onSnapshot(incomesQuery, (snapshot) => {
          const incomesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Income[]
          setIncomes(incomesData)
        })
        unsubscribes.push(unsubIncomes)
      }

      // Subscribe to expenses
      const expensesCollection = getUserCollection('expenses')
      if (expensesCollection) {
        const expensesQuery = query(expensesCollection, orderBy('date', 'desc'))
        const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
          const expensesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Expense[]
          setExpenses(expensesData)
        })
        unsubscribes.push(unsubExpenses)
      }

      // Subscribe to productions
      const productionsCollection = getUserCollection('productions')
      if (productionsCollection) {
        const productionsQuery = query(productionsCollection, orderBy('date', 'desc'))
        const unsubProductions = onSnapshot(productionsQuery, (snapshot) => {
          const productionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Production[]
          setProductions(productionsData)
        })
        unsubscribes.push(unsubProductions)
      }

      // Subscribe to absences
      const absencesCollection = getUserCollection('absences')
      if (absencesCollection) {
        const absencesQuery = query(absencesCollection, orderBy('date', 'desc'))
        const unsubAbsences = onSnapshot(absencesQuery, (snapshot) => {
          const absencesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Absence[]
          setAbsences(absencesData)
        })
        unsubscribes.push(unsubAbsences)
      }

      // Subscribe to employee cycles
      const cyclesCollection = getUserCollection('employeeCycles')
      if (cyclesCollection) {
        const cyclesQuery = query(cyclesCollection, orderBy('startDate', 'desc'))
        const unsubCycles = onSnapshot(cyclesQuery, (snapshot) => {
          const cyclesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as EmployeeCycle[]
          setEmployeeCycles(cyclesData)
        })
        unsubscribes.push(unsubCycles)
      }

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
  const addIncome = async (income: Omit<Income, 'id'>) => {
    const collection = getUserCollection('incomes')
    if (!collection) throw new Error('User not authenticated')
    
    await addDoc(collection, {
      ...income,
      date: income.date || new Date().toISOString().split('T')[0]
    })
  }

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const collection = getUserCollection('expenses')
    if (!collection) throw new Error('User not authenticated')
    
    await addDoc(collection, {
      ...expense,
      date: expense.date || new Date().toISOString().split('T')[0]
    })
  }

  const addProduction = async (production: Omit<Production, 'id'>) => {
    const collection = getUserCollection('productions')
    if (!collection) throw new Error('User not authenticated')
    
    await addDoc(collection, {
      ...production,
      date: production.date || new Date().toISOString().split('T')[0]
    })
  }

  const addAbsence = async (absence: Omit<Absence, 'id'>) => {
    const collection = getUserCollection('absences')
    if (!collection) throw new Error('User not authenticated')
    
    await addDoc(collection, {
      ...absence,
      date: absence.date || new Date().toISOString().split('T')[0]
    })
  }

  const addEmployeeCycle = async (cycle: Omit<EmployeeCycle, 'id'>) => {
    const collection = getUserCollection('employeeCycles')
    if (!collection) throw new Error('User not authenticated')
    
    await addDoc(collection, cycle)
  }

  // Update functions
  const updateIncome = async (id: string, updates: Partial<Income>) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'incomes', id)
    await updateDoc(docRef, updates)
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'expenses', id)
    await updateDoc(docRef, updates)
  }

  const updateProduction = async (id: string, updates: Partial<Production>) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'productions', id)
    await updateDoc(docRef, updates)
  }

  const updateAbsence = async (id: string, updates: Partial<Absence>) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'absences', id)
    await updateDoc(docRef, updates)
  }

  const updateEmployeeCycle = async (id: string, updates: Partial<EmployeeCycle>) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'employeeCycles', id)
    await updateDoc(docRef, updates)
  }

  // Delete functions
  const deleteIncome = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'incomes', id)
    await deleteDoc(docRef)
  }

  const deleteExpense = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'expenses', id)
    await deleteDoc(docRef)
  }

  const deleteProduction = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'productions', id)
    await deleteDoc(docRef)
  }

  const deleteAbsence = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'absences', id)
    await deleteDoc(docRef)
  }

  const deleteEmployeeCycle = async (id: string) => {
    if (!user?.email) throw new Error('User not authenticated')
    const docRef = doc(db, 'users', user.email, 'employeeCycles', id)
    await deleteDoc(docRef)
  }

  return {
    // Data
    incomes,
    expenses,
    productions,
    absences,
    employeeCycles,
    loading,
    error,
    
    // Add functions
    addIncome,
    addExpense,
    addProduction,
    addAbsence,
    addEmployeeCycle,
    
    // Update functions
    updateIncome,
    updateExpense,
    updateProduction,
    updateAbsence,
    updateEmployeeCycle,
    
    // Delete functions
    deleteIncome,
    deleteExpense,
    deleteProduction,
    deleteAbsence,
    deleteEmployeeCycle
  }
} 