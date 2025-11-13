"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsIcon, Copy, Check } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [copied, setCopied] = useState("")

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(""), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your IoT platform and device settings.</p>
      </div>

      {/* General Settings */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <SettingsIcon size={24} />
            General Settings
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="My IoT Hub" placeholder="e.g., Home IoT" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">EST</SelectItem>
                    <SelectItem value="cst">CST</SelectItem>
                    <SelectItem value="pst">PST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Describe your IoT setup"
                defaultValue="Personal home automation and monitoring system"
              />
            </div>

            <Button>Save Changes</Button>
          </div>
        </div>
      </Card>

      {/* API Configuration */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">API Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Use these credentials to connect your ESP32 devices and send data to the platform.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">API URL</Label>
            <div className="flex gap-2">
              <Input
                id="api-url"
                readOnly
                value="https://api.iot-platform.local/data"
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard("https://api.iot-platform.local/data", "api-url")}
              >
                {copied === "api-url" ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                readOnly
                type="password"
                value="sk_live_abc123def456ghi789jkl"
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard("sk_live_abc123def456ghi789jkl", "api-key")}
              >
                {copied === "api-key" ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Alert Thresholds */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Alert Thresholds</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temp-max">Max Temperature (°C)</Label>
                <Input id="temp-max" type="number" defaultValue="40" placeholder="e.g., 40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp-min">Min Temperature (°C)</Label>
                <Input id="temp-min" type="number" defaultValue="10" placeholder="e.g., 10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="humidity-max">Max Humidity (%)</Label>
                <Input id="humidity-max" type="number" defaultValue="80" placeholder="e.g., 80" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity-min">Min Humidity (%)</Label>
                <Input id="humidity-min" type="number" defaultValue="20" placeholder="e.g., 20" />
              </div>
            </div>

            <Button>Save Thresholds</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
