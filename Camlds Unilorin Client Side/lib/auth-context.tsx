"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// Define user type
type User = {
  id: string
  name: string
  email: string
  profilePicture?: string
  role: "user" | "admin"
  position?: "Team Lead" | "Technical Lead" | "Public Relations Officer" | null
  coreTeamRole?: "Technical Team Member" | "Publicity Team Member" | "Volunteer" | null
  socialMedia?: {
    twitter?: string
    linkedin?: string
    github?: string
    whatsapp?: string
  }
  registeredEvents?: string[]
  registrationDates?: Record<string, string>
  appliedForCoreTeam?: boolean
  approvedForCoreTeam?: boolean
  rejectedForCoreTeam?: boolean
  achievements?: string[]
  application?: {
    aboutYourself: string
    skillSet: string
    whyJoin: string
    otherCommunities: string
    impactPlans: string
    preferredRole: "Technical Team Member" | "Publicity Team Member" | "Volunteer"
    date: string
  }
  joinDate?: string
  showRejectionAlert?: boolean
  showApprovalAlert?: boolean
  bio?: string
  applicationsOpen?: boolean
}

// Define application type
type CoreTeamApplication = {
  aboutYourself: string
  skillSet: string
  whyJoin: string
  otherCommunities: string
  impactPlans: string
  preferredRole: "Technical Team Member" | "Publicity Team Member" | "Volunteer"
}

// Define auth context type
type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  googleLogin: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  isAdmin: boolean
  hasAdminPrivileges: boolean
  applyForCoreTeam: (application: CoreTeamApplication) => Promise<void>
  approveCoreTeamMember: (userId: string, role?: string) => Promise<void>
  rejectCoreTeamMember: (userId: string) => Promise<void>
  updateCoreTeamMemberRole: (userId: string, role: string) => Promise<void>
  getAllApplications: () => any[]
  dismissRejectionAlert: () => void
  dismissApprovalAlert: () => void
  canEditPost: (postAuthorId: string) => boolean
  canEditAdministration: () => boolean
  applicationsOpen: boolean
  toggleApplicationStatus: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Sample users for demo
const DEMO_USERS: User[] = [
  {
    id: "1",
    name: "Makinde Kehinde",
    email: "kehinde.makinde07@gmail.com",
    profilePicture: "/placeholder.svg?height=200&width=200",
    role: "admin",
    position: "Team Lead",
    socialMedia: {
      twitter: "adminuser",
      github: "adminuser",
      whatsapp: "+2348012345678",
      linkedin: "adminuser",
    },
    registeredEvents: ["3"],
    registrationDates: { "3": "2025-03-01" },
    achievements: [
      "Led the community to 200+ active members",
      "Organized 15+ successful tech events",
      "Established partnerships with 5 tech companies",
    ],
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@camlds.com",
    profilePicture: "/placeholder.svg?height=200&width=200",
    role: "user",
    socialMedia: {
      twitter: "regularuser",
      github: "regularuser",
    },
    registeredEvents: ["1", "3"],
    registrationDates: { "1": "2025-03-05", "3": "2025-03-10" },
  },
  {
    id: "3",
    name: "Technical Lead",
    email: "tech@camlds.com",
    profilePicture: "/placeholder.svg?height=200&width=200",
    role: "admin",
    position: "Technical Lead",
    socialMedia: {
      twitter: "techlead",
      github: "techlead",
    },
    achievements: [
      "Coordinated community outreach programs",
      "Managed the mentorship program",
      "Represented CAMLDS at 3 national conferences",
    ],
  },
  {
    id: "4",
    name: "PR Officer",
    email: "pr@camlds.com",
    profilePicture: "/placeholder.svg?height=200&width=200",
    role: "admin",
    position: "Public Relations Officer",
    socialMedia: {
      twitter: "profficer",
      github: "profficer",
    },
    achievements: [
      "Maintained detailed records of all community activities",
      "Improved communication processes",
      "Developed the community newsletter",
    ],
  },
]

// Global audio element for login sound
let loginAudio: HTMLAudioElement | null = null

// Function to play login notification sound
const playLoginSound = () => {
  try {
    // Create audio element if it doesn't exist
    if (!loginAudio) {
      loginAudio = new Audio()

      // Use a simple beep sound instead of trying to load an external file
      loginAudio.src = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAAA"
    }

    // Reset the audio to the beginning
    loginAudio.currentTime = 0

    // Play the sound with user interaction context
    const playPromise = loginAudio.play()

    // Handle play promise
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Audio playback was prevented by the browser:", error)
        // Most likely due to browser autoplay policy - we'll just continue silently
      })
    }
  } catch (error) {
    console.error("Error playing login sound:", error)
    // Continue silently if sound fails - this is not critical functionality
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>(DEMO_USERS)
  const [applicationsOpen, setApplicationsOpen] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check for saved user on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("camlds_user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }

      // Load all users from localStorage if available
      const savedAllUsers = localStorage.getItem("camlds_all_users")
      if (savedAllUsers) {
        setAllUsers(JSON.parse(savedAllUsers))
      } else {
        // Initialize with demo users
        localStorage.setItem("camlds_all_users", JSON.stringify(DEMO_USERS))
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }, [])

  // Save all users to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("camlds_all_users", JSON.stringify(allUsers))
    } catch (error) {
      console.error("Error saving user data:", error)
    }
  }, [allUsers])

  // Add this useEffect to load the application status
  useEffect(() => {
    try {
      const savedApplicationStatus = localStorage.getItem("camlds_applications_open")
      if (savedApplicationStatus) {
        setApplicationsOpen(JSON.parse(savedApplicationStatus))
      }
    } catch (error) {
      console.error("Error loading application status:", error)
    }
  }, [])

  // Add this function to toggle application status
  const toggleApplicationStatus = async () => {
    try {
      const newStatus = !applicationsOpen
      setApplicationsOpen(newStatus)
      localStorage.setItem("camlds_applications_open", JSON.stringify(newStatus))

      toast({
        title: newStatus ? "Applications Opened" : "Applications Closed",
        description: newStatus
          ? "Community members can now apply to join the core team"
          : "Applications for the core team are now closed",
      })

      return Promise.resolve()
    } catch (error) {
      console.error("Error toggling application status:", error)
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
      return Promise.reject(error)
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      const foundUser = allUsers.find((u) => u.email === email)

      if (foundUser && password === "Ayanfeoluwa07") {
        // Simple password check for demo
        setUser(foundUser)
        localStorage.setItem("camlds_user", JSON.stringify(foundUser))

        // Get the last name and first name
        const nameParts = foundUser.name.split(" ")
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""
        const firstName = nameParts.length > 0 ? nameParts[0] : ""

        // Play login notification sound
        playLoginSound()

        toast({
          title: "Login successful",
          description: `Welcome ${lastName} ${firstName}!`,
        })
        router.push("/")
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      })
    }
  }

  // Google login function (simulated)
  const googleLogin = async () => {
    try {
      // In a real app, this would use a Google OAuth provider
      // For demo, we'll just log in as the regular user
      const regularUser = allUsers.find((u) => u.email === "user@camlds.com")

      if (regularUser) {
        setUser(regularUser)
        localStorage.setItem("camlds_user", JSON.stringify(regularUser))

        // Play login notification sound
        playLoginSound()

        toast({
          title: "Google login successful",
          description: `Welcome, ${regularUser.name}!`,
        })
        router.push("/")
      }
    } catch (error) {
      console.error("Google login error:", error)
      toast({
        title: "Login failed",
        description: "An error occurred during Google login",
        variant: "destructive",
      })
    }
  }

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      const newUser: User = {
        id: `${allUsers.length + 1}`,
        name,
        email,
        role: "user",
        profilePicture: "/placeholder.svg?height=200&width=200", // Default profile picture
        registeredEvents: [],
        registrationDates: {},
        socialMedia: {},
        achievements: [],
        joinDate: new Date().toISOString().split("T")[0], // Add join date for community listing
      }

      setUser(newUser)
      setAllUsers((prev) => [...prev, newUser])
      localStorage.setItem("camlds_user", JSON.stringify(newUser))

      // Update community members list
      try {
        const communityMembers = localStorage.getItem("camlds_community_members")
        const members = communityMembers ? JSON.parse(communityMembers) : []
        members.push(newUser)
        localStorage.setItem("camlds_community_members", JSON.stringify(members))
      } catch (error) {
        console.error("Error updating community members:", error)
      }

      // Get the last name and first name
      const nameParts = name.split(" ")
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""
      const firstName = nameParts.length > 0 ? nameParts[0] : ""

      // Play login notification sound
      playLoginSound()

      toast({
        title: "Signup successful",
        description: `Welcome ${lastName} ${firstName}!`,
      })
      router.push("/")
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Signup failed",
        description: "An error occurred during signup",
        variant: "destructive",
      })
    }
  }

  // Logout function
  const logout = () => {
    try {
      setUser(null)
      localStorage.removeItem("camlds_user")
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      })
    }
  }

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) return

      const updatedUser = { ...user, ...data }
      setUser(updatedUser)

      // Also update in allUsers
      setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)))

      localStorage.setItem("camlds_user", JSON.stringify(updatedUser))

      // If achievements were updated and user is in administration, update there too
      if (data.achievements) {
        try {
          const storedAdmins = localStorage.getItem("camlds_administrations")
          if (storedAdmins) {
            const administrations = JSON.parse(storedAdmins)

            // Update in all years where this member exists
            Object.keys(administrations).forEach((year) => {
              // Check executive team
              if (administrations[year].executive && administrations[year].executive.members) {
                administrations[year].executive.members = administrations[year].executive.members.map((member: any) => {
                  if (member.id === user.id) {
                    return { ...member, achievements: data.achievements }
                  }
                  return member
                })
              }

              // Check core team
              if (administrations[year].core && administrations[year].core.members) {
                administrations[year].core.members = administrations[year].core.members.map((member: any) => {
                  if (member.id === user.id) {
                    return { ...member, achievements: data.achievements }
                  }
                  return member
                })
              }
            })

            localStorage.setItem("camlds_administrations", JSON.stringify(administrations))
          }
        } catch (error) {
          console.error("Error updating achievements in administrations:", error)
        }
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      })
    }
  }

  // Apply for core team
  const applyForCoreTeam = async (application: CoreTeamApplication) => {
    try {
      if (!user) return

      const updatedUser = {
        ...user,
        appliedForCoreTeam: true,
        application: {
          ...application,
          date: new Date().toISOString().split("T")[0],
        },
      }
      setUser(updatedUser)

      // Also update in allUsers
      setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)))

      localStorage.setItem("camlds_user", JSON.stringify(updatedUser))

      toast({
        title: "Application submitted",
        description: "Your application to join the core team has been submitted.",
      })
    } catch (error) {
      console.error("Core team application error:", error)
      toast({
        title: "Application failed",
        description: "An error occurred while submitting your application",
        variant: "destructive",
      })
    }
  }

  // Approve core team member
  const approveCoreTeamMember = async (userId: string, role?: string) => {
    try {
      // Update in allUsers
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                approvedForCoreTeam: true,
                appliedForCoreTeam: false,
                rejectedForCoreTeam: false,
                coreTeamRole: role || u.application?.preferredRole || "Volunteer", // Assign preferred role or default to Volunteer
                showApprovalAlert: true,
              }
            : u,
        ),
      )

      // If the approved user is the current user, update current user state
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          approvedForCoreTeam: true,
          appliedForCoreTeam: false,
          rejectedForCoreTeam: false,
          coreTeamRole: role || user.application?.preferredRole || "Volunteer",
          showApprovalAlert: true,
        }
        setUser(updatedUser)
        localStorage.setItem("camlds_user", JSON.stringify(updatedUser))

        // Show approval notification
        toast({
          title: "Application Approved",
          description: "You've been approved to join the core team",
        })
      }

      // Add to core team in administration data
      try {
        const storedAdmins = localStorage.getItem("camlds_administrations")
        if (storedAdmins) {
          const administrations = JSON.parse(storedAdmins)
          const currentYear = Object.keys(administrations).sort().reverse()[0]

          if (currentYear && administrations[currentYear]) {
            const approvedUser = allUsers.find((u) => u.id === userId)
            if (approvedUser) {
              const newCoreMember = {
                id: approvedUser.id,
                name: approvedUser.name,
                position: role || approvedUser.application?.preferredRole || "Volunteer",
                profilePicture: approvedUser.profilePicture || "/placeholder.svg?height=200&width=200",
                achievements: [],
              }

              administrations[currentYear].core.members.push(newCoreMember)
              localStorage.setItem("camlds_administrations", JSON.stringify(administrations))
            }
          }
        }
      } catch (error) {
        console.error("Error updating administration data:", error)
      }
    } catch (error) {
      console.error("Approve core team member error:", error)
      toast({
        title: "Approval failed",
        description: "An error occurred while approving the core team member",
        variant: "destructive",
      })
    }
  }

  // Reject core team member
  const rejectCoreTeamMember = async (userId: string) => {
    try {
      // Update in allUsers
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                rejectedForCoreTeam: true,
                appliedForCoreTeam: false,
                approvedForCoreTeam: false,
                showRejectionAlert: true,
              }
            : u,
        ),
      )

      // If the rejected user is the current user, update current user state
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          rejectedForCoreTeam: true,
          appliedForCoreTeam: false,
          approvedForCoreTeam: false,
          showRejectionAlert: true,
        }
        setUser(updatedUser)
        localStorage.setItem("camlds_user", JSON.stringify(updatedUser))

        // Show rejection notification
        toast({
          title: "Application Rejected",
          description: "You've been rejected to join the core team",
        })
      }
    } catch (error) {
      console.error("Reject core team member error:", error)
      toast({
        title: "Rejection failed",
        description: "An error occurred while rejecting the core team member",
        variant: "destructive",
      })
    }
  }

  // Update core team member role
  const updateCoreTeamMemberRole = async (userId: string, role: string) => {
    try {
      // Update in allUsers
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                coreTeamRole: role as "Technical Team Member" | "Publicity Team Member" | "Volunteer",
              }
            : u,
        ),
      )

      // If the updated user is the current user, update current user state
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          coreTeamRole: role as "Technical Team Member" | "Publicity Team Member" | "Volunteer",
        }
        setUser(updatedUser)
        localStorage.setItem("camlds_user", JSON.stringify(updatedUser))

        toast({
          title: "Role Updated",
          description: `Your role has been updated to ${role}`,
        })
      }

      // Update in administration data
      try {
        const storedAdmins = localStorage.getItem("camlds_administrations")
        if (storedAdmins) {
          const administrations = JSON.parse(storedAdmins)

          // Update in all years where this member exists
          Object.keys(administrations).forEach((year) => {
            if (administrations[year].core && administrations[year].core.members) {
              administrations[year].core.members = administrations[year].core.members.map((member: any) => {
                if (member.id === userId) {
                  return { ...member, position: role }
                }
                return member
              })
            }
          })

          localStorage.setItem("camlds_administrations", JSON.stringify(administrations))
        }
      } catch (error) {
        console.error("Error updating role in administrations:", error)
      }
    } catch (error) {
      console.error("Update core team member role error:", error)
      toast({
        title: "Role update failed",
        description: "An error occurred while updating the core team member role",
        variant: "destructive",
      })
    }
  }

  // Get all applications
  const getAllApplications = () => {
    try {
      return allUsers.filter((u) => u.appliedForCoreTeam && u.application)
    } catch (error) {
      console.error("Get all applications error:", error)
      return []
    }
  }

  // Dismiss rejection alert
  const dismissRejectionAlert = () => {
    try {
      if (user && user.showRejectionAlert) {
        const updatedUser = { ...user, showRejectionAlert: false }
        setUser(updatedUser)
        localStorage.setItem("camlds_user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Dismiss rejection alert error:", error)
    }
  }

  // Dismiss approval alert
  const dismissApprovalAlert = () => {
    try {
      if (user && user.showApprovalAlert) {
        const updatedUser = { ...user, showApprovalAlert: false }
        setUser(updatedUser)
        localStorage.setItem("camlds_user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Dismiss approval alert error:", error)
    }
  }

  // Check if user has admin privileges (admin, team lead, technical lead, PR officer)
  const hasAdminPrivileges =
    user?.role === "admin" ||
    user?.position === "Team Lead" ||
    user?.position === "Technical Lead" ||
    user?.position === "Public Relations Officer"

  // Add a new function to check if user can edit posts
  const canEditPost = (postAuthorId: string) => {
    try {
      if (!user) return false

      // Team Lead can edit any post
      if (user.position === "Team Lead") return true

      // Technical Lead and PR Officer can edit any post
      if (user.position === "Technical Lead" || user.position === "Public Relations Officer") return true

      // Admin can edit any post
      if (user.role === "admin") return true

      // Otherwise, users can only edit their own posts
      return user.id === postAuthorId
    } catch (error) {
      console.error("Can edit post error:", error)
      return false
    }
  }

  // Add a new function to check if user can edit administration
  const canEditAdministration = () => {
    try {
      if (!user) return false

      // Team Lead and Technical Lead can edit administration
      return user.position === "Team Lead" || user.position === "Technical Lead"
    } catch (error) {
      console.error("Can edit administration error:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin,
        signup,
        logout,
        updateProfile,
        isAdmin: user?.role === "admin",
        hasAdminPrivileges,
        applyForCoreTeam,
        approveCoreTeamMember,
        rejectCoreTeamMember,
        updateCoreTeamMemberRole,
        getAllApplications,
        dismissRejectionAlert,
        dismissApprovalAlert,
        canEditPost,
        canEditAdministration,
        applicationsOpen,
        toggleApplicationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
