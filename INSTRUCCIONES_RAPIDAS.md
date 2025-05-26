# 🚀 Instrucciones Rápidas - Refresquitos Manager

## ⚡ Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar la aplicación
```bash
npm run dev
```

### 3. Abrir en el navegador
Ir a: http://localhost:3000

## 📱 Uso Básico

### ✅ Registrar una Venta
1. Ir a la pestaña **"Ingresos"**
2. Llenar el formulario:
   - **Fecha**: Fecha de la venta
   - **Cantidad**: Número de refrescos vendidos
   - **Tipo**: Seleccionar tipo de venta
   - **Empleado**: Si es "Venta Empleado", seleccionar César o Yesid
3. Hacer clic en **"Registrar Ingreso"**

### 💰 Registrar un Gasto
1. Ir a la pestaña **"Gastos"**
2. Llenar el formulario:
   - **Nombre**: Descripción del gasto
   - **Categoría**: Tipo de gasto (Costos Fijos, Materia Prima, etc.)
   - **Tipo**: Frecuencia (Mensual, Único, etc.)
   - **Monto**: Cantidad en pesos
   - **Fecha**: Fecha del gasto
3. Hacer clic en **"Registrar Gasto"**

### 🏭 Registrar Producción
1. Ir a la pestaña **"Producción"**
2. Llenar el formulario:
   - **Cantidad Producida**: Número de refrescos producidos
   - **Costo Mano de Obra**: Costo de mano de obra directa
   - **Costos Indirectos**: Otros costos indirectos
   - **Materiales**: Costo de cada uno de los 19 materiales
3. Hacer clic en **"Registrar Lote de Producción"**

### 👥 Gestionar Empleados
1. Ir a la pestaña **"Empleados"**
2. Registrar ausencias de César o Yesid
3. Ver resumen mensual de rendimiento

## 📊 Ver Reportes
1. Ir a la pestaña **"Resumen"**
2. Ver:
   - **Resumen Financiero**: Ingresos, gastos, utilidad neta
   - **Resumen de Producción**: Total producido, inventario actual
   - **Gráficos**: Distribución de ingresos y gastos

## 💡 Características Importantes

### 💾 Datos Automáticos
- **Precio por unidad**: $3,000 COP (automático)
- **Cálculo de utilidad**: Ingresos - Gastos
- **Diezmo**: 10% de la utilidad
- **Ahorro**: 20% de la utilidad
- **Inventario**: Producido - Vendido

### 🔄 Persistencia
- Todos los datos se guardan automáticamente en el navegador
- Los datos persisten al cerrar y abrir la aplicación
- No se necesita base de datos externa

### 📱 Responsive
- Funciona en móviles, tablets y computadoras
- Interfaz adaptativa según el tamaño de pantalla

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción

# Calidad
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```

## 🆘 Solución de Problemas

### ❌ Error al instalar
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error de puerto ocupado
```bash
# Cambiar puerto
npm run dev -- -p 3001
```

### ❌ Datos perdidos
- Los datos se guardan en localStorage del navegador
- Si cambias de navegador, los datos no se transfieren
- Para backup, exporta los datos desde la aplicación

## 📞 Soporte
Para ayuda adicional, contacta al equipo de desarrollo.

---
**¡Listo para gestionar Refresquitos! 🥤** 