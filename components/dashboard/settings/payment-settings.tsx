"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function PaymentSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Payment Gateways</h3>
        <p className="text-sm text-muted-foreground">Configure payment gateway integrations</p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="stripe">Stripe</Label>
            <p className="text-sm text-muted-foreground">Enable Stripe payment processing</p>
          </div>
          <Switch id="stripe" defaultChecked />
        </div>
        <div className="grid gap-4 pl-6">
          <div className="grid gap-2">
            <Label htmlFor="stripe-key">API Key</Label>
            <Input id="stripe-key" type="password" value="sk_test_•••••••••••••••••" readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stripe-webhook">Webhook Secret</Label>
            <Input id="stripe-webhook" type="password" value="whsec_•••••••••••••••••" readOnly />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="paypal">PayPal</Label>
            <p className="text-sm text-muted-foreground">Enable PayPal payment processing</p>
          </div>
          <Switch id="paypal" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Commission Settings</h3>
        <p className="text-sm text-muted-foreground">Configure platform commission rates</p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="commission-rate">Platform Commission Rate (%)</Label>
          <Input id="commission-rate" type="number" defaultValue="10" min="0" max="100" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="variable-commission">Variable Commission Rates</Label>
            <p className="text-sm text-muted-foreground">Enable different commission rates per service category</p>
          </div>
          <Switch id="variable-commission" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </div>
  )
}
