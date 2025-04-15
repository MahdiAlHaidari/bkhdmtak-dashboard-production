// Interface for login response
export interface LoginResponse {
  user: {
    id: number
    name: string
    phoneNumber: string
    isSuperAdmin: boolean
  }
  token: string
}

// Interface for login credentials
export interface LoginCredentials {
  phoneNumber: string
  password: string
}

// Function to login user
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch("https://prod-backend.bkhdmtak.app/Admin/Auth/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      // Try to parse error response
      const errorData = await response.json()
      throw new Error(errorData.detail || "Login failed")
    }

    const data = await response.json()

    // Store token in localStorage
    localStorage.setItem("auth_token", data.token)

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export function getAuthToken(): string | null {
  // Check localStorage for token
  return localStorage.getItem("auth_token")
}

export function isAuthenticated(): boolean {
  // Check if we have a token
  return !!getAuthToken()
}

// Logout function to clear stored token
export function logoutUser(): void {
  // Clear the auth token from localStorage
  localStorage.removeItem("authToken")

  // Clear any other auth-related data that might be stored
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("userData")
  sessionStorage.removeItem("authToken")

  // Clear any cookies related to authentication (if applicable)
  document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
}

// Parse JWT token to get user information
export function parseToken(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error parsing token:", error)
    return null
  }
}

// Get user information from the token
export function getUserInfo() {
  const token = getAuthToken()
  if (!token) return null

  const parsedToken = parseToken(token)
  if (!parsedToken) return null

  return {
    id: parsedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
    role: parsedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    sid: parsedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"],
    exp: parsedToken.exp,
    iat: parsedToken.iat,
  }
}
