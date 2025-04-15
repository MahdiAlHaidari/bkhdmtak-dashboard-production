import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api-constants"
import type { PaginatedResponse, Payment, PaymentDetails, PaymentListParams } from "./types"

export async function getPayments(params: PaymentListParams = {}): Promise<PaginatedResponse<Payment>> {
  const token = getAuthToken()
  const queryParams = new URLSearchParams()

  if (params.pageSize) queryParams.append("PaginationRequest.PageSize", params.pageSize.toString())
  if (params.pageNumber) queryParams.append("PaginationRequest.PageNumber", params.pageNumber.toString())
  if (params.status) queryParams.append("Status", params.status)

  const queryString = queryParams.toString()
  const endpoint = `${API_BASE_URL}/Admin/Payment${queryString ? `?${queryString}` : ""}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch payments: ${response.status}`)
  }

  return response.json()
}

export async function getPaymentById(id: number): Promise<PaymentDetails> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Payment/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch payment details: ${response.status}`)
  }

  return response.json()
}

export async function updatePaymentsToPaid(paymentIds: number[]): Promise<void> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Payment/UpdateToPaid`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentIds),
  })

  if (!response.ok) {
    throw new Error(`Failed to update payments to paid: ${response.status}`)
  }

  return
}

export async function exportPaymentsAsExcel(): Promise<Blob> {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/Admin/Payment/Export`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to export payments: ${response.status}`)
  }

  return await response.blob()
}
