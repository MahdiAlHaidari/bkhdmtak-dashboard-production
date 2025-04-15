"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: any // Changed type to 'any' to handle potential non-function value
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  // Function to handle the reset action safely
  const handleReset = () => {
    // Check if reset is a function before calling it
    if (typeof reset === "function") {
      try {
        reset()
      } catch (e) {
        console.error("Error calling reset:", e)
        window.location.reload()
      }
    } else {
      // If reset is not a function, just reload the page
      console.warn("Reset is not a function, reloading page instead")
      window.location.reload()
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message || "An unexpected error occurred"}</p>
      <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700">
        Try again
      </Button>
    </div>
  )
}
