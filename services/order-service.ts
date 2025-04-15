"use client"

import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api-constants"
import type { Order, PaginatedResponse } from "./types"

export interface OrderListParams {
  pageNumber?: number
  pageSize?: number
  userId?: number
  providerId?: number
  orderStatus?: number
  fromDate?: string
  toDate?: string
}

export async function getOrders(params: OrderListParams = {}): Promise<PaginatedResponse<Order>> {
  const token = getAuthToken()
  const queryParams = new URLSearchParams()

  if (params.pageNumber !== undefined) {
    queryParams.append("PageNumber", params.pageNumber.toString())
  }
  if (params.pageSize !== undefined) {
    queryParams.append("PageSize", params.pageSize.toString())
  }
  if (params.userId !== undefined) {
    queryParams.append("UserId", params.userId.toString())
  }
  if (params.providerId !== undefined) {
    queryParams.append("ProviderId", params.providerId.toString())
  }
  if (params.orderStatus !== undefined) {
    queryParams.append("OrderStatus", params.orderStatus.toString())
  }
  if (params.fromDate) {
    queryParams.append("FromDate", params.fromDate)
  }
  if (params.toDate) {
    queryParams.append("ToDate", params.toDate)
  }

  const queryString = queryParams.toString()
  const endpoint = `${API_BASE_URL}/Admin/Order${queryString ? `?${queryString}` : ""}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.status}`)
  }

  return response.json()
}

export async function getRecentBookings(params: OrderListParams = {}): Promise<PaginatedResponse<Order>> {
  return getOrders({
    pageNumber: params.pageNumber || 1,
    pageSize: params.pageSize || 5,
  })
}

export async function getOrderById(id: number): Promise<Order> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Order/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch order: ${response.status}`)
  }

  return response.json()
}

export async function updateOrderStatus(id: number, status: number): Promise<void> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Order/${id}/Status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update order status: ${response.status}`)
  }

  return
}
