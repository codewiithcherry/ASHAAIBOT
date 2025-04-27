'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  full_name?: string | null
}

interface AuthContextType {
  token: string | null
  user: User | null
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
  fetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true) // Start loading until token checked

  // Check for token in localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      setToken(storedToken)
    } else {
      setIsLoading(false) // No token, stop loading
    }
  }, [])

  // Fetch user data when token changes
  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setUser(null)
      setIsLoading(false) // No token, ensure loading is false
    }
  }, [token])

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken)
    setToken(newToken)
    // fetchUser() will be called automatically by the useEffect above
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
    setIsLoading(false)
  }

  const fetchUser = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        // Token might be invalid/expired
        if (response.status === 401) {
           console.warn('Auth token invalid, logging out.')
           logout() // Log out if token is unauthorized
        } else {
            throw new Error('Failed to fetch user data')
        }
      } else {
        const userData: User = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      // Keep token but clear user? Or logout? Decided to logout for safety.
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    token,
    user,
    isLoading,
    login,
    logout,
    fetchUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 