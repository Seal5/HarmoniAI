"use client"

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white text-gray-800 shadow-sm border border-gray-100 px-4 py-3 rounded-2xl">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-500 mr-2">AI is typing</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
