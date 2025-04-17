"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Search, X, CheckCircle, XCircle, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
// Replace the import from barrel file with direct imports
import type { Product, ProductDetails } from "@/services/types"
import { getProducts, getProductById } from "@/services/product-service"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageUrl } from "@/lib/api-constants"

export function ProductsList() {
  const isMobile = useIsMobile()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [nameFilter, setNameFilter] = useState("")
  const [providerId, setProviderId] = useState<number | undefined>(undefined)
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [subCategoryId, setSubCategoryId] = useState<number | undefined>(undefined)
  const [approvalStatus, setApprovalStatus] = useState<boolean | undefined>(undefined)

  // Product details dialog
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await getProducts({
        pageNumber,
        pageSize,
        providerId,
        categoryId,
        subCategoryId,
        isApproved: approvalStatus,
        keyword: nameFilter || undefined,
      })

      setProducts(response.items)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products. Please try again.")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // View product details
  const viewProductDetails = async (productId: number) => {
    setDetailsLoading(true)
    try {
      const productDetails = await getProductById(productId)
      console.log("Product details:", productDetails) // Log the response for debugging
      setSelectedProduct(productDetails)
      setDetailsDialogOpen(true)
    } catch (err) {
      console.error("Error fetching product details:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load product details",
        variant: "destructive",
      })
    } finally {
      setDetailsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchProducts()
  }, [pageNumber, pageSize])

  // Apply filters
  const applyFilters = () => {
    setPageNumber(1) // Reset to first page when applying filters
    fetchProducts()
  }

  // Reset filters
  const resetFilters = () => {
    setNameFilter("")
    setProviderId(undefined)
    setCategoryId(undefined)
    setSubCategoryId(undefined)
    setApprovalStatus(undefined)
    setPageNumber(1)
    fetchProducts()
  }

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/person-P7j9bTMbEXHbu36RGSXioUw67e7O6c.png"
  }

  // Get approval status badge
  const getApprovalBadge = (isApproved: boolean) => {
    return (
      <Badge
        variant="outline"
        className={isApproved ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}
      >
        {isApproved ? (
          <>
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </>
        ) : (
          <>
            <XCircle className="mr-1 h-3 w-3" /> Pending
          </>
        )}
      </Badge>
    )
  }

  // Format price with discount
  const formatPrice = (price: number, discountAmount: number) => {
    if (discountAmount > 0) {
      // Calculate the discounted price (discountAmount is a decimal percentage, e.g., 0.2 = 20%)
      const discountedPrice = price - price * discountAmount

      return (
        <div className="flex flex-col">
          <span className="line-through text-muted-foreground text-sm">{price.toLocaleString()} IQD</span>
          <span className="font-medium text-green-600">{discountedPrice.toLocaleString()} IQD</span>
        </div>
      )
    }
    return <span className="font-medium">{price.toLocaleString()} IQD</span>
  }

  // Safe image URL getter with fallback
  const getSafeImageUrl = (path: string | null | undefined) => {
    return path ? getImageUrl(path) : "/placeholder.svg"
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  // Filter UI
  const filterUI = (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search products"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="flex-1"
        />
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <Select
            value={approvalStatus?.toString()}
            onValueChange={(value) => {
              if (value === "all") {
                setApprovalStatus(undefined)
              } else {
                setApprovalStatus(value === "true")
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by approval status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="true">Approved</SelectItem>
              <SelectItem value="false">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            type="number"
            placeholder="Provider ID"
            value={providerId || ""}
            onChange={(e) => setProviderId(e.target.value ? Number.parseInt(e.target.value) : undefined)}
          />
        </div>
        <div>
          <Input
            type="number"
            placeholder="Category ID"
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value ? Number.parseInt(e.target.value) : undefined)}
          />
        </div>
      </div>
    </div>
  )

  // Determine which content to show based on screen size
  const content = isMobile ? (
    <>
      {filterUI}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No products found.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{product.name || "Unnamed Product"}</div>
                <div>{getApprovalBadge(product.isApproved)}</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {product.description || "No description"}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="mt-1">{formatPrice(product.price, product.discountAmount || 0)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Platform Fee</div>
                  <div className="mt-1">{(product.platformRatio || 0) * 100}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Provider</div>
                  <div className="mt-1">{product.provider?.name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Category</div>
                  <div className="mt-1">
                    {product.category?.nameEn || "N/A"} / {product.subCategory?.nameEn || "N/A"}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" className="w-full" onClick={() => viewProductDetails(product.id)}>
                  <Eye className="mr-1 h-3 w-3" />
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination for mobile */}
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{pageNumber}</PaginationLink>
            </PaginationItem>
            {pageNumber < totalPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
                disabled={pageNumber >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  ) : (
    <>
      {filterUI}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category / Subcategory</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Platform Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.images && product.images.length > 0 && (
                        <div className="h-10 w-10 rounded-md overflow-hidden">
                          <img
                            src={getSafeImageUrl(product.images[0]?.path) || "/placeholder.svg"}
                            alt={product.name || "Product"}
                            className="h-full w-full object-cover"
                            onError={handleImageError}
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{product.name || "Unnamed Product"}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {product.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.category?.nameEn || "N/A"}</span>
                      <span className="text-xs text-muted-foreground">{product.subCategory?.nameEn || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={getSafeImageUrl(product.provider?.imagePath) || "/placeholder.svg"}
                          alt={product.provider?.name || "Provider"}
                          onError={handleImageError}
                        />
                        <AvatarFallback>{(product.provider?.name || "P").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{product.provider?.name || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(product.price, product.discountAmount || 0)}</TableCell>
                  <TableCell>{((product.platformRatio || 0) * 100).toFixed(0)}%</TableCell>
                  <TableCell>{getApprovalBadge(product.isApproved)}</TableCell>
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
                        <DropdownMenuItem onClick={() => viewProductDetails(product.id)}>View details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {products.length} of {totalCount} products
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = i + 1

              // If we're on a page > 3, adjust the pagination numbers
              if (pageNumber > 3 && totalPages > 5) {
                pageNum = pageNumber - 2 + i

                // Don't show page numbers greater than totalPages
                if (pageNum > totalPages) return null
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink isActive={pageNumber === pageNum} onClick={() => setPageNumber(pageNum)}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            {totalPages > 5 && pageNumber < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {totalPages > 5 && pageNumber < totalPages - 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => setPageNumber(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
                disabled={pageNumber >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  )

  // Return the main component with the Dialog outside the conditional rendering
  return (
    <div>
      {content}

      {/* Product Details Dialog - moved outside conditional rendering */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Detailed information about the product</DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
          ) : selectedProduct ? (
            <div className="space-y-6">
              {/* Product Basic Info */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img
                      src={getSafeImageUrl(selectedProduct.images[0]?.path) || "/placeholder.svg"}
                      alt={selectedProduct.name || "Product"}
                      className="object-cover w-full h-full"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedProduct.name || "Unnamed Product"}</h3>
                  <p className="text-muted-foreground">{selectedProduct.description || "No description available"}</p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p>{formatPrice(selectedProduct.price, selectedProduct.discountAmount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p>{getApprovalBadge(selectedProduct.isApproved)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              {selectedProduct.provider && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Provider</h4>
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={getSafeImageUrl(selectedProduct.provider.imagePath) || "/placeholder.svg"}
                        alt={selectedProduct.provider.name || "Provider"}
                        onError={handleImageError}
                      />
                      <AvatarFallback>{(selectedProduct.provider.name || "P").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedProduct.provider.name || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.provider.phoneNumber || "N/A"}</p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      ID: {selectedProduct.provider.id || "N/A"}
                    </div>
                  </div>
                </div>
              )}

              {/* Category and Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedProduct.category && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Category</h4>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      {selectedProduct.category.colorCode && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: selectedProduct.category.colorCode?.startsWith("#")
                              ? selectedProduct.category.colorCode
                              : `#${selectedProduct.category.colorCode}` || "#cccccc",
                          }}
                        ></div>
                      )}
                      <div>
                        <p className="font-medium">{selectedProduct.category.nameEn || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">{selectedProduct.category.nameAr || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedProduct.subCategory && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Subcategory</h4>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      {selectedProduct.subCategory.colorCode && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: selectedProduct.subCategory.colorCode?.startsWith("#")
                              ? selectedProduct.subCategory.colorCode
                              : `#${selectedProduct.subCategory.colorCode}` || "#cccccc",
                          }}
                        ></div>
                      )}
                      <div>
                        <p className="font-medium">{selectedProduct.subCategory.nameEn || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">{selectedProduct.subCategory.nameAr || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Product Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {selectedProduct.images.map((image, index) => (
                      <div key={image.id || index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={getSafeImageUrl(image.path) || "/placeholder.svg"}
                          alt={`Product image ${image.id || index + 1}`}
                          className="object-cover w-full h-full"
                          onError={handleImageError}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing and Commission */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Pricing and Commission</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-md">
                    <p className="text-sm text-muted-foreground">Base Price</p>
                    <p className="font-medium">{selectedProduct.price.toLocaleString()} IQD</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-sm text-muted-foreground">Discount</p>
                    <p className="font-medium">{((selectedProduct.discountAmount || 0) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-sm text-muted-foreground">Platform Commission</p>
                    <p className="font-medium">{((selectedProduct.platformRatio || 0) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8 text-muted-foreground">
              No product details available.
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
