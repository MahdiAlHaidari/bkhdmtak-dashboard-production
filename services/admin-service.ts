"use client"

import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api-constants"
import type { AdminInfo, DashboardData } from "./types"

export interface AdminListParams {
  isSuperAdmin?: boolean
}

export interface CreateAdminRequest {
  name: string
  phoneNumber: string
  password: string
  isSuperAdmin: boolean
}

export async function getAdminInfo(): Promise<AdminInfo> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Auth/Me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch admin info: ${response.status}`)
  }

  return response.json()
}

export async function getAdmins(params: AdminListParams = {}): Promise<AdminInfo[]> {
  const token = getAuthToken()
  const queryParams = new URLSearchParams()

  if (params.isSuperAdmin !== undefined) {
    queryParams.append("IsSuperAdmin", params.isSuperAdmin.toString())
  }

  const queryString = queryParams.toString()
  const endpoint = `${API_BASE_URL}/Admin/Admin${queryString ? `?${queryString}` : ""}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch admins: ${response.status}`)
  }

  return response.json()
}

export async function createAdmin(data: CreateAdminRequest): Promise<{ id: number }> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Admin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid admin data provided")
    } else if (response.status === 401) {
      throw new Error("Unauthorized. Please log in again.")
    } else {
      throw new Error(`Failed to create admin: ${response.status}`)
    }
  }

  return response.json()
}

export async function deleteAdmin(id: number): Promise<void> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Admin/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Bad request: Invalid admin ID or format")
    } else if (response.status === 401) {
      throw new Error("Unauthorized: You don't have permission to delete this admin")
    } else if (response.status === 404) {
      throw new Error("Admin not found: The specified admin does not exist")
    } else {
      throw new Error(`Failed to delete admin: ${response.status}`)
    }
  }

  // 204 No Content response doesn't need to be parsed
  return
}

export async function updateAdminRole(id: number, isSuperAdmin: boolean): Promise<void> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Admin/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isSuperAdmin }),
  })

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Bad request: Invalid admin ID or role data")
    } else if (response.status === 401) {
      throw new Error("Unauthorized: You don't have permission to update this admin's role")
    } else if (response.status === 404) {
      throw new Error("Admin not found: The specified admin does not exist")
    } else {
      throw new Error(`Failed to update admin role: ${response.status}`)
    }
  }

  // 204 No Content response doesn't need to be parsed
  return
}

export async function updateAdminPassword(id: number, newPassword: string): Promise<void> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Admin/${id}/UpdatePassword`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newPassword }),
  })

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Bad request: Invalid password format")
    } else if (response.status === 401) {
      throw new Error("Unauthorized: You don't have permission to update this admin's password")
    } else if (response.status === 404) {
      throw new Error("Admin not found: The specified admin does not exist")
    } else {
      throw new Error(`Failed to update admin password: ${response.status}`)
    }
  }

  // 204 No Content response doesn't need to be parsed
  return
}

export async function getDashboardData(): Promise<DashboardData> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.status}`)
  }

  return response.json()
}
