"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Plus, Users, Edit, Trash2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"

// Sample events data
const INITIAL_EVENTS_DATA = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    description:
      "Learn the basics of machine learning and its applications in the real world. This workshop will cover fundamental concepts, algorithms, and practical implementations. Participants will get hands-on experience with popular machine learning libraries and frameworks.",
    date: "2025-04-15",
    time: "10:00 AM - 12:00 PM",
    location: "Faculty of Communication and Information Sciences",
    category: "Workshop",
    registeredUsers: ["2"],
    image: "/placeholder.svg?height=400&width=600",
    tutors: [
      {
        id: "1",
        name: "Makinde Kehinde",
        profilePicture: "/placeholder.svg?height=200&width=200",
      },
      {
        id: "3",
        name: "Technical Lead",
        profilePicture: "/placeholder.svg?height=200&width=200",
      },
    ],
    createdBy: "1",
  },
  {
    id: "2",
    title: "Web Development Bootcamp",
    description:
      "A comprehensive bootcamp covering HTML, CSS, JavaScript, and modern frameworks. This intensive program will take you from the basics to advanced concepts in web development. You'll build real-world projects and learn industry best practices.",
    date: "2025-04-22",
    time: "2:00 PM - 5:00 PM",
    location: "CAMLDS Lab, Unilorin",
    category: "Bootcamp",
    registeredUsers: [],
    image: "/placeholder.svg?height=400&width=600",
    tutors: [
      {
        id: "3",
        name: "Technical Lead",
        profilePicture: "/placeholder.svg?height=200&width=200",
      },
      {
        id: "5",
        name: "Charlie Brown",
        profilePicture: "/placeholder.svg?height=200&width=200",
      },
    ],
    createdBy: "3",
  },
  {
    id: "3",
    title: "Tech Career Fair",
    description:
      "Connect with tech companies and explore career opportunities in the tech industry. Meet representatives from leading tech companies, attend career workshops, and network with industry professionals. Bring your resume and be prepared for on-the-spot interviews.",
    date: "2025-05-10",
    time: "9:00 AM - 4:00 PM",
    location: "University Auditorium",
    category: "Career",
    registeredUsers: ["1", "2"],
    image: "/placeholder.svg?height=400&width=600",
    createdBy: "1",
  },
]

// Get events from localStorage or use initial data
const getStoredEvents = () => {
  if (typeof window !== "undefined") {
    const storedEvents = localStorage.getItem("camlds_events")
    return storedEvents ? JSON.parse(storedEvents) : INITIAL_EVENTS_DATA
  }
  return INITIAL_EVENTS_DATA
}

export default function EventsPage() {
  const { user, hasAdminPrivileges, updateProfile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [events, setEvents] = useState(getStoredEvents)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showRegistrations, setShowRegistrations] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("camlds_events", JSON.stringify(events))
  }, [events])

  useEffect(() => {
    // Sort events by date (newest first)
    setEvents((prevEvents) => [...prevEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }, [])

  // Calculate days remaining for each event
  const calculateDaysRemaining = (eventDate: string) => {
    const today = new Date()
    const event = new Date(eventDate)
    const diffTime = event.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Check if event date has passed
  const hasEventPassed = (eventDate: string) => {
    const today = new Date()
    const event = new Date(eventDate)
    return today > event
  }

  // Check if user can edit/delete event
  const canManageEvent = (event: any) => {
    if (!user || !hasAdminPrivileges) return false
    if (hasEventPassed(event.date)) return false

    // Team Lead can manage all events
    if (user.position === "Team Lead") return true

    // Other admins can only manage their own events
    return event.createdBy === user.id
  }

  const handleRegister = (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for events",
        variant: "destructive",
      })
      return
    }

    // Update events state
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          const isRegistered = event.registeredUsers.includes(user.id)

          if (isRegistered) {
            // Unregister
            return {
              ...event,
              registeredUsers: event.registeredUsers.filter((id) => id !== user.id),
            }
          } else {
            // Register
            return {
              ...event,
              registeredUsers: [...event.registeredUsers, user.id],
            }
          }
        }
        return event
      }),
    )

    // Update user's registered events
    if (user) {
      const event = events.find((e) => e.id === eventId)
      const isRegistered = event?.registeredUsers.includes(user.id)

      if (isRegistered) {
        // Unregister
        updateProfile({
          registeredEvents: user.registeredEvents?.filter((id) => id !== eventId) || [],
          registrationDates: { ...user.registrationDates },
        })

        // Remove the registration date
        if (user.registrationDates) {
          const newDates = { ...user.registrationDates }
          delete newDates[eventId]
          updateProfile({ registrationDates: newDates })
        }

        toast({
          title: "Unregistered",
          description: "You have unregistered from this event",
        })
      } else {
        // Register
        const newRegisteredEvents = [...(user.registeredEvents || []), eventId]
        const newRegistrationDates = {
          ...(user.registrationDates || {}),
          [eventId]: new Date().toISOString().split("T")[0],
        }

        updateProfile({
          registeredEvents: newRegisteredEvents,
          registrationDates: newRegistrationDates,
        })

        toast({
          title: "Registered",
          description: "You have registered for this event",
        })
      }
    }
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/edit/${eventId}`)
  }

  const confirmDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteEvent = () => {
    if (!eventToDelete) return

    // Remove event from events list
    setEvents(events.filter((event) => event.id !== eventToDelete))

    // If users have registered for this event, update their registrations
    if (user && user.registeredEvents?.includes(eventToDelete)) {
      updateProfile({
        registeredEvents: user.registeredEvents.filter((id) => id !== eventToDelete),
      })
    }

    toast({
      title: "Event deleted",
      description: "The event has been successfully deleted",
    })

    setShowDeleteConfirm(false)
    setEventToDelete(null)
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Events</h1>
          {hasAdminPrivileges && (
            <Link href="/events/create" className="ml-auto">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No events found</h2>
            <p className="text-muted-foreground mb-6">There are currently no events scheduled.</p>
            {hasAdminPrivileges && (
              <Link href="/events/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Event
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const daysRemaining = calculateDaysRemaining(event.date)
              const isPastEvent = daysRemaining < 0

              return (
                <Card
                  key={event.id}
                  className={`overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] ${
                    isPastEvent ? "opacity-70" : ""
                  }`}
                >
                  {event.image && (
                    <div className="relative h-48 w-full">
                      <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                      {isPastEvent && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive" className="text-lg py-1 px-3">
                            Past Event
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {event.description.length > 100
                            ? `${event.description.substring(0, 100)}...`
                            : event.description}
                        </CardDescription>
                      </div>
                      <Badge>{event.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{event.date}</span>
                        <span className={`ml-2 text-xs ${isPastEvent ? "text-destructive" : "text-primary"}`}>
                          ({isPastEvent ? "Passed" : `${daysRemaining} days left`})
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      {hasAdminPrivileges && (
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{event.registeredUsers.length} registered</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <div className="flex justify-between w-full">
                      <Button variant="outline" onClick={() => setSelectedEvent(event)}>
                        View Details
                      </Button>
                      {user && !isPastEvent && (
                        <Button
                          variant={event.registeredUsers.includes(user.id) ? "destructive" : "default"}
                          onClick={() => handleRegister(event.id)}
                        >
                          {event.registeredUsers.includes(user.id) ? "Unregister" : "Register"}
                        </Button>
                      )}
                    </div>

                    {canManageEvent(event) && (
                      <div className="flex justify-between w-full mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 mr-1"
                          onClick={() => handleEditEvent(event.id)}
                        >
                          <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 ml-1"
                          onClick={() => confirmDeleteEvent(event.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {/* Event Details Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto my-4">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <DialogDescription>Event details and information</DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-6">
                {selectedEvent.image && (
                  <div className="relative h-64 w-full rounded-md overflow-hidden">
                    <Image
                      src={selectedEvent.image || "/placeholder.svg"}
                      alt={selectedEvent.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{selectedEvent.date}</span>
                        {hasEventPassed(selectedEvent.date) ? (
                          <span className="ml-2 text-xs text-destructive">(Event has passed)</span>
                        ) : (
                          <span className="ml-2 text-xs text-primary">
                            ({calculateDaysRemaining(selectedEvent.date)} days left)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{selectedEvent.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{selectedEvent.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge>{selectedEvent.category}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Registration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedEvent.registeredUsers.length} people have registered for this event.
                    </p>

                    {user && !hasEventPassed(selectedEvent.date) && (
                      <Button
                        className="w-full"
                        variant={selectedEvent.registeredUsers.includes(user.id) ? "destructive" : "default"}
                        onClick={() => handleRegister(selectedEvent.id)}
                      >
                        {selectedEvent.registeredUsers.includes(user.id) ? "Unregister" : "Register"}
                      </Button>
                    )}

                    {hasAdminPrivileges && (
                      <Button variant="outline" className="w-full mt-2" onClick={() => setShowRegistrations(true)}>
                        View Registrations
                      </Button>
                    )}

                    {canManageEvent(selectedEvent) && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedEvent(null)
                            handleEditEvent(selectedEvent.id)
                          }}
                        >
                          <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setSelectedEvent(null)
                            confirmDeleteEvent(selectedEvent.id)
                          }}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>

                {(selectedEvent.category === "Workshop" ||
                  selectedEvent.category === "Bootcamp" ||
                  selectedEvent.category === "Seminar") &&
                  selectedEvent.tutors && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Tutors/Panelists</h3>
                      <div className="flex flex-wrap gap-4">
                        {selectedEvent.tutors.map((tutor: any) => (
                          <div key={tutor.id} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={tutor.profilePicture} alt={tutor.name} />
                              <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{tutor.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Registrations Dialog */}
        <Dialog open={showRegistrations} onOpenChange={setShowRegistrations}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto my-4">
            <DialogHeader>
              <DialogTitle>Event Registrations</DialogTitle>
              <DialogDescription>People who have registered for this event</DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {selectedEvent.registeredUsers.length > 0 ? (
                  selectedEvent.registeredUsers.map((userId: string) => {
                    const registeredUser = events.flatMap((e) => e.tutors || []).find((t) => t?.id === userId) || {
                      id: userId,
                      name: `User ${userId}`,
                      profilePicture: "/placeholder.svg?height=200&width=200",
                    }

                    return (
                      <div key={userId} className="flex items-center justify-between p-2 border-b">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={registeredUser.profilePicture} alt={registeredUser.name} />
                            <AvatarFallback>{registeredUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{registeredUser.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Registered on: {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No registrations yet</p>
                )}
              </div>
            )}

            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto my-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteEvent}>
                Delete Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
