"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useForms, type FormType, type FormField } from "@/lib/forms-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Plus, Trash2, FormInput } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function CreateFormPage() {
  const { user } = useAuth()
  const { createForm } = useForms()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formType, setFormType] = useState<FormType>("information")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
  })

  const [fields, setFields] = useState<FormField[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [newOption, setNewOption] = useState("")

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
                <p className="text-muted-foreground">Only Team Lead can create forms.</p>
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, deadline: date }))
    }
  }

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: "text",
      label: "",
      required: false,
    }
    setFields((prev) => [...prev, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id))
  }

  const addOption = () => {
    if (newOption.trim()) {
      setOptions((prev) => [...prev, newOption.trim()])
      setNewOption("")
    }
  }

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (!formData.title) {
        toast({
          title: "Error",
          description: "Please enter a form title",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (formType === "information" && fields.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one field to your form",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (formType === "voting" && options.length < 2) {
        toast({
          title: "Error",
          description: "Please add at least two options for voting",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Set deadline to end of day
      const deadline = new Date(formData.deadline)
      deadline.setHours(23, 59, 59, 999)

      // Create form
      const formId = await createForm({
        title: formData.title,
        description: formData.description,
        type: formType,
        createdBy: user.id,
        deadline: deadline.toISOString(),
        fields: formType === "information" ? fields : [],
        options:
          formType === "voting"
            ? options.map((text, index) => ({
                id: `opt-${index + 1}`,
                text,
                votes: 0,
              }))
            : undefined,
      })

      router.push(`/admin/forms/${formId}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create form",
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
          <h1 className="text-3xl font-bold">Create New Form</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
            <CardDescription>Create a new form for community members to fill out</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Form Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Community Feedback Survey"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the purpose of this form"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline ? format(formData.deadline, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.deadline}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    The form will automatically close at 11:59 PM on this date
                  </p>
                </div>
              </div>

              <Tabs defaultValue="information" onValueChange={(value) => setFormType(value as FormType)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="information">Information Form</TabsTrigger>
                  <TabsTrigger value="voting">Voting Form</TabsTrigger>
                </TabsList>

                <TabsContent value="information" className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Form Fields</h3>
                    <Button type="button" onClick={addField} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Field
                    </Button>
                  </div>

                  {fields.length === 0 ? (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">No fields added yet. Click "Add Field" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <Card key={field.id}>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <div className="space-y-2 flex-1 mr-4">
                                  <Label htmlFor={`field-label-${field.id}`}>Field Label</Label>
                                  <Input
                                    id={`field-label-${field.id}`}
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                    placeholder="Enter field label"
                                  />
                                </div>
                                <div className="space-y-2 w-1/3">
                                  <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
                                  <Select
                                    value={field.type}
                                    onValueChange={(value) =>
                                      updateField(field.id, {
                                        type: value as "text" | "textarea" | "select" | "radio" | "checkbox",
                                      })
                                    }
                                  >
                                    <SelectTrigger id={`field-type-${field.id}`}>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Short Text</SelectItem>
                                      <SelectItem value="textarea">Long Text</SelectItem>
                                      <SelectItem value="select">Dropdown</SelectItem>
                                      <SelectItem value="radio">Radio Buttons</SelectItem>
                                      <SelectItem value="checkbox">Checkboxes</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                                <div className="space-y-2">
                                  <Label>Options</Label>
                                  <div className="space-y-2">
                                    {field.options && field.options.length > 0 ? (
                                      <div className="space-y-2">
                                        {field.options.map((option, index) => (
                                          <div key={index} className="flex items-center">
                                            <Input
                                              value={option}
                                              onChange={(e) => {
                                                const newOptions = [...(field.options || [])]
                                                newOptions[index] = e.target.value
                                                updateField(field.id, { options: newOptions })
                                              }}
                                              className="flex-1 mr-2"
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => {
                                                const newOptions = [...(field.options || [])].filter(
                                                  (_, i) => i !== index,
                                                )
                                                updateField(field.id, { options: newOptions })
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No options added yet.</p>
                                    )}
                                    <div className="flex items-center">
                                      <Input
                                        placeholder="Add new option"
                                        value={field.newOption || ""}
                                        onChange={(e) => updateField(field.id, { newOption: e.target.value })}
                                        className="flex-1 mr-2"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          if (field.newOption?.trim()) {
                                            const newOptions = [...(field.options || []), field.newOption.trim()]
                                            updateField(field.id, { options: newOptions, newOption: "" })
                                          }
                                        }}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`field-required-${field.id}`}
                                    checked={field.required}
                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <Label htmlFor={`field-required-${field.id}`}>Required field</Label>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeField(field.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="voting" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Voting Options</Label>
                    <p className="text-sm text-muted-foreground">Add options for community members to vote on</p>

                    {options.length > 0 ? (
                      <div className="space-y-2 mt-4">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center">
                            <div className="flex-1 p-2 border rounded-md bg-muted">{option}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(index)}
                              className="ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border rounded-md">
                        <p className="text-muted-foreground">No options added yet. Add options below.</p>
                      </div>
                    )}

                    <div className="flex items-center mt-4">
                      <Input
                        placeholder="Enter a voting option"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button type="button" variant="outline" onClick={addOption}>
                        Add
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/forms")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Form"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  )
}
