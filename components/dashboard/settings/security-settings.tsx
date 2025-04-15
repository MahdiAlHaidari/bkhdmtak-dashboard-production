"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Authentication</h3>
        <p className="text-sm text-muted-foreground">Configure authentication settings</p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="two-factor">Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">Require two-factor authentication for admin accounts</p>
          </div>
          <Switch id="two-factor" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="social-login">Social Login</Label>
            <p className="text-sm text-muted-foreground">Allow users to sign in with social accounts</p>
          </div>
          <Switch id="social-login" defaultChecked />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Password Policy</h3>
        <p className="text-sm text-muted-foreground">Configure password requirements</p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="min-length">Minimum Password Length</Label>
          <Input id="min-length" type="number" defaultValue="8" min="6" max="32" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="require-uppercase">Require Uppercase</Label>
            <p className="text-sm text-muted-foreground">Require at least one uppercase letter</p>
          </div>
          <Switch id="require-uppercase" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="require-number">Require Number</Label>
            <p className="text-sm text-muted-foreground">Require at least one number</p>
          </div>
          <Switch id="require-number" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="require-special">Require Special Character</Label>
            <p className="text-sm text-muted-foreground">Require at least one special character</p>
          </div>
          <Switch id="require-special" defaultChecked />
        </div>
      </div>
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </div>
  )
}
