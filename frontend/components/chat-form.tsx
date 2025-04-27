"use client"

import type React from "react"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, ArrowUp, Paperclip, Mic, X } from "lucide-react"
import AutoResizeTextarea from "./auto-resize-textarea"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const formSchema = z.object({
  message: z.string().min(1, "Please enter a message"),
  file: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ChatFormProps {
  isLoading: boolean
  onSubmit: (values: FormValues) => Promise<void>
  onOpenSettings?: () => void
}

export default function ChatForm({ isLoading, onSubmit, onOpenSettings }: ChatFormProps) {
  const [isFocused, setIsFocused] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      file: undefined,
    },
  })

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // On desktop, Enter submits the form unless Shift is pressed
    // On mobile, Enter creates a new line
    if (e.key === "Enter") {
      if (!isMobile && !e.shiftKey) {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    form.setValue("file", file)
  }

  const handleSubmitForm = async (values: FormValues) => {
    await onSubmit(values)
    setSelectedFile(null)
    form.reset()
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // This would be where you'd implement actual voice recording
    if (!isRecording) {
      // Start recording
      console.log("Started recording")
    } else {
      // Stop recording and process
      console.log("Stopped recording")
    }
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmitForm)} className="relative">
        <motion.div
          className={cn(
            "relative bg-black/60 backdrop-blur-md rounded-[24px] overflow-hidden transition-all shadow-lg border border-[rgba(255,255,255,0.12)]",
            isFocused ? "ring-2 ring-white shadow-glow" : "",
            isLoading && "animate-pulse-loading pointer-events-none opacity-70",
          )}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence>
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-4 pt-3 flex items-center gap-2"
              >
                <div className="bg-white/10 rounded-full py-1 px-3 text-xs flex items-center gap-2 border border-white/10">
                  <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                  <span className="text-gray-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-gray-400 hover:text-white rounded-full"
                    onClick={() => {
                      setSelectedFile(null)
                      form.setValue("file", undefined)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-2 py-1.5">
            <div className="flex items-center">
              <div className="flex space-x-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  disabled={isLoading}
                />
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={triggerFileInput}
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 ml-0 transition-colors duration-300"
                    disabled={isLoading}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    className={cn(
                      "rounded-full h-10 w-10 ml-0 transition-all duration-300",
                      isRecording
                        ? "text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 animate-pulse"
                        : "text-gray-400 hover:text-white hover:bg-white/10",
                    )}
                    disabled={isLoading}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </motion.div>

                {onOpenSettings && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onOpenSettings}
                      className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 ml-0 transition-colors duration-300"
                      disabled={isLoading}
                    >
                      <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </div>

              <AutoResizeTextarea
                placeholder="Ask Asha anything..."
                className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-400 py-2 px-3 resize-none text-base tracking-normal transition-all duration-300"
                {...form.register("message")}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />

              <div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    type="submit"
                    className="bg-white hover:bg-gray-200 text-black rounded-full h-10 w-10 p-0 flex items-center justify-center shadow-glow transition-all duration-300"
                    disabled={isLoading}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </form>
    </Form>
  )
}
