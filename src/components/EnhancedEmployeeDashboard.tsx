"use client"

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Income, 
  Absence, 
  EmployeeCycleInfo, 
  EmployeeBonus
} from '@/types/unified'
import { absenceSchema, type AbsenceFormData } from '@/lib/validators'
import { 
  formatDate, 
  getCurrentDate, 
  formatCurrency
} from '@/lib/utils'
import { 
  calculateEmployeeCycleDetail,
  generateEmployeeBonus,
  getEmployeeSalesHistory
} from '@/lib/business-logic'
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
  Clock,
  DollarSign,
  Target,
  History,
  Gift,
  Eye,
  Check,
  X
} from 'lucide-react'

interface EnhancedEmployeeDashboardProps {
  incomes: Income[]
  absences: Absence[]
  employeeCycleInfoList: EmployeeCycleInfo[]
  bonuses: EmployeeBonus[]
  onAddAbsence: (data: Omit<Absence, 'id' | 'createdAt'>) => void
  onDeleteAbsence: (id: string) => void
  onUpdateEmployeeCycleStart: (employee: 'César' | 'Yesid', newStartDate: string) => void
  onStartNewCycle: (employee: 'César' | 'Yesid', newStartDate: string) => void
  onAddBonus: (bonus: Omit<EmployeeBonus, 'id' | 'createdAt'>) => void
  onMarkBonusPaid: (bonusId: string, paidDate: string, notes?: string) => void
}

export default function EnhancedEmployeeDashboard({ 
  incomes, 
  absences, 
  employeeCycleInfoList,
  bonuses,
  onAddAbsence, 
  onDeleteAbsence,
  onUpdateEmployeeCycleStart,
  onStartNewCycle,
  onAddBonus,
  onMarkBonusPaid
}: EnhancedEmployeeDashboardProps) {
  const [editingCycle, setEditingCycle] = useState<string | null>(null)
  const [newCycleDate, setNewCycleDate] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<'César' | 'Yesid'>('César')
  const [viewingBonusDetails, setViewingBonusDetails] = useState<string | null>(null)
  
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

  // Calcular detalles de ciclos actuales
  const employeeCycleDetails = useMemo(() => {
    return employeeCycleInfoList.map(cycleInfo => {
      return calculateEmployeeCycleDetail(
        cycleInfo.employee,
        cycleInfo.cycleStartDate,
        incomes,
        absences
      )
    })
  }, [incomes, absences, employeeCycleInfoList])

  // Obtener historial de ventas por empleado
  const employeeSalesHistory = useMemo(() => {
    const cesarHistory = getEmployeeSalesHistory('César', incomes)
    const yesidHistory = getEmployeeSalesHistory('Yesid', incomes)
    return { César: cesarHistory, Yesid: yesidHistory }
  }, [incomes])

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
      onUpdateEmployeeCycleStart(employee, newCycleDate)
      setEditingCycle(null)
      setNewCycleDate('')
    }
  }

  const handleGenerateBonus = (cycleDetail: any) => {
    const bonus = generateEmployeeBonus(cycleDetail)
    if (bonus) {
      onAddBonus(bonus)
    }
  }

  const handleMarkBonusPaid = (bonusId: string) => {
    onMarkBonusPaid(bonusId, getCurrentDate())
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

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="cycles" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cycles" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Ciclos Actuales
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Historial Ventas
          </TabsTrigger>
          <TabsTrigger value="bonuses" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Bonos
          </TabsTrigger>
          <TabsTrigger value="absences" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Ausencias
          </TabsTrigger>
        </TabsList>

        {/* Ciclos Actuales */}
        <TabsContent value="cycles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employeeCycleDetails.map(cycleDetail => (
              <Card key={cycleDetail.employee} className="refresquitos-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      {cycleDetail.employee}
                    </span>
                    <div className="flex items-center gap-2">
                      {cycleDetail.isComplete ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-600" />
                      )}
                      {cycleDetail.bonusEligible && (
                        <Award className="h-5 w-5 text-green-600" />
                      )}
                      {cycleDetail.absences > 4 && (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Ciclo de Evaluación de 30 Días Trabajados
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Gestión de Fecha de Inicio */}
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Inicio del Ciclo</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCycleStart(cycleDetail.employee)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                    
                    {editingCycle === cycleDetail.employee ? (
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={newCycleDate}
                          onChange={(e) => setNewCycleDate(e.target.value)}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveCycleStart(cycleDetail.employee as 'César' | 'Yesid')}
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
                        {formatDate(cycleDetail.cycleStartDate)}
                      </p>
                    )}
                  </div>

                  {/* Métricas del Ciclo */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Días Trabajados</p>
                      <p className="text-lg font-bold text-blue-600">
                        {cycleDetail.daysWorked} / 30
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(cycleDetail.daysWorked / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Unidades Vendidas</p>
                      <p className="text-lg font-bold text-green-600">
                        {cycleDetail.totalUnits}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(cycleDetail.totalRevenue)}
                      </p>
                    </div>
                  </div>

                  {/* Promedio y Bono */}
                  <div className="border-t pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Promedio/Día</p>
                        <p className="text-lg font-bold text-purple-600">
                          {cycleDetail.averageUnitsPerDay.toFixed(1)} unidades
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bono Potencial</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(cycleDetail.bonusAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estado del Ciclo */}
                  <div className="space-y-2">
                    {cycleDetail.isComplete && cycleDetail.cycleEndDate && (
                      <div className="p-2 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ Ciclo Completado
                        </p>
                        <p className="text-xs text-green-600">
                          Finalizado el: {formatDate(cycleDetail.cycleEndDate)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ausencias</span>
                      <Badge variant={cycleDetail.absences <= 4 ? "default" : "destructive"}>
                        {cycleDetail.absences} / 4
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Elegible para Bono</span>
                      <Badge variant={cycleDetail.bonusEligible ? "default" : "destructive"}>
                        {cycleDetail.bonusEligible ? 'SÍ' : 'NO'}
                      </Badge>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="border-t pt-3 space-y-2">
                    {cycleDetail.isComplete && cycleDetail.bonusEligible && (
                      <Button
                        onClick={() => handleGenerateBonus(cycleDetail)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Generar Bono
                      </Button>
                    )}
                    
                    {cycleDetail.isComplete && (
                      <Button
                        onClick={() => onStartNewCycle(cycleDetail.employee as 'César' | 'Yesid', getCurrentDate())}
                        variant="outline"
                        className="w-full"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Iniciar Nuevo Ciclo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Historial de Ventas */}
        <TabsContent value="sales" className="space-y-6">
          <div className="flex gap-4 mb-4">
            <Select value={selectedEmployee} onValueChange={(value) => setSelectedEmployee(value as 'César' | 'Yesid')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="César">César</SelectItem>
                <SelectItem value="Yesid">Yesid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Historial de Ventas - {selectedEmployee}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employeeSalesHistory[selectedEmployee].length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay historial de ventas</p>
              ) : (
                <div className="space-y-4">
                  {employeeSalesHistory[selectedEmployee].map((period, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{period.period}</h4>
                        <Badge variant="outline">
                          {period.daysWorked} días trabajados
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Unidades</p>
                          <p className="font-bold text-blue-600">{period.totalUnits}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ingresos</p>
                          <p className="font-bold text-green-600">{formatCurrency(period.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Promedio/Día</p>
                          <p className="font-bold text-purple-600">{period.averageUnitsPerDay.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bono Potencial</p>
                          <p className="font-bold text-orange-600">
                            {formatCurrency(Math.round(period.averageUnitsPerDay * 1000))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestión de Bonos */}
        <TabsContent value="bonuses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                Historial de Bonos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bonuses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay bonos registrados</p>
              ) : (
                <div className="space-y-4">
                  {bonuses.map((bonus) => (
                    <div key={bonus.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{bonus.employee}</h4>
                          <Badge variant={bonus.isPaid ? "default" : "secondary"}>
                            {bonus.isPaid ? 'PAGADO' : 'PENDIENTE'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingBonusDetails(viewingBonusDetails === bonus.id ? null : bonus.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!bonus.isPaid && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkBonusPaid(bonus.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Marcar Pagado
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Período</p>
                          <p className="text-sm font-medium">
                            {formatDate(bonus.cycleStartDate)} - {formatDate(bonus.cycleEndDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Unidades</p>
                          <p className="font-bold text-blue-600">{bonus.totalUnits}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Promedio/Día</p>
                          <p className="font-bold text-purple-600">{bonus.averageUnitsPerDay.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bono</p>
                          <p className="font-bold text-green-600">{formatCurrency(bonus.bonusAmount)}</p>
                        </div>
                      </div>

                      {viewingBonusDetails === bonus.id && (
                        <div className="border-t pt-3 mt-3">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Días Trabajados</p>
                              <p className="font-medium">{bonus.workingDays}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Ausencias</p>
                              <p className="font-medium">{bonus.absences}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Ingresos Totales</p>
                              <p className="font-medium">{formatCurrency(bonus.totalRevenue)}</p>
                            </div>
                            {bonus.isPaid && bonus.paidDate && (
                              <div>
                                <p className="text-gray-600">Fecha de Pago</p>
                                <p className="font-medium">{formatDate(bonus.paidDate)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lista de Ausencias */}
        <TabsContent value="absences" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  )
} 