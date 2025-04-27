"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SchedulingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mentorName: string
  mentorRole: string
}

export default function SchedulingModal({ open, onOpenChange, mentorName, mentorRole }: SchedulingModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate time slots (9 AM to 5 PM)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9
    const minute = (i % 2) * 30
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  })

  const handleSchedule = async () => {
    if (!date || !selectedTime) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/schedule-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorName,
          date: format(date, 'yyyy-MM-dd'),
          time: selectedTime,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule session')
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Error scheduling session:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black/90 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Schedule Session with {mentorName}</DialogTitle>
          <p className="text-sm text-gray-400">{mentorRole}</p>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Select Date</h4>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-white/10 bg-black/50"
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Select Time</h4>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={cn(
                    "text-sm",
                    selectedTime === time && "bg-white/20 text-white"
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!date || !selectedTime || isSubmitting}
            className="bg-white/20 text-white hover:bg-white/30"
          >
            {isSubmitting ? "Scheduling..." : "Schedule Session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 