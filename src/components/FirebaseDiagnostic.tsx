'use client'

import { useEffect, useState } from 'react'
import { auth, db, isAuthAvailable } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export function FirebaseDiagnostic() {
  const [authStatus, setAuthStatus] = useState<string>('Checking...')
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Checking...')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Test Auth - Only if auth is available
    let unsubscribe: (() => void) | undefined

    if (isAuthAvailable() && auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthStatus('✅ Connected')
          setUser(user)
        } else {
          setAuthStatus('⚠️ Not authenticated')
          setUser(null)
        }
      }, (error) => {
        setAuthStatus(`❌ Error: ${error.message}`)
      })
    } else {
      setAuthStatus('🔧 Development mode - Auth disabled')
    }

    // Test Firestore
    const testFirestore = async () => {
      try {
        if (db && typeof db.app !== 'undefined') {
          const testCollection = collection(db, 'test')
          await getDocs(testCollection)
          setFirestoreStatus('✅ Connected')
        } else {
          setFirestoreStatus('🔧 Development mode - Using localStorage')
        }
      } catch (error: any) {
        setFirestoreStatus(`❌ Error: ${error.message}`)
      }
    }

    testFirestore()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-bold text-sm mb-2">🔥 Firebase Status</h3>
      <div className="space-y-1 text-xs">
        <div>
          <strong>Auth:</strong> {authStatus}
        </div>
        <div>
          <strong>Firestore:</strong> {firestoreStatus}
        </div>
        {user && (
          <div>
            <strong>User:</strong> {user.email || 'Anonymous'}
          </div>
        )}
      </div>
    </div>
  )
} 