"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

// Form types
export type FormType = "voting" | "information"

export type FormOption = {
  id: string
  text: string
  votes: number
}

export type FormField = {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox"
  label: string
  required: boolean
  options?: string[]
}

export type Form = {
  id: string
  title: string
  description: string
  type: FormType
  createdBy: string
  createdAt: string
  deadline: string
  fields: FormField[]
  options?: FormOption[]
  responses: FormResponse[]
  isActive: boolean
}

export type FormResponse = {
  id: string
  formId: string
  userId: string
  userName: string
  submittedAt: string
  answers: Record<string, string | string[]>
}

type FormsContextType = {
  forms: Form[]
  createForm: (form: Omit<Form, "id" | "createdAt" | "responses" | "isActive">) => Promise<string>
  updateForm: (form: Form) => Promise<void>
  deleteForm: (formId: string) => Promise<void>
  getForm: (formId: string) => Form | undefined
  submitResponse: (response: Omit<FormResponse, "id" | "submittedAt">) => Promise<void>
  getUserResponse: (formId: string, userId: string) => FormResponse | undefined
  getActiveForms: () => Form[]
  hasUserSubmitted: (formId: string, userId: string) => boolean
}

const FormsContext = createContext<FormsContextType | undefined>(undefined)

// Sample form data
const INITIAL_FORMS: Form[] = [
  {
    id: "1",
    title: "Community Feedback Survey",
    description: "Help us improve CAMLDS by sharing your feedback on our recent events and activities.",
    type: "information",
    createdBy: "1", // Team Lead ID
    createdAt: "2025-04-01T10:00:00Z",
    deadline: "2025-04-30T23:59:59Z",
    fields: [
      {
        id: "field1",
        type: "select",
        label: "How many CAMLDS events have you attended?",
        required: true,
        options: ["None", "1-2", "3-5", "More than 5"],
      },
      {
        id: "field2",
        type: "textarea",
        label: "What topics would you like to see covered in future events?",
        required: true,
      },
      {
        id: "field3",
        type: "radio",
        label: "How would you rate your overall experience with CAMLDS?",
        required: true,
        options: ["Excellent", "Good", "Average", "Poor"],
      },
    ],
    responses: [],
    isActive: true,
  },
  {
    id: "2",
    title: "Next Workshop Topic Vote",
    description: "Vote for the topic you'd like to see in our next technical workshop.",
    type: "voting",
    createdBy: "1", // Team Lead ID
    createdAt: "2025-04-05T14:30:00Z",
    deadline: "2025-04-15T23:59:59Z",
    fields: [],
    options: [
      { id: "opt1", text: "Introduction to Machine Learning", votes: 12 },
      { id: "opt2", text: "Web Development with React", votes: 8 },
      { id: "opt3", text: "Mobile App Development", votes: 5 },
      { id: "opt4", text: "Data Visualization Techniques", votes: 7 },
    ],
    responses: [],
    isActive: true,
  },
]

export function FormsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [forms, setForms] = useState<Form[]>([])

  // Load forms from localStorage on mount
  useEffect(() => {
    const loadForms = () => {
      if (typeof window !== "undefined") {
        const storedForms = localStorage.getItem("camlds_forms")
        if (storedForms) {
          setForms(JSON.parse(storedForms))
        } else {
          // Initialize with sample forms
          localStorage.setItem("camlds_forms", JSON.stringify(INITIAL_FORMS))
          setForms(INITIAL_FORMS)
        }
      }
    }

    loadForms()

    // Listen for storage changes
    window.addEventListener("storage", loadForms)
    return () => window.removeEventListener("storage", loadForms)
  }, [])

  // Update localStorage whenever forms change
  useEffect(() => {
    if (forms.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("camlds_forms", JSON.stringify(forms))
    }
  }, [forms])

  // Check form deadlines and update isActive status
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString()
      const updatedForms = forms.map((form) => ({
        ...form,
        isActive: new Date(form.deadline) > new Date(now),
      }))

      if (JSON.stringify(updatedForms) !== JSON.stringify(forms)) {
        setForms(updatedForms)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [forms])

  const createForm = async (formData: Omit<Form, "id" | "createdAt" | "responses" | "isActive">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create forms",
        variant: "destructive",
      })
      throw new Error("Authentication required")
    }

    // Only Team Lead can create forms
    if (user.position !== "Team Lead") {
      toast({
        title: "Permission denied",
        description: "Only Team Lead can create forms",
        variant: "destructive",
      })
      throw new Error("Permission denied")
    }

    const newForm: Form = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      responses: [],
      isActive: new Date(formData.deadline) > new Date(),
    }

    setForms((prev) => [...prev, newForm])

    toast({
      title: "Form created",
      description: "Your form has been created successfully",
    })

    return newForm.id
  }

  const updateForm = async (updatedForm: Form) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update forms",
        variant: "destructive",
      })
      throw new Error("Authentication required")
    }

    // Only Team Lead can update forms
    if (user.position !== "Team Lead") {
      toast({
        title: "Permission denied",
        description: "Only Team Lead can update forms",
        variant: "destructive",
      })
      throw new Error("Permission denied")
    }

    setForms((prev) => prev.map((form) => (form.id === updatedForm.id ? updatedForm : form)))

    toast({
      title: "Form updated",
      description: "Your form has been updated successfully",
    })
  }

  const deleteForm = async (formId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete forms",
        variant: "destructive",
      })
      throw new Error("Authentication required")
    }

    // Only Team Lead can delete forms
    if (user.position !== "Team Lead") {
      toast({
        title: "Permission denied",
        description: "Only Team Lead can delete forms",
        variant: "destructive",
      })
      throw new Error("Permission denied")
    }

    setForms((prev) => prev.filter((form) => form.id !== formId))

    toast({
      title: "Form deleted",
      description: "The form has been deleted successfully",
    })
  }

  const getForm = (formId: string) => {
    return forms.find((form) => form.id === formId)
  }

  const submitResponse = async (responseData: Omit<FormResponse, "id" | "submittedAt">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit responses",
        variant: "destructive",
      })
      throw new Error("Authentication required")
    }

    const form = forms.find((f) => f.id === responseData.formId)

    if (!form) {
      toast({
        title: "Form not found",
        description: "The form you're trying to submit to doesn't exist",
        variant: "destructive",
      })
      throw new Error("Form not found")
    }

    if (!form.isActive) {
      toast({
        title: "Submission closed",
        description: "The deadline for this form has passed",
        variant: "destructive",
      })
      throw new Error("Submission closed")
    }

    // Check if user has already submitted a response
    const hasSubmitted = form.responses.some((r) => r.userId === responseData.userId)

    if (hasSubmitted && form.type === "voting") {
      toast({
        title: "Already submitted",
        description: "You have already submitted a response to this form",
        variant: "destructive",
      })
      throw new Error("Already submitted")
    }

    const newResponse: FormResponse = {
      ...responseData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
    }

    // For voting forms, update the vote counts
    if (form.type === "voting" && form.options) {
      const selectedOptionId = Object.values(responseData.answers)[0] as string

      const updatedOptions = form.options.map((option) =>
        option.id === selectedOptionId ? { ...option, votes: option.votes + 1 } : option,
      )

      setForms((prev) =>
        prev.map((f) =>
          f.id === form.id
            ? {
                ...f,
                options: updatedOptions,
                responses: [...f.responses, newResponse],
              }
            : f,
        ),
      )
    } else {
      // For information forms
      setForms((prev) => prev.map((f) => (f.id === form.id ? { ...f, responses: [...f.responses, newResponse] } : f)))
    }

    toast({
      title: "Response submitted",
      description: "Your response has been submitted successfully",
    })
  }

  const getUserResponse = (formId: string, userId: string) => {
    const form = forms.find((f) => f.id === formId)
    if (!form) return undefined

    return form.responses.find((r) => r.userId === userId)
  }

  const getActiveForms = () => {
    return forms.filter((form) => form.isActive)
  }

  const hasUserSubmitted = (formId: string, userId: string) => {
    const form = forms.find((f) => f.id === formId)
    if (!form) return false

    return form.responses.some((r) => r.userId === userId)
  }

  return (
    <FormsContext.Provider
      value={{
        forms,
        createForm,
        updateForm,
        deleteForm,
        getForm,
        submitResponse,
        getUserResponse,
        getActiveForms,
        hasUserSubmitted,
      }}
    >
      {children}
    </FormsContext.Provider>
  )
}

export const useForms = () => {
  const context = useContext(FormsContext)
  if (context === undefined) {
    throw new Error("useForms must be used within a FormsProvider")
  }
  return context
}
