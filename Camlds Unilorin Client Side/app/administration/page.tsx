"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus, Building2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "@/components/navbar"

// Default administration data
const DEFAULT_ADMINISTRATION_DATA = {
  "2024-2025": {
    executive: {
      title: "Executive Team",
      description: "The leadership team for the 2024-2025 academic year.",
      members: [
        {
          id: "1",
          name: "Makinde Kehinde ",
          position: "Team Lead",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Led the community to 200+ active members",
            "Organized 15+ successful tech events",
            "Established partnerships with 5 tech companies",
          ],
        },
        {
          id: "2",
          name: "Ogundele Victor",
          position: "Technical Lead",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Coordinated community outreach programs",
            "Managed the mentorship program",
            "Represented CAMLDS at 3 national conferences",
          ],
        },
        {
          id: "3",
          name: "Michael Johnson",
          position: "Public Relations Officer",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Maintained detailed records of all community activities",
            "Improved communication processes",
            "Developed the community newsletter",
          ],
        },
      ],
    },
    core: {
      title: "Core Team",
      description: "Core members supporting the executive team for the 2024-2025 academic year.",
      members: [
        {
          id: "4",
          name: "Sarah Williams",
          position: "Technical Team Member",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Conducted 20+ technical workshops",
            "Developed the community website",
            "Led 5 successful hackathon teams",
          ],
        },
        {
          id: "5",
          name: "David Brown",
          position: "Content Creator",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Organized weekly coding sessions",
            "Created comprehensive learning materials",
            "Mentored 15+ junior developers",
          ],
        },
      ],
    },
  },
  "2023-2024": {
    executive: {
      title: "Executive Team",
      description: "The leadership team for the 2023-2024 academic year.",
      members: [
        {
          id: "6",
          name: "Emily Davis",
          position: "Team Lead",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Organized 10+ successful tech events",
            "Increased event attendance by 40%",
            "Secured sponsorships for major events",
          ],
        },
        {
          id: "7",
          name: "Robert Wilson",
          position: "Technical Lead",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Managed event logistics for all community gatherings",
            "Developed efficient check-in system",
            "Coordinated with venue partners",
          ],
        },
        {
          id: "8",
          name: "Alice Johnson",
          position: "Public Relations Officer",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Managed social media presence",
            "Increased online engagement by 60%",
            "Created promotional materials for events",
          ],
        },
      ],
    },
    core: {
      title: "Core Team",
      description: "Core members supporting the executive team for the 2023-2024 academic year.",
      members: [
        {
          id: "9",
          name: "Mark Thompson",
          position: "Technical Team Member",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Assisted in workshop facilitation",
            "Contributed to community projects",
            "Provided technical support for events",
          ],
        },
        {
          id: "10",
          name: "Lisa Chen",
          position: "Content Creator",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Created educational content",
            "Designed graphics for social media",
            "Documented community activities",
          ],
        },
      ],
    },
  },
  "2022-2023": {
    executive: {
      title: "Executive Team",
      description: "The leadership team for the 2022-2023 academic year.",
      members: [
        {
          id: "11",
          name: "Thomas Anderson",
          position: "Team Lead",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Founded the CAMLDS community",
            "Established the organizational structure",
            "Organized the inaugural tech event",
          ],
        },
        {
          id: "12",
          name: "Olivia Martinez",
          position: "Technical Lead",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Developed the first community project",
            "Created technical learning curriculum",
            "Mentored new members",
          ],
        },
        {
          id: "13",
          name: "James Wilson",
          position: "Public Relations Officer",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Established social media presence",
            "Created the community brand identity",
            "Recruited initial members",
          ],
        },
      ],
    },
    core: {
      title: "Core Team",
      description: "Core members supporting the executive team for the 2022-2023 academic year.",
      members: [
        {
          id: "14",
          name: "Sophia Lee",
          position: "Technical Team Member",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Supported technical workshops",
            "Assisted in project development",
            "Provided technical documentation",
          ],
        },
        {
          id: "15",
          name: "Daniel Kim",
          position: "Content Creator",
          profilePicture: "/placeholder.svg?height=200&width=200",
          achievements: [
            "Created educational materials",
            "Designed community logo",
            "Documented early community events",
          ],
        },
      ],
    },
  },
}

// Get administrations from localStorage or use default data
const getStoredAdministrations = () => {
  if (typeof window !== "undefined") {
    const storedAdmins = localStorage.getItem("camlds_administrations")
    return storedAdmins ? JSON.parse(storedAdmins) : DEFAULT_ADMINISTRATION_DATA
  }
  return DEFAULT_ADMINISTRATION_DATA
}

export default function AdministrationPage() {
  const router = useRouter()
  const { user, isAdmin, canEditAdministration } = useAuth()
  const { toast } = useToast()
  const [administrationData, setAdministrationData] = useState(getStoredAdministrations())
  const [selectedYear, setSelectedYear] = useState("2024-2025")
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [memberToDelete, setMemberToDelete] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [yearToDelete, setYearToDelete] = useState<string | null>(null)
  const [isDeleteAdminDialogOpen, setIsDeleteAdminDialogOpen] = useState(false)

  // Load administrations and listen for changes
  useEffect(() => {
    const loadAdministrations = () => {
      setAdministrationData(getStoredAdministrations())
    }

    // Add event listener for storage changes
    window.addEventListener("storage", loadAdministrations)

    // Custom event for administration creation
    const handleAdminCreated = () => loadAdministrations()
    window.addEventListener("administrationCreated", handleAdminCreated)

    return () => {
      window.removeEventListener("storage", loadAdministrations)
      window.removeEventListener("administrationCreated", handleAdminCreated)
    }
  }, [])

  // Initialize localStorage with default data if not already set
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("camlds_administrations")) {
      localStorage.setItem("camlds_administrations", JSON.stringify(DEFAULT_ADMINISTRATION_DATA))
    }
  }, [])

  const years = Object.keys(administrationData).sort().reverse()

  // Set default selected year to the most recent one
  useEffect(() => {
    if (years.length > 0 && !administrationData[selectedYear]) {
      setSelectedYear(years[0])
    }
  }, [years, administrationData, selectedYear])

  const handleMemberClick = (member: any) => {
    setSelectedMember(member)
  }

  const handleEditMember = (member: any, year: string, section: string) => {
    router.push(`/administration/edit/${year}/${section}/${member.id}`)
  }

  const handleDeleteMember = (member: any, year: string, section: string) => {
    setMemberToDelete({ member, year, section })
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteMember = () => {
    if (!memberToDelete) return

    const { member, year, section } = memberToDelete

    // Create a deep copy of the administration data
    const updatedData = JSON.parse(JSON.stringify(administrationData))

    // Filter out the member to delete
    updatedData[year][section].members = updatedData[year][section].members.filter((m: any) => m.id !== member.id)

    // Update state and localStorage
    setAdministrationData(updatedData)
    localStorage.setItem("camlds_administrations", JSON.stringify(updatedData))

    toast({
      title: "Member removed",
      description: `${member.name} has been removed from the ${section} team.`,
    })

    setMemberToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  const handleDeleteAdministration = (year: string) => {
    setYearToDelete(year)
    setIsDeleteAdminDialogOpen(true)
  }

  const confirmDeleteAdministration = () => {
    if (!yearToDelete) return

    // Create a deep copy of the administration data
    const updatedData = JSON.parse(JSON.stringify(administrationData))

    // Delete the administration for the selected year
    delete updatedData[yearToDelete]

    // Update state and localStorage
    setAdministrationData(updatedData)
    localStorage.setItem("camlds_administrations", JSON.stringify(updatedData))

    toast({
      title: "Administration removed",
      description: `The ${yearToDelete} administration has been removed.`,
    })

    // If the deleted year was the selected year, select the most recent year
    if (yearToDelete === selectedYear) {
      const remainingYears = Object.keys(updatedData).sort().reverse()
      if (remainingYears.length > 0) {
        setSelectedYear(remainingYears[0])
      }
    }

    setYearToDelete(null)
    setIsDeleteAdminDialogOpen(false)
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Administration</h1>
          {canEditAdministration() && (
            <Link href="/administration/create" className="ml-auto">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create New Administration
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <div key={year} className="flex items-center gap-1">
                <Button variant={selectedYear === year ? "default" : "outline"} onClick={() => setSelectedYear(year)}>
                  {year}
                </Button>
                {canEditAdministration() && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => handleDeleteAdministration(year)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete {year} administration</span>
                  </Button>
                )}
              </div>
            ))}
          </div>

          {selectedYear && administrationData[selectedYear] && (
            <Tabs defaultValue="executive" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="executive">Executive Team</TabsTrigger>
                <TabsTrigger value="core">Core Team</TabsTrigger>
              </TabsList>

              {Object.entries(administrationData[selectedYear]).map(([key, section]) => (
                <TabsContent key={key} value={key} className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {section.members.map((member) => (
                      <Card
                        key={member.id}
                        className="hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => handleMemberClick(member)}
                      >
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={member.profilePicture} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{member.name}</CardTitle>
                            <CardDescription>{member.position}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <h4 className="font-semibold mb-2">Achievements:</h4>
                          <ul className="space-y-1 list-disc pl-5">
                            {member.achievements && member.achievements.length > 0 ? (
                              member.achievements.slice(0, 2).map((achievement, index) => (
                                <li key={index} className="text-sm">
                                  {achievement}
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-muted-foreground">No achievements listed yet</li>
                            )}
                            {member.achievements && member.achievements.length > 2 && (
                              <li className="text-sm text-primary">+ {member.achievements.length - 2} more...</li>
                            )}
                          </ul>

                          {canEditAdministration() && (
                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteMember(member, selectedYear, key)
                                }}
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                <span>Remove</span>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto my-4">
            <DialogHeader>
              <DialogTitle>Member Details</DialogTitle>
            </DialogHeader>

            {selectedMember && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedMember.profilePicture} alt={selectedMember.name} />
                    <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedMember.name}</h3>
                    <p className="text-muted-foreground">{selectedMember.position}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Achievements:</h4>
                  <ul className="space-y-1 list-disc pl-5 max-h-[200px] overflow-y-auto">
                    {selectedMember.achievements && selectedMember.achievements.length > 0 ? (
                      selectedMember.achievements.map((achievement: string, index: number) => (
                        <li key={index} className="text-sm">
                          {achievement}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">No achievements listed yet</li>
                    )}
                  </ul>
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
                This action cannot be undone. This will permanently remove {memberToDelete?.member.name} from the{" "}
                {memberToDelete?.section} team.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteMember} className="bg-red-500 hover:bg-red-600">
                Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeleteAdminDialogOpen} onOpenChange={setIsDeleteAdminDialogOpen}>
          <AlertDialogContent className="max-h-[90vh] overflow-y-auto my-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Administration</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the {yearToDelete} administration? This action cannot be undone and will
                remove all executive and core team members for this year.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAdministration} className="bg-red-500 hover:bg-red-600">
                Delete Administration
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
