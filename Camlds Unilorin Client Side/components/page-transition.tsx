"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

// Create a separate component that uses useSearchParams
function PageTransitionInner() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true)
    }

    const handleComplete = () => {
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }

    // Listen for route changes
    window.addEventListener("beforeunload", handleStart)

    // Simulate route change for demonstration
    handleStart()
    handleComplete()

    return () => {
      window.removeEventListener("beforeunload", handleStart)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

// Main component that wraps the inner component with Suspense
export function PageTransition() {
  return (
    <Suspense fallback={null}>
      <PageTransitionInner />
    </Suspense>
  )
}
