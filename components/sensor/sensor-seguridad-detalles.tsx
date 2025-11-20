"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, AlertCircle, DoorClosed, Cloud, Droplets, Video, BellOff, Clock, ShieldCheck, Lock } from 'lucide-react'
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
    const [isLoading, setIsLoading] = useState(true)

    const getStatusIcon = (value: boolean | null) => {
        if (value === null) return <Shield className="w-5 h-5 text-gray-400" />
        return value ? <AlertCircle className="w-5 h-5 text-red-500" /> : <ShieldCheck className="w-5 h-5 text-green-500" />
    }

    const getStatusText = (value: boolean | null, activeText: string, safeText: string) => {
        if (value === null) return "—"
        return value ? activeText : safeText
    }

    const getCardStyle = (value: boolean | null) => {
        if (value === null) return "border-gray-300 bg-gray-50 dark:bg-gray-900"
        return value
            ? "border-red-500 bg-red-50 dark:bg-red-950"
            : "border-green-500 bg-green-50 dark:bg-green-950"
    }

    // Obtener historial inicial y suscribirse a tiempo real
    useEffect(() => {
        if (!sensor?.id) return

        let isMounted = true

        const fetchEventHistory = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await supabase
                    .from('eventos_seguridad')
                    .select('created_at, tipo, descripcion, estado')
                    .eq('sensor_id', sensor.id)
                    .order('created_at', { ascending: false })
                    .limit(50)

                if (error) throw error

                if (isMounted && data) {
                    const formattedEvents = data.map(event => ({
                        hora: new Date(event.created_at).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit"
                        }),
                        evento: event.descripcion,
                        tipo: event.tipo as EventLog["tipo"],
                        estado: event.estado as EventLog["estado"]
                    }))
                    setEventLog(formattedEvents)
                }
            } catch (error) {
                console.error("Error loading security events:", error)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        fetchEventHistory()

        const channel = supabase
            .channel(`realtime-security-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "eventos_seguridad",
                    filter: `sensor_id=eq.${sensor.id}`
                },
                (payload) => {
                    if (!isMounted) return

                    const newEvent = payload.new
                    const hora = new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                    })

                    setEventLog((prev) => [{
                        hora,
                        evento: newEvent.descripcion,
                        tipo: newEvent.tipo as EventLog["tipo"],
                        estado: newEvent.estado as EventLog["estado"]
                    }, ...prev.slice(0, 49)])
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [sensor.id, supabase])

    return (
        <div className="space-y-4">
            {/* Estados de los sensores */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className={`p-4 border-2 ${getCardStyle(sensor.movimiento)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Movimiento</p>
                            <p className={`text-lg font-bold mt-1 flex items-center gap-2 ${sensor.movimiento ? "text-red-600" : "text-green-600"}`}>
                                {getStatusIcon(sensor.movimiento)}
                                {getStatusText(sensor.movimiento, "Activo", "Seguro")}
                            </p>
                        </div>
                        <Video className={`w-8 h-8 ${sensor.movimiento ? "text-red-500" : "text-muted-foreground"}`} />
                    </div>
                </Card>

                <Card className={`p-4 border-2 ${getCardStyle(sensor.puerta)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Puerta</p>
                            <p className={`text-lg font-bold mt-1 flex items-center gap-2 ${sensor.puerta ? "text-red-600" : "text-green-600"}`}>
                                {getStatusIcon(sensor.puerta)}
                                {getStatusText(sensor.puerta, "Abierta", "Cerrada")}
                            </p>
                        </div>
                        <DoorClosed className={`w-8 h-8 ${sensor.puerta ? "text-red-500" : "text-muted-foreground"}`} />
                    </div>
                </Card>

                <Card className={`p-4 border-2 ${getCardStyle(sensor.humo)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Humo</p>
                            <p className={`text-lg font-bold mt-1 flex items-center gap-2 ${sensor.humo ? "text-red-600" : "text-green-600"}`}>
                                {getStatusIcon(sensor.humo)}
                                {getStatusText(sensor.humo, "Peligro", "Seguro")}
                            </p>
                        </div>
                        <Cloud className={`w-8 h-8 ${sensor.humo ? "text-red-500" : "text-muted-foreground"}`} />
                    </div>
                </Card>

                <Card className={`p-4 border-2 ${getCardStyle(sensor.agua)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Agua</p>
                            <p className={`text-lg font-bold mt-1 flex items-center gap-2 ${sensor.agua ? "text-red-600" : "text-green-600"}`}>
                                {getStatusIcon(sensor.agua)}
                                {getStatusText(sensor.agua, "Detectada", "Seco")}
                            </p>
                        </div>
                        <Droplets className={`w-8 h-8 ${sensor.agua ? "text-red-500" : "text-muted-foreground"}`} />
                    </div>
                </Card>
            </div>

            {/* Panel de control */}
            <Card className="p-4">
                <h3 className="text-base font-semibold mb-3">Panel de Control</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 text-xs" size="sm">
                        <Shield className="w-4 h-4" />
                        Activar
                    </Button>
                    <Button variant="outline" className="gap-2 text-xs" size="sm">
                        <Lock className="w-4 h-4" />
                        Desactivar
                    </Button>
                    <Button variant="destructive" className="gap-2 text-xs" size="sm">
                        <BellOff className="w-4 h-4" />
                        Silenciar
                    </Button>
                </div>
            </Card>

            {/* Histórico de eventos */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">Histórico de Eventos</h3>
                    {isLoading && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 animate-spin" />
                            Cargando...
                        </div>
                    )}
                </div>
                <div className="overflow-x-auto">
                    {eventLog.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="text-xs">Hora</TableHead>
                                    <TableHead className="text-xs">Evento</TableHead>
                                    <TableHead className="text-xs">Tipo</TableHead>
                                    <TableHead className="text-xs">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eventLog.map((event, idx) => (
                                    <TableRow key={idx} className="hover:bg-muted/50">
                                        <TableCell className="text-xs font-medium">{event.hora}</TableCell>
                                        <TableCell className="text-xs">{event.evento}</TableCell>
                                        <TableCell className="text-xs">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0">{event.tipo}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <Badge
                                                variant={event.estado === "normal" ? "default" : event.estado === "resuelto" ? "secondary" : "destructive"}
                                                className="text-[10px] px-1 py-0"
                                            >
                                                {event.estado}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-xs text-muted-foreground py-6">
                            No hay eventos registrados aún.
                        </p>
                    )}
                </div>
            </Card>

            {/* Información del sensor */}
            <Card className="p-4">
                <h3 className="text-base font-semibold mb-3">Información del Sensor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Nombre</p>
                        <p className="text-sm font-medium mt-1">{sensor.nombre || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Ubicación</p>
                        <p className="text-sm font-medium mt-1">{sensor.ubicacion || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Estado</p>
                        <Badge variant={sensor.activo ? "default" : "secondary"} className="mt-1 text-[10px]">
                            {sensor.activo ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Tipo de Alarma</p>
                        <p className="text-sm font-medium mt-1">Combinada (4 sensores)</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}