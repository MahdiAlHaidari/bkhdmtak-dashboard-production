"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ErrorDisplay } from "@/components/ui/error-display"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Eye, FileSpreadsheet, Loader2 } from "lucide-react"
import { PaymentDetailsDialog } from "./payment-details-dialog"
import type { Payment } from "@/services/types"
import { getPayments, updatePaymentsToPaid, exportPaymentsAsExcel } from "@/services/payment-service"

// Define PaymentStatus enum here since it's used in this component
export enum PaymentStatus {
  Created = "CREATED",
  FormShowed = "FORM_SHOWED",
  ThreeDsMethodCallRequired = "THREE_DS_METHOD_CALL_REQUIRED",
  AuthenticationRequired = "AUTHENTICATION_REQUIRED",
  AuthenticationStarted = "AUTHENTICATION_STARTED",
  Authenticated = "AUTHENTICATED",
  AuthenticationFailed = "AUTHENTICATION_FAILED",
  Initialized = "INITIALIZED",
  Started = "STARTED",
  Success = "SUCCESS",
  Paid = "PAID",
  Failed = "FAILED",
  Error = "ERROR",
  Expired = "EXPIRED",
}

export function PaymentsList() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedPayments, setSelectedPayments] = useState<number[]>([])
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState<Payment | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const pageNumber = Number(searchParams.get("page") || "1")
  const pageSize = 10
  const status = searchParams.get("status") || ""

  const [statusFilter, setStatusFilter] = useState(status)

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true)
        setError(null)

        const params: { pageNumber: number; pageSize: number; status?: string } = {
          pageNumber,
          pageSize,
        }

        if (status && status !== "all") {
          params.status = status
        }

        const response = await getPayments(params)
        setPayments(response.items)
        setTotalPages(response.totalPages)
        setTotalCount(response.totalCount)
        // Clear selected payments when data changes
        setSelectedPayments([])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching payments")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [pageNumber, pageSize, status])

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)

    // Update URL with new status filter
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    params.set("page", "1") // Reset to first page when filter changes
    router.push(`/dashboard/payments?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/dashboard/payments?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PaymentStatus.Success:
      case PaymentStatus.Paid:
        return <Badge className="bg-green-500">{status === PaymentStatus.Success ? "Success" : "Paid"}</Badge>
      case PaymentStatus.Failed:
      case PaymentStatus.Error:
        return <Badge className="bg-red-500">Failed</Badge>
      case PaymentStatus.Expired:
        return <Badge className="bg-yellow-500">Expired</Badge>
      case PaymentStatus.Created:
      case PaymentStatus.FormShowed:
      case PaymentStatus.ThreeDsMethodCallRequired:
      case PaymentStatus.AuthenticationRequired:
      case PaymentStatus.AuthenticationStarted:
      case PaymentStatus.Authenticated:
      case PaymentStatus.Initialized:
      case PaymentStatus.Started:
        return <Badge className="bg-blue-500">Processing</Badge>
      case PaymentStatus.AuthenticationFailed:
        return <Badge className="bg-orange-500">Auth Failed</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const togglePaymentSelection = (paymentId: number, event: React.MouseEvent) => {
    // Stop propagation to prevent row click from triggering
    event.stopPropagation()

    setSelectedPayments((prev) =>
      prev.includes(paymentId) ? prev.filter((id) => id !== paymentId) : [...prev, paymentId],
    )
  }

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.filter((p) => p.status === PaymentStatus.Success).length) {
      // If all SUCCESS payments are selected, deselect all
      setSelectedPayments([])
    } else {
      // Otherwise, select all SUCCESS payments
      setSelectedPayments(
        payments.filter((payment) => payment.status === PaymentStatus.Success).map((payment) => payment.id),
      )
    }
  }

  const handleUpdateToPaid = async () => {
    if (selectedPayments.length === 0) {
      toast({
        title: "No payments selected",
        description: "Please select at least one payment with SUCCESS status to update.",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdatingStatus(true)
      await updatePaymentsToPaid(selectedPayments)

      toast({
        title: "Payments updated successfully",
        description: `${selectedPayments.length} payment(s) updated from SUCCESS to PAID.`,
        variant: "default",
      })

      // Refresh the payments list
      const params: { pageNumber: number; pageSize: number; status?: string } = {
        pageNumber,
        pageSize,
      }

      if (status && status !== "all") {
        params.status = status
      }

      const response = await getPayments(params)
      setPayments(response.items)
      setSelectedPayments([])
    } catch (err) {
      toast({
        title: "Failed to update payments",
        description: err instanceof Error ? err.message : "An error occurred while updating payment statuses",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setExporting(true)
      const blob = await exportPaymentsAsExcel()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url

      // Set the file name
      const now = new Date()
      const formattedDate = now.toISOString().split("T")[0] // YYYY-MM-DD format
      link.download = `payments-export-${formattedDate}.xlsx`

      // Append to the document, click it, and then remove it
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Release the URL object
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Payments data has been exported to Excel.",
        variant: "default",
      })
    } catch (err) {
      toast({
        title: "Export failed",
        description: err instanceof Error ? err.message : "An error occurred while exporting payments",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const viewPaymentDetails = (payment: Payment) => {
    console.log("Opening details for payment:", payment)
    setSelectedPaymentForDetails(payment)
    setDetailsDialogOpen(true)
  }

  // Count how many SUCCESS payments are available
  const successPaymentsCount = payments.filter((p) => p.status === PaymentStatus.Success).length

  if (error) {
    return <ErrorDisplay message={error} />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Payments</CardTitle>
              <CardDescription>Manage and view payment transactions</CardDescription>
            </div>

            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={exporting || loading || payments.length === 0}
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to Excel
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={PaymentStatus.Success}>Success</SelectItem>
                  <SelectItem value={PaymentStatus.Paid}>Paid</SelectItem>
                  <SelectItem value={PaymentStatus.Failed}>Failed</SelectItem>
                  <SelectItem value={PaymentStatus.Error}>Error</SelectItem>
                  <SelectItem value={PaymentStatus.Expired}>Expired</SelectItem>
                  <SelectItem value={PaymentStatus.Created}>Created</SelectItem>
                  <SelectItem value={PaymentStatus.Started}>Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {successPaymentsCount > 0 && (
            <div className="mb-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Bulk Update Available</AlertTitle>
                <AlertDescription>
                  You can select multiple payments with SUCCESS status and update them to PAID status.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedPayments.length > 0 && selectedPayments.length === successPaymentsCount}
                    onCheckedChange={handleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {selectedPayments.length === 0
                      ? "Select all SUCCESS payments"
                      : `Selected ${selectedPayments.length} of ${successPaymentsCount} SUCCESS payments`}
                  </label>
                </div>

                <Button
                  onClick={handleUpdateToPaid}
                  disabled={selectedPayments.length === 0 || updatingStatus}
                  className="ml-auto"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Update to PAID
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No payments found</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {successPaymentsCount > 0 && <TableHead className="w-[50px]">Select</TableHead>}
                      <TableHead>ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        {successPaymentsCount > 0 && (
                          <TableCell>
                            {payment.status === PaymentStatus.Success && (
                              <Checkbox
                                checked={selectedPayments.includes(payment.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedPayments((prev) => [...prev, payment.id])
                                  } else {
                                    setSelectedPayments((prev) => prev.filter((id) => id !== payment.id))
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.orderId}</TableCell>
                        <TableCell>{payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>{payment.createdAt ? formatDate(payment.createdAt) : "N/A"}</TableCell>
                        <TableCell>{payment.updatedAt ? formatDate(payment.updatedAt) : "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => viewPaymentDetails(payment)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => pageNumber > 1 && handlePageChange(pageNumber - 1)}
                        className={pageNumber <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageToShow =
                        pageNumber <= 3 ? i + 1 : pageNumber >= totalPages - 2 ? totalPages - 4 + i : pageNumber - 2 + i

                      if (pageToShow > 0 && pageToShow <= totalPages) {
                        return (
                          <PaginationItem key={pageToShow}>
                            <PaginationLink
                              isActive={pageNumber === pageToShow}
                              onClick={() => handlePageChange(pageToShow)}
                            >
                              {pageToShow}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      }
                      return null
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => pageNumber < totalPages && handlePageChange(pageNumber + 1)}
                        className={pageNumber >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <PaymentDetailsDialog
        payment={selectedPaymentForDetails}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </>
  )
}
