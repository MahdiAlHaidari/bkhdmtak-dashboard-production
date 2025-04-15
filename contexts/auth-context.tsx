"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { isAuthenticated, loginUser, logoutUser, type LoginCredentials } from "@/lib/auth"
import { useRouter } from "next/navigation"
import type { AdminInfo } from "@/services/types"
import { getAdminInfo } from "@/services/admin-service"

interface AuthContextType {
  isAuthenticated: boolean
  user: AdminInfo | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AdminInfo | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await loginUser(credentials)
      setUser(response.user)
      setAuthenticated(true)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  // Logout function
  const logout = () => {
    logoutUser()
    setUser(null)
    setAuthenticated(false)
    router.push("/login")
  }

  // Update the useEffect in AuthProvider to handle 401 errors consistently
  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const authStatus = isAuthenticated()
      setAuthenticated(authStatus)

      if (authStatus) {
        try {
          // Fetch real admin data from the API
          const adminInfo = await getAdminInfo()
          setUser(adminInfo)
        } catch (error) {
          console.error("Error fetching admin info:", error)
          setUser(null)

          // If we get an error fetching user info, we should log out
          // This handles cases where the token might be invalid or expired
          if ((error as any)?.statusCode === 401) {
            console.log("401 error in auth context, logging out user")
            logout()
          }
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
