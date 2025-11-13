"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Sensor {
    id: string
    name: string
}

interface SensorData {
    id: number
    temperature?: number
    humidity?: number
    voltage?: number
    current?: number
    status: string
    created_at: string
}

interface ViewSensorModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ViewSensorModal({ open, onOpenChange }: ViewSensorModalProps) {
    const [sensors, setSensors] = useState<Sensor[]>([])
    const [selectedSensor, setSelectedSensor] = useState<string>("")
    const [data, setData] = useState<SensorData[]>([])
    const [loading, setLoading] = useState(false)

    const supabase = createClient()

    // ⚡ Cargar todos los sensores al abrir el modal
    useEffect(() => {
        if (!open) return
        const fetchSensors = async () => {
            const { data, error } = await supabase.from("sensors").select("id, name").order("name")
            if (error) console.error(error)
            else setSensors(data || [])
        }
        fetchSensors()
    }, [open])

    // ⚡ Cargar datos del sensor seleccionado
    useEffect(() => {
        if (!selectedSensor) return
        const fetchData = async () => {
            setLoading(true)
            const { data: readings, error } = await supabase
                .from("sensor_data")
                .select("*")
                .eq("sensor_id", selectedSensor)
                .order("created_at", { ascending: false })
                .limit(10)

            if (error) console.error(error)
            else setData(readings || [])
            setLoading(false)
        }
        fetchData()
    }, [selectedSensor])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>View Sensor Data</DialogTitle>
                    <DialogDescription>Select a sensor to view its last readings.</DialogDescription>
                </DialogHeader>

                <div className="mb-4">
                    <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a sensor" />
                        </SelectTrigger>
                        <SelectContent>
                            {sensors.map((sensor) => (
                                <SelectItem key={sensor.id} value={sensor.id}>
                                    {sensor.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <p className="text-center text-muted-foreground animate-pulse">Loading readings...</p>
                ) : data.length === 0 ? (
                    <p className="text-center text-muted-foreground">No readings found for this sensor.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Temperature</TableHead>
                                <TableHead>Humidity</TableHead>
                                <TableHead>Voltage</TableHead>
                                <TableHead>Current</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.temperature ?? "-"}</TableCell>
                                    <TableCell>{row.humidity ?? "-"}</TableCell>
                                    <TableCell>{row.voltage ?? "-"}</TableCell>
                                    <TableCell>{row.current ?? "-"}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
        </Dialog>
    )
}
