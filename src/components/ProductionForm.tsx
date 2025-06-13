"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Production, MATERIAL_NAMES, PRODUCT_CONFIG, ProductionFormData, MaterialCost } from '@/types/unified'
import { getCurrentDate } from '@/lib/utils'

interface ProductionFormProps {
  onSubmit: (data: ProductionFormData) => void
}

export default function ProductionForm({ onSubmit }: ProductionFormProps) {
  const [product, setProduct] = useState<'Refresco' | 'Helado'>('Refresco')
  const [quantity, setQuantity] = useState(1)
  const [directLaborCost, setDirectLaborCost] = useState(0)
  const [indirectCosts, setIndirectCosts] = useState(0)
  const [materialCosts, setMaterialCosts] = useState<MaterialCost[]>(
    PRODUCT_CONFIG.Refresco.materials.map(name => ({ name, cost: 0 }))
  )

  // Actualizar materiales cuando cambia el producto
  useEffect(() => {
    const productMaterials = PRODUCT_CONFIG[product].materials
    setMaterialCosts(productMaterials.map(name => ({ name, cost: 0 })))
  }, [product])

  const handleMaterialCostChange = (index: number, cost: number) => {
    setMaterialCosts(prev => 
      prev.map((item, i) => i === index ? { ...item, cost } : item)
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity > 0) {
      onSubmit({
        product,
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
      const productMaterials = PRODUCT_CONFIG[product].materials
      setMaterialCosts(productMaterials.map(name => ({ name, cost: 0 })))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Producto</label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value as 'Refresco' | 'Helado')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="Refresco">Refresco ($1,000)</option>
            <option value="Helado">Helado ($1,800)</option>
          </select>
        </div>

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
        <h3 className="text-lg font-semibold">
          Costos de Materiales - {product}
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({materialCosts.length} materiales disponibles)
          </span>
        </h3>
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
          Registrar Lote de Producción - {product}
        </Button>
      </div>
    </form>
  )
} 