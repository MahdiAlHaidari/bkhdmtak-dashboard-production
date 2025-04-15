import { PaymentsList } from "@/components/dashboard/payments-list"
import { PageTitle } from "@/components/dashboard/page-title"

export default function PaymentsPage() {
  return (
    <div className="space-y-4">
      <PageTitle title="Payments" description="View and manage payment transactions" />
      <PaymentsList />
    </div>
  )
}
