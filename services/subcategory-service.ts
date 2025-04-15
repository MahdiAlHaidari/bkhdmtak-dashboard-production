import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api-constants"
import type {
  CreateSubCategoryRequest,
  SubCategory,
  SubCategoryDetails,
  SubCategoryListParams,
  UpdateSubCategoryRequest,
} from "./types"

export async function getSubCategories(params: SubCategoryListParams = {}): Promise<SubCategory[]> {
  const token = getAuthToken()
  const queryParams = new URLSearchParams()

  if (params.nameAr) queryParams.append("NameAr", params.nameAr)
  if (params.nameEn) queryParams.append("NameEn", params.nameEn)
  if (params.colorCode) queryParams.append("ColorCode", params.colorCode)
  if (params.categoryId) queryParams.append("CategoryId", params.categoryId.toString())

  const queryString = queryParams.toString()
  const endpoint = `${API_BASE_URL}/Admin/SubCategory${queryString ? `?${queryString}` : ""}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch subcategories: ${response.status}`)
  }

  return response.json()
}

export async function getSubCategoryById(id: number): Promise<SubCategoryDetails> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/SubCategory/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch subcategory: ${response.status}`)
  }

  return response.json()
}

export async function createSubCategory(data: CreateSubCategoryRequest): Promise<SubCategory> {
  const token = getAuthToken()

  const formData = new FormData()
  formData.append("NameAr", data.nameAr)
  formData.append("NameEn", data.nameEn)
  formData.append("DescriptionAr", data.descriptionAr)
  formData.append("DescriptionEn", data.descriptionEn)
  if (data.markerImage) formData.append("MarkerImage", data.markerImage)
  if (data.image) formData.append("Image", data.image)
  formData.append("ColorCode", data.colorCode)
  formData.append("CategoryId", data.categoryId.toString())

  const response = await fetch(`${API_BASE_URL}/Admin/SubCategory`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to create subcategory: ${response.status}`)
  }

  return response.json()
}

export async function updateSubCategory(id: number, data: UpdateSubCategoryRequest): Promise<SubCategory> {
  const token = getAuthToken()

  const formData = new FormData()
  formData.append("NameAr", data.nameAr)
  formData.append("NameEn", data.nameEn)
  formData.append("DescriptionAr", data.descriptionAr)
  formData.append("DescriptionEn", data.descriptionEn)
  if (data.markerImage) formData.append("MarkerImage", data.markerImage)
  if (data.image) formData.append("Image", data.image)
  formData.append("ColorCode", data.colorCode)
  formData.append("CategoryId", data.categoryId.toString())

  const response = await fetch(`${API_BASE_URL}/Admin/SubCategory/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to update subcategory: ${response.status}`)
  }

  return response.json()
}

export async function deleteSubCategory(id: number): Promise<void> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/SubCategory/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete subcategory: ${response.status}`)
  }

  // 204 No Content response doesn't need to be parsed
  return
}
