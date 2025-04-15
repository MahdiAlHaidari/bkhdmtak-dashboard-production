import { getAuthToken, logoutUser } from "./auth"
import { API_BASE_URL } from "./api-constants"

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers = new Headers(fetchOptions.headers)

  // Add authorization header if not skipping auth
  if (!skipAuth) {
    const token = getAuthToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  // Add content-type if not already set
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    })

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      console.log("Unauthorized access detected, logging out user")

      // Clear token and all auth data
      logoutUser()

      // Add a small delay to ensure logout is complete before redirect
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Use window.location for hard redirect to ensure context is reset
      window.location.href = "/login?session=expired"

      throw new Error("Session expired. Please log in again.")
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const statusCode = response.status
      let errorMessage = `API error: ${statusCode} ${response.statusText}`

      try {
        const errorData = await response.json()
        if (errorData.message || errorData.detail) {
          errorMessage = errorData.message || errorData.detail
        }
      } catch (parseError) {
        // If we can't parse the error as JSON, just use the status text
        console.error("Error parsing error response:", parseError)
      }

      const error = new Error(errorMessage) as Error & { statusCode?: number }
      error.statusCode = statusCode
      throw error
    }

    // Parse JSON response
    const data = await response.json()
    return data as T
  } catch (error) {
    // If it's a network error (like CORS or server unreachable)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const networkError = new Error("Network error: Unable to connect to the server")
      throw networkError
    }

    // Re-throw the error
    throw error
  }
}

// Convenience methods for common HTTP methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data) 
    }),
    
  put: <T>(endpoint: string, data: any, options?: RequestOptions) => 
    apiClient<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    
  patch: <T>(endpoint: string, data: any, options?: RequestOptions) => 
    apiClient<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
