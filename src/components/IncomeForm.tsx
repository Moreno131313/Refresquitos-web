"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { incomeSchema, type IncomeFormData } from '@/lib/validators'
import { getCurrentDate } from '@/lib/utils'

interface IncomeFormProps {
  onSubmit: (data: IncomeFormData) => void
}

export default function IncomeForm({ onSubmit }: IncomeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: getCurrentDate(),
      quantity: 1,
      type: 'Venta Empleado',
      product: 'Refresco'
    }
  })

  const watchedType = watch('type')
  const watchedProduct = watch('product')

  const handleFormSubmit = (data: IncomeFormData) => {
    onSubmit(data)
    reset({
      date: getCurrentDate(),
      quantity: 1,
      type: 'Venta Empleado',
      product: 'Refresco'
    })
  }

  // Calcular precio total
  const quantity = watch('quantity') || 1
  const pricePerUnit = watchedProduct === 'Helado' ? 1800 : 1000
  const totalAmount = quantity * pricePerUnit

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Fecha
          </label>
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
          <label htmlFor="product" className="text-sm font-medium">
            Producto
          </label>
          <select
            id="product"
            {...register('product')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="Refresco">Refresco ($1,000)</option>
            <option value="Helado">Helado ($1,800)</option>
          </select>
          {errors.product && (
            <p className="text-sm text-red-500">{errors.product.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium">
            Cantidad de Unidades
          </label>
          <Input
            id="quantity"
            type="number"
            min="1"
            {...register('quantity', { valueAsNumber: true })}
            className={errors.quantity ? 'border-red-500' : ''}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500">{errors.quantity.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Total: ${totalAmount.toLocaleString()} COP
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Tipo de Venta
          </label>
          <select
            id="type"
            {...register('type')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="Venta Empleado">Venta Empleado</option>
            <option value="Pedido Puerto López">Pedido Puerto López</option>
            <option value="Pedido Puerto Gaitán">Pedido Puerto Gaitán</option>
            <option value="Paca Villavicencio">Paca Villavicencio</option>
          </select>
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>

        {watchedType === 'Venta Empleado' && (
          <div className="space-y-2">
            <label htmlFor="employee" className="text-sm font-medium">
              Empleado
            </label>
            <select
              id="employee"
              {...register('employee')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Seleccionar empleado</option>
              <option value="César">César</option>
              <option value="Yesid">Yesid</option>
            </select>
            {errors.employee && (
              <p className="text-sm text-red-500">{errors.employee.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? 'Registrando...' : 'Registrar Ingreso'}
        </Button>
      </div>
    </form>
  )
} 