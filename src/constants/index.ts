// === CONSTANTES DE NEGOCIO ===

export const BUSINESS_CONSTANTS = {
  PRICE_PER_UNIT: 1000, // COP por unidad
  CURRENCY: 'COP',
  CURRENCY_SYMBOL: '$',
  LOCALE: 'es-CO',
  
  // Configuración de ciclos de trabajo
  WORK_CYCLE_DAYS: 30,
  BONUS_PERCENTAGE: 0.1, // 10%
  
  // Configuración financiera
  TITHE_PERCENTAGE: 0.1, // 10%
  SAVINGS_PERCENTAGE: 0.2, // 20%
  
  // Límites de la aplicación
  MAX_QUANTITY_PER_SALE: 1000,
  MAX_AMOUNT_PER_EXPENSE: 10000000, // 10 millones COP
  MAX_PRODUCTION_QUANTITY: 5000,
} as const

// === EMPLEADOS ===

export const EMPLOYEES = ['César', 'Yesid'] as const
export type Employee = typeof EMPLOYEES[number]

// === CATEGORÍAS DE GASTOS ===

export const EXPENSE_CATEGORIES = [
  'Costos Fijos',
  'Materia Prima Directa',
  'Mano de Obra Directa',
  'Costos Indirectos de Fabricación',
  'Gastos Administrativos',
  'Gastos de Ventas',
  'Otros'
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

// === TIPOS DE INGRESOS ===

export const INCOME_TYPES = [
  'Venta Empleado',
  'Pedido Puerto López',
  'Pedido Puerto Gaitán',
  'Paca Villavicencio'
] as const

export type IncomeType = typeof INCOME_TYPES[number]

// === MATERIALES DE PRODUCCIÓN ===

export const MATERIALS = [
  'Leche x cantina (40litros)',
  'Leche x cantina (20 litros)',
  'Azucar x BULTO',
  'Azucar x kilo',
  'Maracuya',
  'Mora',
  'Esencia vainilla blanca *Galon',
  'Esencia de Chicle*500ml',
  'Esencia de Arequipe*500ml',
  'Esencia de Vainilla blanca levapan *500ml',
  'Esencia de Leche condensada *500ml',
  'Galletas oreo *12und',
  'CMC *500Gr',
  'Bolsas para empacar refrescos grandes',
  'Bolsa para empacar refrescos pequeños',
  'Colante azul',
  'Colorante pardo C11',
  'Bolsas para Fabricar refrescos grandes',
  'Bolsas para fabricar refrescos pequeños'
] as const

export type Material = typeof MATERIALS[number]

// === TIPOS DE GASTOS POR CATEGORÍA ===

export const EXPENSE_TYPES_BY_CATEGORY = {
  'Costos Fijos': [
    'Arriendo',
    'Servicios públicos',
    'Internet',
    'Seguros',
    'Mantenimiento equipos'
  ],
  'Materia Prima Directa': [
    'Leche',
    'Azúcar',
    'Frutas',
    'Esencias',
    'Colorantes',
    'Empaques'
  ],
  'Mano de Obra Directa': [
    'Salarios producción',
    'Prestaciones sociales',
    'Bonificaciones'
  ],
  'Costos Indirectos de Fabricación': [
    'Combustible',
    'Herramientas',
    'Suministros',
    'Depreciación equipos'
  ],
  'Gastos Administrativos': [
    'Salarios administrativos',
    'Papelería',
    'Comunicaciones',
    'Asesorías'
  ],
  'Gastos de Ventas': [
    'Publicidad',
    'Transporte',
    'Comisiones',
    'Promociones'
  ],
  'Otros': [
    'Impuestos',
    'Multas',
    'Gastos varios',
    'Imprevistos'
  ]
} as const

// === ESTADOS DE LA APLICACIÓN ===

export const APP_STATES = {
  LOADING: 'loading',
  IDLE: 'idle',
  ERROR: 'error',
  SUCCESS: 'success'
} as const

export type AppState = typeof APP_STATES[keyof typeof APP_STATES]

// === CONFIGURACIÓN DE TABLAS ===

export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_ROWS_PER_PAGE: 100
} as const

// === CONFIGURACIÓN DE FORMULARIOS ===

export const FORM_CONFIG = {
  AUTO_SAVE_DELAY: 2000, // ms
  VALIDATION_DEBOUNCE: 300, // ms
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
} as const

// === CONFIGURACIÓN DE NOTIFICACIONES ===

export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000, // ms
  SUCCESS_DURATION: 3000, // ms
  ERROR_DURATION: 8000, // ms
  WARNING_DURATION: 6000, // ms
} as const

// === CONFIGURACIÓN DE GRÁFICOS ===

export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    INFO: '#06B6D4',
    PURPLE: '#8B5CF6'
  },
  GRADIENTS: {
    BLUE: ['#3B82F6', '#1D4ED8'],
    GREEN: ['#10B981', '#059669'],
    PURPLE: ['#8B5CF6', '#7C3AED'],
    ORANGE: ['#F59E0B', '#D97706']
  }
} as const

// === CONFIGURACIÓN DE FECHAS ===

export const DATE_CONFIG = {
  FORMAT: {
    SHORT: 'dd/MM/yyyy',
    LONG: 'dd MMMM yyyy',
    WITH_TIME: 'dd/MM/yyyy HH:mm',
    ISO: 'yyyy-MM-dd'
  },
  TIMEZONE: 'America/Bogota'
} as const

// === CONFIGURACIÓN DE VALIDACIÓN ===

export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[\d\s\-\(\)]{10,}$/
} as const

// === CONFIGURACIÓN DE ALMACENAMIENTO ===

export const STORAGE_KEYS = {
  // Datos principales
  INCOMES: 'refresquitos-incomes',
  EXPENSES: 'refresquitos-expenses',
  PRODUCTIONS: 'refresquitos-productions',
  ABSENCES: 'refresquitos-absences',
  EMPLOYEE_CYCLES: 'refresquitos-employee-cycles',
  
  // Configuración de usuario
  USER_PREFERENCES: 'refresquitos-user-preferences',
  THEME: 'refresquitos-theme',
  LANGUAGE: 'refresquitos-language',
  
  // Cache y temporal
  CACHE_PREFIX: 'refresquitos-cache-',
  TEMP_PREFIX: 'refresquitos-temp-',
  
  // Backup
  BACKUP_PREFIX: 'refresquitos-backup-'
} as const

// === CONFIGURACIÓN DE API ===

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // ms
  
  ENDPOINTS: {
    AUTH: '/api/auth',
    DATA: '/api/data',
    EXPORT: '/api/export',
    BACKUP: '/api/backup'
  }
} as const

// === CONFIGURACIÓN DE FEATURES ===

export const FEATURES = {
  OFFLINE_MODE: true,
  DATA_EXPORT: true,
  DATA_IMPORT: true,
  ADVANCED_ANALYTICS: true,
  NOTIFICATIONS: true,
  BACKUP: true,
  DARK_MODE: true,
  MULTI_LANGUAGE: false // Para futuras versiones
} as const

// === MENSAJES DE ERROR ===

export const ERROR_MESSAGES = {
  NETWORK: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION: 'Los datos ingresados no son válidos.',
  SERVER: 'Error interno del servidor. Intenta más tarde.',
  UNKNOWN: 'Ha ocurrido un error inesperado.',
  
  // Errores específicos
  INVALID_EMAIL: 'El email ingresado no es válido.',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 8 caracteres.',
  REQUIRED_FIELD: 'Este campo es obligatorio.',
  INVALID_NUMBER: 'Debe ser un número válido.',
  INVALID_DATE: 'La fecha ingresada no es válida.',
  
  // Errores de Firebase
  FIREBASE_AUTH: 'Error de autenticación con Firebase.',
  FIREBASE_NETWORK: 'Error de conexión con Firebase.',
  FIREBASE_PERMISSION: 'No tienes permisos para acceder a estos datos.'
} as const

// === MENSAJES DE ÉXITO ===

export const SUCCESS_MESSAGES = {
  SAVED: 'Datos guardados correctamente.',
  UPDATED: 'Información actualizada exitosamente.',
  DELETED: 'Elemento eliminado correctamente.',
  EXPORTED: 'Datos exportados exitosamente.',
  IMPORTED: 'Datos importados correctamente.',
  
  // Específicos del negocio
  INCOME_ADDED: 'Ingreso registrado exitosamente.',
  EXPENSE_ADDED: 'Gasto registrado exitosamente.',
  PRODUCTION_ADDED: 'Lote de producción registrado exitosamente.',
  ABSENCE_ADDED: 'Ausencia registrada exitosamente.',
  CYCLE_UPDATED: 'Ciclo de empleado actualizado exitosamente.'
} as const

// === CONFIGURACIÓN DE ROLES Y PERMISOS ===

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const PERMISSIONS = {
  READ_ALL: 'read:all',
  WRITE_ALL: 'write:all',
  DELETE_ALL: 'delete:all',
  
  READ_INCOMES: 'read:incomes',
  WRITE_INCOMES: 'write:incomes',
  DELETE_INCOMES: 'delete:incomes',
  
  READ_EXPENSES: 'read:expenses',
  WRITE_EXPENSES: 'write:expenses',
  DELETE_EXPENSES: 'delete:expenses',
  
  READ_PRODUCTION: 'read:production',
  WRITE_PRODUCTION: 'write:production',
  DELETE_PRODUCTION: 'delete:production',
  
  READ_EMPLOYEES: 'read:employees',
  WRITE_EMPLOYEES: 'write:employees',
  DELETE_EMPLOYEES: 'delete:employees',
  
  EXPORT_DATA: 'export:data',
  IMPORT_DATA: 'import:data',
  BACKUP_DATA: 'backup:data'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// === CONFIGURACIÓN DE TEMAS ===

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

export type Theme = typeof THEMES[keyof typeof THEMES] 