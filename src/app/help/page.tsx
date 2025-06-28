"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "How does Harmoni AI work?",
    answer:
      "Harmoni AI uses advanced natural language processing to provide empathetic, supportive conversations. Our AI is trained to listen actively and respond with care, helping you process your thoughts and feelings in a safe space.",
  },
  {
    id: "2",
    question: "Is my conversation private and secure?",
    answer:
      "Yes, your privacy is our top priority. All conversations are encrypted and stored securely. We never share your personal information or conversation content with third parties.",
  },
  {
    id: "3",
    question: "Can Harmoni AI replace traditional therapy?",
    answer:
      "Harmoni AI is designed to complement, not replace, professional mental health care. While our AI can provide support and a listening ear, we always recommend consulting with licensed mental health professionals for serious concerns.",
  },
  {
    id: "4",
    question: "What should I do in a crisis situation?",
    answer:
      "If you're experiencing a mental health crisis, please contact emergency services (911) or a crisis hotline immediately. Harmoni AI is not equipped to handle emergency situations and should not be used as a substitute for immediate professional help.",
  },
  {
    id: "5",
    question: "How can I get the most out of my conversations?",
    answer:
      "Be open and honest about your feelings. The more you share, the better Harmoni AI can understand and support you. Don't hesitate to explore different topics or ask for specific types of support.",
  },
  {
    id: "6",
    question: "Can I download my conversation history?",
    answer:
      'Yes, you can download transcripts of your conversations at any time using the "Download Transcript" button in the chat interface. This allows you to keep a record of your progress and insights.',
  },
]

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/home">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & FAQ</h1>
          <p className="text-gray-600">Find answers to common questions about Harmoni AI</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {faqs.map((faq, index) => {
            const isOpen = openItems.has(faq.id)
            return (
              <div key={faq.id} className={cn("border-b border-gray-200", index === faqs.length - 1 && "border-b-0")}>
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Still have questions? We're here to help.</p>
          <Button variant="outline">Contact Support</Button>
        </div>
      </div>
    </div>
  )
}
