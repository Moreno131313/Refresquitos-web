'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { auth, isAuthAvailable } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth'

interface User {
  email: string
  name: string
  uid: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔄 AuthProvider: Inicializando Firebase Auth...')
    
    if (!auth || !isAuthAvailable()) {
      console.log('⚠️ AuthProvider: Firebase Auth no disponible')
      setIsLoading(false)
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      console.log('🔍 AuthProvider: Estado de auth cambió:', firebaseUser?.email)
      
      if (firebaseUser) {
        const userData: User = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          uid: firebaseUser.uid
        }
        console.log('✅ AuthProvider: Usuario autenticado:', userData)
        setUser(userData)
      } else {
        console.log('❌ AuthProvider: Usuario no autenticado')
        setUser(null)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    console.log('🔐 AuthProvider: Login iniciado', { email })
    setError(null)
    setIsLoading(true)
    
    if (!auth || !isAuthAvailable()) {
      const errorMessage = 'Firebase Auth no está disponible'
      setError(errorMessage)
      setIsLoading(false)
      throw new Error(errorMessage)
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ AuthProvider: Login exitoso:', userCredential.user.email)
    } catch (err: any) {
      console.error('❌ AuthProvider: Error en login:', err)
      let errorMessage = 'Error de autenticación'
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado'
          break
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde'
          break
        default:
          errorMessage = err.message || 'Error desconocido'
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    console.log('📝 AuthProvider: Registro iniciado', { email, name })
    setError(null)
    setIsLoading(true)
    
    if (!auth || !isAuthAvailable()) {
      const errorMessage = 'Firebase Auth no está disponible'
      setError(errorMessage)
      setIsLoading(false)
      throw new Error(errorMessage)
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Actualizar el perfil con el nombre
      await updateProfile(userCredential.user, {
        displayName: name
      })
      
      console.log('✅ AuthProvider: Registro exitoso:', userCredential.user.email)
    } catch (err: any) {
      console.error('❌ AuthProvider: Error en registro:', err)
      let errorMessage = 'Error en el registro'
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email ya está registrado'
          break
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
        default:
          errorMessage = err.message || 'Error desconocido'
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    console.log('🚪 AuthProvider: Logout iniciado')
    setError(null)
    
    if (!auth || !isAuthAvailable()) {
      console.log('⚠️ AuthProvider: Firebase Auth no disponible para logout')
      setUser(null)
      return
    }
    
    try {
      await signOut(auth)
      console.log('✅ AuthProvider: Logout exitoso')
    } catch (err: any) {
      console.error('❌ AuthProvider: Error en logout:', err)
      setError('Error al cerrar sesión')
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    error
  }

  // Debug logging
  console.log('🔍 AuthProvider: Estado actual:', {
    user: user?.email,
    isLoading,
    isAuthenticated: !!user,
    error
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 