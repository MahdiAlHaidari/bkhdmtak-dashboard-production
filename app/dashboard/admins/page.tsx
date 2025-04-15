import { PageTitle } from "@/components/dashboard/page-title"
import { AdminsList } from "@/components/dashboard/admins-list"

export default function AdminsPage() {
  return (
    <div className="flex flex-col gap-5 p-4 md:p-8">
      <PageTitle title="Admins" description="View and manage system administrators" />
      <AdminsList />
    </div>
  )
}
