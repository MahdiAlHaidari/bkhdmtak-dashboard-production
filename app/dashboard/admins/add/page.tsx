import { PageTitle } from "@/components/dashboard/page-title"
import { AddAdminForm } from "@/components/dashboard/add-admin-form"

export default function AddAdminPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageTitle title="Add New Admin" description="Create a new administrator account" />
      <AddAdminForm />
    </div>
  )
}
