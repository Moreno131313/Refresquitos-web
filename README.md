# 🥤 Refresquitos Manager

Sistema completo de gestión empresarial para la producción y venta de refrescos, desarrollado con Next.js y TypeScript.

![Refresquitos Logo](public/logo1.png)

## 🚀 Características Principales

### 💰 Gestión de Ingresos
- Registro de ventas con cálculo automático ($1,000 COP por unidad)
- Tipos de venta: Empleado, Puerto López, Puerto Gaitán, Paca Villavicencio
- Seguimiento de vendedores (César y Yesid)
- Listado completo con opción de eliminación

### 💸 Gestión de Gastos
- Categorías especializadas para negocio de manufactura
- Costos Fijos, Materias Primas, Mano de Obra, Gastos Administrativos
- Control detallado de todos los gastos

### 🏭 Gestión de Producción
- Registro de lotes con 19 materias primas diferentes
- Cálculo automático de costos por lote y por unidad
- Resumen general de producción
- Control de inventario automático

### 👥 Gestión de Empleados
- Sistema de ciclos de trabajo de 30 días
- Registro de ausencias
- Cálculo automático de bonificaciones
- Métricas de rendimiento por empleado

### 📊 Reportes y Visualizaciones
- Resumen financiero completo
- Cálculos de diezmo (10%) y ahorro (20%)
- Gráficos de distribución de ingresos y gastos
- Dashboard empresarial interactivo

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: Tailwind CSS, ShadCN UI
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Persistencia**: LocalStorage (sin base de datos externa)

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Moreno131313/Refresquitos.git
cd Refresquitos
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Agregar el logo** (opcional)
- Coloca tu archivo `logo1.png` en la carpeta `public/`
- El sistema tiene un fallback automático si no se encuentra

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🔐 Credenciales de Acceso

Las credenciales de acceso se proporcionan por separado por motivos de seguridad. Contacta al administrador del sistema para obtener acceso.

## 📁 Estructura del Proyecto

```
Refresquitos/
├── public/                 # Archivos estáticos
│   └── logo1.png          # Logo de la empresa
├── src/
│   ├── app/               # App Router de Next.js
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes de UI base
│   │   └── ...           # Componentes específicos
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilidades y validadores
│   └── types/            # Definiciones de TypeScript
├── README.md
└── package.json
```

## 🚀 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run type-check   # Verificación de tipos
```

## 📱 Características Técnicas

- **Responsive Design**: Funciona en desktop, tablet y móvil
- **PWA Ready**: Preparado para ser una Progressive Web App
- **TypeScript**: Tipado estático para mayor robustez
- **Persistencia Local**: Datos guardados en el navegador
- **Autenticación**: Sistema de login seguro
- **Validación**: Formularios con validación completa

## 🎯 Funcionalidades Específicas

### Sistema de Ciclos de 30 Días
- Cada empleado tiene ciclos independientes de 30 días laborales
- Seguimiento automático de días trabajados (basado en ventas)
- Cálculo de bonificaciones por ciclo completado
- Gestión manual de fechas de inicio de ciclo

### Control de Inventario
- Cálculo automático: Producido - Vendido = Inventario
- Alertas visuales de stock
- Historial completo de movimientos

### Reportes Financieros
- Ingresos totales y por categoría
- Gastos detallados por tipo
- Utilidad neta automática
- Distribución de ganancias (diezmo, ahorro, disponible)

## 🤝 Contribución

Este es un proyecto privado para Refresquitos. Para sugerencias o mejoras, contacta al desarrollador.

## 📄 Licencia

© 2024 Refresquitos Manager. Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contacta al administrador del proyecto.

---

**Desarrollado con ❤️ para Refresquitos** 