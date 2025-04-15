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
import { createSubCategory, updateSubCategory } from "@/services/subcategory-service"
import type {
  CreateSubCategoryRequest,
  UpdateSubCategoryRequest,
  SubCategory,
  SubCategoryDetails,
  Category,
} from "@/services/types"
import { getCategories } from "@/services/category-service"
import { toast } from "@/hooks/use-toast"
import { X, Upload, ImageIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IMAGE_BASE_URL } from "@/lib/api-constants"

interface SubCategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  subcategory?: SubCategory | SubCategoryDetails | null // Pass subcategory for edit mode
  mode?: "create" | "edit"
}

export function SubCategoryForm({
  open,
  onOpenChange,
  onSuccess,
  subcategory = null,
  mode = "create",
}: SubCategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateSubCategoryRequest | UpdateSubCategoryRequest>({
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    markerImage: null,
    image: null,
    colorCode: "4CAF50", // Default color without hash
    categoryId: 0, // Default value for categoryId
  })

  // Image preview states
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [markerImagePreview, setMarkerImagePreview] = useState<string | null>(null)

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const markerImageInputRef = useRef<HTMLInputElement>(null)

  // State for parent categories
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Base S3 URL for media
  // Replace this line:
  // const S3_MEDIA_URL = "https://prod-bk-v2.s3.eu-north-1.amazonaws.com/Media/"
  // With this:
  // Using the centralized constant for media URLs

  // Fetch parent categories
  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true)
      try {
        const response = await getCategories({})
        setCategories(response)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load parent categories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Initialize form data when in edit mode and subcategory changes
  useEffect(() => {
    if (mode === "edit" && subcategory) {
      setFormData({
        nameAr: subcategory.nameAr || "",
        nameEn: subcategory.nameEn || "",
        descriptionAr: subcategory.descriptionAr || "",
        descriptionEn: subcategory.descriptionEn || "",
        markerImage: null,
        image: null,
        colorCode: subcategory.colorCode?.startsWith("#")
          ? subcategory.colorCode.substring(1)
          : subcategory.colorCode || "4CAF50",
        categoryId: subcategory.categoryId || 0,
      })

      // Set image previews if available
      if (subcategory.image) {
        setImagePreview(`${IMAGE_BASE_URL}${subcategory.image}`)
      }
      if (subcategory.markerImage) {
        setMarkerImagePreview(`${IMAGE_BASE_URL}${subcategory.markerImage}`)
      }
    }
  }, [subcategory, mode])

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // For color code, remove the hash if present
    if (name === "colorCode") {
      const colorValue = value.startsWith("#") ? value.substring(1) : value
      setFormData((prev) => ({ ...prev, [name]: colorValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle select change for categoryId
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: Number.parseInt(value) }))
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
          description: "Subcategory names in both Arabic and English are required.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!formData.categoryId) {
        toast({
          title: "Validation Error",
          description: "Please select a parent category.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (mode === "create") {
        // Create new subcategory
        const result = await createSubCategory(formData as CreateSubCategoryRequest)

        // Show success message
        toast({
          title: "Subcategory Created",
          description: `Subcategory "${formData.nameEn}" has been created successfully with ID: ${result.id}`,
        })
      } else if (mode === "edit" && subcategory) {
        // Update existing subcategory
        await updateSubCategory(subcategory.id, formData as UpdateSubCategoryRequest)

        // Show success message
        toast({
          title: "Subcategory Updated",
          description: `Subcategory "${formData.nameEn}" has been updated successfully.`,
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
        categoryId: 0,
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
      console.error(`Error ${mode === "create" ? "creating" : "updating"} subcategory:`, error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${mode === "create" ? "create" : "update"} subcategory`,
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
          <DialogTitle>{mode === "create" ? "Add New Subcategory" : "Edit Subcategory"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new subcategory for your platform."
              : "Update the details of this subcategory."}
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
                placeholder="e.g. House Cleaning"
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
                placeholder="e.g. تنظيف المنزل"
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
                placeholder="Describe the subcategory in English"
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
                placeholder="Describe the subcategory in Arabic"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">
              Parent Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.categoryId ? formData.categoryId.toString() : ""}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent category" />
              </SelectTrigger>
              <SelectContent>
                {loadingCategories ? (
                  <div className="flex items-center justify-center p-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="ml-2">Loading categories...</span>
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.nameEn}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subcategory Image</Label>
              <div className="border rounded-md p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Subcategory Preview"
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
                "Create Subcategory"
              ) : (
                "Update Subcategory"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
