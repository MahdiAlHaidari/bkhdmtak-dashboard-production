"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <p className="text-sm text-muted-foreground">Configure which email notifications are sent to administrators</p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="new-provider">New Provider Registration</Label>
            <p className="text-sm text-muted-foreground">Receive notifications when a new provider registers</p>
          </div>
          <Switch id="new-provider" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="new-user">New User Registration</Label>
            <p className="text-sm text-muted-foreground">Receive notifications when a new user registers</p>
          </div>
          <Switch id="new-user" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="new-booking">New Booking</Label>
            <p className="text-sm text-muted-foreground">Receive notifications for new service bookings</p>
          </div>
          <Switch id="new-booking" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="booking-cancelled">Booking Cancellation</Label>
            <p className="text-sm text-muted-foreground">Receive notifications when a booking is cancelled</p>
          </div>
          <Switch id="booking-cancelled" defaultChecked />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">System Notifications</h3>
        <p className="text-sm text-muted-foreground">Configure system-level notifications</p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="system-updates">System Updates</Label>
            <p className="text-sm text-muted-foreground">Receive notifications about system updates</p>
          </div>
          <Switch id="system-updates" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="security-alerts">Security Alerts</Label>
            <p className="text-sm text-muted-foreground">Receive notifications about security issues</p>
          </div>
          <Switch id="security-alerts" defaultChecked />
        </div>
      </div>
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </div>
  )
}
