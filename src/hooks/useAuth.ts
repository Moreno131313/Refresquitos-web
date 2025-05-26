"use client"

import { useState, useEffect } from 'react'
import { AuthState } from '@/types/auth'

const AUTH_STORAGE_KEY = 'refresquitos-auth'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: undefined
  })
  const [isLoading, setIsLoading] = useState(true)

  // Cargar estado de autenticación desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
      if (savedAuth) {
        const parsedAuth: AuthState = JSON.parse(savedAuth)
        setAuthState(parsedAuth)
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
      // Si hay error, limpiar localStorage
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Función para hacer login
  const login = (email: string, name: string) => {
    const newAuthState: AuthState = {
      isAuthenticated: true,
      user: { email, name }
    }
    
    setAuthState(newAuthState)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState))
  }

  // Función para hacer logout
  const logout = () => {
    const newAuthState: AuthState = {
      isAuthenticated: false,
      user: undefined
    }
    
    setAuthState(newAuthState)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return {
    ...authState,
    isLoading,
    login,
    logout
  }
} 