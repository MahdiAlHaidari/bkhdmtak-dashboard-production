import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api-constants"
import type { PaginatedResponse, Service, ServiceDetails, ServiceListParams } from "./types"

export async function getServices(params: ServiceListParams = {}): Promise<PaginatedResponse<Service>> {
  const token = getAuthToken()
  const queryParams = new URLSearchParams()

  if (params.pageSize) queryParams.append("PaginationRequest.PageSize", params.pageSize.toString())
  if (params.pageNumber) queryParams.append("PaginationRequest.PageNumber", params.pageNumber.toString())
  if (params.providerId) queryParams.append("ProviderId", params.providerId.toString())
  if (params.categoryId) queryParams.append("CategoryId", params.categoryId.toString())
  if (params.subCategoryId) queryParams.append("SubCategoryId", params.subCategoryId.toString())
  if (params.isApproved !== undefined) queryParams.append("IsApproved", params.isApproved.toString())

  const queryString = queryParams.toString()
  const endpoint = `${API_BASE_URL}/Admin/Service${queryString ? `?${queryString}` : ""}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch services: ${response.status}`)
  }

  return response.json()
}

export async function getServiceById(id: number): Promise<ServiceDetails> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Service/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch service details: ${response.status}`)
  }

  return response.json()
}
