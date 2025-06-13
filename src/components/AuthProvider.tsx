'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { isFirebaseAvailable } from '@/lib/firebase'

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, name: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 AuthProvider: Inicializando...')
    
    // Check for stored user session
    const storedUser = localStorage.getItem('refresquitos-user')
    console.log('🔍 AuthProvider: Usuario almacenado:', storedUser)
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('✅ AuthProvider: Usuario parseado:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('❌ AuthProvider: Error parsing stored user:', error)
        localStorage.removeItem('refresquitos-user')
      }
    }
    
    setIsLoading(false)
    console.log('✅ AuthProvider: Inicialización completa')
  }, [])

  const login = (email: string, name: string) => {
    console.log('🔐 AuthProvider: Login iniciado', { email, name })
    
    try {
      const userData = { email, name }
      console.log('📝 AuthProvider: Creando userData:', userData)
      
      setUser(userData)
      console.log('✅ AuthProvider: Usuario establecido en estado')
      
      localStorage.setItem('refresquitos-user', JSON.stringify(userData))
      console.log('💾 AuthProvider: Usuario guardado en localStorage')
      
      // Verificar que se guardó correctamente
      const saved = localStorage.getItem('refresquitos-user')
      console.log('🔍 AuthProvider: Verificación guardado:', saved)
      
      console.log('🎉 AuthProvider: Login completado exitosamente')
    } catch (error) {
      console.error('❌ AuthProvider: Error en login:', error)
      throw error
    }
  }

  const logout = () => {
    console.log('🚪 AuthProvider: Logout iniciado')
    
    setUser(null)
    localStorage.removeItem('refresquitos-user')
    
    // Clear all app data on logout
    const keys = Object.keys(localStorage).filter(key => key.startsWith('refresquitos-'))
    keys.forEach(key => localStorage.removeItem(key))
    
    console.log('✅ AuthProvider: Logout completado')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  }

  // Debug logging
  console.log('🔍 AuthProvider: Estado actual:', {
    user,
    isLoading,
    isAuthenticated: !!user,
    firebaseAvailable: isFirebaseAvailable()
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