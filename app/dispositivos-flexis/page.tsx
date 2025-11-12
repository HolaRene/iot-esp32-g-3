"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Trash2 } from "lucide-react"
import { AddDeviceModal } from "@/components/devices/add-device-modal"

const devices = [
  {
    id: 1,
    name: "ESP32-01",
    type: "Temperature Sensor",
    location: "Living Room",
    status: "online",
    lastReading: "23.5°C",
    lastUpdate: "2 minutes ago",
  },
  {
    id: 2,
    name: "ESP32-02",
    type: "Humidity Sensor",
    location: "Bedroom",
    status: "online",
    lastReading: "65%",
    lastUpdate: "1 minute ago",
  },
  {
    id: 3,
    name: "ESP32-03",
    type: "Motion Sensor",
    location: "Kitchen",
    status: "warning",
    lastReading: "Active",
    lastUpdate: "5 minutes ago",
  },
  {
    id: 4,
    name: "ESP32-04",
    type: "Light Sensor",
    location: "Office",
    status: "offline",
    lastReading: "N/A",
    lastUpdate: "1 hour ago",
  },
]

export default function DevicesPage() {
  const [showAddDevice, setShowAddDevice] = useState(false)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Devices</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor all your connected IoT devices.</p>
          </div>
          <Button onClick={() => setShowAddDevice(true)} className="gap-2">
            <Plus size={20} />
            Add Device
          </Button>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Reading</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id} className="hover:bg-muted/50 transition-smooth">
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell className="text-sm">{device.type}</TableCell>
                  <TableCell className="text-sm">{device.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        device.status === "online"
                          ? "default"
                          : device.status === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{device.lastReading}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{device.lastUpdate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <AddDeviceModal open={showAddDevice} onOpenChange={setShowAddDevice} />
      </div>
    </AppLayout>
  )
}
