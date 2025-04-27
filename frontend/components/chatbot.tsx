"use client"

import { useState, useEffect } from "react"
import ChatLog from "./chat-log"
import ChatForm from "./chat-form"
import SettingsDialog from "./settings-dialog"
import Sidebar from "./sidebar"
import type { Message, ChatSession } from "@/lib/types"
import { useMediaQuery } from "@/hooks/use-media-query"
import { v4 as uuidv4 } from "uuid"
import { Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

// Analytics tracking function (replace with real endpoint as needed)
function trackAnalytics(event: string, data: any) {
  // Replace with real analytics integration (e.g., Google Analytics, Segment, custom API)
  console.log("[Analytics]", event, data)
}

// Simple gender bias detection (expand with real NLP or API as needed)
function detectGenderBias(text: string): boolean {
  const genderedWords = [
    /\bhe\b/i, /\bshe\b/i, /\bhis\b/i, /\bher\b/i, /\bhim\b/i, /\bhers\b/i,
    /\bboy\b/i, /\bgirl\b/i, /\bman\b/i, /\bmen\b/i, /\bwoman\b/i, /\bwomen\b/i,
    /\bguys\b/i, /\bgals\b/i, /\bdude\b/i, /\blady\b/i, /\bladies\b/i
  ]
  return genderedWords.some((regex) => regex.test(text))
}

export default function Chatbot() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [typingIndicator, setTypingIndicator] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [biasWarning, setBiasWarning] = useState<string | null>(null)

  // Load chat sessions from localStorage on initial load
  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions")
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions)
        setChatSessions(sessions)
      } catch (e) {
        console.error("Error parsing saved sessions:", e)
      }
    }
  }, [])

  // Save chat sessions to localStorage when they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      const sessionsToSave = chatSessions.map((session) => ({
        ...session,
        messages: session.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }))
      localStorage.setItem("chatSessions", JSON.stringify(sessionsToSave))
    }
  }, [chatSessions])

  // Load messages for current chat session
  useEffect(() => {
    if (currentChatId) {
      const currentSession = chatSessions.find((session) => session.id === currentChatId)
      if (currentSession) {
        setMessages(currentSession.messages)
      }
    }
  }, [currentChatId, chatSessions])

  // Prevent body scroll on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = ""
        document.documentElement.style.overflow = ""
      }
    }
  }, [isMobile])

  // Ensure theme is only set after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track chat started
  useEffect(() => {
    trackAnalytics("chat_started", { timestamp: new Date().toISOString() })
  }, [])

  // Track message sent
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      trackAnalytics("message_sent", { role: lastMsg.role, content: lastMsg.content, timestamp: new Date().toISOString() })
    }
  }, [messages])

  // Create a new chat session
  const createNewChat = () => {
    const newChatId = uuidv4()
    setCurrentChatId(newChatId)
    setMessages([])

    setChatSessions((prev) => [
      {
        id: newChatId,
        title: "New Chat",
        date: new Date().toLocaleDateString(),
        messages: [],
      },
      ...prev,
    ])

    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Select an existing chat session
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleSubmit = async (values: { message: string; file?: File }) => {
    if (!values.message.trim()) return

    // Bias detection
    if (detectGenderBias(values.message)) {
      setBiasWarning("Your message may contain gendered language. Please consider rephrasing to be more inclusive.")
      trackAnalytics("bias_detected", { message: values.message, timestamp: new Date().toISOString() })
      return
    } else {
      setBiasWarning(null)
    }

    const userMessage: Message = {
      role: "user",
      content: values.message,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setTypingIndicator(true)

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            ...msg,
            timestamp: new Date().toISOString()
          })),
          user_input: values.message
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      setTypingIndicator(false)

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      setTypingIndicator(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([])
    if (currentChatId) {
      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === currentChatId
            ? {
                ...session,
                messages: [],
              }
            : session,
        ),
      )
    }
  }

  const handleRetry = () => {
    if (messages.length >= 2) {
      const lastUserMessageIndex = messages.map((m) => m.role).lastIndexOf("user")
      if (lastUserMessageIndex !== -1) {
        const messagesToKeep = messages.slice(0, lastUserMessageIndex + 1)
        setMessages(messagesToKeep)
        const lastUserMessage = messages[lastUserMessageIndex]
        handleSubmit({ message: lastUserMessage.content, file: lastUserMessage.file })
      }
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleDeleteChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== chatId))
    if (currentChatId === chatId) {
      setCurrentChatId(null)
      setMessages([])
    }
  }

  const handleLogout = () => {
    // Clear all local storage
    localStorage.removeItem('chatSessions')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Reset state
    setMessages([])
    setChatSessions([])
    setCurrentChatId(null)
    // Redirect to auth page
    window.location.href = '/auth'
  }

  // Feedback handler
  const handleFeedback = (msgIdx: number, feedback: 'helpful' | 'not_helpful' | 'biased') => {
    const msg = messages[msgIdx]
    trackAnalytics("message_feedback", { feedback, message: msg, timestamp: new Date().toISOString() })
    // Optionally, show a toast or mark feedback as received
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-background to-gray-200 dark:from-gray-900 dark:via-background dark:to-gray-800 animate-gradient-slow"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.1)_0%,_transparent_70%)]"></div>
      </div>

      {/* Theme toggle button */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="bg-background/10 backdrop-blur-md text-foreground hover:bg-background/20 rounded-full h-10 w-10 flex items-center justify-center shadow-glow"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Sidebar toggle button */}
      <motion.div
        className="fixed top-4 left-4 z-50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="bg-background/10 backdrop-blur-md text-foreground hover:bg-background/20 rounded-full h-10 w-10 flex items-center justify-center shadow-glow"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-y-0 left-0 z-50 w-72 md:relative"
          >
            <Sidebar
              previousChats={chatSessions.map(session => ({
                id: session.id,
                title: session.title,
                date: session.date
              }))}
              onSelectChat={selectChat}
              onNewChat={createNewChat}
              onClose={() => setSidebarOpen(false)}
              onDeleteChat={handleDeleteChat}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-30 bg-background/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <motion.div
        className="absolute inset-0 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <motion.div
            className="p-6 text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-foreground">Asha AI</h1>
            <p className="text-muted-foreground text-sm mt-1 tracking-normal">Your Career Assistant</p>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto bg-destructive/20 backdrop-blur-md text-destructive-foreground px-4 py-2 rounded-md tracking-normal border border-destructive/30"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat messages */}
            <div className="flex-1 overflow-hidden">
              <ChatLog
                messages={messages}
                isLoading={isLoading}
                typingIndicator={typingIndicator}
                renderMessageExtras={(msg, idx) =>
                  msg.role === 'assistant' && (
                    <div className="flex gap-2 mt-1">
                      <button className="text-xs text-green-400 hover:underline" onClick={() => handleFeedback(idx, 'helpful')}>Helpful</button>
                      <button className="text-xs text-yellow-400 hover:underline" onClick={() => handleFeedback(idx, 'not_helpful')}>Not Helpful</button>
                      <button className="text-xs text-red-400 hover:underline" onClick={() => handleFeedback(idx, 'biased')}>Flag as Biased</button>
                    </div>
                  )
                }
              />
            </div>

            {/* Input field at bottom */}
            <motion.div
              className="p-4 md:px-8 md:pb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <ChatForm isLoading={isLoading} onSubmit={handleSubmit} onOpenSettings={() => setShowSettings(true)} />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Settings Dialog/Drawer */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      {/* Bias warning */}
      {biasWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-yellow-200 text-yellow-900 px-4 py-2 rounded shadow-lg border border-yellow-400">
          <span className="font-semibold">Inclusivity Tip:</span> {biasWarning}
        </div>
      )}
    </div>
  )
}
