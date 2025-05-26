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
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src="/logo1.png" 
                alt="Refresquitos Logo" 
                className="w-16 h-16 object-cover rounded-full border-2 border-white/30 shadow-md"
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
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30" style={{ display: 'none' }}>
                <Droplets className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Refresquitos Manager</h1>
              <p className="text-blue-100">Sistema de Gestión Financiera y de Producción</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Dashboard Empresarial</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right text-white">
                <p className="text-sm text-blue-100">Bienvenido</p>
                <p className="font-medium flex items-center gap-1 justify-end">
                  <User className="h-4 w-4" />
                  {userName || 'Administrador'}
                </p>
                {userEmail && (
                  <p className="text-xs text-blue-200">{userEmail}</p>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 