"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const options = ["Not at all", "Several days", "More than half the days", "Nearly every day"]

export default function PHQ9Question({
  question,
  index,
  selectedAnswer,
  setAnswer,
  totalQuestions,
}: {
  question: string
  index: number
  selectedAnswer: string | null
  setAnswer: (index: number, value: string) => void
  totalQuestions: number
}) {
  const [localSelection, setLocalSelection] = useState(selectedAnswer)

  useEffect(() => {
    setLocalSelection(selectedAnswer)
  }, [selectedAnswer])

  const handleSelect = (option: string) => {
    setLocalSelection(option)
    setAnswer(index, option)
  }

  return (
    <div className="text-center">
      {/* Question Context */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center bg-coffee-100 rounded-full px-4 py-2 mb-4">
          <span className="text-sm font-medium text-coffee-700">
            Over the last 2 weeks, how often have you been bothered by:
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-coffee-900 leading-tight max-w-3xl mx-auto">
          {question}
        </h1>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {options.map((option, optionIndex) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={cn(
              "group relative p-4 rounded-xl border-2 text-left font-medium transition-all duration-300 transform hover:scale-102",
              "focus:outline-none focus:ring-2 focus:ring-warm-beige-500 focus:ring-offset-2",
              localSelection === option
                ? "bg-warm-beige-700 text-warm-beige-50 border-warm-beige-700 shadow-lg scale-102"
                : "bg-coffee-50/80 text-coffee-800 border-coffee-200 hover:bg-coffee-100 hover:border-coffee-300 hover:shadow-md"
            )}
          >
            {/* Selection Indicator */}
            <div className={cn(
              "absolute top-3 right-3 w-6 h-6 rounded-full border-2 transition-all duration-200",
              localSelection === option
                ? "bg-warm-beige-50 border-warm-beige-300"
                : "border-coffee-300 group-hover:border-coffee-400"
            )}>
              {localSelection === option && (
                <svg className="w-4 h-4 text-warm-beige-700 absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Option Text */}
            <div className="pr-8">
              <div className="flex items-center mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold",
                  localSelection === option
                    ? "bg-warm-beige-600 text-warm-beige-50"
                    : "bg-coffee-200 text-coffee-700 group-hover:bg-coffee-300"
                )}>
                  {optionIndex}
                </div>
                <span className="text-lg">{option}</span>
              </div>
              
              {/* Frequency Description */}
              <p className={cn(
                "text-sm ml-11",
                localSelection === option
                  ? "text-warm-beige-200"
                  : "text-coffee-500"
              )}>
                {optionIndex === 0 && "Not experienced"}
                {optionIndex === 1 && "1-6 days"}
                {optionIndex === 2 && "7+ days"}
                {optionIndex === 3 && "Nearly daily"}
              </p>
            </div>

            {/* Hover Effect */}
            <div className={cn(
              "absolute inset-0 rounded-xl transition-opacity duration-200 pointer-events-none",
              localSelection === option
                ? "bg-gradient-to-r from-warm-beige-600/10 to-warm-beige-700/10"
                : "bg-gradient-to-r from-coffee-100/0 to-coffee-200/0 group-hover:from-coffee-100/50 group-hover:to-coffee-200/50"
            )} />
          </button>
        ))}
      </div>

      {/* Helper Text */}
      <div className="mt-8">
        <p className="text-coffee-600 text-sm max-w-lg mx-auto">
          Select the option that best describes your experience over the past two weeks.
        </p>
      </div>
    </div>
  )
}
