'use client'

import { useEffect, useState } from 'react'
import { isFirebaseAvailable, developmentHelpers } from '@/lib/firebase'
import { useHydration } from '@/hooks/useHydration'

export default function FirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
  const isMounted = useHydration()

  useEffect(() => {
    if (!isMounted) return

    const checkFirebase = async () => {
      try {
        if (isFirebaseAvailable()) {
          setStatus('available')
          console.log('🔥 Firebase está disponible y configurado')
        } else {
          setStatus('unavailable')
          console.log('⚠️ Firebase no está disponible - usando modo desarrollo')
          developmentHelpers.showFirebaseStatus()
        }
      } catch (error) {
        setStatus('unavailable')
        console.error('Error checking Firebase:', error)
      }
    }

    checkFirebase()
  }, [isMounted])

  // No renderizar hasta que el componente esté montado en el cliente
  if (!isMounted) {
    return null
  }

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Verificando Firebase...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 border rounded-lg p-3 text-sm ${
      status === 'available' 
        ? 'bg-green-100 border-green-300 text-green-800' 
        : 'bg-yellow-100 border-yellow-300 text-yellow-800'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'available' ? 'bg-green-500' : 'bg-yellow-500'
        }`}></div>
        <span>
          {status === 'available' 
            ? '🔥 Firebase Conectado' 
            : '💾 Modo Desarrollo (localStorage)'
          }
        </span>
      </div>
    </div>
  )
} 