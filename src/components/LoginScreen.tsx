'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Eye, EyeOff } from 'lucide-react'

export function LoginScreen() {
  const { login, register, isLoading: authLoading, error: authError } = useAuth()
  
  // Estados para login
  const [email, setEmail] = useState('refresquitos@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Estados para registro
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('login')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Iniciando login...', { email })
    
    setIsLoading(true)
    setError('')
    
    try {
      // Validaciones básicas
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos')
      }
      
      if (!email.includes('@')) {
        throw new Error('Email inválido')
      }
      
      console.log('✅ Validaciones pasadas, ejecutando login...')
      
      await login(email.trim(), password)
      
      console.log('✅ Login ejecutado exitosamente')
      
    } catch (err: any) {
      console.error('❌ Error en login:', err)
      setError(err.message || 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Iniciando registro...', { email: registerData.email, name: registerData.name })
    
    setIsLoading(true)
    setError('')
    
    try {
      // Validaciones
      if (!registerData.name || !registerData.email || !registerData.password) {
        throw new Error('Todos los campos son requeridos')
      }
      
      if (!registerData.email.includes('@')) {
        throw new Error('Email inválido')
      }
      
      if (registerData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }
      
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }
      
      console.log('✅ Validaciones pasadas, ejecutando registro...')
      
      await register(registerData.email.trim(), registerData.password, registerData.name.trim())
      
      console.log('✅ Registro ejecutado exitosamente')
      
    } catch (err: any) {
      console.error('❌ Error en registro:', err)
      setError(err.message || 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    console.log('🚀 Acceso rápido con credenciales demo...')
    setEmail('refresquitos@gmail.com')
    setPassword('demo123')
    
    try {
      await login('refresquitos@gmail.com', 'demo123')
      console.log('✅ Acceso rápido exitoso')
    } catch (err: any) {
      console.error('❌ Error en acceso rápido:', err)
      setError('Usuario demo no encontrado. Usa el formulario de registro para crear una cuenta.')
    }
  }

  // Mostrar error de auth si existe
  const displayError = error || authError

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            🥤 Refresquitos Manager
          </CardTitle>
          <CardDescription>
            Gestiona tu negocio de bebidas con autenticación segura
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">❌ {displayError}</p>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
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
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      required
                      disabled={isLoading || authLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
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
                  <span className="bg-white px-2 text-gray-500">O</span>
                </div>
              </div>
              
              <Button
                onClick={handleQuickLogin}
                disabled={isLoading || authLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading || authLoading ? 'Conectando...' : 'Usar Credenciales Demo'}
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nombre Completo</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    placeholder="Tu nombre completo"
                    required
                    disabled={isLoading || authLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Correo Electrónico</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    placeholder="tu@email.com"
                    required
                    disabled={isLoading || authLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={isLoading || authLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmar Contraseña</Label>
                  <Input
                    id="register-confirm-password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    placeholder="Confirma tu contraseña"
                    required
                    disabled={isLoading || authLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || authLoading}
                >
                  {isLoading || authLoading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="text-center text-sm text-gray-500 mt-6">
            <p>🔒 Autenticación segura con Firebase</p>
            <p className="mt-1">🔐 Tus datos están protegidos y sincronizados</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-2 text-xs text-blue-600">
                🔍 Debug: {isLoading ? 'Cargando...' : 'Listo'} | Auth: {authLoading ? 'Cargando...' : 'Listo'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 