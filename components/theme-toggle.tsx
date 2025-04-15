"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug the current theme
  useEffect(() => {
    if (mounted) {
      console.log("Current theme:", theme)
    }
  }, [mounted, theme])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  // Explicitly toggle between 'light' and 'dark' only
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
