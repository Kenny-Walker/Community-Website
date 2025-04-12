"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calendar, Users, FileText, Mail, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useForms, type Form } from "@/lib/forms-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { formatDistanceToNow } from "date-fns"

// X.com logo component
const XLogo = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Form Marquee component
const FormMarquee = ({ forms }: { forms: Form[] }) => {
  const [currentFormIndex, setCurrentFormIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (forms.length <= 1) return

    const interval = setInterval(() => {
      setCurrentFormIndex((prev) => (prev + 1) % forms.length)
    }, 10000) // Rotate every 10 seconds

    return () => clearInterval(interval)
  }, [forms.length])

  if (forms.length === 0 || !isVisible) return null

  const currentForm = forms[currentFormIndex]
  const deadline = new Date(currentForm.deadline)
  const timeRemaining = formatDistanceToNow(deadline, { addSuffix: false })

  // Create the content that will be displayed in the marquee
  const marqueeContent = `${currentForm.title} • Closes in ${timeRemaining} • ${currentForm.title} • Closes in ${timeRemaining}`

  return (
    <div className="bg-primary text-primary-foreground py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="marquee-container flex-1 mr-4">
          <div className="flex items-center">
            <div className="marquee-content">{marqueeContent}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/forms/${currentForm.id}`}>
            <Button variant="secondary" size="sm">
              Open Form
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={() => setIsVisible(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { applicationsOpen, user } = useAuth()
  const { getActiveForms, hasUserSubmitted } = useForms()

  // Get active forms that the user hasn't submitted yet
  const activeForms = user ? getActiveForms().filter((form) => !hasUserSubmitted(form.id, user.id)) : []

  // Only show the alert if applications are open and the user is logged in but not already applied
  const showApplicationAlert =
    applicationsOpen &&
    user &&
    !user.position &&
    !user.appliedForCoreTeam &&
    !user.approvedForCoreTeam &&
    !user.rejectedForCoreTeam

  return (
    <>
      <Navbar />

      {user && activeForms.length > 0 && <FormMarquee forms={activeForms} />}

      <div className="container py-8 md:py-12">
        {showApplicationAlert && (
          <Alert className="mb-6 bg-primary text-primary-foreground">
            <Info className="h-4 w-4" />
            <AlertTitle>Core Team Applications Open!</AlertTitle>
            <AlertDescription>
              Applications to join the CAMLDS core team are now open.
              <Link href="/profile" className="ml-2 underline font-medium">
                Apply now
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Welcome to CAMLDS Unilorin
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Join our vibrant tech community and connect with like-minded individuals passionate about technology
                  and innovation.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button size="lg">Join Now</Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline" size="lg">
                    Explore Events
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <Calendar className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Events</CardTitle>
                  <CardDescription>Discover and participate in tech events, workshops, and meetups.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Stay updated with the latest events in the tech community and register to attend.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/events">
                    <Button variant="ghost" size="sm">
                      View Events <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Posts</CardTitle>
                  <CardDescription>Read and engage with insightful tech articles and discussions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Explore posts on various tech topics shared by community members and administrators.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/posts">
                    <Button variant="ghost" size="sm">
                      Read Posts <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Community</CardTitle>
                  <CardDescription>Connect with members of the CAMLDS Unilorin tech community.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Browse through our community members and build your network.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/community">
                    <Button variant="ghost" size="sm">
                      View Members <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <ExternalLink className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Connect With Us</CardTitle>
                  <CardDescription>Follow us on social media and stay connected.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li>
                      <a
                        href="https://x.com/camlds_unilorin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <XLogo className="h-5 w-5" />
                        <span>@camlds_unilorin</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/camlds-unilorin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <FileText className="h-5 w-5" />
                        <span>@camlds-unilorin</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:camlds.unilorin@gmail.com"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-5 w-5" />
                        <span>camlds.unilorin@gmail.com</span>
                      </a>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://linktr.ee/camlds_unilorin" target="_blank" rel="noopener noreferrer">
                      All Links <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
