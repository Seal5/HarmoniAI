'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

export default function DashboardPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.hasCompletedPHQ9) {
        // User has completed PHQ-9, redirect to chat
        router.push('/chat')
      } else {
        // User hasn't completed PHQ-9, redirect to quiz
        router.push('/quiz')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-beige-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-beige-700 mx-auto mb-4"></div>
          <p className="text-coffee-700">Loading your personalized experience...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-beige-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-beige-700 mx-auto mb-4"></div>
        <p className="text-coffee-700">Redirecting...</p>
      </div>
    </div>
  )
}
