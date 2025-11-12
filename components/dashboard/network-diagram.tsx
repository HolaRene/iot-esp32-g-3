"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const devices = [
  { id: 1, name: "ESP32-01", location: "Living Room", status: "online" },
  { id: 2, name: "ESP32-02", location: "Bedroom", status: "online" },
  { id: 3, name: "ESP32-03", location: "Kitchen", status: "warning" },
  { id: 4, name: "ESP32-04", location: "Office", status: "offline" },
]

export function NetworkDiagram() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Network Status</h3>
      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-smooth"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">
                {device.status === "online" && <CheckCircle2 size={18} className="text-green-500" />}
                {device.status === "warning" && <AlertCircle size={18} className="text-amber-500" />}
                {device.status === "offline" && <AlertCircle size={18} className="text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{device.name}</p>
                <p className="text-xs text-muted-foreground">{device.location}</p>
              </div>
            </div>
            <Badge
              variant={
                device.status === "online" ? "default" : device.status === "warning" ? "secondary" : "destructive"
              }
              className="text-xs flex-shrink-0"
            >
              {device.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
