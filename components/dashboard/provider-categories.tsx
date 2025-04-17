"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, LogOut, RefreshCw } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { ProviderWithCategories } from "@/services/types"
import { getProviderWithCategories, updateProviderCategoryStatus } from "@/services/provider-service"
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
import { getImageUrl } from "@/lib/api-constants"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface ProviderCategoriesProps {
  providerId: number
  onClose: () => void
}

interface ErrorDisplayProps {
  message: string
  onRetry?: () => void
}

function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLoginAgain = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
        <XCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
      <p className="text-sm text-gray-600 mb-4">{message}</p>
      <div className="flex gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
        <Button variant="destructive" onClick={handleLoginAgain}>
          <LogOut className="mr-2 h-4 w-4" />
          Login Again
        </Button>
      </div>
    </div>
  )
}

export function ProviderCategories({ providerId, onClose }: ProviderCategoriesProps) {
  const isMobile = useIsMobile()
  const [providerData, setProviderData] = useState<ProviderWithCategories | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Status update state
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = useState(false)
  const [categoryToUpdate, setCategoryToUpdate] = useState<{ categoryId: number; newStatus: boolean } | null>(null)

  // Fetch provider with categories
  const fetchProviderWithCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProviderWithCategories(providerId)
      setProviderData(data)
    } catch (err) {
      console.error("Error fetching provider categories:", err)
      setError(err instanceof Error ? err.message : "Failed to load provider categories")
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchProviderWithCategories()
  }, [providerId])

  // Handle status update confirmation
  const confirmStatusUpdate = (categoryId: number, newStatus: boolean) => {
    setCategoryToUpdate({ categoryId, newStatus })
    setConfirmStatusDialogOpen(true)
  }

  // Update category status
  const handleStatusUpdate = async () => {
    if (!categoryToUpdate || !providerData) return

    setStatusUpdateLoading(true)
    try {
      await updateProviderCategoryStatus(providerId, categoryToUpdate.categoryId, categoryToUpdate.newStatus)

      // Update the local state
      const updatedCategories = providerData.providerCategories.map((pc) =>
        pc.category.id === categoryToUpdate.categoryId ? { ...pc, isApproved: categoryToUpdate.newStatus } : pc,
      )

      setProviderData({
        ...providerData,
        providerCategories: updatedCategories,
      })

      // Show success message
      toast({
        title: categoryToUpdate.newStatus ? "Category Approved" : "Category Rejected",
        description: `The category has been ${categoryToUpdate.newStatus ? "approved" : "rejected"} for this provider.`,
      })
    } catch (err) {
      console.error("Error updating category status:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update category status",
        variant: "destructive",
      })
    } finally {
      setStatusUpdateLoading(false)
      setConfirmStatusDialogOpen(false)
      setCategoryToUpdate(null)
    }
  }

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg?height=200&width=200"
  }

  // Get status badge
  const getStatusBadge = (isApproved: boolean) => {
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
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </>
        )}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchProviderWithCategories} />
  }

  if (!providerData) {
    return <ErrorDisplay message="No provider data found" onRetry={fetchProviderWithCategories} />
  }

  const { provider, providerCategories } = providerData

  // Provider info section
  const providerInfo = (
    <div className="flex items-center gap-3 mb-6">
      <Avatar className="h-12 w-12">
        <AvatarImage src={getImageUrl(provider.imagePath)} alt={provider.name} onError={handleImageError} />
        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-lg font-semibold">{provider.name}</h3>
        <p className="text-sm text-muted-foreground">{provider.phoneNumber}</p>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="space-y-4">
        {providerInfo}

        <h4 className="text-md font-medium mb-2">Provider Categories</h4>

        {providerCategories.length === 0 ? (
          <p className="text-muted-foreground">No categories found for this provider.</p>
        ) : (
          <div className="space-y-4">
            {providerCategories.map((pc) => (
              <div key={pc.category.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {pc.category.nameEn || `Category ID: ${pc.category.id}`}
                      {pc.category.nameAr && `(${pc.category.nameAr})`}
                    </div>
                    <div className="mt-1">{getStatusBadge(pc.isApproved)}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={pc.isApproved ? "text-red-600" : "text-green-600"}
                    onClick={() => confirmStatusUpdate(pc.category.id, !pc.isApproved)}
                  >
                    {pc.isApproved ? (
                      <>
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" /> Approve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {providerInfo}

      <h4 className="text-md font-medium mb-2">Provider Categories</h4>

      {providerCategories.length === 0 ? (
        <p className="text-muted-foreground">No categories found for this provider.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category ID</TableHead>
                <TableHead>Name (English)</TableHead>
                <TableHead>Name (Arabic)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providerCategories.map((pc) => (
                <TableRow key={pc.category.id}>
                  <TableCell>{pc.category.id}</TableCell>
                  <TableCell>{pc.category.nameEn || "Not specified"}</TableCell>
                  <TableCell>{pc.category.nameAr || "Not specified"}</TableCell>
                  <TableCell>{getStatusBadge(pc.isApproved)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className={pc.isApproved ? "text-red-600" : "text-green-600"}
                      onClick={() => confirmStatusUpdate(pc.category.id, !pc.isApproved)}
                    >
                      {pc.isApproved ? (
                        <>
                          <XCircle className="mr-1 h-3 w-3" /> Reject
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Approve
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>

      {/* Confirm Status Change Dialog */}
      <AlertDialog open={confirmStatusDialogOpen} onOpenChange={setConfirmStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{categoryToUpdate?.newStatus ? "Approve Category" : "Reject Category"}</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToUpdate?.newStatus
                ? "Are you sure you want to approve this category for this provider? They will be able to offer services in this category."
                : "Are you sure you want to reject this category for this provider? They will no longer be able to offer services in this category."}
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
                categoryToUpdate?.newStatus ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {statusUpdateLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : categoryToUpdate?.newStatus ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
