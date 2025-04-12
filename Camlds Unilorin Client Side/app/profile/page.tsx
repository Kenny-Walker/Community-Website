"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, User, Plus, Github, Linkedin } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
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

// Update the RejectionAlert component
const RejectionAlert = ({ onDismiss }: { onDismiss: () => void }) => {
  const [isRed, setIsRed] = useState(true)
  const [isDismissing, setIsDismissing] = useState(false)
  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRed((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setIsDismissing(true)
    setTimeout(onDismiss, 2500)
  }

  return (
    <div
      ref={alertRef}
      className={`fixed inset-0 flex items-center justify-center z-50 ${isDismissing ? "alert-dismissing" : ""}`}
    >
      <div className="max-w-md w-full">
        <Alert
          className={`transition-colors duration-500 ${isRed ? "bg-red-500 text-white" : "bg-white text-black"} ${
            isDismissing ? "animate-dialog-close" : "animate-dialog-open"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Application Denied</AlertTitle>
          <AlertDescription>Your application to the core team has been denied.</AlertDescription>
          <div className="w-full flex justify-center mt-2">
            <Button variant="outline" size="sm" onClick={handleDismiss} className="mx-auto">
              Dismiss
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  )
}

// Update the ApprovalAlert component to use theme-aware colors
const ApprovalAlert = ({ onDismiss }: { onDismiss: () => void }) => {
  const [isDismissing, setIsDismissing] = useState(false)
  const alertRef = useRef<HTMLDivElement>(null)

  const handleDismiss = () => {
    setIsDismissing(true)
    setTimeout(onDismiss, 500)
  }

  return (
    <div
      ref={alertRef}
      className={`fixed inset-0 flex items-center justify-center z-50 ${isDismissing ? "alert-dismissing" : ""}`}
    >
      <div className="max-w-md w-full">
        <Alert className="bg-background border border-primary">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle className="text-foreground">Application Approved</AlertTitle>
          <AlertDescription className="text-foreground">
            Your application to the core team has been approved. Welcome to the core team!
          </AlertDescription>
          <div className="w-full flex justify-center mt-2">
            <Button variant="outline" size="sm" onClick={handleDismiss} className="mx-auto">
              Dismiss
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  )
}

// Update the component to check if applications are open
export default function ProfilePage() {
  const { user, updateProfile, applyForCoreTeam, dismissRejectionAlert, dismissApprovalAlert, applicationsOpen } =
    useAuth()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const placeholder = "/placeholder.svg?height=200&width=200"
  const height = 200
  const width = 200
  const [profilePicture, setProfilePicture] = useState<string | undefined>(placeholder)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [achievements, setAchievements] = useState<string[]>([])
  const [newAchievement, setNewAchievement] = useState("")

  // Social media handles
  const [twitter, setTwitter] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [github, setGithub] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  // Application form fields
  const [applicationData, setApplicationData] = useState({
    aboutYourself: "",
    skillSet: "",
    whyJoin: "",
    otherCommunities: "",
    impactPlans: "",
    preferredRole: "Technical Team Member" as "Technical Team Member" | "Publicity Team Member" | "Volunteer",
  })

  // Add this effect to load events
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEvents = localStorage.getItem("camlds_events")
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents))
      }
    }
  }, [])

  // Update state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setBio(user.bio || "")
      setProfilePicture(user.profilePicture || placeholder)
      setAchievements(user.achievements || [])
      setTwitter(user.socialMedia?.twitter || "")
      setLinkedin(user.socialMedia?.linkedin || "")
      setGithub(user.socialMedia?.github || "")
      setWhatsapp(user.socialMedia?.whatsapp || "")
    }
  }, [user])

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container py-10 min-h-[calc(100vh-8rem)]">
          <h1 className="text-2xl font-bold">Please log in to view your profile</h1>
        </div>
        <Footer />
      </>
    )
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfile({
        name,
        bio,
        profilePicture,
        socialMedia: {
          twitter,
          linkedin,
          github,
          whatsapp,
        },
        achievements,
      })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload this to a storage service
    // For demo purposes, we'll use a placeholder
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfilePicture(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()])
      setNewAchievement("")
    }
  }

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index))
  }

  const handleApplicationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setApplicationData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (role: string) => {
    setApplicationData((prev) => ({
      ...prev,
      preferredRole: role as "Technical Team Member" | "Publicity Team Member" | "Volunteer",
    }))
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate form
    if (!applicationData.aboutYourself || !applicationData.skillSet || !applicationData.whyJoin) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await applyForCoreTeam(applicationData)
      setShowApplicationForm(false)
      toast({
        title: "Application submitted",
        description: "Your application to join the core team has been submitted",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openApplicationForm = () => {
    setShowApplicationForm(true)
  }

  return (
    <>
      <Navbar />
      <div className="container py-10 min-h-[calc(100vh-8rem)]">
        {user.showRejectionAlert && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <RejectionAlert onDismiss={dismissRejectionAlert} />
          </div>
        )}

        {user.showApprovalAlert && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <ApprovalAlert onDismiss={dismissApprovalAlert} />
          </div>
        )}

        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Your Profile</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="flex flex-col gap-6">
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02]">
              <CardContent className="p-6 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={profilePicture || ""} alt={user.name} />
                  <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                {user.bio && <p className="text-sm text-center text-muted-foreground mt-1">{user.bio}</p>}
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground capitalize mt-1">
                  {user.coreTeamRole || user.position || user.role}
                </p>

                {user.socialMedia && (
                  <div className="flex gap-2 mt-4">
                    {user.socialMedia.twitter && (
                      <a
                        href={`https://twitter.com/${user.socialMedia.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <XLogo size={18} />
                      </a>
                    )}
                    {user.socialMedia.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${user.socialMedia.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {user.socialMedia.github && (
                      <a
                        href={`https://github.com/${user.socialMedia.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Github size={18} />
                      </a>
                    )}
                    {user.socialMedia.whatsapp && (
                      <a
                        href={`https://wa.me/${user.socialMedia.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <MessageCircle size={18} />
                      </a>
                    )}
                  </div>
                )}

                {!user.position &&
                  !user.appliedForCoreTeam &&
                  !user.approvedForCoreTeam &&
                  !user.rejectedForCoreTeam && (
                    <>
                      {applicationsOpen ? (
                        <Button onClick={openApplicationForm} variant="outline" className="mt-4">
                          Apply to Join Core Team
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-4">
                          Core team applications are currently closed
                        </p>
                      )}
                    </>
                  )}

                {user.appliedForCoreTeam && (
                  <p className="text-sm text-muted-foreground mt-4">Application pending approval</p>
                )}

                {user.approvedForCoreTeam && (
                  <p className="text-sm text-primary mt-4">Core Team Member - {user.coreTeamRole}</p>
                )}

                {user.rejectedForCoreTeam && (
                  <p className="text-sm text-destructive mt-4">Application was not approved</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="events">My Events</TabsTrigger>
                {(user.position || user.approvedForCoreTeam) && (
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="profile" className="space-y-6">
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your profile information here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us a bit about yourself"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-picture">Profile Picture</Label>
                        <Input id="profile-picture" type="file" accept="image/*" onChange={handleImageUpload} />
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-4">Social Media Handles</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="twitter" className="flex items-center gap-2">
                              <XLogo size={16} /> X.com
                            </Label>
                            <Input
                              id="twitter"
                              value={twitter}
                              onChange={(e) => setTwitter(e.target.value)}
                              placeholder="username (without @)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedin" className="flex items-center gap-2">
                              <Linkedin size={16} /> LinkedIn
                            </Label>
                            <Input
                              id="linkedin"
                              value={linkedin}
                              onChange={(e) => setLinkedin(e.target.value)}
                              placeholder="username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="github" className="flex items-center gap-2">
                              <Github size={16} /> GitHub
                            </Label>
                            <Input
                              id="github"
                              value={github}
                              onChange={(e) => setGithub(e.target.value)}
                              placeholder="username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="flex items-center gap-2">
                              <MessageCircle size={16} /> WhatsApp
                            </Label>
                            <Input
                              id="whatsapp"
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(e.target.value)}
                              placeholder="phone number with country code"
                            />
                          </div>
                        </div>
                      </div>

                      <Button type="submit" disabled={isLoading} className="mt-4">
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="events">
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle>My Events</CardTitle>
                    <CardDescription>Events you have registered for</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user.registeredEvents && user.registeredEvents.length > 0 ? (
                      <div className="space-y-4">
                        <ul className="space-y-2">
                          {user.registeredEvents.map((eventId) => {
                            const event = events.find((e) => e.id === eventId)

                            return (
                              <li key={eventId} className="flex justify-between items-center p-3 border rounded-md">
                                <div>
                                  <p className="font-medium">{event?.title || "Unknown Event"}</p>
                                  <p className="text-sm text-muted-foreground">{event?.date || "Unknown Date"}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Registered on: {user.registrationDates?.[eventId] || "Unknown"}
                                </p>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        You haven&apos;t registered for any events yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              {(user.position || user.approvedForCoreTeam) && (
                <TabsContent value="achievements">
                  <Card className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle>My Achievements</CardTitle>
                      <CardDescription>Add and manage your achievements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a new achievement..."
                            value={newAchievement}
                            onChange={(e) => setNewAchievement(e.target.value)}
                          />
                          <Button onClick={handleAddAchievement} type="button">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {achievements.length > 0 ? (
                            <ul className="space-y-2">
                              {achievements.map((achievement, index) => (
                                <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                                  <span>{achievement}</span>
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveAchievement(index)}>
                                    <Plus className="h-4 w-4 rotate-45" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-center py-4 text-muted-foreground">
                              You haven&apos;t added any achievements yet.
                            </p>
                          )}
                        </div>

                        <Button onClick={handleProfileUpdate} disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Achievements"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

        {/* Core Team Application Form */}
        <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto my-4 animate-dialog-open">
            <DialogHeader>
              <DialogTitle>Core Team Application</DialogTitle>
              <DialogDescription>
                Please fill out this form to apply for the CAMLDS Unilorin Core Team
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredRole">Preferred Role *</Label>
                <Select value={applicationData.preferredRole} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical Team Member">Technical Team Member</SelectItem>
                    <SelectItem value="Publicity Team Member">Publicity Team Member</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutYourself">Tell us a little bit about yourself *</Label>
                <Textarea
                  id="aboutYourself"
                  name="aboutYourself"
                  value={applicationData.aboutYourself}
                  onChange={handleApplicationChange}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillSet">Skill set *</Label>
                <Textarea
                  id="skillSet"
                  name="skillSet"
                  value={applicationData.skillSet}
                  onChange={handleApplicationChange}
                  rows={3}
                  required
                  placeholder="List your technical and soft skills"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whyJoin">Why do you want to join? *</Label>
                <Textarea
                  id="whyJoin"
                  name="whyJoin"
                  value={applicationData.whyJoin}
                  onChange={handleApplicationChange}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherCommunities">Are you part of any other tech community?</Label>
                <Textarea
                  id="otherCommunities"
                  name="otherCommunities"
                  value={applicationData.otherCommunities}
                  onChange={handleApplicationChange}
                  rows={2}
                  placeholder="If yes, please list them"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impactPlans">In what ways do you plan on impacting this community? *</Label>
                <Textarea
                  id="impactPlans"
                  name="impactPlans"
                  value={applicationData.impactPlans}
                  onChange={handleApplicationChange}
                  rows={3}
                  required
                />
              </div>

              <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setShowApplicationForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  )
}
