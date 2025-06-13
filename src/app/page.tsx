'use client'

import { AuthProvider } from '@/components/AuthProvider'
import FinancialDashboardWithFirebase from '@/components/FinancialDashboardWithFirebase'

export default function Home() {
  return (
    <AuthProvider>
      <FinancialDashboardWithFirebase />
    </AuthProvider>
  )
}