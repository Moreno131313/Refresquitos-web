'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export function FirebaseRulesHelper() {
  const [showRules, setShowRules] = useState(false)
  const [hasPermissionError, setHasPermissionError] = useState(true) // Force to true initially

  useEffect(() => {
    // Test Firestore permissions
    const testFirestorePermissions = async () => {
      try {
        const testCollection = collection(db, 'test')
        await getDocs(testCollection)
        // If successful, hide the helper
        setHasPermissionError(false)
      } catch (error: any) {
        // Keep showing the helper if there's any error
        setHasPermissionError(true)
      }
    }

    testFirestorePermissions()
  }, [])

  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso a usuarios autenticados a sus propios datos
    match /users/{userEmail}/{collection}/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.email == userEmail;
    }
    
    // Regla alternativa más permisiva para desarrollo (usar temporalmente)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rules)
    alert('Reglas copiadas al portapapeles!')
  }

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/refresquitos-manager-9c2bb/firestore/rules', '_blank')
  }

  // Show the helper if there are permission issues
  if (!showRules && hasPermissionError) {
    return (
      <div className="fixed top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
        <strong>⚠️ Configuración requerida</strong>
        <p className="text-sm">Necesitas configurar las reglas de Firestore.</p>
        <Button 
          onClick={() => setShowRules(true)}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs"
        >
          Configurar ahora
        </Button>
      </div>
    )
  }

  if (!showRules) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl max-h-96 overflow-auto">
        <h3 className="text-lg font-bold mb-4">🔧 Configurar Reglas de Firestore</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Para que la aplicación funcione correctamente, sigue estos pasos:
          </p>
          <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
            <li>Haz clic en "Abrir Firebase Console"</li>
            <li>Ve a la pestaña "Rules" en Firestore</li>
            <li>Copia las reglas de abajo y pégalas</li>
            <li>Haz clic en "Publish" para aplicar los cambios</li>
            <li>Refresca esta página</li>
          </ol>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reglas de Firestore:
          </label>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
            {rules}
          </pre>
        </div>

        <div className="flex gap-2">
          <Button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-700">
            📋 Copiar Reglas
          </Button>
          <Button onClick={openFirebaseConsole} className="bg-green-600 hover:bg-green-700">
            🌐 Abrir Firebase Console
          </Button>
          <Button 
            onClick={() => setShowRules(false)} 
            variant="outline"
          >
            Cerrar
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            <strong>Nota:</strong> Una vez aplicadas las reglas, podrás usar "Continuar con Google" 
            para autenticarte y acceder a todas las funciones de la aplicación.
          </p>
        </div>
      </div>
    </div>
  )
} 