'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import Chatbot from './chatbot'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function AuthPage() {
  const { user, isLoading, login, logout } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        {showRegister ? (
          <RegisterForm
            onRegisterSuccess={() => setShowRegister(false)}
            switchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginForm
            onLoginSuccess={login}
            switchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    )
  }

  // User is logged in, show Chatbot with logout button
  return (
    <div className="relative min-h-screen">
      {/* Logout button in top-right corner */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="bg-background/10 backdrop-blur-md text-foreground hover:bg-background/20 rounded-full h-10 w-10 flex items-center justify-center shadow-glow"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <Chatbot />
    </div>
  )
} 