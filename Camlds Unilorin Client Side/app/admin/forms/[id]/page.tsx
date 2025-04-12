"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useForms, type FormResponse } from "@/lib/forms-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { FormInput, ArrowLeft, Clock, Download, Eye, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { format, formatDistanceToNow } from "date-fns"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function FormDetailsPage() {
  const { user } = useAuth()
  const { getForm } = useForms()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)

  const formId = params?.id as string
  const form = getForm(formId)

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
                <p className="text-muted-foreground">Only Team Lead can view form details and responses.</p>
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

  // Check if form exists
  if (!form) {
    return (
      <>
        <Navbar />
        <div className="container py-10">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Form Not Found</h1>
                <p className="text-muted-foreground">The form you're looking for doesn't exist or has been deleted.</p>
                <Button className="mt-4" onClick={() => router.push("/admin/forms")}>
                  Back to Forms
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)

    if (deadlineDate <= now) {
      return "Closed"
    }

    return formatDistanceToNow(deadlineDate, { addSuffix: true })
  }

  const exportResponsesToCSV = () => {
    if (form.responses.length === 0) {
      toast({
        title: "No responses",
        description: "There are no responses to export",
        variant: "destructive",
      })
      return
    }

    let csvContent = "data:text/csv;charset=utf-8,"

    if (form.type === "voting") {
      // For voting forms
      csvContent += "User,Option,Submitted At\n"

      form.responses.forEach((response) => {
        const optionId = Object.values(response.answers)[0] as string
        const option = form.options?.find((opt) => opt.id === optionId)?.text || "Unknown"

        csvContent += `"${response.userName}","${option}","${format(new Date(response.submittedAt), "yyyy-MM-dd HH:mm:ss")}"\n`
      })
    } else {
      // For information forms
      // Create header row with all field labels
      const headers = ["User", ...form.fields.map((field) => field.label), "Submitted At"]
      csvContent += headers.map((header) => `"${header}"`).join(",") + "\n"

      // Add data rows
      form.responses.forEach((response) => {
        const row = [response.userName]

        form.fields.forEach((field) => {
          const answer = response.answers[field.id]
          if (Array.isArray(answer)) {
            row.push(`"${answer.join(", ")}"`)
          } else {
            row.push(`"${answer || ""}"`)
          }
        })

        row.push(`"${format(new Date(response.submittedAt), "yyyy-MM-dd HH:mm:ss")}"`)
        csvContent += row.join(",") + "\n"
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${form.title.replace(/\s+/g, "_")}_responses.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Responses have been exported to CSV",
    })
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => router.push("/admin/forms")} className="p-0 mr-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <FormInput className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">{form.title}</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Form Details</CardTitle>
                <CardDescription>Created on {format(new Date(form.createdAt), "MMMM d, yyyy")}</CardDescription>
              </div>
              <Badge variant={form.isActive ? "default" : "secondary"}>{form.isActive ? "Active" : "Closed"}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p>{form.description || "No description provided."}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {form.isActive
                      ? `Closes ${getTimeRemaining(form.deadline)}`
                      : `Closed on ${format(new Date(form.deadline), "MMMM d, yyyy")}`}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{form.responses.length} responses received</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={exportResponsesToCSV} disabled={form.responses.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export Responses
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="responses">
          <TabsList>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="preview">Form Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-6 pt-4">
            {form.responses.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h2 className="text-xl font-semibold mb-2">No Responses Yet</h2>
                    <p className="text-muted-foreground">No one has submitted a response to this form yet.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {form.type === "voting" ? (
                  // Voting results
                  <Card>
                    <CardHeader>
                      <CardTitle>Voting Results</CardTitle>
                      <CardDescription>Total votes: {form.responses.length}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {form.options?.map((option) => {
                          const percentage =
                            form.responses.length > 0 ? Math.round((option.votes / form.responses.length) * 100) : 0

                          return (
                            <div key={option.id} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span>{option.text}</span>
                                <span className="text-sm font-medium">
                                  {option.votes} votes ({percentage}% of 100%)
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Information form responses
                  <div className="space-y-4">
                    {form.responses.map((response) => (
                      <Card
                        key={response.id}
                        className="hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <User className="h-5 w-5 mr-2 text-muted-foreground" />
                              <span className="font-medium">{response.userName}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(response.submittedAt), "MMM d, yyyy h:mm a")}
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <Button variant="ghost" size="sm" className="w-full">
                              <Eye className="mr-2 h-4 w-4" /> View Response
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{form.title}</CardTitle>
                {form.description && <CardDescription>{form.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                {form.type === "voting" ? (
                  <div className="space-y-4">
                    <h3 className="font-medium">Please select one option:</h3>
                    <div className="space-y-2">
                      {form.options?.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`preview-${option.id}`}
                            name="preview-vote"
                            disabled
                            className="rounded-full border-gray-300"
                          />
                          <label htmlFor={`preview-${option.id}`}>{option.text}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {form.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label className="font-medium">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        {field.type === "text" && (
                          <input
                            type="text"
                            disabled
                            placeholder="Short text answer"
                            className="w-full p-2 border rounded-md bg-muted"
                          />
                        )}

                        {field.type === "textarea" && (
                          <textarea
                            disabled
                            placeholder="Long text answer"
                            rows={3}
                            className="w-full p-2 border rounded-md bg-muted"
                          />
                        )}

                        {field.type === "select" && (
                          <select disabled className="w-full p-2 border rounded-md bg-muted">
                            <option value="">Select an option</option>
                            {field.options?.map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === "radio" && (
                          <div className="space-y-2">
                            {field.options?.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`preview-${field.id}-${index}`}
                                  name={`preview-${field.id}`}
                                  disabled
                                  className="rounded-full border-gray-300"
                                />
                                <label htmlFor={`preview-${field.id}-${index}`}>{option}</label>
                              </div>
                            ))}
                          </div>
                        )}

                        {field.type === "checkbox" && (
                          <div className="space-y-2">
                            {field.options?.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`preview-${field.id}-${index}`}
                                  disabled
                                  className="rounded border-gray-300"
                                />
                                <label htmlFor={`preview-${field.id}-${index}`}>{option}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-4 border-t flex justify-end">
                  <Button disabled>Submit</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Response Details Dialog */}
        <Dialog open={!!selectedResponse} onOpenChange={(open) => !open && setSelectedResponse(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Response Details</DialogTitle>
              <DialogDescription>
                Submitted by {selectedResponse?.userName} on{" "}
                {selectedResponse && format(new Date(selectedResponse.submittedAt), "MMMM d, yyyy h:mm a")}
              </DialogDescription>
            </DialogHeader>

            {selectedResponse && (
              <div className="space-y-4">
                {form.fields.map((field) => {
                  const answer = selectedResponse.answers[field.id]

                  return (
                    <div key={field.id} className="space-y-1">
                      <h3 className="font-medium">{field.label}</h3>
                      <div className="p-2 border rounded-md bg-muted">
                        {Array.isArray(answer) ? (
                          <ul className="list-disc pl-5">
                            {answer.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="whitespace-pre-wrap">{answer || "No answer provided"}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <DialogClose asChild>
              <Button variant="outline" className="mt-4">
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  )
}
