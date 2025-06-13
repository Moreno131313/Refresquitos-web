import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
  app: {}
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com'
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test.appspot.com'
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789'
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock console methods for cleaner test output
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test utilities
global.testUtils = {
  // Helper to create mock user
  createMockUser: (overrides = {}) => ({
    email: 'test@example.com',
    name: 'Test User',
    ...overrides
  }),
  
  // Helper to create mock income
  createMockIncome: (overrides = {}) => ({
    id: 'test-income-1',
    amount: 1000,
    quantity: 1,
    date: '2024-01-01',
    type: 'Venta Empleado',
    employee: 'César',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }),
  
  // Helper to create mock expense
  createMockExpense: (overrides = {}) => ({
    id: 'test-expense-1',
    name: 'Test Expense',
    amount: 500,
    date: '2024-01-01',
    category: 'Otros',
    type: 'Test Type',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }),
  
  // Helper to create mock production
  createMockProduction: (overrides = {}) => ({
    id: 'test-production-1',
    date: '2024-01-01',
    quantity: 100,
    materialCosts: [{ name: 'Leche', cost: 200 }],
    directLaborCost: 100,
    indirectCosts: 50,
    totalCost: 350,
    costPerUnit: 3.5,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }),
  
  // Helper to create mock absence
  createMockAbsence: (overrides = {}) => ({
    id: 'test-absence-1',
    employee: 'César',
    date: '2024-01-01',
    reason: 'Enfermedad',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }),
  
  // Helper to wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to trigger window resize
  triggerResize: (width = 1024, height = 768) => {
    global.innerWidth = width
    global.innerHeight = height
    global.dispatchEvent(new Event('resize'))
  }
} 