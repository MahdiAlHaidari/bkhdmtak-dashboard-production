import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { PageTransition } from "@/components/animations/page-transition"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
            <PageTransition className="mx-auto max-w-7xl">{children}</PageTransition>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
