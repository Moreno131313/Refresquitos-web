'use client'

import React, { useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { db } from '@/lib/firebase'
import { addDoc, collection } from 'firebase/firestore'
import { useAuth } from './AuthProvider'

interface InvoiceData {
  customerName: string
  phone: string
  quantity: number
  unitPrice: number
  notes?: string
}

const initialData: InvoiceData = {
  customerName: '',
  phone: '',
  quantity: 1,
  unitPrice: 0,
  notes: '',
}

export default function InvoiceForm() {
  const [data, setData] = useState<InvoiceData>(initialData)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth() || {}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice' ? Number(value) : value,
    }))
  }

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      if (!user?.email) throw new Error('Debes iniciar sesión para emitir una factura.')
      // Guardar en Firestore
      const invoiceToSave = {
        ...data,
        total: data.quantity * data.unitPrice,
        createdAt: new Date().toISOString(),
        userEmail: user.email,
        userName: user.name || '',
      }
      await addDoc(collection(db, 'users', user.email, 'invoices'), invoiceToSave)
      setSuccess(true)
      setShowPreview(true)
    } catch (err: any) {
      setError(err.message || 'Error al guardar la factura')
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContents
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload()
    }
  }

  const total = data.quantity * data.unitPrice

  return (
    <div className="max-w-xl mx-auto my-8">
      <Card>
        <CardHeader>
          <CardTitle>Emitir Factura de Pacas/Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          {!showPreview ? (
            <form className="space-y-4" onSubmit={handlePreview}>
              <div>
                <label className="block text-sm font-medium">Nombre del Cliente</label>
                <input
                  type="text"
                  name="customerName"
                  value={data.customerName}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={data.phone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Cantidad</label>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    value={data.quantity}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium">Valor Unitario</label>
                  <input
                    type="number"
                    name="unitPrice"
                    min={0}
                    value={data.unitPrice}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Notas (opcional)</label>
                <textarea
                  name="notes"
                  value={data.notes}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-semibold">Total: ${total.toLocaleString()}</span>
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Vista previa'}</Button>
              </div>
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              {success && <div className="text-green-600 text-sm mt-2">Factura guardada correctamente</div>}
            </form>
          ) : (
            <div>
              <div ref={printRef} className="bg-white p-6 rounded border mb-4 print:shadow-none print:border-none">
                {/* Branding Refresquitos */}
                <div className="flex items-center gap-4 mb-6">
                  <img src="/logo1.png" alt="Refresquitos Logo" className="h-16 w-16 object-contain" />
                  <div>
                    <h2 className="text-2xl font-bold text-green-700">Refresquitos</h2>
                    <div className="text-sm text-gray-600">Factura de Pacas/Pedido</div>
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 text-sm">Fecha: {new Date().toLocaleDateString()}</span>
                  <span className="text-gray-500 text-sm">Emitida por: {user?.name || user?.email}</span>
                </div>
                <hr className="my-2" />
                <div className="mb-2">
                  <span className="font-medium">Cliente:</span> {data.customerName}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Teléfono:</span> {data.phone}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Cantidad:</span> {data.quantity}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Valor Unitario:</span> ${data.unitPrice.toLocaleString()}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Total:</span> <span className="text-lg font-bold">${total.toLocaleString()}</span>
                </div>
                {data.notes && (
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">Notas:</span> {data.notes}
                  </div>
                )}
                <hr className="my-4" />
                <div className="text-xs text-gray-500 text-center">
                  ¡Gracias por tu compra!<br />
                  Refresquitos - Sabor y frescura para tu día
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePrint} type="button">Imprimir</Button>
                <Button variant="outline" onClick={() => setShowPreview(false)} type="button">Editar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 