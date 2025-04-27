"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import type { Message } from "@/lib/types"

interface ChatLogProps {
  messages: Message[]
  isLoading: boolean
  typingIndicator: boolean
  renderMessageExtras?: (msg: Message, idx: number) => React.ReactNode
}

export default function ChatLog({ messages, isLoading, typingIndicator, renderMessageExtras }: ChatLogProps) {
  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-4 p-4 md:p-8">
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-[50vh] text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Asha AI</h2>
            <p className="text-muted-foreground max-w-md">
              I'm here to help you with your career journey. Ask me anything about jobs, skills, or career advice.
            </p>
          </motion.div>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {renderMessageExtras && renderMessageExtras(message, index)}
            </div>
          </motion.div>
        ))}

        {typingIndicator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-muted text-foreground rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  )
}
