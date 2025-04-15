"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Settings,
  Users,
  Briefcase,
  Layers,
  Home,
  ShoppingBag,
  Calendar,
  CreditCard,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Providers",
    href: "/dashboard/providers",
    icon: Briefcase,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: Calendar,
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: BarChart3,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: ShoppingBag,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: Layers,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "Admins",
    href: "/dashboard/admins",
    icon: Shield,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  return (
    <div
      className={cn(
        "hidden md:flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
        "md:w-[240px] lg:w-[280px] xl:w-[300px]",
      )}
    >
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600",
                  isActive ? "bg-blue-50 text-blue-600" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{link.title}</span>
                {link.badge && <Badge className="ml-auto bg-blue-600 text-white">{link.badge}</Badge>}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
