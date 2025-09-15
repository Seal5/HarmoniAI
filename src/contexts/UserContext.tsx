"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email?: string
  username?: string
  hasCompletedPHQ9: boolean
  phq9Score?: number
  phq9Severity?: string
  lastPHQ9Completion?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  checkPHQ9Status: () => Promise<void>
  markPHQ9Complete: (score: number, severity: string) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simple user ID generation for session-based identification
  const generateUserId = (): string => {
    const userAgent = navigator.userAgent || 'anonymous'
    const timestamp = Date.now().toString()
    const randomString = `${userAgent}-${timestamp}-${Math.random()}`
    return btoa(randomString).substring(0, 16)
  }

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('harmoniai_user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          await checkPHQ9Status()
        } else {
          // Create a new anonymous user
          const newUser: User = {
            id: generateUserId(),
            hasCompletedPHQ9: false,
          }
          setUser(newUser)
          localStorage.setItem('harmoniai_user', JSON.stringify(newUser))
        }
      } catch (error) {
        console.error('Error loading user:', error)
        // Create a new user on error
        const newUser: User = {
          id: generateUserId(),
          hasCompletedPHQ9: false,
        }
        setUser(newUser)
        localStorage.setItem('harmoniai_user', JSON.stringify(newUser))
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Check PHQ-9 completion status from the database
  const checkPHQ9Status = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/phq9?latest=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.responses.length > 0) {
          const latestResponse = data.responses[0]
          const updatedUser = {
            ...user,
            hasCompletedPHQ9: true,
            phq9Score: latestResponse.totalScore,
            phq9Severity: latestResponse.severityLevel,
            lastPHQ9Completion: latestResponse.assessmentDate,
          }
          setUser(updatedUser)
          localStorage.setItem('harmoniai_user', JSON.stringify(updatedUser))
        }
      }
    } catch (error) {
      console.error('Error checking PHQ-9 status:', error)
    }
  }

  // Mark PHQ-9 as completed
  const markPHQ9Complete = (score: number, severity: string) => {
    if (!user) return

    const updatedUser: User = {
      ...user,
      hasCompletedPHQ9: true,
      phq9Score: score,
      phq9Severity: severity,
      lastPHQ9Completion: new Date().toISOString(),
    }

    setUser(updatedUser)
    localStorage.setItem('harmoniai_user', JSON.stringify(updatedUser))
  }

  // Logout user
  const logout = () => {
    setUser(null)
    localStorage.removeItem('harmoniai_user')
  }

  const value: UserContextType = {
    user,
    setUser,
    isLoading,
    checkPHQ9Status,
    markPHQ9Complete,
    logout,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
