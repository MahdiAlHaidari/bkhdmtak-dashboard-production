"use client"

import { useEffect, useState } from "react"

export function useNarrowScreen() {
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const checkIfNarrow = () => {
      setIsNarrow(window.innerWidth < 1200)
    }

    // Initial check
    checkIfNarrow()

    // Add event listener
    window.addEventListener("resize", checkIfNarrow)

    // Clean up
    return () => window.removeEventListener("resize", checkIfNarrow)
  }, [])

  return isNarrow
}
