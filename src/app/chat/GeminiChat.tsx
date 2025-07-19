"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Settings, Download, RotateCcw, Menu, X } from "lucide-react"
import MessageBubble from "@/components/message-bubble"
import TypingIndicator from "@/components/typing-indicator"
import SettingsModal from "@/components/settings-modal"
import { cn } from "@/lib/utils"
import { streamGeminiResponse } from "@/lib/geminiStream"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  date: string
  messages: Message[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I'm here to listen and support you. How are you feeling today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversations] = useState<Conversation[]>([
    { id: "1", title: "Anxiety about work", date: "2024-01-15", messages: [] },
    { id: "2", title: "Relationship concerns", date: "2024-01-14", messages: [] },
    { id: "3", title: "Sleep issues", date: "2024-01-13", messages: [] },
    { id: "4", title: "Self-confidence", date: "2024-01-12", messages: [] },
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const geminiFormattedMessages = messages.map(m => ({
  role: m.sender === "user" ? "user" : "model",
  content: m.text,
}))

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

  const userMessage: Message = {
    id: Date.now().toString(),
    sender: "user",
    text: inputValue,
    timestamp: new Date(),
  }

  setMessages((prev) => [...prev, userMessage])
  setInputValue("")
  setIsTyping(true)

  const newAIMessage: Message = {
    id: (Date.now() + 1).toString(),
    sender: "ai",
    text: "",
    timestamp: new Date(),
  }

  setMessages((prev) => [...prev, newAIMessage])

  const fullMessages: { role: "user" | "model"; content: string }[] = [
  ...messages,
  userMessage,
].map((m) => ({
  role: m.sender === "user" ? "user" : "model", // guarantees correct type
  content: m.text,
}))


  try {
    await streamGeminiResponse(fullMessages, (chunkText) => {
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1]
        const updatedMessage = {
          ...lastMessage,
          text: lastMessage.text + chunkText,
        }
        return [...prevMessages.slice(0, -1), updatedMessage]
      })
    })
  } catch (error) {
    console.error("Streaming error:", error)
  } finally {
    setIsTyping(false)
  }
}

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const downloadTranscript = () => {
    const transcript = messages.map((msg) => `${msg.sender.toUpperCase()}: ${msg.text}`).join("\n\n")

    const blob = new Blob([transcript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "harmoni-ai-transcript.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        sender: "ai",
        text: "Hello! I'm here to listen and support you. How are you feeling today?",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="font-semibold text-gray-900">Conversations</h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <h2 className="font-semibold text-gray-900 mb-4 hidden lg:block">Past Conversations</h2>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div key={conv.id} className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="font-medium text-sm text-gray-900 truncate">{conv.title}</div>
                <div className="text-xs text-gray-500 mt-1">{conv.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold text-gray-900">Harmoni AI</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTranscript}
              className="text-sm px-3 py-1 bg-transparent"
            >
              <Download className="h-4 w-4 mr-1" />
              Download Transcript
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetChat}
              className="text-sm px-3 py-1 text-red-500 hover:bg-red-50 border-red-200 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Chat
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} sender={message.sender} text={message.text} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message…"
              className="resize-none rounded-full p-3 min-h-[48px] max-h-32"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={cn(
                "rounded-full w-12 h-12 p-0 transition-colors",
                inputValue.trim() ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-500 hover:bg-blue-600",
                "disabled:opacity-50",
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
