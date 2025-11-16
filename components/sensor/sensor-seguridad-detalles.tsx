"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Lock } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"

interface SecuritySensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    movimiento: boolean | null
    puerta: boolean | null
    humo: boolean | null
    agua: boolean | null
}

interface EventLog {
    hora: string
    evento: string
    tipo: "movimiento" | "puerta" | "humo" | "agua" | "sistema"
    estado: "normal" | "resuelto" | "activo"
}

export function SecuritySensorDetail({ sensor }: { sensor: SecuritySensorData }) {
    const supabase = createClient()
    const [eventLog, setEventLog] = useState<EventLog[]>([])

    // Generar mensaje según estado
    const getStatusText = (value: boolean | null, activeText: string, safeText: string) => {
        if (value === null) return "—"
        return value ? activeText : safeText
    }

    const getStatusColor = (value: boolean | null) => {
        if (value === null) return "text-muted-foreground"
        return value ? "text-red-500" : "text-green-500"
    }

    const getCardStyle = (value: boolean | null) => {
        if (value === null) return "border-gray-300 bg-gray-50 dark:bg-gray-900"
        return value
            ? "border-red-500 bg-red-50 dark:bg-red-950"
            : "border-green-500 bg-green-50 dark:bg-green-950"
    }

    // Escuchar cambios en tiempo real
    useEffect(() => {
        if (!sensor?.id) return

        const channel = supabase
            .channel(`realtime-security-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sensores_seguridad",
                    filter: `sensor_id=eq.${sensor.id}`
                },
                (payload) => {
                    const newData = payload.new
                    const now = new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                    })

                    const changes: string[] = []

                    if (newData.movimiento) changes.push("Movimiento detectado")
                    if (newData.puerta) changes.push("Puerta abierta")
                    if (newData.humo) changes.push("Humo detectado")
                    if (newData.agua) changes.push("Fuga de agua")

                    // Solo agregar si hay cambio
                    if (changes.length > 0) {
                        const evento = changes.join(" + ")
                        setEventLog((prev) => [
                            { hora: now, evento, tipo: "movimiento", estado: "activo" },
                            ...prev.slice(0, 49) // Máximo 50 eventos
                        ])
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [sensor?.id, supabase])

    // Agregar evento inicial si hay alarma activa
    useEffect(() => {
        if (!sensor) return

        const now = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        const activeAlerts: string[] = []

        if (sensor.movimiento) activeAlerts.push("Movimiento detectado")
        if (sensor.puerta) activeAlerts.push("Puerta abierta")
        if (sensor.humo) activeAlerts.push("Humo detectado")
        if (sensor.agua) activeAlerts.push("Fuga de agua")

        if (activeAlerts.length > 0) {
            setEventLog([
                { hora: now, evento: activeAlerts.join(" + "), tipo: "movimiento", estado: "activo" }
            ])
        }
    }, [sensor])

    return (
        <div className="space-y-6">
            {/* Estados de los sensores */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className={`p-6 border-2 ${getCardStyle(sensor.movimiento)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Movimiento</p>
                            <p className={`text-2xl font-bold mt-2 ${getStatusColor(sensor.movimiento)}`}>
                                {getStatusText(sensor.movimiento, "Warning ACTIVO", "Checkmark Seguro")}
                            </p>
                        </div>
                        <span className="text-4xl">Camera</span>
                    </div>
                </Card>

                <Card className={`p-6 border-2 ${getCardStyle(sensor.puerta)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Puerta</p>
                            <p className={`text-2xl font-bold mt-2 ${getStatusColor(sensor.puerta)}`}>
                                {getStatusText(sensor.puerta, "Warning ABIERTA", "Checkmark Cerrada")}
                            </p>
                        </div>
                        <span className="text-4xl">Door</span>
                    </div>
                </Card>

                <Card className={`p-6 border-2 ${getCardStyle(sensor.humo)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Humo</p>
                            <p className={`text-2xl font-bold mt-2 ${getStatusColor(sensor.humo)}`}>
                                {getStatusText(sensor.humo, "Alarm PELIGRO", "Checkmark Seguro")}
                            </p>
                        </div>
                        <span className="text-4xl">Smoke</span>
                    </div>
                </Card>

                <Card className={`p-6 border-2 ${getCardStyle(sensor.agua)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Agua</p>
                            <p className={`text-2xl font-bold mt-2 ${getStatusColor(sensor.agua)}`}>
                                {getStatusText(sensor.agua, "Alarm DETECTADA", "Checkmark Seguro")}
                            </p>
                        </div>
                        <span className="text-4xl">Water</span>
                    </div>
                </Card>
            </div>

            {/* Panel de control */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Panel de Control</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                        <Lock size={20} />
                        Activar Sistema
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                        Desactivar Sistema
                    </Button>
                    <Button variant="destructive" className="flex-1 gap-2">
                        <AlertTriangle size={20} />
                        Silenciar Alarma
                    </Button>
                </div>
            </Card>

            {/* Histórico de eventos */}
            <Card className="p-6 overflow-x-auto">
                <h3 className="text-lg font-bold mb-4">Histórico de Eventos</h3>
                {eventLog.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Hora</TableHead>
                                <TableHead>Evento</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {eventLog.map((event, idx) => (
                                <TableRow key={idx} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{event.hora}</TableCell>
                                    <TableCell className="text-sm">{event.evento}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{event.tipo}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={event.estado === "normal" ? "default" : event.estado === "resuelto" ? "secondary" : "destructive"}
                                        >
                                            {event.estado}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-center text-muted-foreground py-8">
                        No hay eventos registrados aún.
                    </p>
                )}
            </Card>

            {/* Información del sensor */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Información del Sensor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="text-lg font-medium mt-2">{sensor.nombre || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Ubicación</p>
                        <p className="text-lg font-medium mt-2">{sensor.ubicacion || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant={sensor.activo ? "default" : "secondary"} className="mt-2">
                            {sensor.activo ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tipo de Alarma</p>
                        <p className="text-lg font-medium mt-2">Combinada (4 sensores)</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}