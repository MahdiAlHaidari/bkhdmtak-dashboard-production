"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Order } from "@/services/types"
import { getRecentBookings } from "@/services/order-service"
import { Loader2 } from "lucide-react"
import { getImageUrl } from "@/lib/api-constants"

export function RecentBookings() {
  const isMobile = useIsMobile()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch recent orders
  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        setLoading(true)
        const response = await getRecentBookings({
          pageNumber: 1,
          pageSize: 5, // Limit to 5 most recent orders
        })
        setOrders(response.items)
        setError(null)
      } catch (err) {
        console.error("Error fetching recent orders:", err)
        setError("Failed to load recent bookings")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  // Get status badge
  const getStatusBadge = (status: number) => {
    let statusText = ""
    let color = ""

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

    return (
      <Badge variant="outline" className={color}>
        {statusText}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/person-P7j9bTMbEXHbu36RGSXioUw67e7O6c.png"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent bookings found.</p>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={getImageUrl(order.user.imagePath, true) || "/placeholder.svg"}
                    alt={order.user.name}
                    onError={handleImageError}
                  />
                  <AvatarFallback>{order.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{order.user.name}</div>
                  <div className="text-xs text-muted-foreground">{order.user.phoneNumber}</div>
                </div>
              </div>
              {getStatusBadge(order.orderStatus)}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Booking ID</div>
                <div className="mt-1">#{order.id}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Date</div>
                <div className="mt-1">{formatDate(order.createdAt)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Services</div>
                <div className="mt-1">{order.totalServices}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="font-medium mt-1">{order.total.toLocaleString()} IQD</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getImageUrl(order.user.imagePath, true) || "/placeholder.svg"}
                      alt={order.user.name}
                      onError={handleImageError}
                    />
                    <AvatarFallback>{order.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{order.user.name}</div>
                    <div className="text-xs text-muted-foreground">{order.user.phoneNumber}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
              <TableCell className="text-right">{order.total.toLocaleString()} IQD</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
