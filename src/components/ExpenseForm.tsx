"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ExpenseItem } from '@/types/financials'
import { getCurrentDate } from '@/lib/utils'

interface ExpenseFormProps {
  onSubmit: (data: Omit<ExpenseItem, 'id' | 'createdAt'>) => void
}

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Costos Fijos' as ExpenseItem['category'],
    type: '',
    amount: 0,
    date: getCurrentDate()
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.type && formData.amount > 0) {
      onSubmit(formData)
      setFormData({
        name: '',
        category: 'Costos Fijos',
        type: '',
        amount: 0,
        date: getCurrentDate()
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre del Gasto</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Electricidad, Materia prima..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ExpenseItem['category'] }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="Costos Fijos">Costos Fijos</option>
            <option value="Materia Prima Directa">Materia Prima Directa</option>
            <option value="Mano de Obra Directa">Mano de Obra Directa</option>
            <option value="Costos Indirectos de Fabricación">Costos Indirectos de Fabricación</option>
            <option value="Gastos Administrativos">Gastos Administrativos</option>
            <option value="Gastos de Ventas">Gastos de Ventas</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo</label>
          <Input
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            placeholder="Ej: Mensual, Único, Semanal..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Monto</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          Registrar Gasto
        </Button>
      </div>
    </form>
  )
} 