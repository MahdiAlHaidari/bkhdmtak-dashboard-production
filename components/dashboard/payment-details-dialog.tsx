"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Store, MapPin, FileText, ShoppingCart, Briefcase, Star, CreditCard } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Payment, OrderDetailsResponse } from "@/services/types"
import { getOrderById } from "@/services/order-service"

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

interface PaymentDetailsDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentDetailsDialog({ payment, open, onOpenChange }: PaymentDetailsDialogProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!payment || !open) return

      try {
        setLoadingOrder(true)
        setOrderError(null)
        const details = await getOrderById(payment.orderId)
        setOrderDetails(details)
      } catch (err) {
        console.error("Error fetching order details:", err)
        setOrderError(err instanceof Error ? err.message : "Failed to fetch order details")
        toast({
          title: "Error",
          description: "Failed to fetch order details",
          variant: "destructive",
        })
      } finally {
        setLoadingOrder(false)
      }
    }

    fetchOrderDetails()
  }, [payment, open])

  if (!payment) return null

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

  const getOrderStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge className="bg-blue-500">Pending</Badge>
      case 1:
        return <Badge className="bg-green-500">Accepted</Badge>
      case 2:
        return <Badge className="bg-purple-500">In Progress</Badge>
      case 3:
        return <Badge className="bg-green-500">Completed</Badge>
      case 4:
        return <Badge className="bg-red-500">Cancelled</Badge>
      case 5:
        return <Badge className="bg-yellow-500">Rejected</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
  }

  const getPaymentTypeBadge = (type: number) => {
    switch (type) {
      case 0:
        return <Badge className="bg-blue-500">Cash</Badge>
      case 1:
        return <Badge className="bg-green-500">Online</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Payment & Order Details</DialogTitle>
          <DialogDescription>Information about payment #{payment.id} and its associated order</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="payment" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment">Payment Details</TabsTrigger>
            <TabsTrigger value="order">Order Details</TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="space-y-4 flex-1 overflow-auto">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Payment ID</h3>
                    <p className="font-medium">{payment.id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Order ID</h3>
                    <p className="font-medium">{payment.orderId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Amount</h3>
                    <p className="font-medium">{payment.amount.toFixed(2)} IQD</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                    <div className="mt-1">{getStatusBadge(payment.status)}</div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Created At</h3>
                    <p className="font-medium">{payment.createdAt ? formatDate(payment.createdAt) : "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Updated At</h3>
                    <p className="font-medium">{payment.updatedAt ? formatDate(payment.updatedAt) : "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="order" className="flex-1 overflow-auto">
            <ScrollArea className="h-full pr-4">
              {loadingOrder ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2">Loading order details...</span>
                </div>
              ) : orderError ? (
                <div className="text-center py-4 text-red-500">
                  <p>{orderError}</p>
                </div>
              ) : orderDetails ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground">Order ID</h3>
                          <p className="font-medium">{orderDetails.order.id}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                          <div className="mt-1">{getOrderStatusBadge(orderDetails.order.orderStatus)}</div>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground">Payment Type</h3>
                          <div className="mt-1">{getPaymentTypeBadge(orderDetails.order.paymentType)}</div>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground">Created At</h3>
                          <p className="font-medium">{formatDate(orderDetails.order.createdAt)}</p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span className="font-medium">{orderDetails.order.total.toFixed(2)} IQD</span>
                        </div>
                        {orderDetails.order.total !== orderDetails.order.finalTotal && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Discount:</span>
                            <span className="font-medium text-green-600">
                              -{(orderDetails.order.total - orderDetails.order.finalTotal).toFixed(2)} IQD
                            </span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{orderDetails.order.finalTotal.toFixed(2)} IQD</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <User className="mr-2 h-5 w-5" />
                          Customer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                            <p className="font-medium">{orderDetails.order.user.name}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
                            <p className="font-medium">{orderDetails.order.user.phoneNumber}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {orderDetails.order.provider && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Store className="mr-2 h-5 w-5" />
                            Provider Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                              <p className="font-medium">{orderDetails.order.provider.name}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
                              <p className="font-medium">{orderDetails.order.provider.phoneNumber}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        Delivery Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Address</h3>
                        <p className="font-medium">{orderDetails.order.address || "No address provided"}</p>
                      </div>

                      {orderDetails.order.notes && (
                        <div className="mt-4">
                          <h3 className="font-medium text-sm text-muted-foreground">Notes</h3>
                          <p className="font-medium">{orderDetails.order.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {(orderDetails.order.products.length > 0 ||
                    orderDetails.order.services.length > 0 ||
                    orderDetails.order.customService) && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Order Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {orderDetails.order.products.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-medium mb-2 flex items-center">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Products ({orderDetails.order.totalProducts})
                            </h3>
                            <div className="bg-muted rounded-md p-3">
                              <div className="grid grid-cols-[1fr_auto_auto] gap-2 font-medium text-sm text-muted-foreground mb-2">
                                <div>Name</div>
                                <div>Quantity</div>
                                <div>Price</div>
                              </div>
                              <Separator className="mb-2" />
                              {orderDetails.order.products.map((item, index) => (
                                <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 py-1">
                                  <div>{item.product.name}</div>
                                  <div className="text-center">{item.quantity}</div>
                                  <div className="text-right">{item.product.price.toFixed(2)} IQD</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {orderDetails.order.services.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-medium mb-2 flex items-center">
                              <Briefcase className="mr-2 h-4 w-4" />
                              Services ({orderDetails.order.totalServices})
                            </h3>
                            <div className="bg-muted rounded-md p-3">
                              <div className="grid grid-cols-[1fr_auto_auto] gap-2 font-medium text-sm text-muted-foreground mb-2">
                                <div>Name</div>
                                <div>Quantity</div>
                                <div>Price</div>
                              </div>
                              <Separator className="mb-2" />
                              {orderDetails.order.services.map((item, index) => (
                                <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 py-1">
                                  <div>{item.service.name}</div>
                                  <div className="text-center">{item.quantity}</div>
                                  <div className="text-right">{item.service.price.toFixed(2)} IQD</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {orderDetails.order.customService && (
                          <div>
                            <h3 className="font-medium mb-2 flex items-center">
                              <Briefcase className="mr-2 h-4 w-4" />
                              Custom Service
                            </h3>
                            <div className="bg-muted rounded-md p-3">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm text-muted-foreground">Name:</span>
                                  <p className="font-medium">{orderDetails.order.customService.name}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-muted-foreground">Description:</span>
                                  <p className="font-medium">{orderDetails.order.customService.description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {orderDetails.rating && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Star className="mr-2 h-5 w-5" />
                          Customer Rating
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < orderDetails.rating.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 font-bold">{orderDetails.rating.rating}/5</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground">Comment</h3>
                          <p className="font-medium">{orderDetails.rating.comment || "No comment provided"}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No order details available</div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
