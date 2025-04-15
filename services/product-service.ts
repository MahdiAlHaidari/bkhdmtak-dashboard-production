import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api-constants"
import type { PaginatedResponse, Product, ProductDetails, ProductListParams } from "./types"

export async function getProducts(params: ProductListParams = {}): Promise<PaginatedResponse<Product>> {
  const token = getAuthToken()
  const queryParams = new URLSearchParams()

  if (params.pageSize) queryParams.append("PaginationRequest.PageSize", params.pageSize.toString())
  if (params.pageNumber) queryParams.append("PaginationRequest.PageNumber", params.pageNumber.toString())
  if (params.providerId) queryParams.append("ProviderId", params.providerId.toString())
  if (params.categoryId) queryParams.append("CategoryId", params.categoryId.toString())
  if (params.subCategoryId) queryParams.append("SubCategoryId", params.subCategoryId.toString())
  if (params.isApproved !== undefined) queryParams.append("IsApproved", params.isApproved.toString())
  if (params.keyword) queryParams.append("Keyword", params.keyword)

  const queryString = queryParams.toString()
  const endpoint = `${API_BASE_URL}/Admin/Product${queryString ? `?${queryString}` : ""}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`)
  }

  return response.json()
}

export async function getProductById(id: number): Promise<ProductDetails> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Product/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch product details: ${response.status}`)
  }

  return response.json()
}
