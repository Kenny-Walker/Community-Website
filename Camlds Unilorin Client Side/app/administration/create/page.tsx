"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Plus, Search, Building2 } from "lucide-react"

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
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "user",
    profilePicture: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "4",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "user",
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

export default function CreateAdministrationPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    year: "",
    teamLead: "",
    technicalLead: "",
    publicRelationsOfficer: "",
    coreMembers: [] as string[],
  })

  if (!user || !isAdmin) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">You need Team Lead privileges to create administrations.</p>
              <Button className="mt-4" onClick={() => router.push("/administration")}>
                Back to Administration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectMember = (role: string, memberId: string) => {
    if (role === "coreMembers") {
      if (formData.coreMembers.includes(memberId)) {
        setFormData((prev) => ({
          ...prev,
          coreMembers: prev.coreMembers.filter((id) => id !== memberId),
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          coreMembers: [...prev.coreMembers, memberId],
        }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [role]: memberId }))
    }
  }

  const handleRemoveMember = (role: string, memberId?: string) => {
    if (role === "coreMembers" && memberId) {
      setFormData((prev) => ({
        ...prev,
        coreMembers: prev.coreMembers.filter((id) => id !== memberId),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [role]: "" }))
    }
  }

  const filteredMembers = MEMBERS_DATA.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getSelectedMember = (memberId: string) => {
    return MEMBERS_DATA.find((member) => member.id === memberId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate form
    if (!formData.year || !formData.teamLead || !formData.technicalLead || !formData.publicRelationsOfficer) {
      toast({
        title: "Error",
        description: "Please fill in all required executive team positions",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Get existing administrations from localStorage
    const existingAdmins = localStorage.getItem("camlds_administrations")
    const administrations = existingAdmins ? JSON.parse(existingAdmins) : {}

    // Create new administration object
    const newAdministration = {
      executive: {
        title: "Executive Team",
        description: `The leadership team for the ${formData.year} academic year.`,
        members: [
          {
            id: formData.teamLead,
            name: getSelectedMember(formData.teamLead)?.name || "",
            position: "Team Lead",
            profilePicture:
              getSelectedMember(formData.teamLead)?.profilePicture || "/placeholder.svg?height=200&width=200",
            achievements: [],
          },
          {
            id: formData.technicalLead,
            name: getSelectedMember(formData.technicalLead)?.name || "",
            position: "Technical Lead",
            profilePicture:
              getSelectedMember(formData.technicalLead)?.profilePicture || "/placeholder.svg?height=200&width=200",
            achievements: [],
          },
          {
            id: formData.publicRelationsOfficer,
            name: getSelectedMember(formData.publicRelationsOfficer)?.name || "",
            position: "Public Relations Officer",
            profilePicture:
              getSelectedMember(formData.publicRelationsOfficer)?.profilePicture ||
              "/placeholder.svg?height=200&width=200",
            achievements: [],
          },
        ],
      },
      core: {
        title: "Core Team",
        description: `Core members supporting the executive team for the ${formData.year} academic year.`,
        members: formData.coreMembers.map((memberId) => ({
          id: memberId,
          name: getSelectedMember(memberId)?.name || "",
          position: "Core Team Member",
          profilePicture: getSelectedMember(memberId)?.profilePicture || "/placeholder.svg?height=200&width=200",
          achievements: [],
        })),
      },
    }

    // Add new administration to administrations object
    administrations[formData.year] = newAdministration

    // Save to localStorage
    localStorage.setItem("camlds_administrations", JSON.stringify(administrations))

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("administrationCreated"))

    toast({
      title: "Administration created",
      description: `The ${formData.year} administration has been created successfully`,
    })
    setIsLoading(false)
    router.push("/administration")
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Create New Administration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administration Details</CardTitle>
          <CardDescription>Set up a new administration year and assign roles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year *</Label>
              <Input
                id="year"
                name="year"
                placeholder="e.g., 2024-2025"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </div>

            <Tabs defaultValue="executive" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="executive">Executive Team</TabsTrigger>
                <TabsTrigger value="core">Core Team</TabsTrigger>
              </TabsList>

              <TabsContent value="executive" className="space-y-6">
                <div className="space-y-4">
                  {/* Team Lead */}
                  <div className="space-y-2">
                    <Label>Team Lead *</Label>
                    {formData.teamLead ? (
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={getSelectedMember(formData.teamLead)?.profilePicture}
                              alt={getSelectedMember(formData.teamLead)?.name}
                            />
                            <AvatarFallback>{getSelectedMember(formData.teamLead)?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{getSelectedMember(formData.teamLead)?.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveMember("teamLead")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search members..."
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
                              onClick={() => handleSelectMember("teamLead", member.id)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profilePicture} alt={member.name} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{member.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Technical Lead */}
                  <div className="space-y-2">
                    <Label>Technical Lead *</Label>
                    {formData.technicalLead ? (
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={getSelectedMember(formData.technicalLead)?.profilePicture}
                              alt={getSelectedMember(formData.technicalLead)?.name}
                            />
                            <AvatarFallback>{getSelectedMember(formData.technicalLead)?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{getSelectedMember(formData.technicalLead)?.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveMember("technicalLead")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search members..."
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
                              onClick={() => handleSelectMember("technicalLead", member.id)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profilePicture} alt={member.name} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{member.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Public Relations Officer */}
                  <div className="space-y-2">
                    <Label>Public Relations Officer *</Label>
                    {formData.publicRelationsOfficer ? (
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={getSelectedMember(formData.publicRelationsOfficer)?.profilePicture}
                              alt={getSelectedMember(formData.publicRelationsOfficer)?.name}
                            />
                            <AvatarFallback>
                              {getSelectedMember(formData.publicRelationsOfficer)?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{getSelectedMember(formData.publicRelationsOfficer)?.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveMember("publicRelationsOfficer")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search members..."
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
                              onClick={() => handleSelectMember("publicRelationsOfficer", member.id)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profilePicture} alt={member.name} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{member.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="core" className="space-y-6">
                <div className="space-y-4">
                  <Label>Core Team Members</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.coreMembers.map((memberId) => {
                      const member = getSelectedMember(memberId)
                      return (
                        <div key={memberId} className="flex items-center gap-1 bg-muted p-1 pl-2 rounded-md">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member?.profilePicture} alt={member?.name} />
                            <AvatarFallback>{member?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member?.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 ml-1"
                            onClick={() => handleRemoveMember("coreMembers", memberId)}
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
                        placeholder="Search members to add to core team..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="border rounded-md max-h-60 overflow-y-auto">
                      {filteredMembers
                        .filter(
                          (member) =>
                            !formData.coreMembers.includes(member.id) &&
                            member.id !== formData.teamLead &&
                            member.id !== formData.technicalLead &&
                            member.id !== formData.publicRelationsOfficer,
                        )
                        .map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                            onClick={() => handleSelectMember("coreMembers", member.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.profilePicture} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{member.name}</span>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/administration")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Administration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
