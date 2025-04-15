import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api-constants"
import type { PaginatedResponse, Provider, ProviderListParams, ProviderWithCategories } from "./types"

export async function getProviders(params: ProviderListParams = {}): Promise<PaginatedResponse<Provider>> {
  const token = getAuthToken()
  const queryParams = new URLSearchParams()

  if (params.pageSize) queryParams.append("PaginationRequest.PageSize", params.pageSize.toString())
  if (params.pageNumber) queryParams.append("PaginationRequest.PageNumber", params.pageNumber.toString())
  if (params.name) queryParams.append("Name", params.name)
  if (params.phoneNumber) queryParams.append("PhoneNumber", params.phoneNumber)
  if (params.active !== undefined) queryParams.append("Active", params.active.toString())
  if (params.available !== undefined) queryParams.append("Available", params.available.toString())

  const queryString = queryParams.toString()
  const endpoint = `${API_BASE_URL}/Admin/Provider${queryString ? `?${queryString}` : ""}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch providers: ${response.status}`)
  }

  return response.json()
}

export async function updateProviderStatus(id: number, isActive: boolean): Promise<void> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Provider/${id}/SetActive?isActive=${isActive}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to update provider status: ${response.status}`)
  }

  return
}

export async function getProviderWithCategories(id: number): Promise<ProviderWithCategories> {
  const token = getAuthToken()

  // Updated endpoint to use the new route
  const response = await fetch(`${API_BASE_URL}/Admin/ProviderCategory/GetProviderWithCategories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch provider with categories: ${response.status}`)
  }

  return response.json()
}

export async function updateProviderCategoryStatus(
  providerId: number,
  categoryId: number,
  newStatus: boolean,
): Promise<void> {
  const token = getAuthToken()

  // Updated endpoint to use the new route and PATCH method
  const response = await fetch(`${API_BASE_URL}/Admin/ProviderCategory`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      providerId,
      categoryId,
      newStatus,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update provider category status: ${response.status}`)
  }

  return
}
