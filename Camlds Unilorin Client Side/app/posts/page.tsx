"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, MessageSquare, ThumbsUp, Calendar, Send, FileText, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Navbar from "@/components/navbar"

// Sample posts data
const INITIAL_POSTS_DATA = [
  {
    id: "1",
    title: "Introduction to Data Science",
    shortDescription: "Learn the basics of data science and its applications.",
    content:
      "Data science is an interdisciplinary field that uses scientific methods, processes, algorithms and systems to extract knowledge and insights from structured and unstructured data. Learn how to get started with data science in this comprehensive guide.",
    author: {
      id: "1",
      name: "Makinde Kehinde",
      profilePicture: "/placeholder.svg?height=200&width=200",
    },
    date: "2025-03-15",
    likes: 24,
    userLikes: ["1", "2", "3"],
    comments: [
      {
        id: "c1",
        author: {
          id: "2",
          name: "Victor",
          profilePicture: "/placeholder.svg?height=200&width=200",
        },
        content: "This is really helpful! Looking forward to more content like this.",
        date: "2025-03-16",
      },
      {
        id: "c2",
        author: {
          id: "3",
          name: "Hari Seldon",
          profilePicture: "/placeholder.svg?height=200&width=200",
        },
        content: "Great introduction to the topic. I would also recommend checking out some online courses.",
        date: "2025-03-17",
      },
    ],
    media: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
    isPublished: true,
  },
  {
    id: "2",
    title: "Web Development Trends in 2025",
    shortDescription: "Stay updated with the latest web development trends.",
    content:
      "The web development landscape is constantly evolving. Stay updated with the latest trends and technologies that are shaping the future of web development in 2025 and beyond.",
    author: {
      id: "1",
      name: "Makinde Kehinde",
      profilePicture: "/placeholder.svg?height=200&width=200",
    },
    date: "2025-03-10",
    likes: 18,
    userLikes: ["3", "4"],
    comments: [],
    media: ["/placeholder.svg?height=400&width=600"],
    isPublished: true,
  },
  {
    id: "3",
    title: "Getting Started with Artificial Intelligence",
    shortDescription: "A beginner-friendly introduction to AI concepts.",
    content:
      "Artificial Intelligence is revolutionizing industries across the globe. This post provides a beginner-friendly introduction to AI concepts and practical applications.",
    author: {
      id: "1",
      name: "Ogundele Victor",
      profilePicture: "/placeholder.svg?height=200&width=200",
    },
    date: "2025-03-05",
    likes: 32,
    userLikes: ["1", "2", "4"],
    comments: [
      {
        id: "c3",
        author: {
          id: "4",
          name: "PR Officer",
          profilePicture: "/placeholder.svg?height=200&width=200",
        },
        content: "AI is definitely the future. Great overview!",
        date: "2025-03-06",
      },
    ],
    media: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    isPublished: true,
  },
]

// Get posts from localStorage or use initial data
const getStoredPosts = () => {
  if (typeof window !== "undefined") {
    const storedPosts = localStorage.getItem("camlds_posts")
    return storedPosts ? JSON.parse(storedPosts) : INITIAL_POSTS_DATA
  }
  return INITIAL_POSTS_DATA
}

// Update the PostsPage component to include auto-sliding and comments
export default function PostsPage() {
  const router = useRouter()
  const { user, hasAdminPrivileges, canEditPost } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<any[]>([])
  const [activeSlides, setActiveSlides] = useState<Record<string, number>>({})
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [commentText, setCommentText] = useState("")
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Load posts and check for scheduled posts
  useEffect(() => {
    const loadPosts = () => {
      const allPosts = getStoredPosts()

      // Check for scheduled posts that should now be published
      const now = new Date()
      const updatedPosts = allPosts.map((post) => {
        if (post.scheduledDate && !post.isPublished) {
          const scheduledDate = new Date(post.scheduledDate)
          if (scheduledDate <= now) {
            return { ...post, isPublished: true }
          }
        }
        return post
      })

      // Save updated posts if any scheduled posts were published
      if (JSON.stringify(updatedPosts) !== JSON.stringify(allPosts)) {
        localStorage.setItem("camlds_posts", JSON.stringify(updatedPosts))
      }

      // Filter to only show published posts
      setPosts(updatedPosts.filter((post) => post.isPublished))
    }

    loadPosts()

    // Add event listener for storage changes
    window.addEventListener("storage", loadPosts)

    // Custom event for post creation
    const handlePostCreated = () => loadPosts()
    window.addEventListener("postCreated", handlePostCreated)

    return () => {
      window.removeEventListener("storage", loadPosts)
      window.removeEventListener("postCreated", handlePostCreated)
    }
  }, [])

  useEffect(() => {
    // Sort posts by date (newest first)
    setPosts((prevPosts) => [...prevPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }, [])

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      posts.forEach((post) => {
        if (post.media.length > 1) {
          const currentSlide = activeSlides[post.id] || 0
          const nextSlide = (currentSlide + 1) % post.media.length
          setActiveSlides((prev) => ({
            ...prev,
            [post.id]: nextSlide,
          }))
        }
      })
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [posts, activeSlides])

  const handleLike = (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      })
      return
    }

    // Get all posts
    const allPosts = getStoredPosts()

    // Find the post
    const postIndex = allPosts.findIndex((post: any) => post.id === postId)
    if (postIndex === -1) return

    // Check if user has already liked this post
    const post = allPosts[postIndex]
    const userLikes = post.userLikes || []
    const hasLiked = userLikes.includes(user.id)

    // Toggle like
    if (hasLiked) {
      // Unlike
      allPosts[postIndex].userLikes = userLikes.filter((id: string) => id !== user.id)
      allPosts[postIndex].likes = Math.max(0, (post.likes || 0) - 1)

      // Update state
      setPosts(
        posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              userLikes: userLikes.filter((id: string) => id !== user.id),
              likes: Math.max(0, (p.likes || 0) - 1),
            }
          }
          return p
        }),
      )

      toast({
        title: "Post unliked",
        description: "You unliked this post",
      })
    } else {
      // Like
      allPosts[postIndex].userLikes = [...userLikes, user.id]
      allPosts[postIndex].likes = (post.likes || 0) + 1

      // Update state
      setPosts(
        posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              userLikes: [...(p.userLikes || []), user.id],
              likes: (p.likes || 0) + 1,
            }
          }
          return p
        }),
      )

      toast({
        title: "Post liked",
        description: "You liked this post",
      })
    }

    // Save to localStorage
    localStorage.setItem("camlds_posts", JSON.stringify(allPosts))
  }

  const handleComment = (postId: string) => {
    setSelectedPost(posts.find((post) => post.id === postId))

    // Focus the comment input after the dialog is open
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus()
      }
    }, 100)
  }

  const handleSubmitComment = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive",
      })
      return
    }

    if (!commentText.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    const newComment = {
      id: `c${Date.now()}`,
      author: {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture || "/placeholder.svg?height=200&width=200",
      },
      content: commentText,
      date: new Date().toISOString().split("T")[0],
    }

    // Update posts state
    const updatedPosts = posts.map((post) => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: [...post.comments, newComment],
        }
      }
      return post
    })

    setPosts(updatedPosts)

    // Update in localStorage
    const allPosts = getStoredPosts()
    const updatedAllPosts = allPosts.map((post: any) => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: [...post.comments, newComment],
        }
      }
      return post
    })
    localStorage.setItem("camlds_posts", JSON.stringify(updatedAllPosts))

    // Update selected post
    setSelectedPost({
      ...selectedPost,
      comments: [...selectedPost.comments, newComment],
    })

    // Clear comment input
    setCommentText("")

    toast({
      title: "Comment added",
      description: "Your comment has been added",
    })
  }

  const handleEditPost = (postId: string) => {
    router.push(`/posts/edit/${postId}`)
  }

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePost = () => {
    if (!postToDelete) return

    const allPosts = getStoredPosts()
    const updatedPosts = allPosts.filter((post: any) => post.id !== postToDelete)
    localStorage.setItem("camlds_posts", JSON.stringify(updatedPosts))

    // Update state
    setPosts(posts.filter((post) => post.id !== postToDelete))

    toast({
      title: "Post deleted",
      description: "The post has been deleted successfully",
    })

    setPostToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Posts</h1>
          {hasAdminPrivileges && (
            <Link href="/posts/create" className="ml-auto">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Post
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.01]">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={post.author.profilePicture} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <span>{post.author.name}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{post.date}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{post.shortDescription}</p>

                {post.media.length > 0 && (
                  <div className="relative overflow-hidden rounded-md">
                    <div className="relative aspect-video">
                      <Image
                        src={post.media[activeSlides[post.id] || 0]}
                        alt={`Image for ${post.title}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {post.media.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        {post.media.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full ${
                              (activeSlides[post.id] || 0) === index ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center ${post.userLikes?.includes(user?.id) ? "text-primary" : ""}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    <span>{post.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                    onClick={() => handleComment(post.id)}
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    <span>{post.comments.length}</span>
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {canEditPost(post.author.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePost(post.id)
                      }}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleComment(post.id)}>
                    Read More
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Comments Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto my-4">
            <DialogHeader>
              <DialogTitle>{selectedPost?.title}</DialogTitle>
              <DialogDescription>
                Posted by {selectedPost?.author.name} on {selectedPost?.date}
              </DialogDescription>
            </DialogHeader>

            {selectedPost && (
              <div className="space-y-6">
                <p className="text-sm">{selectedPost.content}</p>

                {selectedPost.media.length > 0 && (
                  <div className="relative overflow-hidden rounded-md">
                    <div className="relative aspect-video">
                      <Image
                        src={selectedPost.media[activeSlides[selectedPost.id] || 0]}
                        alt={`Image for ${selectedPost.title}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {selectedPost.media.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        {selectedPost.media.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full ${
                              (activeSlides[selectedPost.id] || 0) === index ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Comments ({selectedPost.comments.length})</h3>

                  <div className="space-y-4 max-h-[200px] overflow-y-auto">
                    {selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((comment: any) => (
                        <div key={comment.id} className="flex gap-3 p-3 border rounded-md">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.profilePicture} alt={comment.author.name} />
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-sm font-medium">{comment.author.name}</p>
                              <p className="text-xs text-muted-foreground">{comment.date}</p>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>

                  {user ? (
                    <div className="flex gap-2">
                      <Textarea
                        ref={commentInputRef}
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="icon" onClick={handleSubmitComment} disabled={!commentText.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Please{" "}
                      <Link href="/login" className="text-primary hover:underline">
                        log in
                      </Link>{" "}
                      to comment
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="max-h-[90vh] overflow-y-auto my-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeletePost} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
