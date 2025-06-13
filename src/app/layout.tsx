import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import FirebaseStatus from '@/components/FirebaseStatus'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Refresquitos Manager',
  description: 'Sistema de gestión financiera y de producción para el negocio Refresquitos',
  keywords: ['gestión', 'finanzas', 'producción', 'refrescos', 'inventario'],
  authors: [{ name: 'Refresquitos Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          {children}
        </div>
        <Toaster />
        <FirebaseStatus />
      </body>
    </html>
  )
} 