"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"

type EventAlertContextType = {
  todayEvents: any[]
  dismissAlert: (eventId: string) => void
}

const EventAlertContext = createContext<EventAlertContextType | undefined>(undefined)

export function EventAlertProvider({ children }: { children: React.ReactNode }) {
  const [todayEvents, setTodayEvents] = useState<any[]>([])
  const [dismissedEvents, setDismissedEvents] = useState<string[]>([])

  useEffect(() => {
    // Check for events happening today
    const checkTodayEvents = () => {
      if (typeof window !== "undefined") {
        const storedEvents = localStorage.getItem("camlds_events")
        if (!storedEvents) return

        const events = JSON.parse(storedEvents)
        const today = new Date().toISOString().split("T")[0]

        const eventsToday = events.filter((event: any) => event.date === today && !dismissedEvents.includes(event.id))

        setTodayEvents(eventsToday)

        // Trigger confetti if there are events today
        if (eventsToday.length > 0) {
          triggerConfetti()
        }
      }
    }

    checkTodayEvents()

    // Check every hour in case date changes
    const interval = setInterval(checkTodayEvents, 3600000)

    return () => clearInterval(interval)
  }, [dismissedEvents])

  const triggerConfetti = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  }

  const dismissAlert = (eventId: string) => {
    setDismissedEvents((prev) => [...prev, eventId])
  }

  return (
    <EventAlertContext.Provider value={{ todayEvents, dismissAlert }}>
      {todayEvents.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 space-y-2">
          {todayEvents.map((event) => (
            <Alert key={event.id} className="bg-primary text-primary-foreground">
              <div className="flex justify-between items-start">
                <div>
                  <AlertTitle className="text-lg font-bold">{event.title} holds today!</AlertTitle>
                  <AlertDescription className="text-primary-foreground/90">
                    Location: {event.location} | Time: {event.time}
                  </AlertDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground"
                  onClick={() => dismissAlert(event.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}
      {children}
    </EventAlertContext.Provider>
  )
}

export const useEventAlert = () => {
  const context = useContext(EventAlertContext)
  if (context === undefined) {
    throw new Error("useEventAlert must be used within an EventAlertProvider")
  }
  return context
}
