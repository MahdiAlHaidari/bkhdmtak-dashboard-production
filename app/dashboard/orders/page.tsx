import { OrdersList } from "@/components/dashboard/orders-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Manage your customer orders and bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersList />
        </CardContent>
      </Card>
    </div>
  )
}
