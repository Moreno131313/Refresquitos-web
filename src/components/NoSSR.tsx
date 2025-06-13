'use client'

import { useHydration } from '@/hooks/useHydration'
import { ReactNode } from 'react'

interface NoSSRProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente wrapper que previene el renderizado en el servidor
 * Útil para componentes que dependen de APIs del navegador
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
  const isMounted = useHydration()

  if (!isMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 