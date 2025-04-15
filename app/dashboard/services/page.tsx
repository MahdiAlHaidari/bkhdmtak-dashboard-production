import { ServicesList } from "@/components/dashboard/services-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>Manage your available services</CardDescription>
        </CardHeader>
        <CardContent>
          <ServicesList />
        </CardContent>
      </Card>
    </div>
  )
}
