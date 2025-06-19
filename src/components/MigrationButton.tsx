"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, CheckCircle, Database, Zap } from 'lucide-react'
import { migrateLocalStorageData, debugLocalStorageData } from '@/utils/migration'

export default function MigrationButton() {
  const [migrating, setMigrating] = useState(false)
  const [lastResult, setLastResult] = useState<{ migrated: boolean; message: string } | null>(null)

  const handleMigration = async () => {
    setMigrating(true)
    
    try {
      // Debug primero
      console.log('🔍 EJECUTANDO DEBUG ANTES DE MIGRACIÓN...')
      debugLocalStorageData()
      
      // Esperar un poco para que se vea el loading
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Ejecutar migración
      const result = migrateLocalStorageData()
      setLastResult(result)
      
      // Si se migró algo, recargar la página después de un delay
      if (result.migrated) {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
      
    } catch (error) {
      console.error('Error en migración:', error)
      setLastResult({
        migrated: false,
        message: `Error: ${error}`
      })
    } finally {
      setMigrating(false)
    }
  }

  return (
    <Card className="border-2 border-orange-300 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Database className="h-5 w-5" />
          🚀 Herramienta de Migración de Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-orange-700">
          Si el inventario no aparece separado por producto, usa este botón para migrar los datos automáticamente.
        </p>
        
        <div className="flex gap-3">
          <Button
            onClick={handleMigration}
            disabled={migrating}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
          >
            {migrating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Migrando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                MIGRAR DATOS AHORA
              </>
            )}
          </Button>
          
          <Button
            onClick={() => {
              debugLocalStorageData()
              alert('Revisa la consola del navegador (F12) para ver el debug')
            }}
            variant="outline"
            className="border-orange-300"
          >
            🔍 Debug Datos
          </Button>
        </div>

        {lastResult && (
          <div className={`p-3 rounded border ${
            lastResult.migrated 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              {lastResult.migrated ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{lastResult.message}</span>
            </div>
            {lastResult.migrated && (
              <p className="text-xs mt-1">Recargando página en 2 segundos...</p>
            )}
          </div>
        )}

        <div className="text-xs text-orange-600 space-y-1">
          <p>💡 <strong>Funciones disponibles en consola:</strong></p>
          <p>• <code>migrateFresquitos()</code> - Migrar datos</p>
          <p>• <code>debugFresquitos()</code> - Ver estado de datos</p>
          <p>• <code>clearFresquitos()</code> - Limpiar todos los datos</p>
        </div>
      </CardContent>
    </Card>
  )
} 