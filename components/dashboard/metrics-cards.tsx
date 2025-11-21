"use client"

import { Card } from "@/components/ui/card"
import {
  Activity,
  Database,
  AlertTriangle,
  Clock,
  BarChart3,
  Wifi
} from "lucide-react"

const metrics = [
  {
    icon: Database,
    label: "Sensores Activos",
    value: "12",
    change: "↑ 2 nuevos esta semana",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Activity,
    label: "Datos/última hora",
    value: "847",
    change: "15 envíos/min promedio",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: AlertTriangle,
    label: "Alertas Activas",
    value: "3",
    change: "2 seguridad, 1 energía",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Clock,
    label: "Último dato",
    value: "2s",
    change: "Envío en tiempo real",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: BarChart3,
    label: "Categoría más activa",
    value: "Ambiental",
    change: "34 datos/hora",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Wifi,
    label: "Conectividad",
    value: "100%",
    change: "Sin pérdidas",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
]

export function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.label} className="p-6 hover:shadow-lg transition-shadow">
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