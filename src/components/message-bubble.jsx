import React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export default function MessageBubble({ sender, text }) {
  const isAI = sender === "ai";

  return (
    <div className={cn("flex gap-3", isAI ? "justify-start" : "justify-end")}>
      {isAI && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
          isAI
            ? "bg-white/90 text-gray-800 rounded-tl-md border border-teal-100"
            : "bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-tr-md shadow-lg"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>

      {!isAI && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}