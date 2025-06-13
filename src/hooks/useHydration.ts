import { useEffect, useState } from 'react'

/**
 * Hook para evitar errores de hidratación React
 * Garantiza que los componentes solo se rendericen después del mount del cliente
 * 
 * @returns boolean - true si el componente está montado en el cliente
 */
export function useHydration(): boolean {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}

/**
 * Hook para verificar si estamos en el navegador (cliente)
 * Útil para APIs que solo están disponibles en el navegador
 * 
 * @returns boolean - true si estamos en el navegador
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(typeof window !== 'undefined')
  }, [])

  return isClient
} 