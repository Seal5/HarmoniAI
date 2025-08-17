'use client'

import { useState } from "react"
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
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""))

  const setAnswer = (idx: number, value: string) => {
    const updated = [...answers]
    updated[idx] = value
    setAnswers(updated)
  }

  const next = () => {
    if (answers[current]) setCurrent((prev) => prev + 1)
  }

  const prev = () => {
    if (current > 0) setCurrent((prev) => prev - 1)
  }

  return (
    <main className="min-h-screen bg-[#FFF6ED] text-center flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <PHQ9Question
          question={questions[current]}
          index={current}
          totalQuestions={questions.length}
          selectedAnswer={answers[current]}
          setAnswer={setAnswer}
        />

        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" onClick={prev} disabled={current === 0}>
            ←
          </Button>
          <Button
            className="bg-orange-500 text-white hover:bg-orange-600"
            onClick={next}
            disabled={!answers[current]}
          >
            {current === questions.length - 1 ? "Submit" : "→"}
          </Button>
        </div>

        <div className="flex justify-center mt-6 gap-2">
          {answers.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full ${
                idx === current ? "bg-orange-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <p className="mt-6 text-xs italic text-gray-600">
          Your answers help us understand you better, so we can give you the right support.
        </p>
      </div>
    </main>
  )
}
