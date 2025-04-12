"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle, Users, Github, Linkedin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// X.com logo component
const XLogo = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Update the MEMBERS_DATA array to include bio information
const MEMBERS_DATA = [
  {
    id: "1",
    name: "Makinde Kehinde",
    email: "kehinde.makinde07@gmail.com",
    role: "admin",
    position: "Team Lead",
    profilePicture: "/placeholder.svg?height=200&width=200",
    joinDate: "2024-01-15",
    bio: "Team Lead at CAMLDS Unilorin with a passion for machine learning and community building.",
    socialMedia: {
      twitter: "adminuser",
      github: "adminuser",
      whatsapp: "+2348012345678",
      linkedin: "makindekehinde",
    },
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@camlds.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
    joinDate: "2024-02-20",
    bio: "Enthusiastic community member interested in data science and AI applications.",
    socialMedia: {
      twitter: "regularuser",
      github: "regularuser",
    },
  },
  {
    id: "3",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
    joinDate: "2024-02-25",
    bio: "Frontend developer specializing in React and UI/UX design.",
    socialMedia: {
      twitter: "alicejohnson",
      linkedin: "alice-johnson",
    },
  },
  {
    id: "4",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
    joinDate: "2024-03-01",
    bio: "Backend developer with expertise in Node.js and database management.",
    socialMedia: {
      github: "bobsmith",
      linkedin: "bob-smith",
    },
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
    joinDate: "2024-03-05",
    bio: "Data scientist passionate about machine learning and statistical analysis.",
    socialMedia: {
      twitter: "charliebrown",
      whatsapp: "+2348087654321",
    },
  },
  {
    id: "6",
    name: "Diana Prince",
    email: "diana@example.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
    joinDate: "2024-03-10",
    bio: "DevOps engineer with a focus on cloud infrastructure and automation.",
  },
  {
    id: "7",
    name: "Ethan Hunt",
    email: "ethan@example.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
    joinDate: "2024-03-15",
    bio: "Mobile app developer specializing in cross-platform solutions.",
  },
  {
    id: "8",
    name: "Fiona Gallagher",
    email: "fiona@example.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
    joinDate: "2024-03-20",
    bio: "UI/UX designer with a passion for creating intuitive user experiences.",
  },
]

// Get community members from localStorage or use default data
const getStoredMembers = () => {
  if (typeof window !== "undefined") {
    const storedMembers = localStorage.getItem("camlds_community_members")
    return storedMembers ? JSON.parse(storedMembers) : MEMBERS_DATA
  }
  return MEMBERS_DATA
}

export default function CommunityPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [members, setMembers] = useState(getStoredMembers())

  // Load members and listen for changes
  useEffect(() => {
    const loadMembers = () => {
      setMembers(getStoredMembers())
    }

    // Initialize localStorage with default data if not already set
    if (typeof window !== "undefined" && !localStorage.getItem("camlds_community_members")) {
      localStorage.setItem("camlds_community_members", JSON.stringify(MEMBERS_DATA))
    }

    // Add event listener for storage changes
    window.addEventListener("storage", loadMembers)

    return () => {
      window.removeEventListener("storage", loadMembers)
    }
  }, [])

  const totalMembers = members.length

  // Sort members alphabetically by name
  const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name))

  // Filter members based on search query
  const filteredMembers = sortedMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <Navbar />
      <div className="container py-10 min-h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Community Members</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">{totalMembers} strong members and counting ✊</p>

        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={member.profilePicture} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{member.email}</p>
                  <div className="flex items-center justify-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {member.position || (member.role === "admin" ? "Admin" : "Member")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Member Details Dialog */}
        <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto my-4 animate-dialog-open">
            <DialogHeader>
              <DialogTitle>Member Profile</DialogTitle>
              <DialogDescription>View {selectedMember?.name}'s profile and social media</DialogDescription>
            </DialogHeader>

            {selectedMember && (
              <div className="flex flex-col items-center py-4">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={selectedMember.profilePicture} alt={selectedMember.name} />
                  <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{selectedMember.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                <p className="text-sm text-muted-foreground capitalize mt-1">
                  {selectedMember.position || (selectedMember.role === "admin" ? "Admin" : "Member")}
                </p>

                {/* Add bio display */}
                {selectedMember.bio && (
                  <div className="mt-4 text-center">
                    <p className="text-sm">{selectedMember.bio}</p>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  {selectedMember.socialMedia?.twitter && (
                    <a
                      href={`https://twitter.com/${selectedMember.socialMedia.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-primary/10 text-black dark:text-primary hover:bg-primary/20 transition-colors"
                      title="Twitter"
                    >
                      <XLogo size={24} />
                    </a>
                  )}

                  {selectedMember.socialMedia?.github && (
                    <a
                      href={`https://github.com/${selectedMember.socialMedia.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-primary/10 text-black dark:text-primary hover:bg-primary/20 transition-colors"
                      title="GitHub"
                    >
                      <Github size={24} />
                    </a>
                  )}

                  {selectedMember.socialMedia?.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedMember.socialMedia.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-primary/10 text-black dark:text-primary hover:bg-primary/20 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={24} />
                    </a>
                  )}

                  {selectedMember.socialMedia?.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${selectedMember.socialMedia.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-primary/10 text-black dark:text-primary hover:bg-primary/20 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin size={24} />
                    </a>
                  )}
                </div>

                {(!selectedMember.socialMedia || Object.keys(selectedMember.socialMedia).length === 0) && (
                  <p className="text-sm text-muted-foreground mt-6">No social media profiles available</p>
                )}
              </div>
            )}

            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  )
}
