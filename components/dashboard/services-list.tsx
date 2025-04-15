"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Search, X, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
// Replace the import from barrel file with direct imports
import type { Service, ServiceDetails } from "@/services/types"
import { getServices, getServiceById } from "@/services/service-service"
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
import { toast } from "@/components/ui/use-toast"
import { getImageUrl } from "@/lib/api-constants"

// Mock data for fallback
const mockServices = [
  {
    id: 1,
    name: "Home Cleaning",
    description: "Professional home cleaning service",
    isApproved: true,
    price: 80,
    discountAmount: 0,
    platformRation: 10,
    categoryId: 1,
    subCategoryId: 1,
    providerId: 1,
    image: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    name: "Plumbing Repair",
    description: "Expert plumbing repair service",
    isApproved: true,
    price: 60,
    discountAmount: 0,
    platformRation: 10,
    categoryId: 2,
    subCategoryId: 3,
    providerId: 2,
    image: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    name: "Electrical Work",
    description: "Professional electrical services",
    isApproved: true,
    price: 70,
    discountAmount: 0,
    platformRation: 10,
    categoryId: 2,
    subCategoryId: 4,
    providerId: 3,
    image: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    name: "Lawn Mowing",
    description: "Regular lawn maintenance service",
    isApproved: false,
    price: 40,
    discountAmount: 0,
    platformRation: 10,
    categoryId: 3,
    subCategoryId: 5,
    providerId: 4,
    image: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 5,
    name: "House Painting",
    description: "Interior and exterior painting services",
    isApproved: true,
    price: 200,
    discountAmount: 20,
    platformRation: 10,
    categoryId: 4,
    subCategoryId: 6,
    providerId: 5,
    image: "/placeholder.svg?height=32&width=32",
  },
]

export function ServicesList() {
  const isMobile = useIsMobile()
  const [services, setServices] = useState<Service[]>([])
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

  const [selectedService, setSelectedService] = useState<ServiceDetails | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Fetch services
  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await getServices({
        pageNumber,
        pageSize,
        providerId,
        categoryId,
        subCategoryId,
        isApproved: approvalStatus,
      })

      setServices(response.items)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
    } catch (err) {
      console.error("Error fetching services:", err)
      setError("Failed to load services. Please try again.")
      // Use mock data as fallback
      setServices(mockServices)
    } finally {
      setLoading(false)
    }
  }

  const viewServiceDetails = async (serviceId: number) => {
    setDetailsLoading(true)
    try {
      const serviceDetails = await getServiceById(serviceId)
      setSelectedService(serviceDetails)
      setDetailsDialogOpen(true)
    } catch (err) {
      console.error("Error fetching service details:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load service details",
        variant: "destructive",
      })
    } finally {
      setDetailsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchServices()
  }, [pageNumber, pageSize])

  // Apply filters
  const applyFilters = () => {
    setPageNumber(1) // Reset to first page when applying filters
    fetchServices()
  }

  // Reset filters
  const resetFilters = () => {
    setNameFilter("")
    setProviderId(undefined)
    setCategoryId(undefined)
    setSubCategoryId(undefined)
    setApprovalStatus(undefined)
    setPageNumber(1)
    fetchServices()
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

  // Filter services by name (client-side filtering)
  const filteredServices = nameFilter
    ? services.filter((service) => service.name.toLowerCase().includes(nameFilter.toLowerCase()))
    : services

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && services.length === 0) {
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
          placeholder="Filter by name"
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
              if (value === "") {
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

  const handleImageError = (e: any) => {
    e.target.onerror = null
    e.target.src = "/placeholder.svg?height=200&width=200"
  }

  if (isMobile) {
    return (
      <div>
        {filterUI}
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <div key={service.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{service.name}</div>
                <div>{getApprovalBadge(service.isApproved)}</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{service.description}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="mt-1">{formatPrice(service.price, service.discountAmount)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Platform Fee</div>
                  <div className="mt-1">{service.platformRation}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Provider ID</div>
                  <div className="mt-1">{service.providerId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Category</div>
                  <div className="mt-1">
                    {service.categoryId} / {service.subCategoryId}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" className="w-full" onClick={() => viewServiceDetails(service.id)}>
                  View Details
                </Button>
              </div>
            </div>
          ))}
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
      </div>
    )
  }

  return (
    <div>
      {filterUI}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Provider ID</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Platform Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{service.description}</div>
                </TableCell>
                <TableCell>
                  {service.categoryId} / {service.subCategoryId}
                </TableCell>
                <TableCell>{service.providerId}</TableCell>
                <TableCell>{formatPrice(service.price, service.discountAmount)}</TableCell>
                <TableCell>{service.platformRation}%</TableCell>
                <TableCell>{getApprovalBadge(service.isApproved)}</TableCell>
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
                      <DropdownMenuItem onClick={() => viewServiceDetails(service.id)}>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit service</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {service.isApproved ? (
                        <DropdownMenuItem className="text-red-600">Reject service</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">Approve service</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredServices.length} of {totalCount} services
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

      {/* Service Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
            <DialogDescription>Detailed information about the service</DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
          ) : selectedService ? (
            <div className="space-y-6">
              {/* Service Basic Info */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
                  <img
                    src={
                      selectedService.images && selectedService.images.length > 0
                        ? getImageUrl(selectedService.images[0].path)
                        : getImageUrl(selectedService.image) || "/placeholder.svg"
                    }
                    alt={selectedService.name}
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedService.name}</h3>
                  <p className="text-muted-foreground">{selectedService.description}</p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p>{formatPrice(selectedService.price, selectedService.discountAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p>{getApprovalBadge(selectedService.isApproved)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Provider</h4>
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={getImageUrl(selectedService.provider.imagePath) || "/placeholder.svg"}
                      alt={selectedService.provider.name}
                      className="object-cover w-full h-full"
                      onError={handleImageError}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedService.provider.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedService.provider.phoneNumber}</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">ID: {selectedService.provider.id}</div>
                </div>
              </div>

              {/* Category and Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Category</h4>
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    {selectedService.category.colorCode && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: selectedService.category.colorCode?.startsWith("#")
                            ? selectedService.category.colorCode
                            : `#${selectedService.category.colorCode}` || "#cccccc",
                        }}
                      ></div>
                    )}
                    <div>
                      <p className="font-medium">{selectedService.category.nameEn}</p>
                      <p className="text-sm text-muted-foreground">{selectedService.category.nameAr}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Subcategory</h4>
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    {selectedService.subCategory.colorCode && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: selectedService.subCategory.colorCode?.startsWith("#")
                            ? selectedService.subCategory.colorCode
                            : `#${selectedService.subCategory.colorCode}` || "#cccccc",
                        }}
                      ></div>
                    )}
                    <div>
                      <p className="font-medium">{selectedService.subCategory.nameEn}</p>
                      <p className="text-sm text-muted-foreground">{selectedService.subCategory.nameAr}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Images */}
              {selectedService.images && selectedService.images.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Service Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {selectedService.images.map((image) => (
                      <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={getImageUrl(image.path) || "/placeholder.svg"}
                          alt={`Service image ${image.id}`}
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
                    <p className="font-medium">{selectedService.price.toLocaleString()} IQD</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-sm text-muted-foreground">Discount</p>
                    <p className="font-medium">{(selectedService.discountAmount * 100).toFixed(0)}%</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-sm text-muted-foreground">Platform Commission</p>
                    <p className="font-medium">{selectedService.platformRatio}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8 text-muted-foreground">
              No service details available.
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedService && <Button className="bg-blue-600 hover:bg-blue-700">Edit Service</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
