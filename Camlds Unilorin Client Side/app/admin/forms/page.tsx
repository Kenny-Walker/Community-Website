"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useForms } from "@/lib/forms-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { FormInput, Plus, Trash2, Eye, Clock, FileText } from "lucide-react"
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
import { format, formatDistanceToNow } from "date-fns"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function FormsPage() {
  const { user } = useAuth()
  const { forms, deleteForm } = useForms()
  const router = useRouter()
  const { toast } = useToast()
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Check if user is Team Lead
  if (!user || user.position !== "Team Lead") {
    return (
      <>
        <Navbar />
        <div className="container py-10">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground">Only Team Lead can manage forms.</p>
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

  const confirmDeleteForm = () => {
    if (!formToDelete) return

    deleteForm(formToDelete)
      .then(() => {
        setFormToDelete(null)
        setIsDeleteDialogOpen(false)
      })
      .catch((error) => {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to delete form",
          variant: "destructive",
        })
      })
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)

    if (deadlineDate <= now) {
      return "Closed"
    }

    return formatDistanceToNow(deadlineDate, { addSuffix: true })
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FormInput className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Forms</h1>
          </div>
          <Link href="/admin/forms/create" passHref>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Form
            </Button>
          </Link>
        </div>

        {forms.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Forms Created Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create your first form to collect information or votes from community members.
                </p>
                <Link href="/admin/forms/create" passHref>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Form
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">{form.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Created on {format(new Date(form.createdAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Badge variant={form.isActive ? "default" : "secondary"}>
                      {form.isActive ? "Active" : "Closed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{form.description || "No description provided."}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {form.isActive
                        ? `Closes ${getTimeRemaining(form.deadline)}`
                        : `Closed on ${format(new Date(form.deadline), "MMM d, yyyy")}`}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{form.type === "voting" ? "Voting Form" : "Information Form"}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Responses:</span>
                      <span className="text-sm">{form.responses.length}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => {
                      setFormToDelete(form.id)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/admin/forms/${form.id}`)}>
                    <Eye className="mr-1 h-4 w-4" /> View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the form and all responses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteForm} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Footer />
    </>
  )
}
