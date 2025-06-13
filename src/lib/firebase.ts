import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
import { debugLog } from '@/config/app'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Validate Firebase configuration
function validateFirebaseConfig(): boolean {
  const required = [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId
  ]
  
  const isValid = required.every(value => value && value.length > 0 && !value.includes('demo'))
  
  if (!isValid) {
    debugLog('Firebase config validation failed. Using development mode.')
    return false
  }
  
  return true
}

// Development mode flag
export const isDevelopmentMode = !validateFirebaseConfig()

// Initialize Firebase app
let app: FirebaseApp
let db: Firestore
let auth: Auth | null = null

try {
  if (isDevelopmentMode) {
    debugLog('🔧 Running in DEVELOPMENT MODE - Firebase disabled')
    
    // Create mock Firebase instances for development
    app = {} as FirebaseApp
    db = {} as Firestore
    
  } else {
    // Initialize Firebase for production
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getFirestore(app)
    
    // Initialize Auth only if needed (optional)
    try {
      auth = getAuth(app)
    } catch (authError) {
      console.warn('Firebase Auth not available:', authError)
      auth = null
    }
    
    // Connect to emulators in development environment
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080)
        if (auth) {
          connectAuthEmulator(auth, 'http://localhost:9099')
        }
        debugLog('🔧 Connected to Firebase emulators')
      } catch (error) {
        debugLog('Failed to connect to Firebase emulators:', error)
      }
    }
    
    debugLog('🔥 Firebase initialized successfully')
  }
} catch (error) {
  console.error('Firebase initialization error:', error)
  
  // Fallback to development mode
  debugLog('🔧 Falling back to DEVELOPMENT MODE due to Firebase error')
  app = {} as FirebaseApp
  db = {} as Firestore
  auth = null
}

// Export Firebase instances
export { app, db, auth }

// Helper function to check if Firebase is available
export function isFirebaseAvailable(): boolean {
  return !isDevelopmentMode && !!app && !!db
}

// Helper function to check if Auth is available
export function isAuthAvailable(): boolean {
  return isFirebaseAvailable() && !!auth
}

// Development mode helpers
export const developmentHelpers = {
  showFirebaseStatus: () => {
    if (isDevelopmentMode) {
      console.log(`
🔧 DESARROLLO MODE ACTIVO
========================
Firebase está deshabilitado para desarrollo.
Los datos se guardan en localStorage.

Para habilitar Firebase:
1. Configura las credenciales reales en .env.local
2. Asegúrate de que el proyecto Firebase esté configurado
3. Verifica las reglas de Firestore

Estado actual:
- API Key: ${firebaseConfig.apiKey?.substring(0, 10)}...
- Project ID: ${firebaseConfig.projectId}
- Auth Domain: ${firebaseConfig.authDomain}
- Auth Available: ${isAuthAvailable() ? 'Sí' : 'No'}
      `)
    } else {
      console.log('🔥 Firebase está configurado y funcionando')
      console.log('🔐 Auth disponible:', isAuthAvailable() ? 'Sí' : 'No')
    }
  },
  
  getConfig: () => firebaseConfig,
  
  isConfigValid: () => !isDevelopmentMode
}

// Auto-show status in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    developmentHelpers.showFirebaseStatus()
  }, 1000)
} 