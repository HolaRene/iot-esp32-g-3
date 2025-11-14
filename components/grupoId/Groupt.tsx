"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Trash2, ArrowLeft } from 'lucide-react'
import Link from "next/link"

const mockSensors = [
    {
        id: 1,
        name: "Temperature Sensor 1",
        type: "temperature",
        unit: "°C",
        currentValue: "23.5",
        minValue: "20",
        maxValue: "28",
        status: "online",
        lastReading: "2 seconds ago",
    },
    {
        id: 2,
        name: "Humidity Sensor 1",
        type: "humidity",
        unit: "%",
        currentValue: "65",
        minValue: "40",
        maxValue: "70",
        status: "online",
        lastReading: "3 seconds ago",
    },
    {
        id: 3,
        name: "Motion Detector 1",
        type: "motion",
        unit: "state",
        currentValue: "No Motion",
        minValue: "-",
        maxValue: "-",
        status: "online",
        lastReading: "10 seconds ago",
    },
    {
        id: 4,
        name: "Light Sensor 1",
        type: "light",
        unit: "lux",
        currentValue: "450",
        minValue: "0",
        maxValue: "1000",
        status: "online",
        lastReading: "5 seconds ago",
    },
]

export default function GroupDetailsPage({ id }: { id: string }) {
    const [showAddSensor, setShowAddSensor] = useState(false)
    const groupId = id
    console.log(groupId)

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/groups">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Living Room Sensors</h1>
                        <p className="text-muted-foreground mt-1">Monitor all sensors in this group in real-time.</p>
                    </div>
                </div>
                <Button onClick={() => setShowAddSensor(true)} className="gap-2">
                    <Plus size={20} />
                    Add Sensor
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Total Sensors</p>
                    <p className="text-2xl font-bold mt-2">{mockSensors.length}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Online</p>
                    <p className="text-2xl font-bold mt-2 text-green-500">{mockSensors.filter(s => s.status === 'online').length}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Avg Temperature</p>
                    <p className="text-2xl font-bold mt-2">23.5°C</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Avg Humidity</p>
                    <p className="text-2xl font-bold mt-2">65%</p>
                </Card>
            </div>

            {/* Sensors Table */}
            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Sensor Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Current Value</TableHead>
                            <TableHead>Min - Max</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Reading</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockSensors.map((sensor) => (
                            <TableRow key={sensor.id} className="hover:bg-muted/50 transition-smooth">
                                <TableCell className="font-medium">{sensor.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{sensor.type}</Badge>
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                    {sensor.currentValue} {sensor.unit}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {sensor.minValue} - {sensor.maxValue}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={sensor.status === "online" ? "default" : "secondary"}>
                                        {sensor.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{sensor.lastReading}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/sensors/${sensor.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye size={16} />
                                            </Button>
                                        </Link>
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

            {/* <AddSensorModal open={showAddSensor} onOpenChange={setShowAddSensor} groupId={parseInt(groupId)} /> */}
        </div>

    )
}
