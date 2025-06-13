# 💰 Sistema de Cálculo de Ganancias - Refresquitos Manager

## 📋 Resumen Ejecutivo

El **Refresquitos Manager** ahora cuenta con un sistema completo de cálculo de ganancias que permite:

- ✅ Calcular la ganancia real por cada venta usando costos FIFO
- ✅ Mostrar ganancia por unidad en tiempo real
- ✅ Simular ventas antes de registrarlas
- ✅ Gestionar inventario separado por producto (Refrescos y Helados)
- ✅ Generar análisis financiero detallado

---

## 🎯 Precios de Venta Configurados

| Producto | Precio por Unidad | Configuración |
|----------|-------------------|---------------|
| **Refresco** | $1,000 COP | Precio fijo por unidad |
| **Helado** | $1,800 COP | Precio fijo por unidad |

---

## 🧮 Fórmula de Cálculo de Ganancias

### Ganancia por Venta
```
Ganancia = Precio de Venta - Costo de Producción (FIFO)
```

### Margen de Ganancia
```
Margen % = (Ganancia / Precio de Venta) × 100
```

### Ejemplo Práctico

**Scenario**: Venta de 10 Refrescos
- **Precio de venta**: $1,000 × 10 = $10,000
- **Costo FIFO**: $700 × 10 = $7,000
- **Ganancia**: $10,000 - $7,000 = $3,000
- **Margen**: ($3,000 / $10,000) × 100 = 30%

---

## 🏗️ Arquitectura del Sistema

### 1. Método FIFO (First In, First Out)
El sistema utiliza el método FIFO para calcular costos reales:

```typescript
// Lotes de producción ordenados por fecha
Lote 1: 100 refrescos a $800 c/u (15 Enero)
Lote 2: 50 refrescos a $900 c/u (16 Enero)

// Al vender 120 refrescos:
// - 100 del Lote 1 a $800 = $80,000
// - 20 del Lote 2 a $900 = $18,000
// - Costo total = $98,000
```

### 2. Inventario Separado por Producto
- **Refrescos**: Inventario independiente con sus propios lotes
- **Helados**: Inventario independiente con sus propios lotes
- **Tracking**: Seguimiento individual de costos y cantidades

### 3. Componentes Principales

#### 📊 `EnhancedFinancialSummaryCard`
- Muestra ganancia bruta y neta
- Calcula márgenes de rentabilidad
- Distribución automática (diezmo, ahorro, disponible)

#### 🎯 `SaleSimulator`
- Simula ventas antes de registrarlas
- Muestra ganancia estimada en tiempo real
- Verifica disponibilidad de inventario
- Calcula margen por unidad

#### 📈 `SeparateInventoryCard`
- Estado de inventario por producto
- Valor total del inventario
- Costo promedio por unidad

---

## 🔄 Flujo de Trabajo

### 1. Registro de Producción
```
Registrar Lote → Calcular Costo por Unidad → Agregar al Inventario FIFO
```

### 2. Simulación de Venta
```
Seleccionar Producto → Ingresar Cantidad → Ver Ganancia Estimada → Decidir Venta
```

### 3. Registro de Venta
```
Registrar Venta → Aplicar FIFO → Calcular Ganancia Real → Actualizar Inventario
```

### 4. Análisis Financiero
```
Procesar Todas las Ventas → Calcular COGS → Generar Resumen → Mostrar Ganancias
```

---

## 📱 Funcionalidades de Usuario

### En el Dashboard Principal:
1. **Resumen Financiero**: Ganancia bruta, neta y márgenes
2. **Inventario Separado**: Estado por producto con valores
3. **Análisis de Prueba**: Verificación de cálculos (temporal)

### En la Sección de Ingresos:
1. **Formulario de Venta**: Precio automático según producto
2. **Simulador**: Cálculo previo de ganancia
3. **Lista de Ventas**: Historial con ganancia por unidad

### En la Sección de Producción:
1. **Registro de Lotes**: Cálculo automático de costo por unidad
2. **Lista de Producciones**: Historial de lotes con costos

---

## 🧪 Pruebas y Validación

### Componente de Prueba (`ProfitAnalysisTest`)
- Verifica precios de productos
- Simula venta de prueba
- Muestra fórmulas de cálculo
- Valida método FIFO

### Datos de Prueba Automáticos
El sistema incluye un botón para generar datos de prueba que permite:
- Crear lotes de producción de refrescos y helados
- Generar ventas de ejemplo
- Probar el inventario separado
- Validar cálculos de ganancia

---

## 💡 Beneficios del Sistema

### Para el Negocio:
- ✅ **Precisión**: Costos reales usando FIFO
- ✅ **Transparencia**: Ganancia visible por cada venta
- ✅ **Control**: Simulación antes de vender
- ✅ **Análisis**: Reportes financieros detallados

### Para la Toma de Decisiones:
- ✅ **Rentabilidad**: Identifica productos más rentables
- ✅ **Precios**: Valida si los precios son adecuados
- ✅ **Inventario**: Control preciso de stock y valores
- ✅ **Proyección**: Simula escenarios de venta

---

## 🔧 Configuración Técnica

### Archivos Principales:
- `src/lib/business-logic.ts`: Lógica de cálculos
- `src/components/EnhancedFinancialSummary.tsx`: Resumen financiero
- `src/components/SaleSimulator.tsx`: Simulador de ventas
- `src/components/SeparateInventoryCard.tsx`: Inventario separado
- `src/types/unified.ts`: Tipos y configuración de productos

### Configuración de Productos:
```typescript
export const PRODUCT_CONFIG = {
  Refresco: { 
    price: 1000, 
    name: 'Refresco',
    description: 'Refresco tradicional'
  },
  Helado: { 
    price: 1800, 
    name: 'Helado',
    description: 'Helado artesanal'
  }
} as const
```

---

## 🚀 Estado Actual

### ✅ Completamente Implementado:
- [x] Cálculo de ganancia por unidad
- [x] Método FIFO para costos reales
- [x] Simulador de ventas
- [x] Inventario separado por producto
- [x] Análisis financiero completo
- [x] Interfaz de usuario intuitiva
- [x] Documentación completa

### 🎯 Próximas Mejoras Sugeridas:
- [ ] Reportes exportables (PDF/Excel)
- [ ] Alertas de inventario bajo
- [ ] Análisis de tendencias de ventas
- [ ] Integración con sistema de facturación
- [ ] Dashboard para móvil

---

## 📞 Soporte

Este sistema ha sido desarrollado con Next.js 14, TypeScript y Tailwind CSS, garantizando:
- **Performance**: Cálculos rápidos y precisos
- **Escalabilidad**: Fácil adición de nuevos productos
- **Mantenibilidad**: Código bien documentado y estructurado
- **Usabilidad**: Interfaz intuitiva y responsive

**¡El sistema de cálculo de ganancias está listo para producción!** 🎉 