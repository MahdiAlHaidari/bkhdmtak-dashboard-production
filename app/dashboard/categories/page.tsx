import { CategoriesList } from "@/components/dashboard/categories-list"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddCategoryButton } from "@/components/dashboard/add-category-button"
import { AddSubCategoryButton } from "@/components/dashboard/add-subcategory-button"

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Tabs defaultValue="categories" className="hidden">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-xl">Service Categories</CardTitle>
            <AddCategoryButton />
          </div>
          <Card>
            <CardContent className="pt-6">
              <CategoriesList type="main" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subcategories">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-xl">Service Subcategories</CardTitle>
            <AddSubCategoryButton />
          </div>
          <Card>
            <CardContent className="pt-6">
              <CategoriesList type="sub" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
