"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"
import { useState } from "react"

const initialAlerts = [
  {
    id: 1,
    device: "ESP32-03",
    location: "Kitchen",
    message: "Temperature exceeds 35°C",
    severity: "critical",
    timestamp: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    device: "ESP32-02",
    location: "Bedroom",
    message: "Humidity level high (75%)",
    severity: "warning",
    timestamp: "15 minutes ago",
    read: false,
  },
  {
    id: 3,
    device: "ESP32-04",
    location: "Office",
    message: "Device offline",
    severity: "critical",
    timestamp: "1 hour ago",
    read: true,
  },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts)

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const markAsRead = (id: number) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-muted-foreground mt-1">{alerts.filter((a) => !a.read).length} unread notifications</p>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No alerts at the moment. All systems operational!</p>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 transition-smooth ${!alert.read ? "bg-primary/5 border-primary/20" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                      {alert.severity}
                    </Badge>
                    {!alert.read && <span className="inline-block w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <p className="font-medium text-foreground">{alert.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alert.device} • {alert.location} • {alert.timestamp}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!alert.read && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(alert.id)}>
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dismissAlert(alert.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
