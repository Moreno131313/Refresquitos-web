"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductionItem, MATERIAL_NAMES } from '@/types/financials'
import { getCurrentDate } from '@/lib/utils'

interface ProductionFormProps {
  onSubmit: (data: Omit<ProductionItem, 'id' | 'createdAt' | 'totalCost' | 'costPerUnit'>) => void
}

export default function ProductionForm({ onSubmit }: ProductionFormProps) {
  const [quantity, setQuantity] = useState(1)
  const [directLaborCost, setDirectLaborCost] = useState(0)
  const [indirectCosts, setIndirectCosts] = useState(0)
  const [materialCosts, setMaterialCosts] = useState(
    MATERIAL_NAMES.map(name => ({ name, cost: 0 }))
  )

  const handleMaterialCostChange = (index: number, cost: number) => {
    setMaterialCosts(prev => 
      prev.map((item, i) => i === index ? { ...item, cost } : item)
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity > 0) {
      onSubmit({
        date: getCurrentDate(),
        quantity,
        materialCosts,
        directLaborCost,
        indirectCosts
      })
      // Reset form
      setQuantity(1)
      setDirectLaborCost(0)
      setIndirectCosts(0)
      setMaterialCosts(MATERIAL_NAMES.map(name => ({ name, cost: 0 })))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Cantidad Producida</label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Costo Mano de Obra Directa</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={directLaborCost}
            onChange={(e) => setDirectLaborCost(parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Costos Indirectos</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={indirectCosts}
            onChange={(e) => setIndirectCosts(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Costos de Materiales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialCosts.map((material, index) => (
            <div key={material.name} className="space-y-2">
              <label className="text-sm font-medium">{material.name}</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={material.cost}
                onChange={(e) => handleMaterialCostChange(index, parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Registrar Lote de Producción
        </Button>
      </div>
    </form>
  )
} 