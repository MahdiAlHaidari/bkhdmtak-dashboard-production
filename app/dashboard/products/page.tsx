import { ProductsList } from "@/components/dashboard/products-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Manage your available products</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsList />
        </CardContent>
      </Card>
    </div>
  )
}
