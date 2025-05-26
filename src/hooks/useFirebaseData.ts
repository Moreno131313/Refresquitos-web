import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  IncomeItem, 
  ExpenseItem, 
  ProductionItem, 
  AbsenceRecord, 
  EmployeeCycleInfo 
} from '@/types/financials'

export function useFirebaseData(userId: string) {
  const [incomes, setIncomes] = useState<IncomeItem[]>([])
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [productions, setProductions] = useState<ProductionItem[]>([])
  const [absences, setAbsences] = useState<AbsenceRecord[]>([])
  const [employeeCycleInfoList, setEmployeeCycleInfoList] = useState<EmployeeCycleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener la referencia de la colección del usuario
  const getUserCollection = (collectionName: string) => {
    return collection(db, 'users', userId, collectionName)
  }

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!userId) return

    const unsubscribes: (() => void)[] = []

    try {
      // Suscribirse a ingresos
      const incomesQuery = query(
        getUserCollection('incomes'), 
        orderBy('createdAt', 'desc')
      )
      const unsubIncomes = onSnapshot(incomesQuery, (snapshot) => {
        const incomesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as IncomeItem[]
        setIncomes(incomesData)
      })
      unsubscribes.push(unsubIncomes)

      // Suscribirse a gastos
      const expensesQuery = query(
        getUserCollection('expenses'), 
        orderBy('createdAt', 'desc')
      )
      const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
        const expensesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ExpenseItem[]
        setExpenses(expensesData)
      })
      unsubscribes.push(unsubExpenses)

      // Suscribirse a producción
      const productionsQuery = query(
        getUserCollection('productions'), 
        orderBy('createdAt', 'desc')
      )
      const unsubProductions = onSnapshot(productionsQuery, (snapshot) => {
        const productionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProductionItem[]
        setProductions(productionsData)
      })
      unsubscribes.push(unsubProductions)

      // Suscribirse a ausencias
      const absencesQuery = query(
        getUserCollection('absences'), 
        orderBy('createdAt', 'desc')
      )
      const unsubAbsences = onSnapshot(absencesQuery, (snapshot) => {
        const absencesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AbsenceRecord[]
        setAbsences(absencesData)
      })
      unsubscribes.push(unsubAbsences)

      // Suscribirse a ciclos de empleados
      const cyclesQuery = getUserCollection('employeeCycles')
      const unsubCycles = onSnapshot(cyclesQuery, (snapshot) => {
        const cyclesData = snapshot.docs.map(doc => ({
          ...doc.data()
        })) as EmployeeCycleInfo[]
        setEmployeeCycleInfoList(cyclesData)
      })
      unsubscribes.push(unsubCycles)

      setLoading(false)
    } catch (err) {
      console.error('Error setting up Firebase listeners:', err)
      setError('Error al conectar con la base de datos')
      setLoading(false)
    }

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [userId])

  // Funciones para agregar datos
  const addIncome = async (incomeData: Omit<IncomeItem, 'id' | 'createdAt'>) => {
    try {
      const docRef = doc(getUserCollection('incomes'))
      await setDoc(docRef, {
        ...incomeData,
        createdAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error adding income:', err)
      throw new Error('Error al guardar el ingreso')
    }
  }

  const addExpense = async (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    try {
      const docRef = doc(getUserCollection('expenses'))
      await setDoc(docRef, {
        ...expenseData,
        createdAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error adding expense:', err)
      throw new Error('Error al guardar el gasto')
    }
  }

  const addProduction = async (productionData: Omit<ProductionItem, 'id' | 'createdAt'>) => {
    try {
      const docRef = doc(getUserCollection('productions'))
      await setDoc(docRef, {
        ...productionData,
        createdAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error adding production:', err)
      throw new Error('Error al guardar la producción')
    }
  }

  const addAbsence = async (absenceData: Omit<AbsenceRecord, 'id' | 'createdAt'>) => {
    try {
      const docRef = doc(getUserCollection('absences'))
      await setDoc(docRef, {
        ...absenceData,
        createdAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error adding absence:', err)
      throw new Error('Error al guardar la ausencia')
    }
  }

  const updateEmployeeCycleStart = async (employee: 'César' | 'Yesid', newStartDate: string) => {
    try {
      const docRef = doc(getUserCollection('employeeCycles'), employee)
      await setDoc(docRef, {
        employee,
        cycleStartDate: newStartDate
      }, { merge: true })
    } catch (err) {
      console.error('Error updating employee cycle:', err)
      throw new Error('Error al actualizar el ciclo del empleado')
    }
  }

  // Funciones para eliminar datos
  const deleteIncome = async (id: string) => {
    try {
      await deleteDoc(doc(getUserCollection('incomes'), id))
    } catch (err) {
      console.error('Error deleting income:', err)
      throw new Error('Error al eliminar el ingreso')
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(getUserCollection('expenses'), id))
    } catch (err) {
      console.error('Error deleting expense:', err)
      throw new Error('Error al eliminar el gasto')
    }
  }

  const deleteProduction = async (id: string) => {
    try {
      await deleteDoc(doc(getUserCollection('productions'), id))
    } catch (err) {
      console.error('Error deleting production:', err)
      throw new Error('Error al eliminar la producción')
    }
  }

  const deleteAbsence = async (id: string) => {
    try {
      await deleteDoc(doc(getUserCollection('absences'), id))
    } catch (err) {
      console.error('Error deleting absence:', err)
      throw new Error('Error al eliminar la ausencia')
    }
  }

  return {
    // Datos
    incomes,
    expenses,
    productions,
    absences,
    employeeCycleInfoList,
    
    // Estado
    loading,
    error,
    
    // Funciones para agregar
    addIncome,
    addExpense,
    addProduction,
    addAbsence,
    updateEmployeeCycleStart,
    
    // Funciones para eliminar
    deleteIncome,
    deleteExpense,
    deleteProduction,
    deleteAbsence
  }
} 