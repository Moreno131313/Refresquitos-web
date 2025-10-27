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
  Timestamp,
  getDoc,
  getDocs
} from 'firebase/firestore'
import { db, isFirebaseAvailable } from '@/lib/firebase'
import { generateId } from '@/lib/utils'
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
  EmployeeCycleFormData,
  DamagedProduct
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
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);

  // Computed property for employeeCycleInfoList
  const employeeCycleInfoList: EmployeeCycleInfo[] = useMemo(() => {
    const activeCycles = employeeCycles.filter(cycle => cycle.isActive)
    
    // Si no hay ciclos activos, crear ciclos por defecto
    if (activeCycles.length === 0 && user?.email) {
      const today = new Date().toISOString().split('T')[0]
      return [
        { id: generateId(), employee: 'César', cycleStartDate: today },
        { id: generateId(), employee: 'Yesid', cycleStartDate: today }
      ]
    }
    
    return activeCycles.map(cycle => ({
      id: cycle.id || generateId(),
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
      
      // Cargar datos de localStorage
      const savedIncomes = localStorage.getItem('refresquitos-incomes')
      const savedExpenses = localStorage.getItem('refresquitos-expenses')
      const savedProductions = localStorage.getItem('refresquitos-productions')
      const savedAbsences = localStorage.getItem('refresquitos-absences')
      const savedEmployeeCycles = localStorage.getItem('refresquitos-employee-cycles')
      const savedBonuses = localStorage.getItem('refresquitos-bonuses')

      if (savedIncomes) {
        const incomesData = JSON.parse(savedIncomes)
        
        // Migración automática: corregir precios de Paca en localStorage
        const correctedIncomes = incomesData.map((income: any) => {
          if (income.product === 'Paca' && income.amount === income.quantity * 1000) {
            // Este ingreso de Paca tiene precio incorrecto, corregirlo
            const correctedAmount = income.quantity * 9000
            console.log(`🔧 Migrando ingreso de Paca en localStorage: ${income.id} - ${income.amount} → ${correctedAmount}`)
            
            return { ...income, amount: correctedAmount }
          }
          return income
        })
        
        // Guardar datos corregidos en localStorage
        if (JSON.stringify(incomesData) !== JSON.stringify(correctedIncomes)) {
          localStorage.setItem('refresquitos-incomes', JSON.stringify(correctedIncomes))
        }
        
        setIncomes(correctedIncomes)
      }

      if (savedExpenses) {
        const expensesData = JSON.parse(savedExpenses)
        setExpenses(expensesData)
      }

      if (savedProductions) {
        const productionsData = JSON.parse(savedProductions)
        setProductions(productionsData)
      }

      if (savedAbsences) {
        const absencesData = JSON.parse(savedAbsences)
        setAbsences(absencesData)
      }

      if (savedEmployeeCycles) {
        const cyclesData = JSON.parse(savedEmployeeCycles)
        setEmployeeCycles(cyclesData)
        
        // Inicializar ciclos automáticamente si no existen
        const activeCycles = cyclesData.filter((cycle: any) => cycle.isActive)
        if (activeCycles.length === 0) {
          const today = new Date().toISOString().split('T')[0]
          
          // Crear ciclos para César y Yesid
          const initializeCycles = async () => {
            try {
              await addDoc(collection(db, 'users', user.email, 'employeeCycles'), {
                employee: 'César',
                startDate: today,
                isActive: true,
                createdAt: new Date().toISOString()
              })
              
              await addDoc(collection(db, 'users', user.email, 'employeeCycles'), {
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
      }

      if (savedBonuses) {
        const bonusesData = JSON.parse(savedBonuses)
        setBonuses(bonusesData)
      }

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
        
        // Migración automática: corregir precios de Paca
        const correctedIncomes = incomesData.map(income => {
          if (income.product === 'Paca' && income.amount === income.quantity * 1000) {
            // Este ingreso de Paca tiene precio incorrecto, corregirlo
            const correctedAmount = income.quantity * 9000
            console.log(`🔧 Migrando ingreso de Paca: ${income.id} - ${income.amount} → ${correctedAmount}`)
            
            // Actualizar en Firebase
            const incomeDoc = doc(db, 'users', user.email, 'incomes', income.id)
            updateDoc(incomeDoc, { amount: correctedAmount }).catch(console.error)
            
            return { ...income, amount: correctedAmount }
          }
          return income
        })
        
        setIncomes(correctedIncomes)
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

      // Suscripción a productos dañados
      const damagedProductsCollection = collection(db, 'users', user.email, 'damagedProducts');
      const damagedProductsQuery = query(damagedProductsCollection, orderBy('date', 'desc'));
      const unsubDamagedProducts = onSnapshot(damagedProductsQuery, (snapshot) => {
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Migración automática: si no tiene id, actualizarlo
          if (!data.id) {
            updateDoc(doc.ref, { id: doc.id });
          }
          return {
            id: doc.id,
            ...data,
          };
        }) as DamagedProduct[];
        setDamagedProducts(productsData);
      });
      unsubscribes.push(unsubDamagedProducts);

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
    const pricePerUnit = incomeData.product === 'Helado' ? 1800 : incomeData.product === 'Paca' ? 9000 : 1000
    const amount = incomeData.quantity * pricePerUnit
    
    // Crear el objeto income base sin campos undefined
    const income: any = {
      quantity: incomeData.quantity,
      product: incomeData.product,
      type: incomeData.type,
      amount,
      createdAt: new Date().toISOString(),
      date: incomeData.date || new Date().toISOString().split('T')[0]
    }
    
    // Solo incluir employee si tiene un valor válido
    if (incomeData.employee && incomeData.employee.trim() !== '') {
      income.employee = incomeData.employee
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

  const addDamagedProduct = async (product: DamagedProduct) => {
    const collection = getUserCollection('damagedProducts');
    if (!collection) throw new Error('User not authenticated');
    const docRef = await addDoc(collection, { ...product, id: generateId() });
    setDamagedProducts(prev => [...prev, { ...product, id: docRef.id }]);
    // NO crear ingreso en incomes - solo registrar en damagedProducts
  };

  // Update functions
  const updateEmployeeCycleStart = async (employee: 'César' | 'Yesid', newStartDate: string) => {
    console.log('📅 Firebase updateEmployeeCycleStart:', {
      employee,
      newStartDate,
      originalType: typeof newStartDate,
      timestamp: new Date().toISOString()
    })
    
    const activeCycle = employeeCycles.find(cycle => 
      cycle.employee === employee && cycle.isActive
    )
    
    if (activeCycle) {
      console.log('📝 Actualizando ciclo existente:', {
        cycleId: activeCycle.id,
        currentStartDate: activeCycle.startDate,
        newStartDate
      })
      
      const cycleDoc = doc(db, 'users', user?.email || '', 'employeeCycles', activeCycle.id)
      await updateDoc(cycleDoc, {
        startDate: newStartDate,
        updatedAt: new Date().toISOString()
      })
      
      console.log('✅ Ciclo actualizado en Firebase')
    } else {
      console.log('📝 Creando nuevo ciclo:', { employee, newStartDate })
      
      // Create new cycle if none exists
      await addEmployeeCycle({
        employee,
        startDate: newStartDate,
        isActive: true
      })
      
      console.log('✅ Nuevo ciclo creado en Firebase')
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
    if (!user?.email) {
      // Fallback a localStorage si no hay usuario autenticado
      console.log('⚠️ Usuario no autenticado, usando localStorage fallback para eliminar ciclo')
      const savedCycles = localStorage.getItem('refresquitos-employee-cycles')
      if (savedCycles) {
        const cycles = JSON.parse(savedCycles)
        const updatedCycles = cycles.filter((cycle: any) => cycle.id !== id)
        localStorage.setItem('refresquitos-employee-cycles', JSON.stringify(updatedCycles))
        // Actualizar el estado local
        setEmployeeCycles(updatedCycles)
      }
      return
    }
    
    if (!isFirebaseAvailable()) {
      // Fallback a localStorage si Firebase no está disponible
      console.log('⚠️ Firebase no disponible, usando localStorage fallback para eliminar ciclo')
      const savedCycles = localStorage.getItem('refresquitos-employee-cycles')
      if (savedCycles) {
        const cycles = JSON.parse(savedCycles)
        const updatedCycles = cycles.filter((cycle: any) => cycle.id !== id)
        localStorage.setItem('refresquitos-employee-cycles', JSON.stringify(updatedCycles))
        // Actualizar el estado local
        setEmployeeCycles(updatedCycles)
      }
      return
    }
    
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

  const deleteDamagedProduct = async (id: string) => {
    const collection = getUserCollection('damagedProducts');
    if (!collection) throw new Error('User not authenticated');
    const docRef = doc(collection, id);
    await deleteDoc(docRef);
    setDamagedProducts(prev => prev.filter(item => item.id !== id));
  };

  // Función de limpieza para eliminar ingresos antiguos de tipo "Producto Dañado"
  const cleanupOldDamagedProductIncomes = async () => {
    if (!user?.email) return;
    
    try {
      const incomesCollection = getUserCollection('incomes');
      if (!incomesCollection) return;
      
      // Buscar todos los ingresos de tipo "Producto Dañado"
      const snapshot = await getDocs(query(incomesCollection));
      const documentsToDelete: string[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.type === 'Producto Dañado' || data.type === 'Restauración por eliminación de daño') {
          documentsToDelete.push(doc.id);
        }
      });
      
      // Eliminar todos los documentos encontrados
      for (const docId of documentsToDelete) {
        const docRef = doc(incomesCollection, docId);
        await deleteDoc(docRef);
      }
      
      console.log(`🧹 Limpieza completada: ${documentsToDelete.length} registros antiguos eliminados`);
      
      if (documentsToDelete.length > 0) {
        // Recargar los datos después de la limpieza
        window.location.reload();
      }
    } catch (error) {
      console.error('Error durante la limpieza:', error);
    }
  };

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
    deleteBonus,
    addDamagedProduct,
    deleteDamagedProduct,
    damagedProducts,
    cleanupOldDamagedProductIncomes
  }
} 