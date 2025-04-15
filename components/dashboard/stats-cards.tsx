"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Calendar, ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"
import { type DashboardData, getDashboardData } from "@/services/admin-service"
import { ErrorDisplay } from "@/components/ui/error-display"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Add animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// Mock data for fallback
const mockDashboardData: DashboardData = {
  totalUsers: 1250,
  totalProviders: 85,
  totalOrders: 3420,
  totalServices: 175,
  usersPercentageChange: 12.5,
  providersPercentageChange: 8.2,
  ordersPercentageChange: 15.7,
  servicesPercentageChange: 5.3,
  totalOrdersByMonth: [],
}

export function StatsCards() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)

        // Check if user is authenticated before making the API call
        if (!isAuthenticated) {
          console.log("User not authenticated, using mock data")
          setDashboardData(mockDashboardData)
          return
        }

        const data = await getDashboardData()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)

        // Extract status code if available
        let statusCode = null
        let errorMessage = "Failed to load dashboard data. Please try again."

        if (err instanceof Error) {
          errorMessage = err.message

          // Try to extract status code from error object
          if ((err as any).statusCode) {
            statusCode = (err as any).statusCode
          }
        }

        // Handle 401 errors by using mock data instead of showing error
        if (statusCode === 401) {
          console.log("401 error in dashboard, using mock data")
          setDashboardData(mockDashboardData)
          return
        }

        setError(errorMessage)
        setErrorStatusCode(statusCode)
        setErrorDialogOpen(true)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated])

  // Format percentage change with + sign for positive values
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 animate-pulse bg-blue-100 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 animate-pulse bg-blue-50 rounded-md"></div>
              <div className="h-4 w-32 mt-2 animate-pulse bg-blue-50 rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <ErrorDisplay
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        title="Error Loading Dashboard Data"
        description={error || "There was a problem loading the dashboard data."}
        statusCode={errorStatusCode || undefined}
        onRetry={() => {
          setErrorDialogOpen(false)
          setLoading(true)
          getDashboardData()
            .then((data) => {
              setDashboardData(data)
              setError(null)
            })
            .catch((err) => {
              console.error("Error retrying dashboard data fetch:", err)
              setError(err instanceof Error ? err.message : "Failed to load dashboard data")
              setErrorDialogOpen(true)
            })
            .finally(() => setLoading(false))
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalUsers.toLocaleString() || "0"}</div>
              <p
                className={`text-xs ${dashboardData?.usersPercentageChange > 0 ? "text-green-600" : dashboardData?.usersPercentageChange < 0 ? "text-red-600" : "text-muted-foreground"}`}
              >
                {dashboardData ? formatPercentage(dashboardData.usersPercentageChange) : "0%"} from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalProviders.toLocaleString() || "0"}</div>
              <p
                className={`text-xs ${dashboardData?.providersPercentageChange > 0 ? "text-green-600" : dashboardData?.providersPercentageChange < 0 ? "text-red-600" : "text-muted-foreground"}`}
              >
                {dashboardData ? formatPercentage(dashboardData.providersPercentageChange) : "0%"} from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalOrders.toLocaleString() || "0"}</div>
              <p
                className={`text-xs ${dashboardData?.ordersPercentageChange > 0 ? "text-green-600" : dashboardData?.ordersPercentageChange < 0 ? "text-red-600" : "text-muted-foreground"}`}
              >
                {dashboardData ? formatPercentage(dashboardData.ordersPercentageChange) : "0%"} from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalServices.toLocaleString() || "0"}</div>
              <p
                className={`text-xs ${dashboardData?.servicesPercentageChange > 0 ? "text-green-600" : dashboardData?.servicesPercentageChange < 0 ? "text-red-600" : "text-muted-foreground"}`}
              >
                {dashboardData ? formatPercentage(dashboardData.servicesPercentageChange) : "0%"} from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
}
