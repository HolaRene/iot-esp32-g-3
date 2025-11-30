"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Shield, AlertTriangle, Eye, DoorOpen, Flame, Droplets, Ruler, Lightbulb, Bell, Sun, Moon } from "lucide-react"

interface SecuritySensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    movimiento: boolean
    puerta: boolean
    humo: boolean
    agua: boolean
    distancia: number
    luces: boolean
    alarma: boolean
    modo?: string
}

interface EventLog {
    tiempo: string
    evento: string
    estado: boolean | number
}

/**
 * 📊 Componente de Sensor de Seguridad
 * Muestra estados de sensores de seguridad en tiempo real
 * 💾 Tabla BD: sensores_seguridad
 */
export function SecuritySensorDetail({ sensor }: { sensor: SecuritySensorData }) {
    const supabase = createClient()
    const [eventLog, setEventLog] = useState<EventLog[]>([])

    useEffect(() => {
        if (!sensor?.id) return

        let isMounted = true

        // Agregar estado inicial
        const initialEvents: EventLog[] = [
            { tiempo: new Date().toLocaleTimeString("es-ES"), evento: "Movimiento", estado: sensor.movimiento },
            { tiempo: new Date().toLocaleTimeString("es-ES"), evento: "Puerta", estado: sensor.puerta },
            { tiempo: new Date().toLocaleTimeString("es-ES"), evento: "Humo", estado: sensor.humo },
            { tiempo: new Date().toLocaleTimeString("es-ES"), evento: "Agua", estado: sensor.agua },
        ]
        setEventLog(initialEvents)

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
                    if (!isMounted) return

                    const newData = payload.new
                    const tiempo = new Date().toLocaleTimeString("es-ES")

                    // Agregar eventos al log
                    const newEvents: EventLog[] = []
                    if (newData.movimiento !== sensor.movimiento) {
                        newEvents.push({ tiempo, evento: "Movimiento", estado: newData.movimiento })
                    }
                    if (newData.puerta !== sensor.puerta) {
                        newEvents.push({ tiempo, evento: "Puerta", estado: newData.puerta })
                    }
                    if (newData.humo !== sensor.humo) {
                        newEvents.push({ tiempo, evento: "Humo", estado: newData.humo })
                    }
                    if (newData.agua !== sensor.agua) {
                        newEvents.push({ tiempo, evento: "Agua", estado: newData.agua })
                    }

                    if (newEvents.length > 0) {
                        setEventLog((prev) => [...newEvents, ...prev].slice(0, 10))
                    }
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [sensor.id, sensor.movimiento, sensor.puerta, sensor.humo, sensor.agua, supabase])

    const hasAlert = sensor.movimiento || sensor.puerta || sensor.humo || sensor.agua || sensor.alarma

    return (
        <div className="space-y-4">
            {/* Estado general */}
            <Card className={`p-4 border-2 ${hasAlert ? 'border-red-500' : 'border-green-500'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Estado de Seguridad</p>
                        <p className={`text-2xl font-bold mt-1 ${hasAlert ? 'text-red-600' : 'text-green-600'}`}>
                            {hasAlert ? "Alerta Activa" : "Todo Normal"}
                        </p>
                    </div>
                    {hasAlert ? (
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    ) : (
                        <Shield className="w-10 h-10 text-green-600" />
                    )}
                </div>
            </Card>

            {/* Sensores de seguridad */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <Eye className={`w-5 h-5 ${sensor.movimiento ? 'text-red-500' : 'text-gray-400'}`} />
                        <div>
                            <p className="text-xs text-muted-foreground">Movimiento</p>
                            <Badge variant={sensor.movimiento ? "destructive" : "secondary"} className="mt-1">
                                {sensor.movimiento ? "Detectado" : "Normal"}
                            </Badge>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <DoorOpen className={`w-5 h-5 ${sensor.puerta ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <div>
                            <p className="text-xs text-muted-foreground">Puerta</p>
                            <Badge variant={sensor.puerta ? "destructive" : "secondary"} className="mt-1">
                                {sensor.puerta ? "Abierta" : "Cerrada"}
                            </Badge>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <Flame className={`w-5 h-5 ${sensor.humo ? 'text-red-500' : 'text-gray-400'}`} />
                        <div>
                            <p className="text-xs text-muted-foreground">Humo</p>
                            <Badge variant={sensor.humo ? "destructive" : "secondary"} className="mt-1">
                                {sensor.humo ? "Detectado" : "Normal"}
                            </Badge>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <Droplets className={`w-5 h-5 ${sensor.agua ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div>
                            <p className="text-xs text-muted-foreground">Agua</p>
                            <Badge variant={sensor.agua ? "destructive" : "secondary"} className="mt-1">
                                {sensor.agua ? "Detectada" : "Normal"}
                            </Badge>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Controles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Modo</p>
                            <div className="flex items-center gap-2 mt-1">
                                {sensor.modo === 'nocturno' ? (
                                    <>
                                        <Badge variant="default">Nocturno</Badge>
                                        <span className="text-xs text-green-600">Funciona en este modo</span>
                                    </>
                                ) : sensor.modo === 'diurno' ? (
                                    <>
                                        <Badge variant="secondary">Diurno</Badge>
                                        <span className="text-xs text-red-600">Solo funciona en modo nocturno</span>
                                    </>
                                ) : (
                                    <>
                                        <Badge variant="secondary">-</Badge>
                                        <span className="text-xs text-muted-foreground">Modo no especificado</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            {sensor.modo === 'nocturno' ? (
                                <Moon className="w-5 h-5 text-blue-600" />
                            ) : (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            )}
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Distancia</p>
                            <p className="text-2xl font-bold mt-1">{sensor.distancia} cm</p>
                        </div>
                        <Ruler className="w-5 h-5 text-blue-500" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Luces</p>
                            <Badge variant={sensor.luces ? "default" : "secondary"} className="mt-1">
                                {sensor.luces ? "Encendidas" : "Apagadas"}
                            </Badge>
                        </div>
                        <Lightbulb className={`w-5 h-5 ${sensor.luces ? 'text-yellow-500' : 'text-gray-400'}`} />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Alarma</p>
                            <Badge variant={sensor.alarma ? "destructive" : "secondary"} className="mt-1">
                                {sensor.alarma ? "Activada" : "Desactivada"}
                            </Badge>
                        </div>
                        <Bell className={`w-5 h-5 ${sensor.alarma ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                    </div>
                </Card>
            </div>

            {/* Log de eventos */}
            <Card className="p-4">
                <h3 className="text-base font-semibold mb-3">Registro de Eventos</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hora</TableHead>
                            <TableHead>Evento</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {eventLog.map((event, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-mono text-xs">{event.tiempo}</TableCell>
                                <TableCell>{event.evento}</TableCell>
                                <TableCell>
                                    <Badge variant={event.estado ? "destructive" : "secondary"}>
                                        {typeof event.estado === 'boolean'
                                            ? (event.estado ? "Activo" : "Inactivo")
                                            : event.estado
                                        }
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
