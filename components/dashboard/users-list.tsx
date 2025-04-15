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
import { Search, X, Eye, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getUsers, getUserById, updateUserBlockedStatus } from "@/services/user-service"
import type { User } from "@/services/types"
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

// Mock data for fallback
const mockUsers = [
  {
    id: 1,
    name: "Alice Johnson",
    phoneNumber: "+1234567890",
    imagePath: "/placeholder.svg?height=32&width=32",
    countryId: 1,
    cityId: 1,
    stateId: 1,
    isBlocked: false,
  },
  {
    id: 2,
    name: "Bob Smith",
    phoneNumber: "+1987654321",
    imagePath: "/placeholder.svg?height=32&width=32",
    countryId: 1,
    cityId: 2,
    stateId: 1,
    isBlocked: false,
  },
  {
    id: 3,
    name: "Carol White",
    phoneNumber: "+1122334455",
    imagePath: "/placeholder.svg?height=32&width=32",
    countryId: 1,
    cityId: 3,
    stateId: 2,
    isBlocked: true,
  },
  {
    id: 4,
    name: "Dave Brown",
    phoneNumber: "+1555666777",
    imagePath: "/placeholder.svg?height=32&width=32",
    countryId: 2,
    cityId: 4,
    stateId: 3,
    isBlocked: false,
  },
  {
    id: 5,
    name: "Eve Davis",
    phoneNumber: "+1999888777",
    imagePath: "/placeholder.svg?height=32&width=32",
    countryId: 2,
    cityId: 5,
    stateId: 3,
    isBlocked: false,
  },
]

export function UsersList() {
  const isMobile = useIsMobile()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usedMockData, setUsedMockData] = useState(false)

  // Selected user for details dialog
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Status update state
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = useState(false)
  const [userToUpdate, setUserToUpdate] = useState<{ user: User; newStatus: boolean } | null>(null)

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [nameFilter, setNameFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await getUsers({
        pageNumber,
        pageSize,
        name: nameFilter || undefined,
        phoneNumber: phoneFilter || undefined,
      })

      if (response.items.length > 0) {
        setUsers(response.items)
        setTotalPages(response.totalPages)
        setTotalCount(response.totalCount)
        setUsedMockData(false)
      } else {
        // If the API returns an empty array, use mock data
        setUsers(mockUsers)
        setTotalPages(1)
        setTotalCount(mockUsers.length)
        setUsedMockData(true)
      }
      setError(null)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users. Using sample data instead.")

      // Always use mock data on error
      setUsers(mockUsers)
      setTotalPages(1)
      setTotalCount(mockUsers.length)
      setUsedMockData(true)

      // Show toast with error
      toast({
        title: "Error loading users",
        description: "Using sample data instead. You may need to refresh or log in again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [pageNumber, pageSize])

  // Apply filters
  const applyFilters = () => {
    setPageNumber(1) // Reset to first page when applying filters
    fetchUsers()
  }

  // Reset filters
  const resetFilters = () => {
    setNameFilter("")
    setPhoneFilter("")
    setPageNumber(1)
    fetchUsers()
  }

  // View user details
  const viewUserDetails = async (userId: number) => {
    setDetailsLoading(true)
    try {
      // If we're using mock data, find the user in the mock data
      if (usedMockData) {
        const mockUser = mockUsers.find((u) => u.id === userId)
        if (mockUser) {
          setSelectedUser(mockUser as User)
          setDetailsDialogOpen(true)
          return
        }
      }

      // Otherwise, fetch from API
      const userDetails = await getUserById(userId)
      setSelectedUser(userDetails)
      setDetailsDialogOpen(true)
    } catch (err) {
      console.error("Error fetching user details:", err)
      toast({
        title: "Error",
        description: "Failed to load user details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDetailsLoading(false)
    }
  }

  // Handle status update confirmation
  const confirmStatusUpdate = (user: User, newStatus: boolean) => {
    setUserToUpdate({ user, newStatus })
    setConfirmStatusDialogOpen(true)
  }

  // Update user status
  const handleStatusUpdate = async () => {
    if (!userToUpdate) return

    setStatusUpdateLoading(true)
    try {
      // If we're using mock data, just update the local state
      if (usedMockData) {
        // Update the user in the local state
        const updatedUsers = users.map((u) =>
          u.id === userToUpdate.user.id ? { ...u, isBlocked: !userToUpdate.user.isBlocked } : u,
        )
        setUsers(updatedUsers)

        // If we're viewing the user details, update the selected user
        if (selectedUser && selectedUser.id === userToUpdate.user.id) {
          setSelectedUser({ ...selectedUser, isBlocked: !selectedUser.isBlocked })
        }

        // Show success message
        toast({
          title: userToUpdate.user.isBlocked ? "User Unblocked" : "User Blocked",
          description: `${userToUpdate.user.name} has been ${userToUpdate.user.isBlocked ? "unblocked" : "blocked"} successfully.`,
        })

        return
      }

      // Otherwise, update via API
      await updateUserBlockedStatus(userToUpdate.user.id, !userToUpdate.user.isBlocked)

      // Update the user in the local state
      const updatedUsers = users.map((u) =>
        u.id === userToUpdate.user.id ? { ...u, isBlocked: !userToUpdate.user.isBlocked } : u,
      )
      setUsers(updatedUsers)

      // If we're viewing the user details, update the selected user
      if (selectedUser && selectedUser.id === userToUpdate.user.id) {
        setSelectedUser({ ...selectedUser, isBlocked: !selectedUser.isBlocked })
      }

      // Show success message
      toast({
        title: userToUpdate.user.isBlocked ? "User Unblocked" : "User Blocked",
        description: `${userToUpdate.user.name} has been ${userToUpdate.user.isBlocked ? "unblocked" : "blocked"} successfully.`,
      })
    } catch (err) {
      console.error("Error updating user status:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user status",
        variant: "destructive",
      })
    } finally {
      setStatusUpdateLoading(false)
      setConfirmStatusDialogOpen(false)
      setUserToUpdate(null)
    }
  }

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/person-2n19vN0KvHZAuFSp0P3ds1C2TsR8qx.png"
  }

  // Get status badge
  const getStatusBadge = (isBlocked: boolean) => {
    return (
      <Badge
        variant="outline"
        className={isBlocked ? "border-red-500 text-red-500" : "border-green-500 text-green-500"}
      >
        {isBlocked ? (
          <>
            <XCircle className="mr-1 h-3 w-3" /> Blocked
          </>
        ) : (
          <>
            <CheckCircle className="mr-1 h-3 w-3" /> Active
          </>
        )}
      </Badge>
    )
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && users.length === 0) {
    // This should never happen now since we always set mock data on error
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
      {usedMockData && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          Note: Displaying sample data. Connection to the server could not be established.
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <div>
        {filterUI}
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getImageUrl(user.imagePath, true)} alt={user.name} onError={handleImageError} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.phoneNumber}</div>
                  </div>
                </div>
                <div>{getStatusBadge(user.isBlocked)}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Country ID</div>
                  <div className="mt-1">{user.countryId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">City ID</div>
                  <div className="mt-1">{user.cityId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">State ID</div>
                  <div className="mt-1">{user.stateId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Actions</div>
                  <div className="mt-1 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => viewUserDetails(user.id)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={user.isBlocked ? "text-green-600" : "text-red-600"}
                      onClick={() => confirmStatusUpdate(user, !user.isBlocked)}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  </div>
                </div>
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

        {/* User Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Detailed information about the user</DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* User Basic Info */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <img
                      src={getImageUrl(selectedUser.imagePath, true) || "/placeholder.svg"}
                      alt={selectedUser.name}
                      className="object-cover w-full h-full"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.phoneNumber}</p>
                    <div className="mt-2">{getStatusBadge(selectedUser.isBlocked)}</div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-2">Location Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Country ID</p>
                        <p>{selectedUser.countryId || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">City ID</p>
                        <p>{selectedUser.cityId || "Not specified"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State ID</p>
                      <p>{selectedUser.stateId || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                Close
              </Button>
              {selectedUser && (
                <Button
                  className={selectedUser.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                  onClick={() => {
                    setDetailsDialogOpen(false)
                    confirmStatusUpdate(selectedUser, !selectedUser.isBlocked)
                  }}
                >
                  {selectedUser.isBlocked ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Unblock User
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" /> Block User
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Status Change Dialog */}
        <AlertDialog open={confirmStatusDialogOpen} onOpenChange={setConfirmStatusDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{userToUpdate?.user.isBlocked ? "Unblock User" : "Block User"}</AlertDialogTitle>
              <AlertDialogDescription>
                {userToUpdate?.user.isBlocked
                  ? `Are you sure you want to unblock ${userToUpdate?.user.name}? They will be able to access the platform.`
                  : `Are you sure you want to block ${userToUpdate?.user.name}? They will no longer be able to access the platform.`}
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
                  userToUpdate?.user.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }
              >
                {statusUpdateLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : userToUpdate?.user.isBlocked ? (
                  "Unblock"
                ) : (
                  "Block"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getImageUrl(user.imagePath, true)} alt={user.name} onError={handleImageError} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.name}</div>
                  </div>
                </TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{getStatusBadge(user.isBlocked)}</TableCell>
                <TableCell>{user.countryId}</TableCell>
                <TableCell>{user.cityId}</TableCell>
                <TableCell>{user.stateId}</TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => viewUserDetails(user.id)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={user.isBlocked ? "text-green-600" : "text-red-600"}
                      onClick={() => confirmStatusUpdate(user, !user.isBlocked)}
                    >
                      {user.isBlocked ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Unblock
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" /> Block
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
          Showing {users.length} of {totalCount} users
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

      {/* User Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the user</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Basic Info */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <img
                    src={getImageUrl(selectedUser.imagePath, true) || "/placeholder.svg"}
                    alt={selectedUser.name}
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.phoneNumber}</p>
                  <div className="mt-2">{getStatusBadge(selectedUser.isBlocked)}</div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Location Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Country ID</p>
                    <p>{selectedUser.countryId || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City ID</p>
                    <p>{selectedUser.cityId || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State ID</p>
                    <p>{selectedUser.stateId || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedUser && (
              <Button
                className={selectedUser.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                onClick={() => {
                  setDetailsDialogOpen(false)
                  confirmStatusUpdate(selectedUser, !selectedUser.isBlocked)
                }}
              >
                {selectedUser.isBlocked ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Unblock User
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" /> Block User
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Status Change Dialog */}
      <AlertDialog open={confirmStatusDialogOpen} onOpenChange={setConfirmStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{userToUpdate?.user.isBlocked ? "Unblock User" : "Block User"}</AlertDialogTitle>
            <AlertDialogDescription>
              {userToUpdate?.user.isBlocked
                ? `Are you sure you want to unblock ${userToUpdate?.user.name}? They will be able to access the platform.`
                : `Are you sure you want to block ${userToUpdate?.user.name}? They will no longer be able to access the platform.`}
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
                userToUpdate?.user.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {statusUpdateLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : userToUpdate?.user.isBlocked ? (
                "Unblock"
              ) : (
                "Block"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
