"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorDisplayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  statusCode?: number
  onRetry?: () => void
}

export function ErrorDisplay({
  open,
  onOpenChange,
  title = "An error occurred",
  description = "There was a problem processing your request.",
  statusCode,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {title}
            {statusCode && <span className="text-sm">({statusCode})</span>}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="rounded-full bg-red-50 p-3">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onRetry && (
            <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
