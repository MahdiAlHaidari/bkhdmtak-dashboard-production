import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api-constants"
import type { PaginatedResponse, User, UserListParams } from "./types"

export async function getUsers(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
  const token = getAuthToken()
  const queryParams = new URLSearchParams()

  if (params.pageSize) queryParams.append("PaginationRequest.PageSize", params.pageSize.toString())
  if (params.pageNumber) queryParams.append("PaginationRequest.PageNumber", params.pageNumber.toString())
  if (params.name) queryParams.append("Name", params.name)
  if (params.phoneNumber) queryParams.append("PhoneNumber", params.phoneNumber)

  const queryString = queryParams.toString()
  const endpoint = `${API_BASE_URL}/Admin/User${queryString ? `?${queryString}` : ""}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`)
  }

  return response.json()
}

export async function getUserById(id: number): Promise<User> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/User/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user details: ${response.status}`)
  }

  return response.json()
}

export async function updateUserBlockedStatus(id: number, isBlocked: boolean): Promise<void> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/User/${id}/SetBlock?isBlocked=${isBlocked}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to update user blocked status: ${response.status}`)
  }

  return
}
