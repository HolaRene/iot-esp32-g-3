"use client"

import { useState } from "react"
import { MetricsCards } from "./metrics-cards"
import { TemperatureChart } from "./temperature-chart"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddGroupModal } from "../devices/add-device-modal"
import { GroupsOverview } from "./network-diagram"

export function Dashboard() {
  const [showAddDevice, setShowAddDevice] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de los IoT</h1>
          <p className="text-muted-foreground mt-1">Bienvenido a esta monitor del lado oeste.</p>
        </div>
        <Button onClick={() => setShowAddDevice(true)} className="gap-2">
          <Plus size={20} />
          Agrega un grupo
        </Button>
      </div>

      {/* Metrics */}
      <MetricsCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TemperatureChart />
        </div>
        <div>
          <GroupsOverview />
        </div>
      </div>

      {/* Add Device Modal */}
      <AddGroupModal open={showAddDevice} onOpenChange={setShowAddDevice} />
    </div>
  )
}
