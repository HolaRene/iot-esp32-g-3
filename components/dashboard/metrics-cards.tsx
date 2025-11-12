"use client"

import { Card } from "@/components/ui/card"
import { Activity, Server, Wifi, TrendingUp } from "lucide-react"

const metrics = [
  {
    icon: Server,
    label: "Connected Devices",
    value: "12",
    change: "+2 this week",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Wifi,
    label: "Active Sensors",
    value: "34",
    change: "All operational",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Activity,
    label: "Avg. Latency",
    value: "45ms",
    change: "Normal range",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: TrendingUp,
    label: "Last Update",
    value: "2s ago",
    change: "Real-time sync",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
]

export function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.label} className="p-6 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold mt-2 text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{metric.change}</p>
              </div>
              <div className={`${metric.bg} p-3 rounded-lg`}>
                <Icon className={`${metric.color}`} size={24} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
