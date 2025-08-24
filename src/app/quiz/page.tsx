'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import PHQ9Question from "@/components/PHQ9Question"
import { Button } from "@/components/ui/button"

const questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you're a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way",
  "If you’ve checked any problems, how much have they affected your work, home responsibilities, or social life?",
]

export default function QuizPage() {
  const router = useRouter()
  const { user, isLoading, markPHQ9Complete } = useUser()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Redirect to chat if PHQ-9 already completed
  useEffect(() => {
    if (!isLoading && user && user.hasCompletedPHQ9) {
      router.push('/chat')
    }
  }, [user, isLoading, router])

  const setAnswer = (idx: number, value: string) => {
    const updated = [...answers]
    updated[idx] = value
    setAnswers(updated)
  }

  const next = () => {
    if (answers[current]) {
      if (current === questions.length - 1) {
        // Last question - submit the quiz
        submitQuiz()
      } else {
        // Move to next question
        setCurrent((prev) => prev + 1)
      }
    }
  }

  const prev = () => {
    if (current > 0) setCurrent((prev) => prev - 1)
  }

  const submitQuiz = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answers,
          email: user?.email,
          username: user?.username,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quiz')
      }

      // Success! Update user context and redirect to chat
      console.log('Quiz submitted successfully:', data)
      
      // Mark PHQ-9 as completed in user context
      markPHQ9Complete(data.data.phq9Score, data.data.severityLevel)
      
      // Show success message with interpretation
      const successMessage = `Assessment completed successfully!\n\nYour PHQ-9 score: ${data.data.phq9Score}\nSeverity level: ${data.data.severityLevel}\n\n${data.interpretation}\n\nYou'll now be redirected to chat where I can provide personalized support.`
      alert(successMessage)
      
      // Redirect to chat page
      router.push('/chat')
      
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-beige-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-beige-700 mx-auto mb-4"></div>
          <p className="text-coffee-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-warm-beige-50 via-coffee-50 to-warm-beige-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-beige-700 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-warm-beige-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-coffee-900 mb-2">Mental Health Assessment</h1>
          <p className="text-coffee-600 text-lg max-w-2xl mx-auto leading-relaxed">
            This confidential questionnaire helps us understand your current well-being so we can provide personalized support.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-coffee-600 mb-2">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{Math.round(((current + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-coffee-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-warm-beige-600 to-warm-beige-700 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-coffee-200/50 p-8 mb-6 transform transition-all duration-300 hover:shadow-2xl">
          <PHQ9Question
            question={questions[current]}
            index={current}
            totalQuestions={questions.length}
            selectedAnswer={answers[current]}
            setAnswer={setAnswer}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={prev} 
            disabled={current === 0 || isSubmitting}
            className="border-coffee-300 text-coffee-700 hover:bg-coffee-100 hover:border-coffee-400 px-6 py-3 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>
          
          <Button
            className="bg-gradient-to-r from-warm-beige-700 to-warm-beige-800 text-warm-beige-50 hover:from-warm-beige-800 hover:to-warm-beige-900 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={next}
            disabled={!answers[current] || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                {current === questions.length - 1 ? "Complete Assessment" : "Next Question"}
                {current !== questions.length - 1 && (
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{submitError}</p>
            </div>
          </div>
        )}

        {/* Question Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {answers.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === current 
                  ? "bg-warm-beige-700 scale-125 shadow-md" 
                  : answers[idx] 
                    ? "bg-warm-beige-500 shadow-sm" 
                    : "bg-coffee-300"
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-coffee-100/80 rounded-xl px-6 py-3 shadow-sm">
            <svg className="w-5 h-5 text-coffee-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-coffee-700 font-medium">
              Your responses are confidential and help us provide better support
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
