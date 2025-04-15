"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SubCategoryForm } from "@/components/dashboard/subcategory-form"

export function AddSubCategoryButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Subcategory
      </Button>
      <SubCategoryForm
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          // Refresh the subcategories list
          window.location.reload()
        }}
      />
    </>
  )
}
