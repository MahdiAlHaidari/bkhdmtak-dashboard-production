"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { MoreHorizontal, Search, X, Pencil, Trash, RefreshCw, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Category, SubCategory, SubCategoryDetails } from "@/services/types"
import { getCategories, deleteCategory } from "@/services/category-service"
import { getSubCategories, getSubCategoryById, deleteSubCategory } from "@/services/subcategory-service"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { CategoryForm } from "./category-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { ErrorDisplay } from "@/components/ui/error-display"
import { SubCategoryForm } from "./subcategory-form"
import { getImageUrl } from "@/lib/api-constants"

// Add a refreshData prop to the component
export function CategoriesList({
  type = "main",
  refreshData = false,
}: { type: "main" | "sub"; refreshData?: boolean }) {
  // Rest of the component code remains the same
  const isMobile = useIsMobile()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryDetails | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Edit category state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)

  // Delete category state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Edit subcategory state
  const [editSubcategoryDialogOpen, setEditSubcategoryDialogOpen] = useState(false)
  const [subcategoryToEdit, setSubcategoryToEdit] = useState<SubCategoryDetails | null>(null)

  // Delete subcategory state
  const [deleteSubcategoryDialogOpen, setDeleteSubcategoryDialogOpen] = useState(false)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<SubCategoryDetails | null>(null)
  const [deleteSubcategoryLoading, setDeleteSubcategoryLoading] = useState(false)

  // Filter state
  const [nameFilter, setNameFilter] = useState("")
  const [colorFilter, setColorFilter] = useState("")
  // Add a new state for category filter
  const [categoryIdFilter, setCategoryIdFilter] = useState<string>("")

  // Update the fetchCategories function to use the getSubCategories function
  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    setErrorStatusCode(null)
    try {
      if (type === "main") {
        const response = await getCategories({
          nameEn: nameFilter || undefined,
          colorCode: colorFilter || undefined,
        })
        setCategories(response)
      } else {
        // Use the real API for subcategories
        const response = await getSubCategories({
          nameEn: nameFilter || undefined,
          colorCode: colorFilter || undefined,
          categoryId: categoryIdFilter ? Number.parseInt(categoryIdFilter) : undefined,
        })
        setSubcategories(response)
      }
    } catch (err) {
      console.error("Error fetching categories:", err)

      // Extract status code if available
      let statusCode = null
      let errorMessage = "Failed to load categories. Please try again."

      if (err instanceof Error) {
        errorMessage = err.message

        // Try to extract status code from error message
        const statusMatch = err.message.match(/(\d{3})/)
        if (statusMatch) {
          statusCode = Number.parseInt(statusMatch[1])
        }
      }

      setError(errorMessage)
      setErrorStatusCode(statusCode)
      setErrorDialogOpen(true)
      if (type === "main") {
        setCategories([])
      } else {
        setSubcategories([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCategories()
  }, [type])

  // Add a useEffect to refresh data when refreshData changes
  useEffect(() => {
    if (refreshData) {
      fetchCategories()
    }
  }, [refreshData])

  // Apply filters
  const applyFilters = () => {
    fetchCategories()
  }

  // Update the resetFilters function to reset the category filter
  const resetFilters = () => {
    setNameFilter("")
    setColorFilter("")
    setCategoryIdFilter("")
    fetchCategories()
  }

  // View category details
  const viewCategoryDetails = async (item: Category | SubCategory) => {
    if (type === "sub") {
      // For subcategories, fetch the detailed information
      setDetailsLoading(true)
      try {
        const subCategoryDetails = await getSubCategoryById(item.id)
        setSelectedSubCategory(subCategoryDetails)
        setDetailsDialogOpen(true)
      } catch (err) {
        console.error("Error fetching subcategory details:", err)
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load subcategory details",
          variant: "destructive",
        })
      } finally {
        setDetailsLoading(false)
      }
    } else {
      // For main categories, just use the existing data
      setSelectedCategory(item as Category)
      setDetailsDialogOpen(true)
    }
  }

  // Edit category
  const editCategory = (category: Category) => {
    setCategoryToEdit(category)
    setEditDialogOpen(true)
  }

  // Edit subcategory
  const editSubcategory = (subcategory: SubCategoryDetails) => {
    setSubcategoryToEdit(subcategory)
    setEditSubcategoryDialogOpen(true)
  }

  // Confirm delete category
  const confirmDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  // Confirm delete subcategory
  const confirmDeleteSubcategory = (subcategory: SubCategoryDetails) => {
    setSubcategoryToDelete(subcategory)
    setDeleteSubcategoryDialogOpen(true)
  }

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    setDeleteLoading(true)
    try {
      await deleteCategory(categoryToDelete.id)

      // Remove the category from the local state
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id))

      // Show success message
      toast({
        title: "Category Deleted",
        description: `Category "${categoryToDelete.nameEn}" has been deleted successfully.`,
      })

      // Close the dialog
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)

      // If we're viewing the category details, close that dialog too
      if (selectedCategory && selectedCategory.id === categoryToDelete.id) {
        setDetailsDialogOpen(false)
        setSelectedCategory(null)
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Handle delete subcategory
  const handleDeleteSubcategory = async () => {
    if (!subcategoryToDelete) return

    setDeleteSubcategoryLoading(true)
    try {
      await deleteSubCategory(subcategoryToDelete.id)

      // Remove the subcategory from the local state
      setSubcategories(subcategories.filter((s) => s.id !== subcategoryToDelete.id))

      // Show success message
      toast({
        title: "Subcategory Deleted",
        description: `Subcategory "${subcategoryToDelete.nameEn}" has been deleted successfully.`,
      })

      // Close the dialog
      setDeleteSubcategoryDialogOpen(false)
      setSubcategoryToDelete(null)

      // If we're viewing the subcategory details, close that dialog too
      if (selectedSubCategory && selectedSubCategory.id === subcategoryToDelete.id) {
        setDetailsDialogOpen(false)
        setSelectedSubCategory(null)
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete subcategory",
        variant: "destructive",
      })
    } finally {
      setDeleteSubcategoryLoading(false)
    }
  }

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg?height=200&width=200"
  }

  // Get the appropriate data based on the type
  const items = type === "main" ? categories : subcategories

  // Filter items by name (client-side filtering)
  const filteredItems = nameFilter
    ? items.filter(
        (item) => item.nameEn.toLowerCase().includes(nameFilter.toLowerCase()) || item.nameAr.includes(nameFilter),
      )
    : items

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && items.length === 0 && !errorDialogOpen) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <div className="text-red-500 text-center">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Error Loading {type === "main" ? "Categories" : "Subcategories"}
          </h3>
          <p className="mb-4">{error}</p>
        </div>
        <Button onClick={fetchCategories} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // Update the filter UI to include category filter when type is "sub"
  const filterUI = (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Filter by name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Filter by color code"
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
          className="flex-1"
        />
        {type === "sub" && (
          <Input
            placeholder="Filter by category ID"
            value={categoryIdFilter}
            onChange={(e) => setCategoryIdFilter(e.target.value)}
            className="flex-1"
            type="number"
          />
        )}
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

  return (
    <div>
      {filterUI}

      {/* Error Dialog */}
      <ErrorDisplay
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        title={`Error Loading ${type === "main" ? "Categories" : "Subcategories"}`}
        description={error || `There was a problem loading the ${type === "main" ? "categories" : "subcategories"}.`}
        statusCode={errorStatusCode || undefined}
        onRetry={fetchCategories}
      />

      {/* Categories List - Mobile View */}
      {isMobile ? (
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {type === "main" ? "categories" : "subcategories"} found.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.colorCode && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: item.colorCode?.startsWith("#")
                            ? item.colorCode
                            : `#${item.colorCode}` || "#cccccc",
                        }}
                      ></div>
                    )}
                    <div className="font-medium">{item.nameEn}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => viewCategoryDetails(item)}>
                    View
                  </Button>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{item.nameAr}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {type === "sub" && (
                    <div>
                      <div className="text-muted-foreground">Parent Category</div>
                      <div className="mt-1">
                        {(item as SubCategory).categoryId ? `Category ID: ${(item as SubCategory).categoryId}` : "N/A"}
                      </div>
                    </div>
                  )}
                  {type === "main" && (
                    <>
                      <div>
                        <div className="text-muted-foreground">Created</div>
                        <div className="mt-1">{new Date((item as Category).created).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Modified</div>
                        <div className="mt-1">{new Date((item as Category).lastModified).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Platform Discount</div>
                        <div className="mt-1">{((item as Category).platformDiscount * 100).toFixed(0)}%</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  {type === "sub" ? (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => viewCategoryDetails(item)}>
                      View Details
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => editCategory(item as Category)}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600"
                        onClick={() => confirmDeleteCategory(item as Category)}
                      >
                        <Trash className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Categories List - Desktop View */
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name (English)</TableHead>
                <TableHead>Name (Arabic)</TableHead>
                {type === "sub" && <TableHead>Parent Category</TableHead>}
                <TableHead>Color</TableHead>
                {type === "main" && <TableHead>Platform Discount</TableHead>}
                {type === "main" && <TableHead>Created</TableHead>}
                {type === "main" && <TableHead>Last Modified</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={type === "sub" ? 5 : 7} className="text-center py-8 text-muted-foreground">
                    No {type === "main" ? "categories" : "subcategories"} found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.nameEn}</div>
                    </TableCell>
                    <TableCell>{item.nameAr}</TableCell>
                    {type === "sub" && (
                      <TableCell>
                        {(item as SubCategory).categoryId ? `Category ID: ${(item as SubCategory).categoryId}` : "N/A"}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.colorCode && (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: item.colorCode?.startsWith("#")
                                ? item.colorCode
                                : `#${item.colorCode}` || "#cccccc",
                            }}
                          ></div>
                        )}
                        <span>
                          {item.colorCode?.startsWith("#") ? item.colorCode.substring(1) : item.colorCode || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    {type === "main" && (
                      <TableCell>{((item as Category).platformDiscount * 100).toFixed(0)}%</TableCell>
                    )}
                    {type === "main" && (
                      <TableCell>{new Date((item as Category).created).toLocaleDateString()}</TableCell>
                    )}
                    {type === "main" && (
                      <TableCell>{new Date((item as Category).lastModified).toLocaleDateString()}</TableCell>
                    )}
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
                          <DropdownMenuItem onClick={() => viewCategoryDetails(item)}>View details</DropdownMenuItem>
                          {type === "main" ? (
                            <>
                              <DropdownMenuItem onClick={() => editCategory(item as Category)}>
                                Edit category
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => confirmDeleteCategory(item as Category)}
                              >
                                Delete category
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  // For subcategories, we need to fetch the details first
                                  getSubCategoryById(item.id)
                                    .then((details) => {
                                      editSubcategory(details)
                                    })
                                    .catch((error) => {
                                      console.error("Error fetching subcategory details:", error)
                                      toast({
                                        title: "Error",
                                        description: "Failed to load subcategory details for editing",
                                        variant: "destructive",
                                      })
                                    })
                                }}
                              >
                                Edit subcategory
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  // For subcategories, we need to fetch the details first
                                  getSubCategoryById(item.id)
                                    .then((details) => {
                                      confirmDeleteSubcategory(details)
                                    })
                                    .catch((error) => {
                                      console.error("Error fetching subcategory details:", error)
                                      toast({
                                        title: "Error",
                                        description: "Failed to load subcategory details for deletion",
                                        variant: "destructive",
                                      })
                                    })
                                }}
                              >
                                Delete subcategory
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Rest of the component remains the same */}
      {/* Category Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{type === "sub" ? "Subcategory Details" : "Category Details"}</DialogTitle>
            <DialogDescription>
              Detailed information about the {type === "sub" ? "subcategory" : "category"}
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
          ) : type === "sub" && selectedSubCategory ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(selectedSubCategory.image) || "/placeholder.svg"}
                    alt={selectedSubCategory.nameEn}
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{selectedSubCategory.nameEn}</h3>
                    {selectedSubCategory.colorCode && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: selectedSubCategory.colorCode?.startsWith("#")
                            ? selectedSubCategory.colorCode
                            : `#${selectedSubCategory.colorCode}` || "#cccccc",
                        }}
                      ></div>
                    )}
                  </div>
                  <p className="text-muted-foreground">{selectedSubCategory.nameAr}</p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p>{new Date(selectedSubCategory.created).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Modified</p>
                      <p>{new Date(selectedSubCategory.lastModified).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Description</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">English</p>
                    <p>{selectedSubCategory.descriptionEn || "No description available"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Arabic</p>
                    <p>{selectedSubCategory.descriptionAr || "No description available"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Parent Category</h4>
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  {selectedSubCategory.category.colorCode && (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: selectedSubCategory.category.colorCode?.startsWith("#")
                          ? selectedSubCategory.category.colorCode
                          : `#${selectedSubCategory.category.colorCode}` || "#cccccc",
                      }}
                    ></div>
                  )}
                  <div>
                    <p className="font-medium">{selectedSubCategory.category.nameEn}</p>
                    <p className="text-sm text-muted-foreground">{selectedSubCategory.category.nameAr}</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">ID: {selectedSubCategory.category.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Subcategory Image</h4>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                    <img
                      src={getImageUrl(selectedSubCategory.image) || "/placeholder.svg"}
                      alt={selectedSubCategory.nameEn}
                      className="object-contain w-full h-full"
                      onError={handleImageError}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Marker Image</h4>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                    <img
                      src={getImageUrl(selectedSubCategory.markerImage) || "/placeholder.svg"}
                      alt={`${selectedSubCategory.nameEn} Marker`}
                      className="object-contain w-full h-full"
                      onError={handleImageError}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Metadata</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p>User ID: {selectedSubCategory.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modified By</p>
                    <p>User ID: {selectedSubCategory.lastModifiedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Color Code</p>
                    <p>
                      {selectedSubCategory.colorCode?.startsWith("#")
                        ? selectedSubCategory.colorCode.substring(1)
                        : selectedSubCategory.colorCode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p>{selectedSubCategory.id}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            selectedCategory && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(selectedCategory.image) || "/placeholder.svg"}
                      alt={selectedCategory.nameEn}
                      className="object-cover w-full h-full"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{selectedCategory.nameEn}</h3>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: selectedCategory.colorCode?.startsWith("#")
                            ? selectedCategory.colorCode
                            : `#${selectedCategory.colorCode}` || "#cccccc",
                        }}
                      ></div>
                    </div>
                    <p className="text-muted-foreground">{selectedCategory.nameAr}</p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p>{new Date(selectedCategory.created).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Modified</p>
                        <p>{new Date(selectedCategory.lastModified).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Description</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">English</p>
                      <p>{selectedCategory.descriptionEn || "No description available"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Arabic</p>
                      <p>{selectedCategory.descriptionAr || "No description available"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Category Image</h4>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <img
                        src={getImageUrl(selectedCategory.image) || "/placeholder.svg"}
                        alt={selectedCategory.nameEn}
                        className="object-contain w-full h-full"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Marker Image</h4>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <img
                        src={getImageUrl(selectedCategory.markerImage) || "/placeholder.svg"}
                        alt={`${selectedCategory.nameEn} Marker`}
                        className="object-contain w-full h-full"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Metadata</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Created By</p>
                      <p>User ID: {selectedCategory.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Modified By</p>
                      <p>User ID: {selectedCategory.lastModifiedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Color Code</p>
                      <p>
                        {selectedCategory.colorCode?.startsWith("#")
                          ? selectedCategory.colorCode.substring(1)
                          : selectedCategory.colorCode || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Platform Discount</p>
                      <p>{(selectedCategory.platformDiscount * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ID</p>
                      <p>{selectedCategory.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              {type === "sub" && selectedSubCategory ? (
                <>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setDetailsDialogOpen(false)
                      if (selectedSubCategory) {
                        editSubcategory(selectedSubCategory)
                      }
                    }}
                  >
                    Edit Subcategory
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDetailsDialogOpen(false)
                      if (selectedSubCategory) {
                        confirmDeleteSubcategory(selectedSubCategory)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </>
              ) : (
                selectedCategory && (
                  <>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setDetailsDialogOpen(false)
                        if (selectedCategory) {
                          editCategory(selectedCategory)
                        }
                      }}
                    >
                      Edit Category
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setDetailsDialogOpen(false)
                        if (selectedCategory) {
                          confirmDeleteCategory(selectedCategory)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </>
                )
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <CategoryForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        category={categoryToEdit}
        mode="edit"
        onSuccess={() => {
          fetchCategories()
        }}
      />

      {/* Edit Subcategory Dialog */}
      <SubCategoryForm
        open={editSubcategoryDialogOpen}
        onOpenChange={setEditSubcategoryDialogOpen}
        subcategory={subcategoryToEdit}
        mode="edit"
        onSuccess={() => {
          fetchCategories()
        }}
      />

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.nameEn}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteCategory()
              }}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Subcategory Confirmation Dialog */}
      <AlertDialog open={deleteSubcategoryDialogOpen} onOpenChange={setDeleteSubcategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the subcategory "{subcategoryToDelete?.nameEn}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubcategoryLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteSubcategory()
              }}
              disabled={deleteSubcategoryLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSubcategoryLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
