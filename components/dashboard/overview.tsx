"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"
import { getDashboardData } from "@/services/admin-service"
import { useNarrowScreen } from "@/hooks/use-narrow-screen"

// Mock data for fallback
const mockChartData = [
  { month: 1, totalOrders: 120 },
  { month: 2, totalOrders: 150 },
  { month: 3, totalOrders: 180 },
  { month: 4, totalOrders: 220 },
  { month: 5, totalOrders: 270 },
  { month: 6, totalOrders: 250 },
  { month: 7, totalOrders: 300 },
  { month: 8, totalOrders: 350 },
  { month: 9, totalOrders: 380 },
  { month: 10, totalOrders: 400 },
  { month: 11, totalOrders: 450 },
  { month: 12, totalOrders: 500 },
]

// Month names for the chart
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function Overview() {
  const [chartData, setChartData] = useState(mockChartData)
  const [loading, setLoading] = useState(true)
  const isNarrowScreen = useNarrowScreen()

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true)
        const data = await getDashboardData()

        if (data.totalOrdersByMonth && data.totalOrdersByMonth.length > 0) {
          setChartData(data.totalOrdersByMonth)
        }
      } catch (err) {
        console.error("Error fetching chart data:", err)
        // Keep using mock data on error
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  // Format the month number to month name
  const formatMonth = (month: number) => {
    return monthNames[month - 1] || month
  }

  return (
    <div className="h-[300px] w-full">
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 25, bottom: 5, left: 0 }}>
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={isNarrowScreen ? 1 : 0}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <Card className="border-blue-100 bg-background p-2 shadow-md">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium text-muted-foreground">Month:</span>
                        <span className="font-medium">{formatMonth(payload[0].payload.month)}</span>
                        <span className="font-medium text-muted-foreground">Orders:</span>
                        <span className="font-medium">{payload[0].value}</span>
                      </div>
                    </Card>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="totalOrders" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-blue-600" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
