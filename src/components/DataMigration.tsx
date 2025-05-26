"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/useToast'
import { 
  IncomeItem, 
  ExpenseItem, 
  ProductionItem, 
  AbsenceRecord, 
  EmployeeCycleInfo 
} from '@/types/financials'
import { 
  collection, 
  doc, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Upload, Download, Database, AlertCircle } from 'lucide-react'

interface DataMigrationProps {
  userId: string
  onMigrationComplete: () => void
}

export default function DataMigration({ userId, onMigrationComplete }: DataMigrationProps) {
  const [migrating, setMigrating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [migrationStatus, setMigrationStatus] = useState<string>('')
  const { toast } = useToast()

  const migrateLocalStorageToFirebase = async () => {
    setMigrating(true)
    setProgress(0)
    setMigrationStatus('Iniciando migración...')

    try {
      // Obtener datos del localStorage
      const localIncomes = localStorage.getItem('refresquitos-incomes')
      const localExpenses = localStorage.getItem('refresquitos-expenses')
      const localProductions = localStorage.getItem('refresquitos-productions')
      const localAbsences = localStorage.getItem('refresquitos-absences')
      const localEmployeeCycles = localStorage.getItem('refresquitos-employee-cycles')

      const incomes: IncomeItem[] = localIncomes ? JSON.parse(localIncomes) : []
      const expenses: ExpenseItem[] = localExpenses ? JSON.parse(localExpenses) : []
      const productions: ProductionItem[] = localProductions ? JSON.parse(localProductions) : []
      const absences: AbsenceRecord[] = localAbsences ? JSON.parse(localAbsences) : []
      const employeeCycles: EmployeeCycleInfo[] = localEmployeeCycles ? JSON.parse(localEmployeeCycles) : []

      const totalItems = incomes.length + expenses.length + productions.length + absences.length + employeeCycles.length
      let processedItems = 0

      if (totalItems === 0) {
        setMigrationStatus('No hay datos para migrar')
        setProgress(100)
        toast({
          title: "Sin datos",
          description: "No se encontraron datos en el almacenamiento local para migrar"
        })
        setMigrating(false)
        return
      }

      // Migrar ingresos
      setMigrationStatus('Migrando ingresos...')
      for (const income of incomes) {
        const docRef = doc(collection(db, 'users', userId, 'incomes'), income.id)
        await setDoc(docRef, {
          ...income,
          createdAt: Timestamp.fromDate(new Date(income.createdAt))
        })
        processedItems++
        setProgress((processedItems / totalItems) * 100)
      }

      // Migrar gastos
      setMigrationStatus('Migrando gastos...')
      for (const expense of expenses) {
        const docRef = doc(collection(db, 'users', userId, 'expenses'), expense.id)
        await setDoc(docRef, {
          ...expense,
          createdAt: Timestamp.fromDate(new Date(expense.createdAt))
        })
        processedItems++
        setProgress((processedItems / totalItems) * 100)
      }

      // Migrar producciones
      setMigrationStatus('Migrando producciones...')
      for (const production of productions) {
        const docRef = doc(collection(db, 'users', userId, 'productions'), production.id)
        await setDoc(docRef, {
          ...production,
          createdAt: Timestamp.fromDate(new Date(production.createdAt))
        })
        processedItems++
        setProgress((processedItems / totalItems) * 100)
      }

      // Migrar ausencias
      setMigrationStatus('Migrando ausencias...')
      for (const absence of absences) {
        const docRef = doc(collection(db, 'users', userId, 'absences'), absence.id)
        await setDoc(docRef, {
          ...absence,
          createdAt: Timestamp.fromDate(new Date(absence.createdAt))
        })
        processedItems++
        setProgress((processedItems / totalItems) * 100)
      }

      // Migrar ciclos de empleados
      setMigrationStatus('Migrando ciclos de empleados...')
      for (const cycle of employeeCycles) {
        const docRef = doc(collection(db, 'users', userId, 'employeeCycles'), cycle.employee)
        await setDoc(docRef, cycle)
        processedItems++
        setProgress((processedItems / totalItems) * 100)
      }

      setMigrationStatus('¡Migración completada!')
      setProgress(100)

      toast({
        title: "Migración exitosa",
        description: `Se migraron ${totalItems} elementos a la nube`
      })

      // Limpiar localStorage después de migración exitosa
      localStorage.removeItem('refresquitos-incomes')
      localStorage.removeItem('refresquitos-expenses')
      localStorage.removeItem('refresquitos-productions')
      localStorage.removeItem('refresquitos-absences')
      localStorage.removeItem('refresquitos-employee-cycles')

      onMigrationComplete()

    } catch (error) {
      console.error('Error during migration:', error)
      setMigrationStatus('Error en la migración')
      toast({
        title: "Error en migración",
        description: "Hubo un problema al migrar los datos. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setMigrating(false)
    }
  }

  const checkLocalStorageData = () => {
    const localIncomes = localStorage.getItem('refresquitos-incomes')
    const localExpenses = localStorage.getItem('refresquitos-expenses')
    const localProductions = localStorage.getItem('refresquitos-productions')
    const localAbsences = localStorage.getItem('refresquitos-absences')
    const localEmployeeCycles = localStorage.getItem('refresquitos-employee-cycles')

    const incomes = localIncomes ? JSON.parse(localIncomes) : []
    const expenses = localExpenses ? JSON.parse(localExpenses) : []
    const productions = localProductions ? JSON.parse(localProductions) : []
    const absences = localAbsences ? JSON.parse(localAbsences) : []
    const employeeCycles = localEmployeeCycles ? JSON.parse(localEmployeeCycles) : []

    return {
      incomes: incomes.length,
      expenses: expenses.length,
      productions: productions.length,
      absences: absences.length,
      employeeCycles: employeeCycles.length,
      total: incomes.length + expenses.length + productions.length + absences.length + employeeCycles.length
    }
  }

  const localData = checkLocalStorageData()

  if (localData.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Base de Datos en la Nube
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se encontraron datos locales para migrar. Tu aplicación ya está configurada para usar la base de datos en la nube.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Migrar Datos a la Nube
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Se encontraron datos guardados localmente en tu navegador. Migra estos datos a la nube para acceder desde cualquier dispositivo.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">Datos encontrados:</h4>
          <ul className="text-sm space-y-1">
            <li>• {localData.incomes} ingresos</li>
            <li>• {localData.expenses} gastos</li>
            <li>• {localData.productions} producciones</li>
            <li>• {localData.absences} ausencias</li>
            <li>• {localData.employeeCycles} ciclos de empleados</li>
          </ul>
          <p className="text-sm font-medium">Total: {localData.total} elementos</p>
        </div>

        {migrating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{migrationStatus}</span>
              <span className="text-sm">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={migrateLocalStorageToFirebase}
            disabled={migrating}
            className="flex-1"
          >
            {migrating ? 'Migrando...' : 'Migrar a la Nube'}
          </Button>
          <Button 
            variant="outline"
            onClick={onMigrationComplete}
            disabled={migrating}
          >
            Omitir
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Después de la migración, los datos locales se eliminarán automáticamente y todos los nuevos datos se guardarán en la nube.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
} 