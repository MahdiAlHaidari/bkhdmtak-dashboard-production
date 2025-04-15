"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentBookings } from "@/components/dashboard/recent-bookings"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProvidersMap } from "@/components/dashboard/providers-map"
import { motion } from "framer-motion"

// Animation variants for staggered children
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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
      <StatsCards />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <motion.div variants={item}>
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Service bookings over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <Overview />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="w-full relative z-0">
            <CardHeader>
              <CardTitle>Providers Map</CardTitle>
              <CardDescription>Current active provider locations</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px]">
              <ProvidersMap />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <motion.div variants={item} initial="hidden" animate="show">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest service bookings across all providers</CardDescription>
            </div>
            <div className="mt-2 sm:mt-0">
              <select className="text-sm border rounded p-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <RecentBookings />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
