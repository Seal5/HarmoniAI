"use client"

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Settings, Download, RotateCcw, Menu, X, Plus } from "lucide-react";
import MessageBubble from "@/components/message-bubble"
import TypingIndicator from "@/components/typing-indicator"
import SettingsModal from "@/components/settings-modal"
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Redirect to quiz if PHQ-9 not completed
  useEffect(() => {
    if (!isLoading && user && !user.hasCompletedPHQ9) {
      router.push('/quiz')
    }
  }, [user, isLoading, router])

  // Initialize by loading conversations from Redis
  useEffect(() => {
    if (user && user.hasCompletedPHQ9) {
      console.log("🚀 Initializing chat for user:", user.email);
      loadConversationsFromRedis();
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isTyping]);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("harmoni_conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  // Get context-aware welcome message
  const getWelcomeMessage = (score?: number, severity?: string) => {
    if (!score || !severity) {
      return "Hello! I'm Harmoni, your AI therapeutic companion. I'm here to listen and support you. How are you doing today?"
    }

    let message = "Hello! I'm Harmoni, your AI therapeutic companion. I'm glad you're here. "
    
    switch (severity) {
      case 'MINIMAL':
        message += "I see from your recent assessment that you're doing relatively well. I'm here to help you maintain your mental wellness and provide support whenever you need it."
        break
      case 'MILD':
        message += "I understand you may be experiencing some challenges based on your recent assessment. I'm here to listen and provide support as we work together."
        break
      case 'MODERATE':
      case 'MODERATELY_SEVERE':
        message += "I want you to know that I'm here to provide you with the support you need. Based on your recent assessment, let's focus on strategies that can help you feel better."
        break
      case 'SEVERE':
        message += "Thank you for taking the step to be here. I want to provide you with compassionate support. Please remember that professional help is also valuable, and I'm here to supplement that care."
        break
      default:
        message += "I'm here to provide you with supportive conversation tailored to your needs."
    }
    
    message += " How would you like to start our conversation today?"
    return message
  }

  // Load conversations from Redis or localStorage
  const loadConversationsFromRedis = async () => {
    try {
      console.log("📚 Loading conversations from Redis...");
      
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.conversations.length > 0) {
          console.log(`✅ Loaded ${data.conversations.length} conversations from Redis`);
          setConversations(data.conversations);
          setActiveConversationId(data.conversations[0].id);
          return;
        }
      }
      
      // Fallback to localStorage when Redis is unavailable
      console.log("📝 Redis unavailable, checking localStorage...");
      const savedConversations = localStorage.getItem("harmoni_conversations");
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        if (parsedConversations.length > 0) {
          console.log(`✅ Loaded ${parsedConversations.length} conversations from localStorage`);
          setConversations(parsedConversations);
          setActiveConversationId(parsedConversations[0].id);
          return;
        }
      }
      
      // If no conversations found anywhere, create first one
      console.log("📝 No conversations found, creating first one");
      await createFirstConversation();
    } catch (error) {
      console.error("❌ Error loading conversations:", error);
      // Try localStorage fallback on error
      const savedConversations = localStorage.getItem("harmoni_conversations");
      if (savedConversations) {
        try {
          const parsedConversations = JSON.parse(savedConversations);
          if (parsedConversations.length > 0) {
            console.log(`✅ Fallback: Loaded ${parsedConversations.length} conversations from localStorage`);
            setConversations(parsedConversations);
            setActiveConversationId(parsedConversations[0].id);
            return;
          }
        } catch (parseError) {
          console.error("❌ Error parsing localStorage conversations:", parseError);
        }
      }
      await createFirstConversation();
    }
  };

  // Create the very first conversation when none exist
  const createFirstConversation = async () => {
    const welcomeMessage = getWelcomeMessage(user?.phq9Score, user?.phq9Severity)
    
    const newConv = {
      id: Date.now().toString(),
      title: "New Conversation",
      date: new Date().toISOString().split("T")[0],
      messages: [
        {
          id: "init",
          role: "model",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ],
    };
    
    console.log("✨ Created first conversation:", newConv);
    // Set as first conversation (replace empty array)
    setConversations([newConv]);
    setActiveConversationId(newConv.id);
    
    // Save to Redis
    await saveConversationToRedis(newConv);
  };

  // Save conversation to Redis
  const saveConversationToRedis = async (conversation) => {
    try {
      console.log(`💾 Saving conversation ${conversation.id} to Redis...`);
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ Conversation ${conversation.id} saved to Redis`);
      } else {
        console.error(`❌ Failed to save conversation: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error saving conversation to Redis:", error);
    }
  };

  // Update conversation in Redis
  const updateConversationInRedis = async (conversation) => {
    try {
      console.log(`🔄 Updating conversation ${conversation.id} in Redis...`);
      
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ Conversation ${conversation.id} updated in Redis`);
      } else {
        console.error(`❌ Failed to update conversation: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error updating conversation in Redis:", error);
    }
  };

  const createNewConversation = async () => {
    const welcomeMessage = getWelcomeMessage(user?.phq9Score, user?.phq9Severity)
    
    const newConv = {
      id: Date.now().toString(),
      title: "New Conversation",
      date: new Date().toISOString().split("T")[0],
      messages: [
        {
          id: "init",
          role: "model",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ],
    };
    
    console.log("✨ Created new conversation:", newConv);
    // Add new conversation to existing ones instead of replacing them
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    
    // Save to Redis
    await saveConversationToRedis(newConv);
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
    
    const words = userMessage.split(' ').slice(0, 3).join(' ');
    return words.length > 20 ? words.substring(0, 20) + "..." : words;
  };

  const sendMessage = async (messageText) => {
    try {
      console.log("📤 Sending message:", messageText);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: messageText,
          context: {
            phq9Score: user?.phq9Score,
            severity: user?.phq9Severity,
            hasCompletedPHQ9: user?.hasCompletedPHQ9,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("📨 Received response:", data);
      return data.reply;
    } catch (error) {
      console.error("❌ Send message error:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isTyping) return;

    console.log("💬 Handling send message:", message);

    // Clear input and start typing indicator
    setInputValue("");
    setIsTyping(true);

    // Find current conversation
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
      content: message,
      timestamp: new Date(),
    };

    // Add user message to conversation
    const updatedConversation = {
      ...currentConv,
      title: currentConv.messages.length === 1 ? generateConversationTitle(message) : currentConv.title,
      messages: [...currentConv.messages, userMessage],
    };

    // Update conversations with user message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId ? updatedConversation : conv
    ));

    try {
      // Prepare messages for API (exclude initial greeting)
      const messagesToSend = updatedConversation.messages.slice(1);
      
      console.log("📨 Sending to API:", messagesToSend);

      // Get AI response
      const aiReply = await sendMessage(messagesToSend);

      // Create AI message
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: aiReply,
        timestamp: new Date(),
      };

      // Add AI response to conversation
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiMessage]
      };
      
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId ? finalConversation : conv
      ));
      
      // Save the updated conversation to Redis
      await updateConversationInRedis(finalConversation);

    } catch (error) {
      console.error("❌ Error getting AI response:", error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        role: "model",
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment. I'm here to support you.",
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [...conv.messages, errorMessage] }
          : conv
      ));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-teal-700">Loading your personalized chat...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.hasCompletedPHQ9) {
    return null // Will redirect to quiz
  }

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
            {user.phq9Severity && (
              <p className="text-xs text-teal-600 mt-1">
                Assessment: {user.phq9Severity.toLowerCase()} 
                {user.phq9Score && ` (${user.phq9Score}/27)`}
              </p>
            )}
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
