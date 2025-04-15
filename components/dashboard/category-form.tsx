"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createCategory, updateCategory } from "@/services/category-service"
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/services/types"
import { toast } from "@/hooks/use-toast"
import { X, Upload, ImageIcon } from "lucide-react"
import { IMAGE_BASE_URL } from "@/lib/api-constants"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  category?: Category | null // Pass category for edit mode
  mode?: "create" | "edit"
}

export function CategoryForm({ open, onOpenChange, onSuccess, category = null, mode = "create" }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCategoryRequest | UpdateCategoryRequest>({
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    markerImage: null,
    image: null,
    colorCode: "4CAF50", // Default color without hash
    platformDiscount: 0, // Default value for platform discount
  })

  // Image preview states
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [markerImagePreview, setMarkerImagePreview] = useState<string | null>(null)

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const markerImageInputRef = useRef<HTMLInputElement>(null)

  // Base S3 URL for media
  // Using the centralized constant for media URLs

  // Initialize form data when in edit mode and category changes
  useEffect(() => {
    if (mode === "edit" && category) {
      setFormData({
        nameAr: category.nameAr || "",
        nameEn: category.nameEn || "",
        descriptionAr: category.descriptionAr || "",
        descriptionEn: category.descriptionEn || "",
        markerImage: null,
        image: null,
        colorCode: category.colorCode?.startsWith("#")
          ? category.colorCode.substring(1)
          : category.colorCode || "4CAF50",
        platformDiscount: category.platformDiscount || 0, // Set platformDiscount from category
      })

      // Set image previews if available
      if (category.image) {
        setImagePreview(`${IMAGE_BASE_URL}${category.image}`)
      }
      if (category.markerImage) {
        setMarkerImagePreview(`${IMAGE_BASE_URL}${category.markerImage}`)
      }
    }
  }, [category, mode])

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // For color code, remove the hash if present
    if (name === "colorCode") {
      const colorValue = value.startsWith("#") ? value.substring(1) : value
      setFormData((prev) => ({ ...prev, [name]: colorValue }))
    } else if (name === "platformDiscount") {
      // Handle platform discount as a number
      const numValue = Number.parseFloat(value)
      // Validate that it's between 0 and 1
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
        setFormData((prev) => ({ ...prev, [name]: numValue }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle image file changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "markerImage") => {
    const file = e.target.files?.[0] || null

    if (file) {
      // Update form data
      setFormData((prev) => ({ ...prev, [type]: file }))

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      if (type === "image") {
        setImagePreview(previewUrl)
      } else {
        setMarkerImagePreview(previewUrl)
      }
    }
  }

  // Clear image
  const clearImage = (type: "image" | "markerImage") => {
    if (type === "image") {
      setFormData((prev) => ({ ...prev, image: null }))
      setImagePreview(null)
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    } else {
      setFormData((prev) => ({ ...prev, markerImage: null }))
      setMarkerImagePreview(null)
      if (markerImageInputRef.current) {
        markerImageInputRef.current.value = ""
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.nameAr || !formData.nameEn) {
        toast({
          title: "Validation Error",
          description: "Category names in both Arabic and English are required.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Validate platformDiscount
      if (formData.platformDiscount < 0 || formData.platformDiscount > 1) {
        toast({
          title: "Validation Error",
          description: "Platform discount must be between 0 and 1.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (mode === "create") {
        // Create new category
        const result = await createCategory(formData as CreateCategoryRequest)

        // Show success message
        toast({
          title: "Category Created",
          description: `Category "${formData.nameEn}" has been created successfully with ID: ${result.id}`,
        })
      } else if (mode === "edit" && category) {
        // Update existing category
        await updateCategory(category.id, formData as UpdateCategoryRequest)

        // Show success message
        toast({
          title: "Category Updated",
          description: `Category "${formData.nameEn}" has been updated successfully.`,
        })
      }

      // Reset form
      setFormData({
        nameAr: "",
        nameEn: "",
        descriptionAr: "",
        descriptionEn: "",
        markerImage: null,
        image: null,
        colorCode: "4CAF50",
        platformDiscount: 0, // Reset platformDiscount
      })
      setImagePreview(null)
      setMarkerImagePreview(null)

      // Close dialog
      onOpenChange(false)

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} category:`, error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${mode === "create" ? "create" : "update"} category`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Category" : "Edit Category"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new service category for your platform."
              : "Update the details of this service category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameEn">
                Name (English) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nameEn"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleInputChange}
                placeholder="e.g. Cleaning"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameAr">
                Name (Arabic) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nameAr"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleInputChange}
                placeholder="e.g. تنظيف"
                required
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">Description (English)</Label>
              <Textarea
                id="descriptionEn"
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleInputChange}
                placeholder="Describe the category in English"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionAr">Description (Arabic)</Label>
              <Textarea
                id="descriptionAr"
                name="descriptionAr"
                value={formData.descriptionAr}
                onChange={handleInputChange}
                placeholder="Describe the category in Arabic"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorCode">Color Code</Label>
            <div className="flex items-center gap-2">
              <Input
                id="colorCode"
                name="colorCode"
                type="color"
                value={`#${formData.colorCode}`}
                onChange={handleInputChange}
                className="w-12 h-10 p-1"
              />
              <Input
                value={formData.colorCode}
                onChange={handleInputChange}
                name="colorCode"
                placeholder="RRGGBB"
                className="flex-1"
              />
            </div>
          </div>

          {/* Platform Discount Field */}
          <div className="space-y-2">
            <Label htmlFor="platformDiscount">Platform Discount (0-1)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="platformDiscount"
                name="platformDiscount"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={formData.platformDiscount}
                onChange={handleInputChange}
                className="flex-1"
              />
              <div className="w-12 h-10 flex items-center justify-center bg-muted rounded-md">
                {(formData.platformDiscount * 100).toFixed(0)}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Enter a value between 0 and 1 (e.g., 0.1 for 10% discount)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="border rounded-md p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Category Preview"
                      className="w-full h-32 object-contain rounded-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background"
                      onClick={() => clearImage("image")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 bg-muted/30 rounded-md">
                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <Label htmlFor="image" className="text-sm text-blue-600 cursor-pointer hover:underline">
                      Upload Image
                    </Label>
                  </div>
                )}
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "image")}
                  className="hidden"
                  ref={imageInputRef}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Marker Image</Label>
              <div className="border rounded-md p-4">
                {markerImagePreview ? (
                  <div className="relative">
                    <img
                      src={markerImagePreview || "/placeholder.svg"}
                      alt="Marker Preview"
                      className="w-full h-32 object-contain rounded-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background"
                      onClick={() => clearImage("markerImage")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 bg-muted/30 rounded-md">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <Label htmlFor="markerImage" className="text-sm text-blue-600 cursor-pointer hover:underline">
                      Upload Marker
                    </Label>
                  </div>
                )}
                <Input
                  id="markerImage"
                  name="markerImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "markerImage")}
                  className="hidden"
                  ref={markerImageInputRef}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create Category"
              ) : (
                "Update Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
