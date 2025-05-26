import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Refresquitos Manager',
  description: 'Sistema de gestión financiera y de producción para el negocio Refresquitos',
  keywords: ['gestión', 'finanzas', 'producción', 'refrescos', 'inventario'],
  authors: [{ name: 'Refresquitos Team' }],
  viewport: 'width=device-width, initial-scale=1',
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
      </body>
    </html>
  )
} 