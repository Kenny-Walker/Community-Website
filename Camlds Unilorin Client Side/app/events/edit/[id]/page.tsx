"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Search, Plus, AlertTriangle } from "lucide-react"

// Sample community members data for tutor selection
const MEMBERS_DATA = [
  {
    id: "1",
    name: "Makinde Kehinde",
    email: "kehinde.makinde07@gmail.com",
    role: "admin",
    profilePicture: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@camlds.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "3",
    name: "Technical Lead",
    email: "tech@camlds.com",
    role: "admin",
    profilePicture: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "4",
    name: "PR Officer",
    email: "pr@camlds.com",
    role: "admin",
    profilePicture: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
  },
]

export default function EditEventPage() {
  const { user, hasAdminPrivileges } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [eventNotFound, setEventNotFound] = useState(false)
  const [eventPassed, setEventPassed] = useState(false)
  const [notAuthorized, setNotAuthorized] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    tutors: [] as string[],
  })

  const [eventImage, setEventImage] = useState<string | null>(null)
  const eventId = params?.id as string

  // Check if event date has passed
  const hasEventPassed = (eventDate: string) => {
    const today = new Date()
    const event = new Date(eventDate)
    return today > event
  }

  // Check if user can edit event
  const canManageEvent = (event: any) => {
    if (!user || !hasAdminPrivileges) return false
    if (hasEventPassed(event.date)) return false

    // Team Lead can manage all events
    if (user.position === "Team Lead") return true

    // Other admins can only manage their own events
    return event.createdBy === user.id
  }

  // Load event data
  useEffect(() => {
    if (!eventId) return

    // Get events from localStorage
    const storedEvents = localStorage.getItem("camlds_events")
    if (!storedEvents) {
      setEventNotFound(true)
      return
    }

    const events = JSON.parse(storedEvents)
    const event = events.find((e: any) => e.id === eventId)

    if (!event) {
      setEventNotFound(true)
      return
    }

    // Check if event has passed
    if (hasEventPassed(event.date)) {
      setEventPassed(true)
      return
    }

    // Check if user is authorized to edit
    if (!canManageEvent(event)) {
      setNotAuthorized(true)
      return
    }

    // Set form data
    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: event.date || "",
      time: event.time || "",
      location: event.location || "",
      category: event.category || "",
      tutors: event.tutors?.map((t: any) => t.id) || [],
    })

    setEventImage(event.image || null)
  }, [eventId, user])

  if (!user || !hasAdminPrivileges) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">You need admin privileges to edit events.</p>
              <Button className="mt-4" onClick={() => router.push("/events")}>
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (eventNotFound) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
              <p className="text-muted-foreground">The event you're trying to edit doesn't exist.</p>
              <Button className="mt-4" onClick={() => router.push("/events")}>
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (eventPassed) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Cannot Edit Past Event
              </h1>
              <p className="text-muted-foreground">This event has already passed and cannot be edited.</p>
              <Button className="mt-4" onClick={() => router.push("/events")}>
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (notAuthorized) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Not Authorized</h1>
              <p className="text-muted-foreground">You don't have permission to edit this event.</p>
              <Button className="mt-4" onClick={() => router.push("/events")}>
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload this to a storage service
    // For demo purposes, we'll use a placeholder
    setEventImage("/placeholder.svg?height=400&width=600")
  }

  const handleSelectTutor = (tutorId: string) => {
    if (formData.tutors.includes(tutorId)) {
      setFormData((prev) => ({
        ...prev,
        tutors: prev.tutors.filter((id) => id !== tutorId),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        tutors: [...prev.tutors, tutorId],
      }))
    }
  }

  const filteredMembers = MEMBERS_DATA.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getSelectedTutor = (tutorId: string) => {
    return MEMBERS_DATA.find((member) => member.id === tutorId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate form
    if (!formData.title || !formData.date || !formData.location || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Get existing events from localStorage
    const storedEvents = localStorage.getItem("camlds_events")
    if (!storedEvents) {
      toast({
        title: "Error",
        description: "Could not find events data",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const events = JSON.parse(storedEvents)
    const eventIndex = events.findIndex((e: any) => e.id === eventId)

    if (eventIndex === -1) {
      toast({
        title: "Error",
        description: "Event not found",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Get the existing event
    const existingEvent = events[eventIndex]

    // Create updated event object
    const updatedEvent = {
      ...existingEvent,
      ...formData,
      image: eventImage || existingEvent.image,
      tutors: formData.tutors.map((tutorId) => {
        const tutor = getSelectedTutor(tutorId)
        return {
          id: tutor?.id,
          name: tutor?.name,
          profilePicture: tutor?.profilePicture,
        }
      }),
    }

    // Update the event in the array
    events[eventIndex] = updatedEvent

    // Save to localStorage
    localStorage.setItem("camlds_events", JSON.stringify(events))

    toast({
      title: "Event updated",
      description: "Your event has been updated successfully",
    })

    setIsLoading(false)
    router.push("/events")
  }

  const showTutorSelection =
    formData.category === "Workshop" || formData.category === "Bootcamp" || formData.category === "Seminar"

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Event</h1>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Update the details for this event</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  name="time"
                  type="text"
                  placeholder="e.g., 2:00 PM - 4:00 PM"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Seminar">Seminar</SelectItem>
                  <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                  <SelectItem value="Hackathon">Hackathon</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Career">Career Event</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-image">Event Image</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input id="event-image" type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
                {eventImage && (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <img
                      src={eventImage || "/placeholder.svg"}
                      alt="Event preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 rounded-full"
                      onClick={() => setEventImage(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {showTutorSelection && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Tutors/Panelists</Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tutors.map((tutorId) => {
                    const tutor = getSelectedTutor(tutorId)
                    return (
                      <div key={tutorId} className="flex items-center gap-1 bg-muted p-1 pl-2 rounded-md">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={tutor?.profilePicture} alt={tutor?.name} />
                          <AvatarFallback>{tutor?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{tutor?.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-1"
                          onClick={() => handleSelectTutor(tutorId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search members to add as tutors..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectTutor(member.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.profilePicture} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                        {formData.tutors.includes(member.id) ? (
                          <X className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/events")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
