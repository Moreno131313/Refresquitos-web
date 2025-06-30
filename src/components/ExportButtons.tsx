"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { FileText, FileSpreadsheet, Download, Loader2 } from 'lucide-react'
import { exportToPDF, exportToExcel, generateFilename, type ExportData } from '@/utils/exportUtils'
import { Badge } from './ui/badge'

interface ExportButtonsProps {
  elementId: string
  exportData: ExportData
  disabled?: boolean
  className?: string
}

export default function ExportButtons({ 
  elementId, 
  exportData, 
  disabled = false, 
  className = "" 
}: ExportButtonsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  const handlePDFExport = async () => {
    setIsExportingPDF(true)
    try {
      const filename = generateFilename('pdf', exportData.type, exportData.period)
      const success = await exportToPDF(elementId, filename)
      
      if (success) {
        // Mostrar mensaje de éxito
        console.log('PDF generado exitosamente')
      } else {
        throw new Error('Error al generar PDF')
      }
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      alert('Error al generar el archivo PDF. Por favor, inténtelo de nuevo.')
    } finally {
      setIsExportingPDF(false)
    }
  }

  const handleExcelExport = () => {
    setIsExportingExcel(true)
    try {
      const filename = generateFilename('xlsx', exportData.type, exportData.period)
      const success = exportToExcel(exportData, filename)
      
      if (success) {
        // Mostrar mensaje de éxito
        console.log('Excel generado exitosamente')
      } else {
        throw new Error('Error al generar Excel')
      }
    } catch (error) {
      console.error('Error al exportar Excel:', error)
      alert('Error al generar el archivo Excel. Por favor, inténtelo de nuevo.')
    } finally {
      setIsExportingExcel(false)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className="flex items-center gap-1">
        <Download className="h-3 w-3" />
        Exportar
      </Badge>
      
      <Button
        onClick={handlePDFExport}
        disabled={disabled || isExportingPDF || isExportingExcel}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300"
      >
        {isExportingPDF ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 text-red-600" />
        )}
        {isExportingPDF ? 'Generando...' : 'PDF'}
      </Button>

      <Button
        onClick={handleExcelExport}
        disabled={disabled || isExportingPDF || isExportingExcel}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300"
      >
        {isExportingExcel ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
        )}
        {isExportingExcel ? 'Generando...' : 'Excel'}
      </Button>
    </div>
  )
}

// Componente de ayuda para mostrar información sobre la exportación
export function ExportInfo() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-start gap-3">
        <Download className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-800 mb-2">Opciones de Exportación</h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              <span><strong>PDF:</strong> Reporte visual completo con gráficos y formato de presentación</span>
            </div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span><strong>Excel:</strong> Datos estructurados en múltiples hojas para análisis detallado</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Los archivos se descargarán automáticamente con fecha y hora actual.
          </p>
        </div>
      </div>
    </div>
  )
} 