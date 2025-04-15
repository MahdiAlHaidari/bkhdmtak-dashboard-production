import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api-constants"
import type { Category, CategoryListParams, CreateCategoryRequest, UpdateCategoryRequest } from "./types"

export async function getCategories(params: CategoryListParams = {}): Promise<Category[]> {
  const token = getAuthToken()
  const queryParams = new URLSearchParams()

  if (params.nameAr) queryParams.append("NameAr", params.nameAr)
  if (params.nameEn) queryParams.append("NameEn", params.nameEn)
  if (params.colorCode) queryParams.append("ColorCode", params.colorCode)

  const queryString = queryParams.toString()
  const endpoint = `${API_BASE_URL}/Admin/Category${queryString ? `?${queryString}` : ""}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`)
  }

  return response.json()
}

export async function getCategoryById(id: number): Promise<Category> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Category/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch category: ${response.status}`)
  }

  return response.json()
}

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const token = getAuthToken()

  const formData = new FormData()
  formData.append("NameAr", data.nameAr)
  formData.append("NameEn", data.nameEn)
  formData.append("DescriptionAr", data.descriptionAr)
  formData.append("DescriptionEn", data.descriptionEn)
  if (data.markerImage) formData.append("MarkerImage", data.markerImage)
  if (data.image) formData.append("Image", data.image)
  formData.append("ColorCode", data.colorCode)
  formData.append("PlatformDiscount", data.platformDiscount.toString())

  const response = await fetch(`${API_BASE_URL}/Admin/Category`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to create category: ${response.status}`)
  }

  return response.json()
}

export async function updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
  const token = getAuthToken()

  const formData = new FormData()
  formData.append("NameAr", data.nameAr)
  formData.append("NameEn", data.nameEn)
  formData.append("DescriptionAr", data.descriptionAr)
  formData.append("DescriptionEn", data.descriptionEn)
  if (data.markerImage) formData.append("MarkerImage", data.markerImage)
  if (data.image) formData.append("Image", data.image)
  formData.append("ColorCode", data.colorCode)
  formData.append("PlatformDiscount", data.platformDiscount.toString())

  const response = await fetch(`${API_BASE_URL}/Admin/Category/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to update category: ${response.status}`)
  }

  return response.json()
}

export async function deleteCategory(id: number): Promise<void> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Category/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete category: ${response.status}`)
  }

  // 204 No Content response doesn't need to be parsed
  return
}
