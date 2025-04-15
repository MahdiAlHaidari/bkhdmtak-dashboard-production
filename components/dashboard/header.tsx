"use client"

import {
  Bell,
  Menu,
  Settings,
  User,
  Home,
  Briefcase,
  Users,
  BarChart3,
  Layers,
  LogOut,
  ShoppingBag,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[80%] sm:w-[350px]">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/provider-O3yW607t3ZFR0WLm7ZDLfmtr0smcY5.png"
                  alt="Bkhdmtak Logo"
                  width={40}
                  height={40}
                  className="h-8 w-auto"
                />
                <span className="text-lg font-semibold text-blue-600">Bkhdmtak Dashboard</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
          <div className="py-2">
            <nav className="grid items-start px-2 text-sm font-medium">
              {[
                { title: "Dashboard", href: "/dashboard", icon: Home },
                { title: "Providers", href: "/dashboard/providers", icon: Briefcase },
                { title: "Users", href: "/dashboard/users", icon: Users },
                { title: "Orders", href: "/dashboard/orders", icon: Calendar },
                { title: "Services", href: "/dashboard/services", icon: BarChart3 },
                { title: "Products", href: "/dashboard/products", icon: ShoppingBag },
                { title: "Categories", href: "/dashboard/categories", icon: Layers },
                { title: "Settings", href: "/dashboard/settings", icon: Settings },
              ].map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600 text-muted-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.title}</span>
                    {link.badge && <Badge className="ml-auto bg-blue-600 text-white">{link.badge}</Badge>}
                  </Link>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/provider-O3yW607t3ZFR0WLm7ZDLfmtr0smcY5.png"
          alt="Bkhdmtak Logo"
          width={40}
          height={40}
          className="h-8 w-auto"
        />
        <span className="text-lg font-semibold text-blue-600 hidden sm:inline">Bkhdmtak Dashboard</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                5
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[calc(100vh-10rem)] overflow-auto">
              <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                <div className="font-medium">New Provider Request</div>
                <div className="text-sm text-muted-foreground">Thomas Wilson has requested to join as a provider</div>
                <div className="text-xs text-muted-foreground mt-1">2 minutes ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                <div className="font-medium">New Provider Request</div>
                <div className="text-sm text-muted-foreground">
                  Rebecca Martinez has requested to join as a provider
                </div>
                <div className="text-xs text-muted-foreground mt-1">15 minutes ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                <div className="font-medium">New Provider Request</div>
                <div className="text-sm text-muted-foreground">James Johnson has requested to join as a provider</div>
                <div className="text-xs text-muted-foreground mt-1">1 hour ago</div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center text-blue-600 cursor-pointer">
              <Link href="/dashboard">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative h-8 overflow-hidden rounded-full w-8 p-0">
              {user ? (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.phoneNumber}</span>
                    {user.isSuperAdmin && <span className="text-xs text-blue-600 font-medium">Super Admin</span>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log in</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
