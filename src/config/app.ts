// Configuración principal de la aplicación
export const APP_CONFIG = {
  name: 'Refresquitos Manager',
  version: '2.0.0',
  description: 'Sistema profesional de gestión financiera y de producción',
  author: 'Refresquitos Team',
  
  // URLs y endpoints
  urls: {
    homepage: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    api: process.env.NEXT_PUBLIC_API_URL || '/api',
    support: 'mailto:support@refresquitos.com'
  },

  // Configuración de Firebase
  firebase: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  },

  // Configuración de negocio
  business: {
    pricePerUnit: 1000, // COP por unidad
    currency: 'COP',
    currencySymbol: '$',
    locale: 'es-CO',
    
    // Configuración de empleados
    employees: ['César', 'Yesid'] as const,
    
    // Configuración de ciclos de trabajo
    workCycle: {
      daysRequired: 30, // Días trabajados para completar ciclo
      bonusPercentage: 0.1 // 10% de bonus
    },

    // Configuración financiera
    financial: {
      tithePercentage: 0.1, // 10% diezmo
      savingsPercentage: 0.2, // 20% ahorro
    }
  },

  // Configuración de UI
  ui: {
    theme: {
      primary: 'blue',
      secondary: 'purple',
      accent: 'green'
    },
    
    // Configuración de tablas
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 20, 50]
    },

    // Configuración de formularios
    forms: {
      autoSave: true,
      autoSaveDelay: 2000 // ms
    }
  },

  // Configuración de desarrollo
  dev: {
    enableDebugLogs: process.env.NODE_ENV === 'development',
    enablePerformanceMonitoring: process.env.NODE_ENV === 'production',
    mockData: process.env.NODE_ENV === 'development'
  },

  // Configuración de features
  features: {
    enableOfflineMode: true,
    enableDataExport: true,
    enableDataImport: true,
    enableAdvancedAnalytics: true,
    enableNotifications: true,
    enableBackup: true
  }
} as const

// Tipos derivados de la configuración
export type Employee = typeof APP_CONFIG.business.employees[number]
export type Currency = typeof APP_CONFIG.business.currency
export type Theme = typeof APP_CONFIG.ui.theme.primary

// Validación de configuración
export function validateConfig(): boolean {
  const required = [
    APP_CONFIG.firebase.projectId,
    APP_CONFIG.firebase.apiKey,
    APP_CONFIG.firebase.authDomain
  ]

  return required.every(value => value && value.length > 0)
}

// Helper para obtener configuración de Firebase
export function getFirebaseConfig() {
  return {
    apiKey: APP_CONFIG.firebase.apiKey,
    authDomain: APP_CONFIG.firebase.authDomain,
    projectId: APP_CONFIG.firebase.projectId,
    storageBucket: APP_CONFIG.firebase.storageBucket,
    messagingSenderId: APP_CONFIG.firebase.messagingSenderId,
    appId: APP_CONFIG.firebase.appId,
    measurementId: APP_CONFIG.firebase.measurementId
  }
}

// Helper para formatear moneda
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(APP_CONFIG.business.locale, {
    style: 'currency',
    currency: APP_CONFIG.business.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Helper para logging condicional
export function debugLog(...args: any[]): void {
  if (APP_CONFIG.dev.enableDebugLogs) {
    console.log('[DEBUG]', ...args)
  }
}

// Helper para obtener configuración de empleado
export function getEmployeeConfig(employee: Employee) {
  return {
    name: employee,
    workCycleDays: APP_CONFIG.business.workCycle.daysRequired,
    bonusPercentage: APP_CONFIG.business.workCycle.bonusPercentage
  }
} 