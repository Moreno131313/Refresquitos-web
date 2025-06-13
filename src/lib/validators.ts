import { z } from 'zod';
import { MATERIAL_NAMES } from '@/types/unified';

export const incomeSchema = z.object({
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  product: z.enum(['Refresco', 'Helado']),
  type: z.enum(['Venta Empleado', 'Pedido Puerto López', 'Pedido Puerto Gaitán', 'Paca Villavicencio']),
  employee: z.enum(['César', 'Yesid']).optional(),
  date: z.string().min(1, 'La fecha es requerida'),
});

export const expenseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.enum(['Costos Fijos', 'Materia Prima Directa', 'Mano de Obra Directa', 'Costos Indirectos de Fabricación', 'Gastos Administrativos', 'Gastos de Ventas', 'Otros']),
  type: z.string().min(1, 'El tipo es requerido'),
  amount: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
});

export const materialCostSchema = z.object({
  name: z.enum(MATERIAL_NAMES as readonly [string, ...string[]]),
  cost: z.number().min(0, 'El costo debe ser mayor o igual a 0'),
});

export const productionSchema = z.object({
  product: z.enum(['Refresco', 'Helado']),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
  materialCosts: z.array(materialCostSchema).min(1, 'Debe incluir al menos un material'),
  directLaborCost: z.number().min(0, 'El costo de mano de obra debe ser mayor o igual a 0'),
  indirectCosts: z.number().min(0, 'Los costos indirectos deben ser mayor o igual a 0'),
});

export const absenceSchema = z.object({
  employee: z.enum(['César', 'Yesid']),
  date: z.string().min(1, 'La fecha es requerida'),
  reason: z.string().optional(),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type ProductionFormData = z.infer<typeof productionSchema>;
export type AbsenceFormData = z.infer<typeof absenceSchema>

// Schema para login
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
})

export type LoginFormData = z.infer<typeof loginSchema>; 