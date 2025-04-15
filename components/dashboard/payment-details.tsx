"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { ErrorDisplay } from "@/components/ui/error-display"
import type { PaymentDetails as PaymentDetailsType, OrderDetailsResponse } from "@/services/types"
import { getPaymentById } from "@/services/payment-service"
import { getOrderById } from "@/services/order-service"

interface PaymentDetailsProps {
  paymentId: number
}

export function PaymentDetails({ paymentId }: PaymentDetailsProps) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsType | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true)
        setError(null)

        // Fetch payment details
        const paymentData = await getPaymentById(paymentId)
        setPaymentDetails(paymentData)

        // Fetch order details if payment has an orderId
        if (paymentData.payment.orderId) {
          try {
            const orderData = await getOrderById(paymentData.payment.orderId)
            setOrderDetails(orderData)
          } catch (orderError) {
            console.error("Error fetching order details:", orderError)
            // Don't set an error for the whole component if just the order fetch fails
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching payment details")
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [paymentId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  if (!paymentDetails) {
    return <div className="text-center py-8 text-muted-foreground">No payment details found</div>
  }

  const { payment, logs } = paymentDetails

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "PAID":
        return <Badge className="bg-green-500">{status}</Badge>
      case "FAILED":
      case "ERROR":
        return <Badge className="bg-red-500">{status}</Badge>
      case "EXPIRED":
        return <Badge className="bg-yellow-500">{status}</Badge>
      case "CREATED":
      case "FORM_SHOWED":
      case "THREE_DS_METHOD_CALL_REQUIRED":
      case "AUTHENTICATION_REQUIRED":
      case "AUTHENTICATION_STARTED":
      case "AUTHENTICATED":
      case "INITIALIZED":
      case "STARTED":
        return <Badge className="bg-blue-500">{status}</Badge>
      case "AUTHENTICATION_FAILED":
        return <Badge className="bg-orange-500">{status}</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  return (
    <Tabs defaultValue="payment">
      <TabsList className="mb-4">
        <TabsTrigger value="payment">Payment Information</TabsTrigger>
        <TabsTrigger value="logs">Payment Logs</TabsTrigger>
        {orderDetails && <TabsTrigger value="order">Order Details</TabsTrigger>}
      </TabsList>

      <TabsContent value="payment">
        <Card>
          <CardHeader>
            <CardTitle>Payment #{payment.id}</CardTitle>
            <CardDescription>Basic payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment ID</h3>
                <p className="text-base">{payment.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Order ID</h3>
                <p className="text-base">{payment.orderId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                <p className="text-base">{payment.amount.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className="text-base mt-1">{getStatusBadge(payment.status)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p className="text-base">{payment.createdAt ? formatDate(payment.createdAt) : "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Updated At</h3>
                <p className="text-base">{payment.updatedAt ? formatDate(payment.updatedAt) : "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="logs">
        <Card>
          <CardHeader>
            <CardTitle>Payment Logs</CardTitle>
            <CardDescription>History of payment status changes</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No logs available</div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Status: {getStatusBadge(log.status)}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {orderDetails && (
        <TabsContent value="order">
          <Card>
            <CardHeader>
              <CardTitle>Order #{orderDetails.order.id}</CardTitle>
              <CardDescription>Associated order details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order ID</h3>
                  <p className="text-base">{orderDetails.order.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
                  <p className="text-base">{orderDetails.order.total.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Final Total</h3>
                  <p className="text-base">{orderDetails.order.finalTotal.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Status</h3>
                  <p className="text-base">{orderDetails.order.orderStatus}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Type</h3>
                  <p className="text-base">{orderDetails.order.paymentType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="text-base">{formatDate(orderDetails.order.createdAt)}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="text-sm font-medium mb-2">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">User ID</h4>
                    <p className="text-base">{orderDetails.order.user.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                    <p className="text-base">{orderDetails.order.user.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Phone Number</h4>
                    <p className="text-base">{orderDetails.order.user.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {orderDetails.order.provider && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Provider Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Provider ID</h4>
                        <p className="text-base">{orderDetails.order.provider.id}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                        <p className="text-base">{orderDetails.order.provider.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Phone Number</h4>
                        <p className="text-base">{orderDetails.order.provider.phoneNumber}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                        <p className="text-base">{orderDetails.order.provider.email || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {orderDetails.order.products.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Products</h3>
                    <div className="space-y-3">
                      {orderDetails.order.products.map((item, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.product.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {item.product.price.toFixed(2)} × {item.quantity}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total: {(item.product.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {orderDetails.order.services.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Services</h3>
                    <div className="space-y-3">
                      {orderDetails.order.services.map((item, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{item.service.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.service.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {item.service.price.toFixed(2)} × {item.quantity}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total: {(item.service.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {orderDetails.order.customService && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Custom Service</h3>
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{orderDetails.order.customService.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {orderDetails.order.customService.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Quantity: {orderDetails.order.customService.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  )
}
