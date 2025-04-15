"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, ShieldAlert, RefreshCw, PlusCircle, Trash2, AlertCircle, Star, StarOff, Key } from "lucide-react"
import { getAdmins, deleteAdmin, updateAdminRole, updateAdminPassword, type AdminInfo } from "@/services/admin-service"
import { ErrorDisplay } from "@/components/ui/error-display"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AdminsList() {
  const [admins, setAdmins] = useState<AdminInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<AdminInfo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null)

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [adminToUpdatePassword, setAdminToUpdatePassword] = useState<AdminInfo | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const fetchAdmins = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdmins()
      setAdmins(data)
    } catch (err) {
      console.error("Error fetching admins:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch admins")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleDeleteClick = (admin: AdminInfo) => {
    setAdminToDelete(admin)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return

    setIsDeleting(true)
    try {
      await deleteAdmin(adminToDelete.id)
      toast({
        title: "Admin deleted",
        description: `${adminToDelete.name || "Admin"} has been successfully deleted.`,
      })
      fetchAdmins() // Refresh the list
    } catch (err) {
      console.error("Error deleting admin:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete admin",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setAdminToDelete(null)
    }
  }

  const handleRoleChange = async (admin: AdminInfo) => {
    setUpdatingRoleId(admin.id)
    try {
      await updateAdminRole(admin.id, !admin.isSuperAdmin)
      toast({
        title: "Role updated",
        description: `${admin.name || "Admin"} is now a ${!admin.isSuperAdmin ? "Super Admin" : "Regular Admin"}.`,
      })

      // Update the local state to reflect the change immediately
      setAdmins(admins.map((a) => (a.id === admin.id ? { ...a, isSuperAdmin: !a.isSuperAdmin } : a)))
    } catch (err) {
      console.error("Error updating admin role:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update admin role",
        variant: "destructive",
      })
    } finally {
      setUpdatingRoleId(null)
    }
  }

  const handlePasswordClick = (admin: AdminInfo) => {
    setAdminToUpdatePassword(admin)
    setNewPassword("")
    setPasswordError(null)
    setPasswordDialogOpen(true)
  }

  const handlePasswordUpdate = async () => {
    if (!adminToUpdatePassword) return

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long")
      return
    }

    setIsUpdatingPassword(true)
    setPasswordError(null)

    try {
      await updateAdminPassword(adminToUpdatePassword.id, newPassword)
      toast({
        title: "Password updated",
        description: `Password for ${adminToUpdatePassword.name || "Admin"} has been successfully updated.`,
      })
      setPasswordDialogOpen(false)
      setAdminToUpdatePassword(null)
      setNewPassword("")
    } catch (err) {
      console.error("Error updating admin password:", err)
      setPasswordError(err instanceof Error ? err.message : "Failed to update password")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay
            title="Error Loading Admins"
            description={error}
            action={
              <Button onClick={fetchAdmins} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  if (admins.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Admins</CardTitle>
          <Link href="/dashboard/admins/add">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ShieldAlert className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-lg font-medium">No admins found</p>
            <p className="text-sm text-muted-foreground">There are no admin users in the system.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Admins</CardTitle>
          <Link href="/dashboard/admins/add">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>{admin.name || "N/A"}</TableCell>
                  <TableCell>{admin.phoneNumber || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Shield className={`mr-2 h-4 w-4 ${admin.isSuperAdmin ? "text-amber-500" : "text-slate-500"}`} />
                      {admin.isSuperAdmin ? "Super Admin" : "Admin"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePasswordClick(admin)}
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-100"
                          >
                            <Key className="h-4 w-4" />
                            <span className="sr-only">Change password</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Change password</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRoleChange(admin)}
                            disabled={updatingRoleId === admin.id}
                            className={
                              admin.isSuperAdmin
                                ? "text-amber-500 hover:text-amber-600 hover:bg-amber-100"
                                : "text-slate-500 hover:text-slate-600 hover:bg-slate-100"
                            }
                          >
                            {updatingRoleId === admin.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : admin.isSuperAdmin ? (
                              <StarOff className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {admin.isSuperAdmin ? "Remove super admin role" : "Make super admin"}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {admin.isSuperAdmin ? "Remove super admin role" : "Make super admin"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(admin)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete admin</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete admin</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Admin
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {adminToDelete?.name || "this admin"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Set a new password for {adminToUpdatePassword?.name || "this admin"}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)} disabled={isUpdatingPassword}>
              Cancel
            </Button>
            <Button onClick={handlePasswordUpdate} disabled={isUpdatingPassword || !newPassword}>
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
