"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useForms } from "@/lib/forms-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FormInput, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function FormSubmissionPage() {
  const { user } = useAuth()
  const { getForm, submitResponse, hasUserSubmitted, getUserResponse } = useForms()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  const formId = params?.id as string
  const form = getForm(formId)
  const userResponse = user ? getUserResponse(formId, user.id) : undefined
  const hasSubmitted = user ? hasUserSubmitted(formId, user.id) : false

  // Update time remaining every minute
  useEffect(() => {
    if (!form) return

    const updateTimeRemaining = () => {
      const now = new Date()
      const deadline = new Date(form.deadline)

      if (deadline <= now) {
        setTimeRemaining("Closed")
        return
      }

      setTimeRemaining(formatDistanceToNow(deadline, { addSuffix: true }))
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000)

    return () => clearInterval(interval)
  }, [form])

  // Initialize form fields
  useEffect(() => {
    if (!form || form.type !== "information") return

    const initialAnswers: Record<string, string | string[]> = {}

    form.fields.forEach((field) => {
      if (field.type === "checkbox") {
        initialAnswers[field.id] = []
      } else {
        initialAnswers[field.id] = ""
      }
    })

    setAnswers(initialAnswers)
  }, [form])

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container py-10">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
                <p className="text-muted-foreground">Please log in to view and submit this form.</p>
                <Button className="mt-4" onClick={() => router.push("/login")}>
                  Log In
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

  // Check if form is active
  if (!form.isActive) {
    return (
      <>
        <Navbar />
        <div className="container py-10">
          <Card>
            <CardHeader>
              <CardTitle>{form.title}</CardTitle>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Submission Closed</h2>
                  <p className="text-muted-foreground">
                    This form is no longer accepting responses. The deadline was{" "}
                    {format(new Date(form.deadline), "MMMM d, yyyy h:mm a")}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  // Check if user has already submitted (for voting forms)
  if (form.type === "voting" && hasSubmitted) {
    const userVote = userResponse?.answers[Object.keys(userResponse.answers)[0]] as string
    const selectedOption = form.options?.find((opt) => opt.id === userVote)?.text || "Unknown option"

    return (
      <>
        <Navbar />
        <div className="container py-10">
          <Card>
            <CardHeader>
              <CardTitle>{form.title}</CardTitle>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Vote Recorded</h2>
                  <p className="text-muted-foreground mb-4">
                    You have already voted for this form. Your selection was:
                  </p>
                  <div className="inline-block bg-muted px-4 py-2 rounded-md font-medium">{selectedOption}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  const handleTextChange = (fieldId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentValues = (prev[fieldId] as string[]) || []

      if (checked) {
        return {
          ...prev,
          [fieldId]: [...currentValues, option],
        }
      } else {
        return {
          ...prev,
          [fieldId]: currentValues.filter((val) => val !== option),
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (form.type === "information") {
        // Check required fields
        const missingRequired = form.fields
          .filter((field) => field.required)
          .some((field) => {
            const answer = answers[field.id]
            return !answer || (Array.isArray(answer) && answer.length === 0)
          })

        if (missingRequired) {
          toast({
            title: "Error",
            description: "Please fill in all required fields",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      } else if (form.type === "voting") {
        // Check if an option is selected
        if (!answers.option) {
          toast({
            title: "Error",
            description: "Please select an option",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      // Submit response
      await submitResponse({
        formId: form.id,
        userId: user.id,
        userName: user.name,
        answers,
      })

      toast({
        title: "Success",
        description: "Your response has been submitted successfully",
      })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="flex items-center gap-2 mb-6">
          <FormInput className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">{form.title}</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{form.title}</CardTitle>
                {form.description && <CardDescription>{form.description}</CardDescription>}
              </div>
              <div className="flex items-center text-sm">
                <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Closes {timeRemaining}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.type === "voting" ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Please select one option:</h3>
                  <RadioGroup
                    value={(answers.option as string) || ""}
                    onValueChange={(value) => setAnswers({ option: value })}
                  >
                    <div className="space-y-2">
                      {form.options?.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id}>{option.text}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ) : (
                <div className="space-y-6">
                  {form.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>

                      {field.type === "text" && (
                        <Input
                          id={field.id}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleTextChange(field.id, e.target.value)}
                          required={field.required}
                        />
                      )}

                      {field.type === "textarea" && (
                        <Textarea
                          id={field.id}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleTextChange(field.id, e.target.value)}
                          required={field.required}
                          rows={3}
                        />
                      )}

                      {field.type === "select" && (
                        <Select
                          value={(answers[field.id] as string) || ""}
                          onValueChange={(value) => handleTextChange(field.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {field.type === "radio" && (
                        <RadioGroup
                          value={(answers[field.id] as string) || ""}
                          onValueChange={(value) => handleTextChange(field.id, value)}
                        >
                          <div className="space-y-2">
                            {field.options?.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      )}

                      {field.type === "checkbox" && (
                        <div className="space-y-2">
                          {field.options?.map((option, index) => {
                            const values = (answers[field.id] as string[]) || []
                            const checked = values.includes(option)

                            return (
                              <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${field.id}-${index}`}
                                  checked={checked}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(field.id, option, checked as boolean)
                                  }
                                />
                                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <CardFooter className="px-0 pt-6 flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  )
}
