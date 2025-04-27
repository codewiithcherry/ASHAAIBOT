'use client'

import { AuthProvider } from '@/context/AuthContext'
import { AuthPage } from '@/components/AuthPage'

export default function Home() {
  return (
    <AuthProvider>
      <main className="h-[100dvh] w-screen overflow-hidden bg-background">
        <AuthPage />
      </main>
    </AuthProvider>
  )
}
