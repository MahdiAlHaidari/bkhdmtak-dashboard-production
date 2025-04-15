"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, X, Eye, CheckCircle, XCircle, ListFilter } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"
import type { Provider } from "@/services/types"
import { getProviders, updateProviderStatus } from "@/services/provider-service"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
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
import { ProviderCategories } from "./provider-categories"
import { getImageUrl } from "@/lib/api-constants"

// Mock data for fallback
const mockProviders = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    imagePath: "/placeholder.svg?height=32&width=32",
    isActive: true,
    isAvailable: true,
    countryId: 1,
    cityId: 1,
    stateId: 1,
    currentLatitude: 40.7128,
    currentLongitude: -74.006,
    practicingImage: "",
    unifiedCardImageFront: "",
    residenceCardImageFront: "",
    residenceCardImageBack: "",
    unifiedCardImageBack: "",
    accountOrCardNumber: "1234567890",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phoneNumber: "+1987654321",
    imagePath: "/placeholder.svg?height=32&width=32",
    isActive: true,
    isAvailable: true,
    countryId: 1,
    cityId: 1,
    stateId: 1,
    currentLatitude: 40.7128,
    currentLongitude: -74.006,
    practicingImage: "",
    unifiedCardImageFront: "",
    residenceCardImageFront: "",
    residenceCardImageBack: "",
    unifiedCardImageBack: "",
    accountOrCardNumber: "0987654321",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    phoneNumber: "+1122334455",
    imagePath: "/placeholder.svg?height=32&width=32",
    isActive: false,
    isAvailable: false,
    countryId: 1,
    cityId: 1,
    stateId: 1,
    currentLatitude: 40.7128,
    currentLongitude: -74.006,
    practicingImage: "",
    unifiedCardImageFront: "",
    residenceCardImageFront: "",
    residenceCardImageBack: "",
    unifiedCardImageBack: "",
    accountOrCardNumber: "1122334455",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@example.com",
    phoneNumber: "+1555666777",
    imagePath: "/placeholder.svg?height=32&width=32",
    isActive: true,
    isAvailable: true,
    countryId: 1,
    cityId: 1,
    stateId: 1,
    currentLatitude: 40.7128,
    currentLongitude: -74.006,
    practicingImage: "",
    unifiedCardImageFront: "",
    residenceCardImageFront: "",
    residenceCardImageBack: "",
    unifiedCardImageBack: "",
    accountOrCardNumber: "555666777",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david@example.com",
    phoneNumber: "+1999888777",
    imagePath: "/placeholder.svg?height=32&width=32",
    isActive: true,
    isAvailable: false,
    countryId: 1,
    cityId: 1,
    stateId: 1,
    currentLatitude: 40.7128,
    currentLongitude: -74.006,
    practicingImage: "",
    unifiedCardImageFront: "",
    residenceCardImageFront: "",
    residenceCardImageBack: "",
    unifiedCardImageBack: "",
    accountOrCardNumber: "999888777",
  },
]

export function ProvidersList() {
  const isMobile = useIsMobile()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Selected provider for details dialog
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Status update state
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = useState(false)
  const [providerToUpdate, setProviderToUpdate] = useState<{ provider: Provider; newStatus: boolean } | null>(null)

  // Provider categories dialog state
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false)
  const [selectedProviderForCategories, setSelectedProviderForCategories] = useState<number | null>(null)

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [nameFilter, setNameFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
  const [availableFilter, setAvailableFilter] = useState<boolean | undefined>(undefined)

  // Fetch providers
  const fetchProviders = async () => {
    setLoading(true)
    try {
      const response = await getProviders({
        pageNumber,
        pageSize,
        name: nameFilter || undefined,
        phoneNumber: phoneFilter || undefined,
        active: activeFilter,
        available: availableFilter,
      })

      setProviders(response.items)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
    } catch (err) {
      console.error("Error fetching providers:", err)
      setError("Failed to load providers. Please try again.")
      // Use mock data as fallback
      setProviders(mockProviders)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchProviders()
  }, [pageNumber, pageSize, nameFilter, phoneFilter, activeFilter, availableFilter])

  // Apply filters
  const applyFilters = () => {
    setPageNumber(1) // Reset to first page when applying filters
    fetchProviders()
  }

  // Reset filters
  const resetFilters = () => {
    setNameFilter("")
    setPhoneFilter("")
    setActiveFilter(undefined)
    setAvailableFilter(undefined)
    setPageNumber(1)
    fetchProviders()
  }

  // View provider details
  const viewProviderDetails = (provider: Provider) => {
    setSelectedProvider(provider)
    setDetailsDialogOpen(true)
  }

  // View provider categories
  const viewProviderCategories = (providerId: number) => {
    setSelectedProviderForCategories(providerId)
    setCategoriesDialogOpen(true)
  }

  // Handle status update confirmation
  const confirmStatusUpdate = (provider: Provider, newStatus: boolean) => {
    setProviderToUpdate({ provider, newStatus })
    setConfirmStatusDialogOpen(true)
  }

  // Update provider status
  const handleStatusUpdate = async () => {
    if (!providerToUpdate) return

    setStatusUpdateLoading(true)
    try {
      await updateProviderStatus(providerToUpdate.provider.id, providerToUpdate.newStatus)

      // Update the provider in the local state
      const updatedProviders = providers.map((p) =>
        p.id === providerToUpdate.provider.id ? { ...p, isActive: providerToUpdate.newStatus } : p,
      )
      setProviders(updatedProviders)

      // If we're viewing the provider details, update the selected provider
      if (selectedProvider && selectedProvider.id === providerToUpdate.provider.id) {
        setSelectedProvider({ ...selectedProvider, isActive: providerToUpdate.newStatus })
      }

      // Show success message
      toast({
        title: providerToUpdate.newStatus ? "Provider Activated" : "Provider Deactivated",
        description: `${providerToUpdate.provider.name} has been ${providerToUpdate.newStatus ? "activated" : "deactivated"} successfully.`,
      })
    } catch (err) {
      console.error("Error updating provider status:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update provider status",
        variant: "destructive",
      })
    } finally {
      setStatusUpdateLoading(false)
      setConfirmStatusDialogOpen(false)
      setProviderToUpdate(null)
    }
  }

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg?height=200&width=200"
  }

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant="outline" className={isActive ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}>
        {isActive ? (
          <>
            <CheckCircle className="mr-1 h-3 w-3" /> Active
          </>
        ) : (
          <>
            <XCircle className="mr-1 h-3 w-3" /> Inactive
          </>
        )}
      </Badge>
    )
  }

  // Get availability badge
  const getAvailabilityBadge = (isAvailable: boolean) => {
    return (
      <Badge
        variant="outline"
        className={isAvailable ? "border-blue-500 text-blue-500" : "border-orange-500 text-orange-500"}
      >
        {isAvailable ? "Available" : "Unavailable"}
      </Badge>
    )
  }

  if (loading && providers.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && providers.length === 0) {
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
        <Input
          placeholder="Filter by phone"
          value={phoneFilter}
          onChange={(e) => setPhoneFilter(e.target.value)}
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
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={activeFilter === true ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setActiveFilter(activeFilter === true ? undefined : true)}
        >
          Active
        </Badge>
        <Badge
          variant={activeFilter === false ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setActiveFilter(activeFilter === false ? undefined : false)}
        >
          Inactive
        </Badge>
        <Badge
          variant={availableFilter === true ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setAvailableFilter(availableFilter === true ? undefined : true)}
        >
          Available
        </Badge>
        <Badge
          variant={availableFilter === false ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setAvailableFilter(availableFilter === false ? undefined : false)}
        >
          Unavailable
        </Badge>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div>
        {filterUI}
        <div className="space-y-4">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={getImageUrl(provider.imagePath, true)}
                      alt={provider.name}
                      onError={handleImageError}
                    />
                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-xs text-muted-foreground">{provider.email || provider.phoneNumber}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => viewProviderDetails(provider)}>
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="mt-1">{getStatusBadge(provider.isActive)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Availability</div>
                  <div className="mt-1">{getAvailabilityBadge(provider.isAvailable)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Phone</div>
                  <div className="mt-1">{provider.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Location</div>
                  <div className="mt-1">{provider.cityId ? `City ID: ${provider.cityId}` : "Not specified"}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={provider.isActive ? "text-red-600" : "text-green-600"}
                  onClick={() => confirmStatusUpdate(provider, !provider.isActive)}
                >
                  {provider.isActive ? (
                    <>
                      <XCircle className="mr-1 h-3 w-3" /> Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" /> Activate
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={() => viewProviderCategories(provider.id)}>
                  <ListFilter className="mr-1 h-3 w-3" /> Categories
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
              <TableHead>Provider</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getImageUrl(provider.imagePath, true)}
                        alt={provider.name}
                        onError={handleImageError}
                      />
                      <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-xs text-muted-foreground">{provider.email || "No email"}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{provider.phoneNumber}</TableCell>
                <TableCell>{getStatusBadge(provider.isActive)}</TableCell>
                <TableCell>{getAvailabilityBadge(provider.isAvailable)}</TableCell>
                <TableCell>{provider.cityId ? `City ID: ${provider.cityId}` : "Not specified"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => viewProviderDetails(provider)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => viewProviderCategories(provider.id)}>
                      <ListFilter className="mr-1 h-3 w-3" /> Categories
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={provider.isActive ? "text-red-600" : "text-green-600"}
                      onClick={() => confirmStatusUpdate(provider, !provider.isActive)}
                    >
                      {provider.isActive ? (
                        <>
                          <XCircle className="mr-1 h-3 w-3" /> Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Activate
                        </>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {providers.length} of {totalCount} providers
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

      {/* Provider Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
            <DialogDescription>Detailed information about the provider</DialogDescription>
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-6">
              {/* Provider Basic Info */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(selectedProvider.imagePath, true) || "/placeholder.svg"}
                    alt={selectedProvider.name}
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedProvider.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{selectedProvider.email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>{selectedProvider.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account/Card Number</p>
                      <p>{selectedProvider.accountOrCardNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p>{getStatusBadge(selectedProvider.isActive)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <p>{getAvailabilityBadge(selectedProvider.isAvailable)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Location Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Country ID</p>
                    <p>{selectedProvider.countryId || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City ID</p>
                    <p>{selectedProvider.cityId || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State ID</p>
                    <p>{selectedProvider.stateId || "Not specified"}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Current Coordinates</p>
                  <p>
                    {selectedProvider.currentLatitude && selectedProvider.currentLongitude
                      ? `Lat: ${selectedProvider.currentLatitude}, Long: ${selectedProvider.currentLongitude}`
                      : "Location not available"}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Documents</h4>
                <Tabs defaultValue="unified">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
                    <TabsTrigger value="unified">Unified Card</TabsTrigger>
                    <TabsTrigger value="residence">Residence Card</TabsTrigger>
                    <TabsTrigger value="practicing">Practicing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="unified" className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Front</p>
                        <div className="border rounded-lg overflow-hidden h-48 relative">
                          <img
                            src={getImageUrl(selectedProvider.unifiedCardImageFront) || "/placeholder.svg"}
                            alt="Unified Card Front"
                            className="object-contain w-full h-full"
                            onError={handleImageError}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Back</p>
                        <div className="border rounded-lg overflow-hidden h-48 relative">
                          <img
                            src={getImageUrl(selectedProvider.unifiedCardImageBack) || "/placeholder.svg"}
                            alt="Unified Card Back"
                            className="object-contain w-full h-full"
                            onError={handleImageError}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="residence" className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Front</p>
                        <div className="border rounded-lg overflow-hidden h-48 relative">
                          <img
                            src={getImageUrl(selectedProvider.residenceCardImageFront) || "/placeholder.svg"}
                            alt="Residence Card Front"
                            className="object-contain w-full h-full"
                            onError={handleImageError}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Back</p>
                        <div className="border rounded-lg overflow-hidden h-48 relative">
                          <img
                            src={getImageUrl(selectedProvider.residenceCardImageBack) || "/placeholder.svg"}
                            alt="Residence Card Back"
                            className="object-contain w-full h-full"
                            onError={handleImageError}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="practicing" className="pt-4">
                    <div className="border rounded-lg overflow-hidden h-48 relative">
                      <img
                        src={getImageUrl(selectedProvider.practicingImage) || "/placeholder.svg"}
                        alt="Practicing Image"
                        className="object-contain w-full h-full"
                        onError={handleImageError}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedProvider && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsDialogOpen(false)
                    viewProviderCategories(selectedProvider.id)
                  }}
                >
                  <ListFilter className="mr-2 h-4 w-4" /> Manage Categories
                </Button>
                <Button
                  className={
                    selectedProvider.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  }
                  onClick={() => {
                    setDetailsDialogOpen(false)
                    confirmStatusUpdate(selectedProvider, !selectedProvider.isActive)
                  }}
                >
                  {selectedProvider.isActive ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" /> Deactivate Provider
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Activate Provider
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Provider Categories Dialog */}
      <Dialog open={categoriesDialogOpen} onOpenChange={setCategoriesDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Provider Categories</DialogTitle>
            <DialogDescription>Manage categories for this provider</DialogDescription>
          </DialogHeader>

          {selectedProviderForCategories && (
            <ProviderCategories
              providerId={selectedProviderForCategories}
              onClose={() => setCategoriesDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Status Change Dialog */}
      <AlertDialog open={confirmStatusDialogOpen} onOpenChange={setConfirmStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {providerToUpdate?.newStatus ? "Activate Provider" : "Deactivate Provider"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {providerToUpdate?.newStatus
                ? `Are you sure you want to activate ${providerToUpdate?.provider.name}? They will be able to access the platform and offer services.`
                : `Are you sure you want to deactivate ${providerToUpdate?.provider.name}? They will no longer be able to access the platform or offer services.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusUpdateLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleStatusUpdate()
              }}
              disabled={statusUpdateLoading}
              className={
                providerToUpdate?.newStatus ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {statusUpdateLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : providerToUpdate?.newStatus ? (
                "Activate"
              ) : (
                "Deactivate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
