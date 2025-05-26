"use client"

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  IncomeItem, 
  AbsenceRecord, 
  EmployeeCycleInfo, 
  EmployeeCyclePerformance 
} from '@/types/financials'
import { absenceSchema, type AbsenceFormData } from '@/lib/validators'
import { 
  formatDate, 
  getCurrentDate, 
  formatCurrency,
  calculateWorkedDaysInCycle,
  calculateAbsencesInCycle,
  calculateSalesInCycle,
  addDays
} from '@/lib/utils'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  RotateCcw,
  CheckCircle,
  Clock
} from 'lucide-react'

interface EmployeeDashboardProps {
  incomes: IncomeItem[]
  absences: AbsenceRecord[]
  employeeCycleInfoList: EmployeeCycleInfo[]
  onAddAbsence: (data: Omit<AbsenceRecord, 'id' | 'createdAt'>) => void
  onDeleteAbsence: (id: string) => void
  onUpdateEmployeeCycleStart: (employee: 'César' | 'Yesid', newStartDate: string) => void
  onStartNewCycle: (employee: 'César' | 'Yesid', newStartDate: string) => void
}

export default function EmployeeDashboard({ 
  incomes, 
  absences, 
  employeeCycleInfoList,
  onAddAbsence, 
  onDeleteAbsence,
  onUpdateEmployeeCycleStart,
  onStartNewCycle
}: EmployeeDashboardProps) {
  const [editingCycle, setEditingCycle] = useState<string | null>(null)
  const [newCycleDate, setNewCycleDate] = useState('')
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AbsenceFormData>({
    resolver: zodResolver(absenceSchema),
    defaultValues: {
      date: getCurrentDate(),
      employee: 'César'
    }
  })

  // Cálculo del rendimiento por ciclos de empleados
  const employeeCyclePerformance = useMemo(() => {
    return employeeCycleInfoList.map(cycleInfo => {
      const { employee, cycleStartDate } = cycleInfo
      
      // Calcular días trabajados y fecha de finalización si completó 30 días
      const { daysWorked, actualEndDate } = calculateWorkedDaysInCycle(
        incomes, 
        employee, 
        cycleStartDate
      )
      
      const isComplete = daysWorked >= 30
      const cycleEndDate = isComplete ? actualEndDate : undefined
      
      // Calcular ausencias en el ciclo
      const absencesInCycle = calculateAbsencesInCycle(
        absences, 
        employee, 
        cycleStartDate, 
        cycleEndDate
      )
      
      // Calcular ventas totales en el ciclo
      const totalSales = calculateSalesInCycle(
        incomes, 
        employee, 
        cycleStartDate, 
        cycleEndDate
      )
      
      // Determinar elegibilidad para bono
      let bonusEligible: boolean | 'PENDING'
      if (isComplete) {
        bonusEligible = absencesInCycle <= 4
      } else {
        bonusEligible = 'PENDING'
      }

      return {
        employee,
        cycleStartDate,
        cycleEndDate,
        daysWorked,
        totalSales,
        absencesInCycle,
        bonusEligible,
        isComplete
      } as EmployeeCyclePerformance
    })
  }, [incomes, absences, employeeCycleInfoList])

  const handleFormSubmit = (data: AbsenceFormData) => {
    onAddAbsence(data)
    reset({
      date: getCurrentDate(),
      employee: 'César'
    })
  }

  const handleEditCycleStart = (employee: string) => {
    const cycleInfo = employeeCycleInfoList.find(c => c.employee === employee)
    if (cycleInfo) {
      setNewCycleDate(cycleInfo.cycleStartDate)
      setEditingCycle(employee)
    }
  }

  const handleSaveCycleStart = (employee: 'César' | 'Yesid') => {
    if (newCycleDate) {
      console.log('🔍 Guardando fecha de ciclo:', {
        employee,
        selectedDate: newCycleDate,
        timestamp: new Date().toISOString()
      })
      onUpdateEmployeeCycleStart(employee, newCycleDate)
      setEditingCycle(null)
      setNewCycleDate('')
    }
  }

  const handleStartNewEmployeeCycle = (employee: 'César' | 'Yesid') => {
    const performance = employeeCyclePerformance.find(p => p.employee === employee)
    if (performance && performance.cycleEndDate) {
      const nextCycleStart = addDays(performance.cycleEndDate, 1)
      onStartNewCycle(employee, nextCycleStart)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario de Registro de Ausencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Registrar Ausencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Empleado</Label>
                <Select 
                  onValueChange={(value) => setValue('employee', value as 'César' | 'Yesid')}
                  defaultValue="César"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="César">César</SelectItem>
                    <SelectItem value="Yesid">Yesid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employee && (
                  <p className="text-sm text-red-500">{errors.employee.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha de Ausencia</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo (Opcional)</Label>
                <Input
                  id="reason"
                  {...register('reason')}
                  placeholder="Ej: Enfermedad, Personal..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                {isSubmitting ? 'Registrando...' : 'Registrar Ausencia'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Rendimiento por Ciclos de 30 Días Trabajados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employeeCyclePerformance.map((performance) => (
          <Card key={performance.employee} className="refresquitos-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  {performance.employee}
                </span>
                <div className="flex items-center gap-2">
                  {performance.isComplete ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-600" />
                  )}
                  {performance.bonusEligible === true && (
                    <Award className="h-5 w-5 text-green-600" />
                  )}
                  {performance.bonusEligible === false && (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ciclo de Evaluación de 30 Días Trabajados
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gestión de Fecha de Inicio de Ciclo */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Inicio del Ciclo Actual</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCycleStart(performance.employee)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                </div>
                
                {editingCycle === performance.employee ? (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={newCycleDate}
                      onChange={(e) => setNewCycleDate(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveCycleStart(performance.employee as 'César' | 'Yesid')}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCycle(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm font-mono text-blue-600">
                    {formatDate(performance.cycleStartDate)}
                  </p>
                )}
              </div>

              {/* Métricas del Ciclo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Días Trabajados</p>
                  <p className="text-lg font-bold text-blue-600">
                    {performance.daysWorked} / 30
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(performance.daysWorked / 30) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Ventas en Ciclo</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(performance.totalSales)}
                  </p>
                </div>
              </div>

              {/* Estado del Ciclo */}
              <div className="border-t pt-4">
                {performance.isComplete && performance.cycleEndDate && (
                  <div className="mb-3 p-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      ✅ Ciclo Completado
                    </p>
                    <p className="text-xs text-green-600">
                      Finalizado el: {formatDate(performance.cycleEndDate)}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ausencias en Ciclo</span>
                  <span className={`font-bold ${performance.absencesInCycle <= 4 ? 'text-green-600' : 'text-red-600'}`}>
                    {performance.absencesInCycle}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">Elegible para Bono</span>
                  <span className={`font-bold ${
                    performance.bonusEligible === 'PENDING' ? 'text-orange-600' :
                    performance.bonusEligible ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {performance.bonusEligible === 'PENDING' ? 'PENDIENTE' :
                     performance.bonusEligible ? 'SÍ' : 'NO'}
                  </span>
                </div>
                
                {performance.bonusEligible === false && (
                  <p className="text-xs text-red-500 mt-1">
                    Máximo 4 ausencias para bono
                  </p>
                )}
                
                {performance.bonusEligible === 'PENDING' && (
                  <p className="text-xs text-orange-500 mt-1">
                    Esperando completar 30 días trabajados
                  </p>
                )}
              </div>

              {/* Botón para Iniciar Nuevo Ciclo */}
              {performance.isComplete && (
                <div className="border-t pt-4">
                  <Button
                    onClick={() => handleStartNewEmployeeCycle(performance.employee as 'César' | 'Yesid')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Iniciar Nuevo Ciclo de Evaluación
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Ausencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Historial de Ausencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {absences.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay ausencias registradas</p>
          ) : (
            <div className="space-y-3">
              {absences.map((absence) => (
                <div key={absence.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{absence.employee}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(absence.date)}
                          {absence.reason && ` • ${absence.reason}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteAbsence(absence.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}