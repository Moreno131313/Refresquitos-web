"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Droplets, TrendingUp, LogOut, User } from 'lucide-react'

interface AppHeaderProps {
  userEmail?: string
  userName?: string
  onLogout: () => void
}

export default function AppHeader({ userEmail, userName, onLogout }: AppHeaderProps) {
  return (
    <Card className="refresquitos-header border-0 rounded-none">
      <CardContent className="p-4 md:p-6">
        {/* Layout móvil: stack vertical */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          {/* Logo y título */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
              <img 
                src="/logo1.png" 
                alt="Refresquitos Logo" 
                className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-full border-2 border-white/30 shadow-md"
                style={{
                  clipPath: 'circle(50% at 50% 50%)',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  // Fallback si no se encuentra la imagen
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30" style={{ display: 'none' }}>
                <Droplets className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-white leading-tight">Refresquitos Manager</h1>
              <p className="text-sm md:text-base text-blue-100 leading-tight">Sistema de Gestión Financiera y de Producción</p>
            </div>
          </div>
          
          {/* Usuario y acciones */}
          <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
            {/* Badge dashboard - solo desktop */}
            <div className="hidden lg:flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Dashboard Empresarial</span>
            </div>
            
            {/* Info usuario */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-right text-white">
                <p className="text-xs md:text-sm text-blue-100">Bienvenido</p>
                <p className="text-sm md:text-base font-medium flex items-center gap-1 justify-end">
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="truncate max-w-[120px] md:max-w-none">
                    {userName || 'Administrador'}
                  </span>
                </p>
                {userEmail && (
                  <p className="text-xs text-blue-200 truncate max-w-[140px] md:max-w-none">
                    {userEmail}
                  </p>
                )}
              </div>
              
              {/* Botón logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white flex-shrink-0"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 