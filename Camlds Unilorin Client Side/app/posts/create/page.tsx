"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { X, Upload, Calendar, FileText } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Switch } from "@/components/ui/switch"

export default function CreatePostPage() {
  const { user, hasAdminPrivileges } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    content: "",
    scheduledDate: null as Date | null,
  })

  const [media, setMedia] = useState<string[]>([])
  const [isScheduled, setIsScheduled] = useState(false)
  const [date, setDate] = useState<Date | null>(null)

  if (!user || (!user.role === "admin" && !user.position)) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">You need admin privileges to create posts.</p>
              <Button className="mt-4" onClick={() => router.push("/posts")}>
                Back to Posts
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

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // In a real app, you would upload these to a storage service
    // For demo purposes, we'll use placeholders
    const newMedia = Array.from(files).map(() => "/placeholder.svg?height=400&width=600")
    setMedia([...media, ...newMedia])
  }

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate form
    if (!formData.title || !formData.shortDescription || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (isScheduled && !date) {
      toast({
        title: "Error",
        description: "Please select a scheduled date",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Get existing posts from localStorage
    const existingPosts = localStorage.getItem("camlds_posts")
    const posts = existingPosts ? JSON.parse(existingPosts) : []

    // Create new post object
    const newPost = {
      id: `${Date.now()}`, // Generate a unique ID
      title: formData.title,
      shortDescription: formData.shortDescription,
      content: formData.content,
      author: {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture || "/placeholder.svg?height=200&width=200",
      },
      date: isScheduled ? format(date!, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      scheduledDate: isScheduled ? date!.toISOString() : null,
      isPublished: !isScheduled,
      likes: 0,
      comments: [],
      media: media.length > 0 ? media : ["/placeholder.svg?height=400&width=600"],
    }

    // Add new post to posts array
    const updatedPosts = [...posts, newPost]

    // Save to localStorage
    localStorage.setItem("camlds_posts", JSON.stringify(updatedPosts))

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("postCreated"))

    toast({
      title: isScheduled ? "Post scheduled" : "Post created",
      description: isScheduled
        ? `Your post has been scheduled for ${format(date!, "MMMM dd, yyyy")}`
        : "Your post has been created successfully",
    })

    setIsLoading(false)
    router.push("/posts")
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Create New Post</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>Create a new post to share with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title *</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Textarea
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                rows={2}
                required
                placeholder="A brief summary that will be shown in the post card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Full Content *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={8}
                required
                placeholder="The complete content that will be shown when 'Read More' is clicked"
              />
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                {media.map((src, index) => (
                  <div key={index} className="relative aspect-video bg-muted rounded-md overflow-hidden">
                    <img
                      src={src || "/placeholder.svg"}
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveMedia(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-video bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors">
                  <Upload className="h-6 w-6 mb-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleMediaUpload} />
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Switch id="schedule" checked={isScheduled} onCheckedChange={setIsScheduled} />
              <Label htmlFor="schedule">Schedule this post</Label>
            </div>

            {isScheduled && (
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/posts")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : isScheduled ? "Schedule Post" : "Create Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
