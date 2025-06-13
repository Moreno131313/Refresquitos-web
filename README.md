# 🥤 Refresquitos Manager

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/refresquitos/manager)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.8.1-orange.svg)](https://firebase.google.com/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/refresquitos/manager/actions)

Sistema profesional de gestión financiera y de producción para el negocio Refresquitos. Una aplicación web moderna construida con Next.js, TypeScript, Firebase y Tailwind CSS.

## 🌟 Características Principales

### 💰 Gestión Financiera
- **Registro de Ingresos**: Control detallado de ventas por empleado y tipo
- **Control de Gastos**: Categorización profesional de gastos por tipo
- **Análisis Financiero**: Cálculo automático de utilidades, márgenes y distribución
- **Reportes Avanzados**: Gráficos interactivos y métricas en tiempo real

### 🏭 Gestión de Producción
- **Control de Lotes**: Registro detallado de cada lote de producción
- **Costos de Materiales**: Seguimiento de materias primas y costos directos
- **Inventario**: Control automático de stock y productos disponibles
- **Análisis de Costos**: Cálculo de costo por unidad y rentabilidad

### 👥 Gestión de Empleados
- **Ciclos de Trabajo**: Sistema de evaluación por ciclos de 30 días trabajados
- **Control de Ausencias**: Registro y seguimiento de faltas
- **Bonificaciones**: Cálculo automático de bonos por rendimiento
- **Métricas de Desempeño**: Análisis detallado por empleado

### 🔧 Características Técnicas
- **Tiempo Real**: Sincronización automática con Firebase
- **Offline First**: Funciona sin conexión a internet
- **Responsive**: Optimizado para móviles, tablets y desktop
- **PWA Ready**: Instalable como aplicación nativa
- **Exportación de Datos**: CSV, PDF y otros formatos
- **Backup Automático**: Respaldo seguro en la nube

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18.0.0 o superior
- npm 8.0.0 o superior
- Cuenta de Firebase

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/refresquitos/manager.git
   cd refresquitos-manager
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus credenciales de Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
refresquitos-manager/
├── src/
│   ├── components/          # Componentes React reutilizables
│   │   ├── ui/             # Componentes base de UI
│   │   ├── forms/          # Formularios especializados
│   │   └── charts/         # Componentes de gráficos
│   ├── hooks/              # Custom hooks de React
│   ├── lib/                # Utilidades y configuraciones
│   ├── types/              # Definiciones de TypeScript
│   ├── constants/          # Constantes de la aplicación
│   ├── config/             # Configuración de la app
│   └── pages/              # Páginas de Next.js
├── public/                 # Archivos estáticos
├── tests/                  # Tests unitarios e integración
├── docs/                   # Documentación adicional
└── scripts/                # Scripts de utilidad
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests para CI/CD
npm run test:ci
```

### Coverage Objetivo

- **Líneas**: 70%+
- **Funciones**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta el linter |
| `npm run lint:fix` | Corrige errores de linting automáticamente |
| `npm run type-check` | Verifica tipos de TypeScript |
| `npm run test` | Ejecuta los tests |
| `npm run test:coverage` | Ejecuta tests con reporte de coverage |

## 🏗️ Arquitectura

### Stack Tecnológico

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Firestore, Auth)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

### Patrones de Diseño

- **Component Composition**: Componentes reutilizables y composables
- **Custom Hooks**: Lógica de negocio encapsulada
- **Type Safety**: TypeScript estricto en toda la aplicación
- **Error Boundaries**: Manejo robusto de errores
- **Performance**: Lazy loading y optimizaciones

## 📊 Modelo de Datos

### Entidades Principales

```typescript
interface Income {
  id: string
  amount: number
  quantity: number
  date: string
  type: 'Venta Empleado' | 'Pedido Puerto López' | 'Pedido Puerto Gaitán' | 'Paca Villavicencio'
  employee?: 'César' | 'Yesid'
  createdAt: string
}

interface Expense {
  id: string
  name: string
  amount: number
  date: string
  category: ExpenseCategory
  type: string
  createdAt: string
}

interface Production {
  id: string
  date: string
  quantity: number
  materialCosts: MaterialCost[]
  directLaborCost: number
  indirectCosts: number
  totalCost: number
  costPerUnit: number
  createdAt: string
}
```

## 🔐 Seguridad

### Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden acceder a sus datos
    match /users/{userEmail}/{collection}/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.email == userEmail;
    }
  }
}
```

### Mejores Prácticas

- ✅ Autenticación obligatoria
- ✅ Validación de datos en cliente y servidor
- ✅ Sanitización de inputs
- ✅ Reglas de seguridad estrictas en Firestore
- ✅ Variables de entorno para credenciales

## 🚀 Deployment

### Vercel (Recomendado)

1. **Conectar repositorio**
   ```bash
   vercel --prod
   ```

2. **Configurar variables de entorno**
   - Agregar todas las variables `NEXT_PUBLIC_FIREBASE_*` en Vercel

3. **Deploy automático**
   - Cada push a `main` despliega automáticamente

### Otros Proveedores

- **Netlify**: Compatible con build estático
- **AWS Amplify**: Soporte completo para Next.js
- **Firebase Hosting**: Integración nativa

## 📈 Performance

### Métricas Objetivo

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Optimizaciones Implementadas

- ✅ Code splitting automático
- ✅ Lazy loading de componentes
- ✅ Optimización de imágenes
- ✅ Caching estratégico
- ✅ Bundle analysis

## 🤝 Contribución

### Proceso de Desarrollo

1. **Fork** el repositorio
2. **Crear** una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crear** un Pull Request

### Estándares de Código

- **ESLint**: Configuración estricta
- **Prettier**: Formateo automático
- **TypeScript**: Tipado estricto
- **Conventional Commits**: Mensajes de commit estandarizados

### Tests Requeridos

- ✅ Tests unitarios para nuevas funciones
- ✅ Tests de integración para flujos críticos
- ✅ Coverage mínimo del 70%

## 📝 Changelog

### v2.0.0 (2024-01-15)

#### 🎉 Nuevas Características
- Sistema de tipos unificado
- Arquitectura profesional
- Suite completa de testing
- Documentación exhaustiva
- Configuración avanzada

#### 🐛 Correcciones
- Errores de TypeScript resueltos
- Compatibilidad mejorada
- Performance optimizada

#### 🔧 Mejoras Técnicas
- Refactoring completo de la base de código
- Patrones de diseño implementados
- Manejo de errores robusto

### v1.0.0 (2024-01-01)
- Lanzamiento inicial
- Funcionalidades básicas implementadas

## 📞 Soporte

### Documentación

- **Wiki**: [GitHub Wiki](https://github.com/refresquitos/manager/wiki)
- **API Docs**: [Documentación de API](docs/api.md)
- **Guías**: [Guías de Usuario](docs/guides/)

### Contacto

- **Email**: support@refresquitos.com
- **Issues**: [GitHub Issues](https://github.com/refresquitos/manager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/refresquitos/manager/discussions)

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **Next.js Team** por el framework increíble
- **Firebase Team** por la plataforma robusta
- **Vercel** por el hosting gratuito
- **Tailwind CSS** por el sistema de diseño
- **Comunidad Open Source** por las herramientas y librerías

---

<div align="center">
  <p>Hecho con ❤️ por el equipo de Refresquitos</p>
  <p>
    <a href="https://refresquitos-manager.vercel.app">Demo</a> •
    <a href="https://github.com/refresquitos/manager/issues">Reportar Bug</a> •
    <a href="https://github.com/refresquitos/manager/discussions">Solicitar Feature</a>
  </p>
</div> 