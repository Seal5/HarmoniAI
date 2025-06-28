"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  sender: "user" | "ai"
  text: string
}

export default function MessageBubble({ sender, text }: MessageBubbleProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "flex transition-all duration-300 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        sender === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl",
          sender === "user"
            ? "bg-blue-200 text-black ml-auto"
            : "bg-white text-gray-800 shadow-sm border border-gray-100",
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}
