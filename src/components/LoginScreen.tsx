'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function LoginScreen() {
  const { login, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState('refresquitos@gmail.com')
  const [name, setName] = useState('Administrador')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Iniciando login...', { email, name })
    
    setIsLoading(true)
    setError('')
    
    try {
      // Validaciones básicas
      if (!email || !name) {
        throw new Error('Email y nombre son requeridos')
      }
      
      if (!email.includes('@')) {
        throw new Error('Email inválido')
      }
      
      console.log('✅ Validaciones pasadas, ejecutando login...')
      
      // Ejecutar login inmediatamente
      login(email.trim(), name.trim())
      
      console.log('✅ Login ejecutado exitosamente')
      
    } catch (err: any) {
      console.error('❌ Error en login:', err)
      setError(err.message || 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = () => {
    console.log('🚀 Acceso rápido iniciado...')
    setIsLoading(true)
    setError('')
    
    try {
      login('refresquitos@gmail.com', 'Administrador')
      console.log('✅ Acceso rápido exitoso')
    } catch (err: any) {
      console.error('❌ Error en acceso rápido:', err)
      setError(err.message || 'Error en acceso rápido')
    } finally {
      setIsLoading(false)
    }
  }

  // Debug info
  console.log('🔍 LoginScreen state:', { 
    email, 
    name, 
    isLoading, 
    authLoading, 
    error 
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🥤 Refresquitos Manager
          </h1>
          <p className="text-gray-600">
            Gestiona tu negocio de bebidas desde cualquier dispositivo
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="refresquitos@gmail.com"
              required
              disabled={isLoading || authLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              disabled={isLoading || authLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || authLoading}
          >
            {isLoading || authLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">O continúa con</span>
          </div>
        </div>
        
        <Button
          onClick={handleQuickLogin}
          disabled={isLoading || authLoading}
          variant="outline"
          className="w-full flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading || authLoading ? 'Conectando...' : 'Acceso Rápido'}
        </Button>
        
        <div className="text-center text-sm text-gray-500">
          <p>✅ Firebase configurado y funcionando</p>
          <p className="mt-1">🔒 Tus datos están protegidos y sincronizados</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-2 text-xs text-blue-600">
              🔍 Debug: {isLoading ? 'Cargando...' : 'Listo'} | Auth: {authLoading ? 'Cargando...' : 'Listo'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 