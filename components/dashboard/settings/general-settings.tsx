"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Platform Information</h3>
        <p className="text-sm text-muted-foreground">Update your platform details and branding</p>
      </div>
      <Separator />
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="platform-name">Platform Name</Label>
          <Input id="platform-name" defaultValue="ProviderHub" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="platform-description">Platform Description</Label>
          <Textarea id="platform-description" defaultValue="Connect users with service providers for all their needs" />
        </div>
        <div className="grid gap-2">
          <Label>Platform Logo</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/provider-O3yW607t3ZFR0WLm7ZDLfmtr0smcY5.png"
                alt="Platform Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <Button variant="outline" size="sm">
              Change Logo
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Regional Settings</h3>
        <p className="text-sm text-muted-foreground">Configure regional preferences for your platform</p>
      </div>
      <Separator />
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="timezone">Default Timezone</Label>
          <select
            id="timezone"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue="America/New_York"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">Default Currency</Label>
          <select
            id="currency"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue="USD"
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="CAD">Canadian Dollar (CAD)</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </div>
  )
}
