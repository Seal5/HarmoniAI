"use client"

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Settings, Download, RotateCcw, Menu, X, Plus } from "lucide-react";
import MessageBubble from "@/components/message-bubble"
import TypingIndicator from "@/components/typing-indicator"
import SettingsModal from "@/components/settings-modal"
import { cn } from "@/lib/utils";
import { geminiChat } from "@/lib/geminiChat"

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log("🔄 Initializing app...");
    
    // Clear corrupted storage for fresh start
    localStorage.removeItem("harmoni_conversations");
    console.log("🗑️ Cleared localStorage for fresh start");
    
    // Always start with a fresh conversation for now
    createNewConversation();
  }, []);

  // Save conversations whenever they change
  useEffect(() => {
    localStorage.setItem("harmoni_conversations", JSON.stringify(conversations));
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversationId, isTyping]);

  const createNewConversation = () => {
    const newConv = {
      id: Date.now().toString(),
      title: "New Conversation",
      date: new Date().toISOString().split("T")[0],
      messages: [
        {
          id: "init",
          role: "model",
          content: "Hello! I'm Harmoni, your AI therapeutic companion. I'm here to listen and support you. How are you doing today?",
          timestamp: new Date(),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const generateConversationTitle = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('anxious') || message.includes('anxiety') || message.includes('worry')) {
      return "Anxiety & Worries";
    }
    if (message.includes('sad') || message.includes('depressed') || message.includes('down')) {
      return "Feeling Down";
    }
    if (message.includes('stress') || message.includes('overwhelmed') || message.includes('pressure')) {
      return "Stress & Pressure";
    }
    if (message.includes('relationship') || message.includes('partner') || message.includes('friend')) {
      return "Relationship Issues";
    }
    if (message.includes('work') || message.includes('job') || message.includes('career')) {
      return "Work & Career";
    }
    if (message.includes('family') || message.includes('parent') || message.includes('sibling')) {
      return "Family Matters";
    }
    if (message.includes('sleep') || message.includes('tired') || message.includes('insomnia')) {
      return "Sleep & Rest";
    }
    if (message.includes('angry') || message.includes('frustrated') || message.includes('mad')) {
      return "Anger & Frustration";
    }
    if (message.includes('lonely') || message.includes('alone') || message.includes('isolated')) {
      return "Loneliness";
    }
    if (message.includes('confident') || message.includes('self-esteem') || message.includes('worth')) {
      return "Self-Confidence";
    }
    
    const words = userMessage.split(' ').slice(0, 3).join(' ');
    return words.length > 20 ? words.substring(0, 20) + "..." : words;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const currentInputValue = inputValue.trim();
    setInputValue(""); // Clear input immediately
    setIsTyping(true);
    
    // Find the current conversation
    const currentConv = conversations.find((c) => c.id === activeConversationId);
    if (!currentConv) {
      console.error("❌ No active conversation found");
      setIsTyping(false);
      return;
    }
    
    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentInputValue,
      timestamp: new Date(),
    };
    
    // Update conversation with user message
    const updatedMessages = [...currentConv.messages, userMessage];
    const isFirstUserMessage = currentConv.messages.length === 1 && currentConv.messages[0].role === "model";
    const newTitle = isFirstUserMessage ? generateConversationTitle(currentInputValue) : currentConv.title;
    
    const updatedConversation = {
      ...currentConv,
      title: newTitle,
      messages: updatedMessages,
    };
    
    // Update conversations array
    const updatedConversations = conversations.map((conv) =>
      conv.id === activeConversationId ? updatedConversation : conv
    );
    
    setConversations(updatedConversations);

    try {
      console.log("🔍 Updated conversation:", updatedConversation);
      console.log("🔍 Updated conversation messages:", updatedConversation.messages);
      
      // Prepare messages for API (exclude the initial "Hello" from Harmoni)
      // Use the updated conversation that includes the new user message
      console.log("🔍 updatedConversation.messages:", updatedConversation.messages);
      console.log("🔍 updatedConversation.messages type:", typeof updatedConversation.messages);
      console.log("🔍 updatedConversation.messages isArray:", Array.isArray(updatedConversation.messages));
      
      const messagesToSend = updatedConversation.messages.slice(1);
      console.log("📨 Messages to send to API:", messagesToSend);
      console.log("📨 messagesToSend type:", typeof messagesToSend);
      console.log("📨 messagesToSend isArray:", Array.isArray(messagesToSend));
      console.log("📨 messagesToSend length:", messagesToSend?.length);
      
      if (!Array.isArray(messagesToSend)) {
        console.error("❌ messagesToSend is not an array!", messagesToSend);
        throw new Error("Messages to send is not an array");
      }
      
      if (messagesToSend.length === 0) {
        console.error("❌ No messages to send to API!");
        throw new Error("No messages to send to API");
      }
      
      console.log("🚀 Calling geminiChat with:", { messages: messagesToSend });
      const { data } = await geminiChat({ messages: messagesToSend });

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    id: (Date.now() + 1).toString(),
                    role: "model",
                    content: data.reply,
                    timestamp: new Date(),
                  },
                ],
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error getting AI response:", error);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    id: (Date.now() + 1).toString(),
                    role: "model",
                    content: "I apologize, but I'm having trouble responding right now. Please try again in a moment. I'm here to support you.",
                    timestamp: new Date(),
                  },
                ],
              }
            : conv
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadTranscript = () => {
    const current = conversations.find((c) => c.id === activeConversationId);
    if (!current) return;

    const transcript = current.messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");

    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harmoni-session-${current.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetChat = () => {
    createNewConversation();
  };

  const setActiveConversation = (id) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  };

  const currentConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="flex h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-teal-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-teal-100">
          <div>
            <h2 className="font-bold text-xl bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Harmoni AI
            </h2>
            <p className="text-sm text-gray-500 mt-1">Your therapeutic companion</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={createNewConversation}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new session to begin</p>
            </div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-teal-50",
                conv.id === activeConversationId ? "bg-teal-100 shadow-sm border border-teal-200" : "hover:bg-gray-50"
              )}
              onClick={() => setActiveConversation(conv.id)}
            >
              <div className="font-medium text-sm text-gray-900 truncate">{conv.title}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                <span>{conv.date}</span>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {conv.messages.filter(m => m.role === "user").length} messages
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-teal-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Harmoni AI
              </h1>
              <p className="text-sm text-gray-500">Therapeutic AI Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTranscript}
              className="text-sm px-3 py-1 bg-white/60 hover:bg-white border-teal-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Export Session
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetChat}
              className="text-sm px-3 py-1 text-teal-600 hover:bg-teal-50 border-teal-200"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              New Session
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentConversation?.messages.map((message) => (
            <MessageBubble
              key={message.id}
              sender={message.role === "model" ? "ai" : "user"}
              text={message.content}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-teal-100 p-6">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="resize-none rounded-2xl p-4 min-h-[60px] max-h-32 bg-white/80 border-teal-200 focus:border-teal-400 focus:ring-teal-400/20"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={cn(
                "rounded-2xl w-12 h-12 p-0 transition-all duration-200",
                inputValue.trim() ? "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg" : "bg-gray-300 hover:bg-gray-400",
                "disabled:opacity-50"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}