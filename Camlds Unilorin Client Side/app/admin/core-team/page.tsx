"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Users } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Add this import
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Update the component to include the application status toggle
export default function CoreTeamApplicationsPage() {
  const {
    user,
    approveCoreTeamMember,
    rejectCoreTeamMember,
    getAllApplications,
    applicationsOpen,
    toggleApplicationStatus,
  } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [applicants, setApplicants] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({})
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  // Check if user is Team Lead, Technical Lead, or PR Officer
  const canViewApplications =
    user?.position === "Team Lead" ||
    user?.position === "Technical Lead" ||
    user?.position === "Public Relations Officer"

  // Load applications
  useEffect(() => {
    if (canViewApplications) {
      // getAllApplications returns an array directly, not a Promise
      const applications = getAllApplications()
      setApplicants(applications)
    }
  }, [canViewApplications, getAllApplications])

  // Add this function to handle the toggle
  const handleToggleApplications = async () => {
    setIsTogglingStatus(true)
    try {
      await toggleApplicationStatus()
    } catch (error) {
      console.error(error)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  if (!user || !canViewApplications) {
    return (
      <>
        <Navbar />
        <div className="container py-10 min-h-[calc(100vh-8rem)]">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground">You need appropriate privileges to access this page.</p>
                <Button className="mt-4" onClick={() => router.push("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  const handleApprove = async (applicantId: string) => {
    setIsProcessing((prev) => ({ ...prev, [applicantId]: true }))

    try {
      await approveCoreTeamMember(applicantId)

      // Remove from applicants list
      setApplicants((prev) => prev.filter((a) => a.id !== applicantId))

      toast({
        title: "Application approved",
        description: "The user has been added to the core team",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      })
    } finally {
      setIsProcessing((prev) => ({ ...prev, [applicantId]: false }))
    }
  }

  const handleReject = async (applicantId: string) => {
    setIsProcessing((prev) => ({ ...prev, [applicantId]: true }))

    try {
      await rejectCoreTeamMember(applicantId)

      // Remove from applicants list
      setApplicants((prev) => prev.filter((a) => a.id !== applicantId))

      toast({
        title: "Application rejected",
        description: "The application has been rejected",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      })
    } finally {
      setIsProcessing((prev) => ({ ...prev, [applicantId]: false }))
    }
  }

  const viewApplicationDetails = (applicant: any) => {
    setSelectedApplicant(applicant)
  }

  // Update the return statement to include the toggle
  return (
    <>
      <Navbar />
      <div className="container py-10 min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Core Team Applications</h1>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="application-status" className="text-sm font-medium">
              {applicationsOpen ? "Applications Open" : "Applications Closed"}
            </Label>
            <Switch
              id="application-status"
              checked={applicationsOpen}
              onCheckedChange={handleToggleApplications}
              disabled={isTogglingStatus}
            />
          </div>
        </div>

        {/* Application status card */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Application Status: {applicationsOpen ? "Open" : "Closed"}</h2>
                <p className="text-sm text-muted-foreground">
                  {applicationsOpen
                    ? "Community members can currently apply to join the core team."
                    : "Applications are currently closed. Toggle the switch to allow members to apply."}
                </p>
              </div>
              <Button
                variant={applicationsOpen ? "destructive" : "default"}
                onClick={handleToggleApplications}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus ? "Updating..." : applicationsOpen ? "Close Applications" : "Open Applications"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {applicants.length > 0 ? (
          <div className="space-y-6">
            {applicants.map((applicant) => (
              <Card key={applicant.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={applicant.profilePicture} alt={applicant.name} />
                        <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{applicant.name}</CardTitle>
                        <CardDescription>{applicant.email}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {applicant.application && (
                    <div className="space-y-4 mb-4">
                      <div>
                        <h3 className="font-semibold">Preferred Role:</h3>
                        <p className="text-sm">{applicant.application.preferredRole}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold">About:</h3>
                        <p className="text-sm line-clamp-2">{applicant.application.aboutYourself}</p>
                      </div>
                      <Button variant="outline" onClick={() => viewApplicationDetails(applicant)} className="w-full">
                        View Full Application
                      </Button>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(applicant.id)}
                      disabled={isProcessing[applicant.id]}
                    >
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(applicant.id)} disabled={isProcessing[applicant.id]}>
                      {isProcessing[applicant.id] ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">No Pending Applications</h2>
                <p className="text-muted-foreground">
                  There are currently no pending applications to join the core team.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Details Dialog */}
        <Dialog open={!!selectedApplicant} onOpenChange={(open) => !open && setSelectedApplicant(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>Full application details for {selectedApplicant?.name}</DialogDescription>
            </DialogHeader>

            {selectedApplicant && selectedApplicant.application && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedApplicant.profilePicture} alt={selectedApplicant.name} />
                    <AvatarFallback>{selectedApplicant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{selectedApplicant.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedApplicant.email}</p>
                    <p className="text-sm">Applied on: {selectedApplicant.application.date}</p>
                  </div>
                </div>

                <div className="grid gap-4 border-t pt-4">
                  <div>
                    <h3 className="font-semibold text-lg">Preferred Role</h3>
                    <p>{selectedApplicant.application.preferredRole}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">About</h3>
                    <p className="whitespace-pre-wrap">{selectedApplicant.application.aboutYourself}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">Skills</h3>
                    <p className="whitespace-pre-wrap">{selectedApplicant.application.skillSet}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">Why Join</h3>
                    <p className="whitespace-pre-wrap">{selectedApplicant.application.whyJoin}</p>
                  </div>

                  {selectedApplicant.application.otherCommunities && (
                    <div>
                      <h3 className="font-semibold text-lg">Other Communities</h3>
                      <p className="whitespace-pre-wrap">{selectedApplicant.application.otherCommunities}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-lg">Impact Plans</h3>
                    <p className="whitespace-pre-wrap">{selectedApplicant.application.impactPlans}</p>
                  </div>
                </div>

                <DialogFooter className="flex justify-between gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedApplicant.id)
                      setSelectedApplicant(null)
                    }}
                    disabled={isProcessing[selectedApplicant.id]}
                  >
                    Reject Application
                  </Button>
                  <Button
                    onClick={() => {
                      handleApprove(selectedApplicant.id)
                      setSelectedApplicant(null)
                    }}
                    disabled={isProcessing[selectedApplicant.id]}
                  >
                    {isProcessing[selectedApplicant.id] ? "Processing..." : "Approve Application"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  )
}
