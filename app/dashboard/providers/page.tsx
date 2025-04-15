import { ProvidersList } from "@/components/dashboard/providers-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProvidersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Providers</CardTitle>
          <CardDescription>Manage your service providers</CardDescription>
        </CardHeader>
        <CardContent>
          <ProvidersList />
        </CardContent>
      </Card>
    </div>
  )
}
