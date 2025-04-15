"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CategoryForm } from "@/components/dashboard/category-form"

export function AddCategoryButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Category
      </Button>
      <CategoryForm
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          // Refresh the categories list
          window.location.reload()
        }}
      />
    </>
  )
}
