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
    <>
      <p className="text-sm text-gray-700 mb-6">← Back</p>
      <p className="text-sm text-gray-700 mb-2">
        Over the last 2 weeks, how often have you been bothered by any of the following problems?
      </p>
      <h2 className="text-lg font-semibold mt-1 text-gray-900">{`Q${index + 1}/Q${totalQuestions}`}</h2>
      <h1 className="text-2xl font-bold mt-2 mb-6 text-gray-900">{question}</h1>

      <div className="flex flex-wrap justify-center gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={cn(
              "px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200",
              localSelection === option
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </>
  )
}
