# 🥤 Refresquitos Manager

Sistema de gestión financiera y de producción para el negocio "Refresquitos". Una aplicación web moderna construida con Next.js, React, TypeScript y Tailwind CSS.

## 🚀 Características Principales

### 📊 Gestión de Ingresos
- Registro de ventas con cantidad de unidades vendidas
- Cálculo automático del monto total ($1000 por unidad)
- Tipos de venta: "Venta Empleado", "Pedido Puerto López", "Pedido Puerto Gaitán", "Paca Villavicencio"
- Seguimiento de ventas por empleado (César y Yesid)
- Listado completo de ingresos con opción de eliminación

### 💰 Gestión de Gastos
- Registro de gastos por categorías especializadas
- Categorías: Costos Fijos, Materia Prima Directa, Mano de Obra Directa, etc.
- Listado completo de gastos con opción de eliminación

### 🏭 Gestión de Producción
- Registro de lotes de producción con cantidad de refrescos
- Control detallado de 19 insumos de materia prima
- Cálculo de costos de mano de obra directa e indirectos
- Cálculo automático del costo total y costo por unidad
- Resumen general de producción con inventario actual

### 👥 Control de Empleados
- Seguimiento de ausencias de César y Yesid
- Resumen mensual de rendimiento por empleado
- Cálculo de elegibilidad para bonos por asistencia
- Métricas de ventas y días trabajados

### 📈 Reportes y Visualizaciones
- Resumen financiero con utilidad neta, diezmo (10%) y ahorro (20%)
- Gráficos de distribución de ingresos y gastos
- Control de inventario en tiempo real
- Dashboard con métricas principales

### 💾 Persistencia de Datos
- Almacenamiento local en el navegador
- Los datos persisten entre sesiones
- No requiere base de datos externa

## 🛠️ Tecnologías Utilizadas

- **Next.js 14** - Framework de React con App Router
- **React 18** - Librería de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utility-first
- **ShadCN UI** - Componentes de UI modernos y accesibles
- **React Hook Form** - Manejo eficiente de formularios
- **Zod** - Validación de esquemas
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos modernos
- **Radix UI** - Componentes primitivos accesibles

## 📋 Requisitos Previos

- Node.js 18.0.0 o superior
- npm, yarn, pnpm o bun

## 🚀 Instalación y Configuración

### 1. Clonar o descargar el proyecto
```bash
# Si tienes git instalado
git clone <url-del-repositorio>
cd refresquitos

# O simplemente descargar y extraer los archivos
```

### 2. Instalar dependencias
```bash
# Con npm
npm install

# Con yarn
yarn install

# Con pnpm
pnpm install

# Con bun
bun install
```

### 3. Ejecutar en modo desarrollo
```bash
# Con npm
npm run dev

# Con yarn
yarn dev

# Con pnpm
pnpm dev

# Con bun
bun dev
```

### 4. Abrir en el navegador
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Páginas de Next.js (App Router)
│   ├── globals.css        # Estilos globales y variables CSS
│   ├── layout.tsx         # Layout principal de la aplicación
│   └── page.tsx           # Página de inicio
├── components/            # Componentes de React
│   ├── ui/               # Componentes base de ShadCN UI
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── tabs.tsx
│   ├── AppHeader.tsx     # Header de la aplicación
│   ├── FinancialDashboardClient.tsx  # Componente principal
│   ├── IncomeForm.tsx    # Formulario de ingresos
│   ├── ExpenseForm.tsx   # Formulario de gastos
│   ├── ProductionForm.tsx # Formulario de producción
│   └── EmployeeDashboard.tsx # Dashboard de empleados
├── hooks/                # Custom hooks de React
│   ├── useToast.ts      # Hook para notificaciones
│   └── useMobile.ts     # Hook para detectar móviles
├── lib/                  # Utilidades y lógica
│   ├── utils.ts         # Funciones de utilidad
│   └── validators.ts    # Esquemas de validación con Zod
└── types/               # Definiciones de tipos TypeScript
    └── financials.ts    # Tipos para el sistema financiero
```

## 🎯 Uso de la Aplicación

### Navegación Principal
La aplicación tiene 5 pestañas principales:

1. **Resumen** - Dashboard con métricas generales y gráficos
2. **Ingresos** - Registro y listado de ventas
3. **Gastos** - Registro y listado de gastos
4. **Producción** - Gestión de lotes de producción
5. **Empleados** - Control de ausencias y rendimiento

### Registro de Ventas
1. Ve a la pestaña "Ingresos"
2. Completa el formulario con:
   - Fecha de la venta
   - Cantidad de unidades
   - Tipo de venta
   - Empleado (si es venta de empleado)
3. El sistema calculará automáticamente el monto ($1000 x cantidad)

### Registro de Producción
1. Ve a la pestaña "Producción"
2. Ingresa la cantidad de refrescos producidos
3. Completa los costos de los 19 materiales
4. Agrega costos de mano de obra directa e indirectos
5. El sistema calculará el costo total y por unidad

### Control de Empleados
1. Ve a la pestaña "Empleados"
2. Registra ausencias de César o Yesid
3. Revisa el resumen mensual de rendimiento
4. Verifica elegibilidad para bonos por asistencia

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run start        # Inicia el servidor de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
npm run type-check   # Verifica tipos de TypeScript
```

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Dispositivos móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Escritorio (1024px+)
- 🖥️ Pantallas grandes (1440px+)

## 🎨 Personalización

### Colores y Tema
Los colores se pueden personalizar en `src/app/globals.css`:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... más variables */
}
```

### Componentes
Los componentes de UI están en `src/components/ui/` y pueden ser personalizados según las necesidades.

## 🐛 Solución de Problemas

### Error de dependencias
```bash
# Limpiar caché e instalar de nuevo
rm -rf node_modules package-lock.json
npm install
```

### Error de TypeScript
```bash
# Verificar tipos
npm run type-check
```

### Problemas de estilos
```bash
# Reconstruir estilos de Tailwind
npm run build
```

## 📄 Licencia

Este proyecto es privado y está destinado exclusivamente para el negocio "Refresquitos".

## 🤝 Soporte

Para soporte técnico o preguntas sobre la aplicación, contacta al equipo de desarrollo.

---

**¡Gracias por usar Refresquitos Manager! 🥤** 