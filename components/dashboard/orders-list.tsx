"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Search, X, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
// Replace the import from barrel file with direct imports
import type { Order, OrderDetailsResponse } from "@/services/types"
import { getOrders, getOrderById } from "@/services/order-service"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getImageUrl } from "@/lib/api-constants"

// Mock data for fallback
const mockOrders = [
  {
    id: 1,
    total: 120,
    orderStatus: "Completed",
    notes: "Please deliver to the back door",
    startTime: "2025-03-14T14:00:00.000Z",
    latitude: 33.315,
    longitude: 44.366,
    address: "123 Main St, Baghdad",
    userId: 1,
    userName: "Ahmed Ali",
    providerId: 2,
    providerName: "Home Services Co.",
    customServiceOfferId: 0,
    orderProducts: [
      {
        quantity: 2,
        product: {
          id: 1,
          name: "Cleaning Supplies Kit",
          description: "Complete kit for home cleaning",
          price: 45,
          discountAmount: 0,
          category: {
            id: 1,
            nameAr: "تنظيف",
            nameEn: "Cleaning",
            descriptionAr: "",
            descriptionEn: "",
            markerImage: "",
            image: "",
            colorCode: "4CAF50",
          },
          subCategory: {
            id: 1,
            nameAr: "مستلزمات التنظيف",
            nameEn: "Cleaning Supplies",
            descriptionAr: "",
            descriptionEn: "",
            markerImage: "",
            image: "",
            colorCode: "4CAF50",
            categoryId: 1,
            categoryName: "Cleaning",
          },
          image: "",
        },
      },
    ],
    orderServices: [
      {
        quantity: 1,
        service: {
          id: 1,
          name: "Home Cleaning",
          description: "Professional home cleaning service",
          price: 80,
          discountAmount: 0.1,
          category: {
            id: 1,
            nameAr: "تنظيف",
            nameEn: "Cleaning",
            descriptionAr: "",
            descriptionEn: "",
            markerImage: "",
            image: "",
            colorCode: "4CAF50",
          },
          subCategory: {
            id: 1,
            nameAr: "تنظيف المنزل",
            nameEn: "Home Cleaning",
            descriptionAr: "",
            descriptionEn: "",
            markerImage: "",
            image: "",
            colorCode: "4CAF50",
            categoryId: 1,
            categoryName: "Cleaning",
          },
          image: "",
        },
      },
    ],
    rating: {
      rating: 4.5,
      comment: "Great service, very professional",
    },
    createdAt: "2025-03-14T10:20:03.157Z",
  },
  {
    id: 2,
    total: 85,
    orderStatus: "In Progress",
    notes: "",
    startTime: "2025-03-15T09:30:00.000Z",
    latitude: 33.312,
    longitude: 44.361,
    address: "45 Park Avenue, Baghdad",
    userId: 2,
    userName: "Mohammed Hassan",
    providerId: 3,
    providerName: "Fix-It Plumbing",
    customServiceOfferId: 0,
    orderProducts: [],
    orderServices: [
      {
        quantity: 1,
        service: {
          id: 2,
          name: "Plumbing Repair",
          description: "Expert plumbing repair service",
          price: 85,
          discountAmount: 0,
          category: {
            id: 2,
            nameAr: "سباكة",
            nameEn: "Plumbing",
            descriptionAr: "",
            descriptionEn: "",
            markerImage: "",
            image: "",
            colorCode: "2196F3",
          },
          subCategory: {
            id: 3,
            nameAr: "إصلاح السباكة",
            nameEn: "Plumbing Repair",
            descriptionAr: "",
            descriptionEn: "",
            markerImage: "",
            image: "",
            colorCode: "2196F3",
            categoryId: 2,
            categoryName: "Plumbing",
          },
          image: "",
        },
      },
    ],
    rating: null,
    createdAt: "2025-03-14T18:45:12.000Z",
  },
]

// Order status options
const ORDER_STATUS_OPTIONS = [
  { value: "1", label: "Pending" },
  { value: "2", label: "Approved" },
  { value: "3", label: "Rejected" },
  { value: "4", label: "Cancelled" },
  { value: "5", label: "In Progress" },
  { value: "6", label: "Completed" },
  { value: "7", label: "Refunded" },
]

export function OrdersList() {
  const isMobile = useIsMobile()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [orderStatus, setOrderStatus] = useState<number | undefined>(undefined)
  const [userId, setUserId] = useState<number | undefined>(undefined)
  const [dateFilter, setDateFilter] = useState<string>("")

  // Order details dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Add state for rating and status logs
  const [orderRating, setOrderRating] = useState<OrderDetailsResponse["rating"]>(null)
  const [statusLogs, setStatusLogs] = useState<OrderDetailsResponse["statusLogs"]>([])

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await getOrders({
        pageNumber,
        pageSize,
        orderStatus,
        userId,
        createdAt: dateFilter || undefined,
      })

      setOrders(response.items)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders. Please try again.")
      // Use mock data as fallback
      setOrders(mockOrders)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [pageNumber, pageSize])

  // Apply filters
  const applyFilters = () => {
    setPageNumber(1) // Reset to first page when applying filters
    fetchOrders()
  }

  // Reset filters
  const resetFilters = () => {
    setOrderStatus(undefined)
    setUserId(undefined)
    setDateFilter("")
    setPageNumber(1)
    fetchOrders()
  }

  // View order details
  const viewOrderDetails = async (order: Order) => {
    try {
      setLoading(true)
      const orderDetails = await getOrderById(order.id)
      setSelectedOrder(orderDetails.order)
      setOrderRating(orderDetails.rating)
      setStatusLogs(orderDetails.statusLogs)
      setDetailsDialogOpen(true)
    } catch (err) {
      console.error("Error fetching order details:", err)
      // Fallback to using the list item data
      setSelectedOrder(order)
      setOrderRating(null)
      setStatusLogs([])
      setDetailsDialogOpen(true)
    } finally {
      setLoading(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string | number) => {
    let statusText = ""
    let color = ""

    // Convert numeric status to string representation
    if (typeof status === "number") {
      switch (status) {
        case 1:
          statusText = "Pending"
          color = "border-yellow-500 text-yellow-500"
          break
        case 2:
          statusText = "Approved"
          color = "border-blue-500 text-blue-500"
          break
        case 3:
          statusText = "Rejected"
          color = "border-red-700 text-red-700"
          break
        case 4:
          statusText = "Cancelled"
          color = "border-red-500 text-red-500"
          break
        case 5:
          statusText = "In Progress"
          color = "border-orange-500 text-orange-500"
          break
        case 6:
          statusText = "Completed"
          color = "border-green-500 text-green-500"
          break
        case 7:
          statusText = "Refunded"
          color = "border-purple-500 text-purple-500"
          break
        default:
          statusText = `Status ${status}`
          color = "border-gray-500 text-gray-500"
      }
    } else {
      // Handle string status (for backward compatibility or mock data)
      statusText = status
      switch (status.toLowerCase()) {
        case "pending":
          color = "border-yellow-500 text-yellow-500"
          break
        case "approved":
          color = "border-blue-500 text-blue-500"
          break
        case "rejected":
          color = "border-red-700 text-red-700"
          break
        case "cancelled":
          color = "border-red-500 text-red-500"
          break
        case "in progress":
          color = "border-orange-500 text-orange-500"
          break
        case "completed":
          color = "border-green-500 text-green-500"
          break
        case "refunded":
          color = "border-purple-500 text-purple-500"
          break
        default:
          color = "border-gray-500 text-gray-500"
      }
    }

    return (
      <Badge variant="outline" className={color}>
        {statusText}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/person-2n19vN0KvHZAuFSp0P3ds1C2TsR8qx.png"
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  // Filter UI
  const filterUI = (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Select
          value={orderStatus?.toString() || "all"}
          onValueChange={(value) => {
            if (value === "all") {
              setOrderStatus(undefined)
            } else {
              setOrderStatus(Number.parseInt(value))
            }
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="User ID"
          value={userId || ""}
          onChange={(e) => setUserId(e.target.value ? Number.parseInt(e.target.value) : undefined)}
          className="flex-1"
        />
        <Input
          type="date"
          placeholder="Date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
            <Search className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button onClick={resetFilters} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )

  // Modify the mobile view return statement to not include an early return
  // Instead, we'll use conditional rendering for the content

  // Replace the entire if (isMobile) { return (...) } block with:
  const content = isMobile ? (
    <div>
      {filterUI}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Order #{order.id}</div>
              <div>{getStatusBadge(order.orderStatus)}</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Customer</div>
                <div className="mt-1">{order.user?.name || "N/A"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Provider</div>
                <div className="mt-1">{order.provider?.name || "N/A"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total</div>
                <div className="mt-1 font-medium">{order.total?.toLocaleString() || 0} IQD</div>
              </div>
              <div>
                <div className="text-muted-foreground">Date</div>
                <div className="mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</div>
              </div>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => viewOrderDetails(order)}
                disabled={loading}
              >
                {loading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-t-2 border-blue-600 mr-1"></div>
                ) : (
                  <Eye className="mr-1 h-3 w-3" />
                )}
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination for mobile */}
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{pageNumber}</PaginationLink>
            </PaginationItem>
            {pageNumber < totalPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
                disabled={pageNumber >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  ) : (
    <div>
      {filterUI}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{order.user?.name || "N/A"}</TableCell>
                <TableCell>{order.provider?.name || "N/A"}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                <TableCell className="font-medium">{order.total?.toLocaleString() || 0} IQD</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => viewOrderDetails(order)}>View details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Update status</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {orders.length} of {totalCount} orders
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = i + 1

              // If we're on a page > 3, adjust the pagination numbers
              if (pageNumber > 3 && totalPages > 5) {
                pageNum = pageNumber - 2 + i

                // Don't show page numbers greater than totalPages
                if (pageNum > totalPages) return null
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink isActive={pageNumber === pageNum} onClick={() => setPageNumber(pageNum)}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            {totalPages > 5 && pageNumber < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {totalPages > 5 && pageNumber < totalPages - 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => setPageNumber(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
                disabled={pageNumber >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )

  // Return the final component
  return (
    <div>
      {content}

      {/* Order Details Dialog - now outside the conditional rendering */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Detailed information about the order</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Basic Info */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Order #{selectedOrder.id}</h3>
                    {getStatusBadge(selectedOrder.orderStatus)}
                  </div>
                  <p className="text-muted-foreground">Created on {formatDate(selectedOrder.createdAt)}</p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Updated</p>
                      <p>{formatDate(selectedOrder.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold">{selectedOrder.total.toLocaleString()} IQD</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Customer</h4>
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{selectedOrder.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedOrder.user?.name || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">Phone: {selectedOrder.user?.phoneNumber || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">ID: {selectedOrder.user?.id || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {selectedOrder.address && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Location</h4>
                  <div className="p-3 border rounded-md">
                    <p className="font-medium">{selectedOrder.address}</p>
                    <p className="text-sm text-muted-foreground">
                      Coordinates: {selectedOrder.latitude}, {selectedOrder.longitude}
                    </p>
                  </div>
                </div>
              )}

              {/* Provider Information */}
              {selectedOrder.provider && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Provider</h4>
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{selectedOrder.provider.name?.charAt(0) || "P"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedOrder.provider.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Phone: {selectedOrder.provider.phoneNumber || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">Email: {selectedOrder.provider.email || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">ID: {selectedOrder.provider.id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Order Items</h4>

                {/* Services */}
                {selectedOrder.services && selectedOrder.services.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-md font-medium mb-2">Services</h5>
                    <div className="space-y-2">
                      {selectedOrder.services.map((orderService, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            <img
                              src={getImageUrl(orderService.service.image) || "/placeholder.svg"}
                              alt={orderService.service.name}
                              className="object-cover w-full h-full"
                              onError={handleImageError}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{orderService.service.name}</p>
                              <p className="font-medium">
                                {orderService.quantity} x {orderService.service.price.toLocaleString()} IQD
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">{orderService.service.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {orderService.service.category.nameEn} / {orderService.service.subCategory.nameEn}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {selectedOrder.products && selectedOrder.products.length > 0 && (
                  <div>
                    <h5 className="text-md font-medium mb-2">Products</h5>
                    <div className="space-y-2">
                      {selectedOrder.products.map((orderProduct, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            <img
                              src={getImageUrl(orderProduct.product.image) || "/placeholder.svg"}
                              alt={orderProduct.product.name}
                              className="object-cover w-full h-full"
                              onError={handleImageError}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{orderProduct.product.name}</p>
                              <p className="font-medium">
                                {orderProduct.quantity} x {orderProduct.product.price.toLocaleString()} IQD
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">{orderProduct.product.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {orderProduct.product.category.nameEn} / {orderProduct.product.subCategory.nameEn}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Service */}
                {selectedOrder.customService && (
                  <div>
                    <h5 className="text-md font-medium mb-2">Custom Service</h5>
                    <div className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <p className="font-medium">{selectedOrder.customService.name}</p>
                        <p className="font-medium">Quantity: {selectedOrder.customService.quantity}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedOrder.customService.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Category: {selectedOrder.customService.category.nameEn}
                        {selectedOrder.customService.subCategory &&
                          ` / ${selectedOrder.customService.subCategory.nameEn}`}
                      </p>
                      {selectedOrder.customService.images && selectedOrder.customService.images.length > 0 && (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {selectedOrder.customService.images.map((image, idx) => (
                            <div key={idx} className="relative aspect-square rounded-md overflow-hidden">
                              <img
                                src={getImageUrl(image) || "/placeholder.svg"}
                                alt={`Custom service image ${idx + 1}`}
                                className="object-cover w-full h-full"
                                onError={handleImageError}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Notes</h4>
                  <div className="p-3 border rounded-md">
                    <p>{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Rating section to the order details dialog */}
              {orderRating && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Rating</h4>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">Rating: {orderRating.rating}/5</div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < orderRating.rating ? "text-yellow-500" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {orderRating.comment && <p className="mt-2 text-sm text-muted-foreground">{orderRating.comment}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted on {formatDate(orderRating.createdAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Status History section to the order details dialog */}
              {statusLogs.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Status History</h4>
                  <div className="p-3 border rounded-md">
                    <div className="space-y-2">
                      {statusLogs.map((log, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>{getStatusBadge(log.status)}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(log.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
