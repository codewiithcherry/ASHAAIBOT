"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const faqs = [
  {
    question: "How can I improve my resume for tech jobs?",
    answer: "Focus on quantifiable achievements, relevant technical skills, and project experience. Use action verbs and tailor your resume for each job application."
  },
  {
    question: "What are the most in-demand tech skills?",
    answer: "Currently, skills in cloud computing, AI/ML, cybersecurity, and full-stack development are highly sought after. Soft skills like communication and problem-solving are also crucial."
  },
  {
    question: "How do I prepare for technical interviews?",
    answer: "Practice coding problems, review data structures and algorithms, and prepare for system design questions. Mock interviews and coding platforms can help you prepare effectively."
  },
  {
    question: "What's the best way to network in tech?",
    answer: "Attend tech meetups, contribute to open-source projects, engage on professional platforms like LinkedIn, and participate in hackathons or coding competitions."
  },
  {
    question: "How do I negotiate a tech job offer?",
    answer: "Research market rates, highlight your unique value, and consider total compensation including benefits, equity, and growth opportunities. Be prepared to discuss your expectations professionally."
  }
]

export function FAQMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            className="w-full justify-between text-left p-3 hover:bg-white/5"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span className="text-sm font-medium text-white">{faq.question}</span>
            {openIndex === index ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </Button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3 text-sm text-gray-300 border-t border-white/10">
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
} 