"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Shield, AlertCircle, BellOff, Clock, ShieldCheck, Lock, Gauge, Lightbulb, Siren
} from 'lucide-react'
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
    distancia: number | null
    luces: boolean | null
    alarma: boolean | null
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
        if (value === null) return <Shield className="w-4 h-4 text-gray-400" />
        return value ? <AlertCircle className="w-4 h-4 text-red-500" /> : <ShieldCheck className="w-4 h-4 text-green-500" />
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

    useEffect(() => {
        if (!sensor?.id) return
        let isMounted = true


        const channel = supabase
            .channel(`realtime-sec-${sensor.id}`)
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
                    const e = payload.new

                    const hora = new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                    })

                    setEventLog(prev => [{
                        hora,
                        evento: e.descripcion,
                        tipo: e.tipo,
                        estado: e.estado
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
        <div className="space-y-3">

            {/* === ESTADOS DE LOS SENSORES === */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">

                {/* Movimiento */}
                <Card className={`p-3 border ${getCardStyle(sensor.movimiento)}`}>
                    <p className="text-xs text-muted-foreground">Movimiento</p>
                    <p className="text-sm font-bold flex items-center gap-1 mt-1">
                        {getStatusIcon(sensor.movimiento)}
                        {getStatusText(sensor.movimiento, "Activo", "Seguro")}
                    </p>
                </Card>

                {/* Puerta */}
                <Card className={`p-3 border ${getCardStyle(sensor.puerta)}`}>
                    <p className="text-xs text-muted-foreground">Puerta</p>
                    <p className="text-sm font-bold flex items-center gap-1 mt-1">
                        {getStatusIcon(sensor.puerta)}
                        {getStatusText(sensor.puerta, "Abierta", "Cerrada")}
                    </p>
                </Card>

                {/* Humo */}
                <Card className={`p-3 border ${getCardStyle(sensor.humo)}`}>
                    <p className="text-xs text-muted-foreground">Humo</p>
                    <p className="text-sm font-bold flex items-center gap-1 mt-1">
                        {getStatusIcon(sensor.humo)}
                        {getStatusText(sensor.humo, "Detectado", "Normal")}
                    </p>
                </Card>

                {/* Agua */}
                <Card className={`p-3 border ${getCardStyle(sensor.agua)}`}>
                    <p className="text-xs text-muted-foreground">Agua</p>
                    <p className="text-sm font-bold flex items-center gap-1 mt-1">
                        {getStatusIcon(sensor.agua)}
                        {getStatusText(sensor.agua, "Detectada", "Seco")}
                    </p>
                </Card>

                {/* Distancia */}
                <Card className="p-3 border bg-blue-50 dark:bg-blue-900">
                    <p className="text-xs text-muted-foreground">Distancia</p>
                    <p className="text-sm font-bold flex items-center gap-1 mt-1">
                        <Gauge className="w-4 h-4 text-blue-600" />
                        {sensor.distancia ?? "—"} cm
                    </p>
                </Card>

                {/* Luces */}
                <Card className={`p-3 border ${getCardStyle(sensor.luces)}`}>
                    <p className="text-xs text-muted-foreground">Luces</p>
                    <p className="text-sm font-bold flex items-center gap-1 mt-1">
                        <Lightbulb className={`w-4 h-4 ${sensor.luces ? "text-yellow-400" : "text-muted-foreground"}`} />
                        {sensor.luces ? "Encendidas" : "Apagadas"}
                    </p>
                </Card>

                {/* Alarma */}
                <Card className={`p-3 border ${getCardStyle(sensor.alarma)}`}>
                    <p className="text-xs text-muted-foreground">Alarma</p>
                    <p className="text-sm font-bold flex items-center gap-1 mt-1">
                        <Siren className={`w-4 h-4 ${sensor.alarma ? "text-red-500" : "text-muted-foreground"}`} />
                        {sensor.alarma ? "Activa" : "Inactiva"}
                    </p>
                </Card>

            </div>

            {/* === PANEL DE CONTROL === */}
            <Card className="p-3">
                <h3 className="text-sm font-semibold mb-2">Panel de Control</h3>
                <div className="grid grid-cols-3 gap-2">
                    <Button className="text-xs p-1.5 h-7">Activar</Button>
                    <Button variant="outline" className="text-xs p-1.5 h-7">
                        <Lock className="w-3 h-3" /> Desactivar
                    </Button>
                    <Button variant="destructive" className="text-xs p-1.5 h-7">
                        <BellOff className="w-3 h-3" /> Silenciar
                    </Button>
                </div>
            </Card>

            {/* === HISTÓRICO DE EVENTOS === */}
            <Card className="p-3">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold">Histórico</h3>
                    {isLoading && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3 animate-spin" /> Cargando...
                        </div>
                    )}
                </div>
                <div className="overflow-x-auto max-h-64">
                    {eventLog.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-[11px]">Hora</TableHead>
                                    <TableHead className="text-[11px]">Evento</TableHead>
                                    <TableHead className="text-[11px]">Tipo</TableHead>
                                    <TableHead className="text-[11px]">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eventLog.map((event, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="text-[11px]">{event.hora}</TableCell>
                                        <TableCell className="text-[11px]">{event.evento}</TableCell>
                                        <TableCell className="text-[11px]">
                                            <Badge className="text-[9px] px-1">{event.tipo}</Badge>
                                        </TableCell>
                                        <TableCell className="text-[11px]">
                                            <Badge variant={event.estado === "activo" ? "destructive" : "default"} className="text-[9px] px-1">
                                                {event.estado}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-xs py-3 text-muted-foreground">Sin eventos aún.</p>
                    )}
                </div>
            </Card>

            {/* === INFO DEL SENSOR === */}
            <Card className="p-3">
                <h3 className="text-sm font-semibold mb-2">Información</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <p className="text-muted-foreground">Nombre</p>
                        <p className="font-medium">{sensor.nombre || "—"}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Ubicación</p>
                        <p className="font-medium">{sensor.ubicacion || "—"}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Estado</p>
                        <Badge className="text-[10px] mt-1">
                            {sensor.activo ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Tipo</p>
                        <p className="font-medium">Sensor de Seguridad (7 señales)</p>
                    </div>
                </div>
            </Card>

        </div>
    )
}
