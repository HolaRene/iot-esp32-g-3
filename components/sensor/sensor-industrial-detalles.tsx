"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"

interface IndustrialSensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    vibracion: number
    ruido: number
    inclinacion: number
    consumo: number
}

function getMachineStatus(vibracion: number, ruido: number): { estado: string; color: string; emoji: string } {
    if (vibracion < 4 && ruido < 85) return { estado: "Óptimo", color: "text-green-500", emoji: "Checkmark" }
    if (vibracion < 6 && ruido < 95) return { estado: "Normal", color: "text-blue-500", emoji: "Info" }
    if (vibracion < 8 && ruido < 105) return { estado: "Alerta", color: "text-yellow-500", emoji: "Warning" }
    return { estado: "Crítico", color: "text-red-500", emoji: "Alarm" }
}

export function IndustrialSensorDetail({ sensor }: { sensor: IndustrialSensorData }) {
    const supabase = createClient()



    const [history, setHistory] = useState<{
        tiempo: string
        vibracion: number
        ruido: number
        inclinacion: number
        consumo: number
    }[]>([])

    // Escucha en tiempo real
    useEffect(() => {
        if (!sensor?.id) return

        const channel = supabase
            .channel(`realtime-industrial-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sensores_industrial", // Ajusta el nombre de la tabla
                    filter: `sensor_id=eq.${sensor.id}`
                },
                (payload) => {
                    const newData = payload.new
                    const tiempo = new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    })

                    setHistory((prev) => {
                        if (prev.length > 0 && prev[prev.length - 1].tiempo === tiempo) {
                            return prev
                        }

                        const updated = [...prev, {
                            tiempo,
                            vibracion: newData.vibracion,
                            ruido: newData.ruido,
                            inclinacion: newData.inclinacion,
                            consumo: newData.consumo
                        }]

                        return updated.slice(-60) // Última hora (60 puntos)
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [sensor?.id, supabase])

    // Dato inicial
    useEffect(() => {
        if (!sensor || history.length > 0) return

        const tiempo = new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })

        setHistory([{
            tiempo,
            vibracion: sensor.vibracion,
            ruido: sensor.ruido,
            inclinacion: sensor.inclinacion,
            consumo: sensor.consumo
        }])
    }, [sensor, history.length])

    const machineStatus = getMachineStatus(sensor.vibracion, sensor.ruido)

    // Alertas dinámicas
    const alertas = [
        {
            texto: "Vibración normal",
            variante: sensor.vibracion < 6 ? "default" : "secondary",
            emoji: sensor.vibracion < 6 ? "Checkmark" : "Warning"
        },
        {
            texto: "Ruido elevado",
            variante: sensor.ruido > 90 ? "secondary" : "default",
            emoji: sensor.ruido > 90 ? "Warning" : "Checkmark"
        },
        {
            texto: "Inclinación fuera de rango",
            variante: Math.abs(sensor.inclinacion) > 5 ? "secondary" : "default",
            emoji: Math.abs(sensor.inclinacion) > 5 ? "Warning" : "Checkmark"
        }
    ]

    return (
        <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Vibración</p>
                            <p className="text-3xl font-bold mt-2">{sensor?.vibracion?.toFixed(1) ?? "—"} mm/s</p>
                        </div>
                        <div className="bg-purple-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Chart Up</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Ruido</p>
                            <p className="text-3xl font-bold mt-2">{sensor.ruido} dB</p>
                        </div>
                        <div className="bg-orange-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Speaker</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Inclinación</p>
                            <p className="text-3xl font-bold mt-2">{sensor.inclinacion.toFixed(1) ?? "—"}°</p>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Ruler</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Consumo</p>
                            <p className="text-3xl font-bold mt-2">{sensor.consumo} kW</p>
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Gear</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Estado de la máquina */}
            <Card className="p-6 border-2" style={{ borderColor: machineStatus.color.replace("text-", "") }}>
                <div className="flex items-center gap-4">
                    <div className="text-5xl">{machineStatus.emoji}</div>
                    <div>
                        <p className="text-sm text-muted-foreground">Estado de la Máquina</p>
                        <p className={`text-2xl font-bold mt-1 ${machineStatus.color}`}>{machineStatus.estado}</p>
                        <p className="text-xs text-muted-foreground mt-2">Basado en vibración y niveles de ruido</p>
                    </div>
                </div>
            </Card>

            {/* Gráfico en tiempo real */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Tendencias en Tiempo Real</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="tiempo"
                            tick={{ fontSize: 11 }}
                            interval="preserveStartEnd"
                            minTickGap={30}
                        />
                        <YAxis yAxisId="vib" domain={[0, 10]} />
                        <YAxis yAxisId="ruido" orientation="right" domain={[60, 120]} />
                        <Tooltip />
                        <Legend />
                        <Line
                            yAxisId="vib"
                            type="monotone"
                            dataKey="vibracion"
                            stroke="#9333ea"
                            strokeWidth={2}
                            name="Vibración (mm/s)"
                            dot={{ fill: "#9333ea", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="ruido"
                            type="monotone"
                            dataKey="ruido"
                            stroke="#f97316"
                            strokeWidth={2}
                            name="Ruido (dB)"
                            dot={{ fill: "#f97316", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Alertas y recomendaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Alertas Activas</h3>
                    <div className="space-y-2">
                        {alertas.map((alerta, i) => (
                            <Badge key={i} className="block">
                                {alerta.emoji} {alerta.texto}
                            </Badge>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Mantenimiento Recomendado</h3>
                    <ul className="space-y-2 text-sm">
                        {sensor.vibracion > 5 && (
                            <li className="flex gap-2">
                                <span>Wrench</span>
                                <span>Inspección de rodamientos urgente</span>
                            </li>
                        )}
                        {sensor.ruido > 95 && (
                            <li className="flex gap-2">
                                <span>Ear</span>
                                <span>Revisar aislamiento acústico</span>
                            </li>
                        )}
                        <li className="flex gap-2">
                            <span>Checkmark</span>
                            <span>Próximo mantenimiento: en {8 - Math.floor(Date.now() / 86400000) % 8} días</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    )
}