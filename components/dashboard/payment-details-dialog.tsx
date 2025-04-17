"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Payment } from "@/services/types"
import { PaymentStatus } from "./payments-list"

// Local formatDate function to avoid dependency on external module
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

interface PaymentDetailsDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentDetailsDialog({ payment, open, onOpenChange }: PaymentDetailsDialogProps) {
  if (!payment) {
    return null
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="transaction" className="flex-1">
              Transaction
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex-1">
              Raw Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Overview</CardTitle>
                  <CardDescription>Basic payment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                      <p>{payment.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                      <p>{payment.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p>{payment.amount.toFixed(2)} SAR</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p>{getStatusBadge(payment.status)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created At</p>
                      <p>{formatDate(payment.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                      <p>{formatDate(payment.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="transaction" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                  <CardDescription>Payment transaction information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                      <p>{payment.transactionId || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                      <p>{payment.paymentMethod || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Card Type</p>
                      <p>{payment.cardType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Card Last 4</p>
                      <p>{payment.cardLast4 || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Payment Data</CardTitle>
                  <CardDescription>Complete payment object</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto p-4 bg-muted rounded-md">
                    {JSON.stringify(payment, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
