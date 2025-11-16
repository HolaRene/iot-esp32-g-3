"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"

interface AirQualitySensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    co2: number
    pm25: number
    voc: number
}

function getAirQualityStatus(co2: number): { estado: string; color: string; emoji: string } {
    if (co2 < 600) return { estado: "Buena", color: "text-green-500", emoji: "Checkmark" }
    if (co2 < 800) return { estado: "Regular", color: "text-yellow-500", emoji: "Warning" }
    return { estado: "Mala", color: "text-red-500", emoji: "Cross" }
}

export function AirQualitySensorDetail({ sensor }: { sensor: AirQualitySensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<{ tiempo: string; co2: number; pm25: number; voc: number }[]>([])

    // Escucha en tiempo real
    useEffect(() => {
        if (!sensor?.id) return

        const channel = supabase
            .channel(`realtime-airquality-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sensores_calidad_aire", // Ajusta el nombre de la tabla
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
                        // Evitar duplicados por segundo
                        if (prev.length > 0 && prev[prev.length - 1].tiempo === tiempo) {
                            return prev
                        }

                        const updated = [...prev, {
                            tiempo,
                            co2: newData.co2,
                            pm25: newData.pm25,
                            voc: newData.voc
                        }]

                        return updated.slice(-50) // Máximo 50 puntos
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [sensor?.id, supabase])

    // Agregar dato inicial solo si no hay historial
    useEffect(() => {
        if (!sensor || history.length > 0) return

        const tiempo = new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })

        setHistory([{
            tiempo,
            co2: sensor.co2,
            pm25: sensor.pm25,
            voc: sensor.voc
        }])
    }, [sensor, history.length])

    const qualityStatus = getAirQualityStatus(sensor.co2)

    return (
        <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">CO₂</p>
                            <p className="text-3xl font-bold mt-2">{sensor.co2} ppm</p>
                        </div>
                        <div className="bg-orange-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Cloud</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">PM2.5</p>
                            <p className="text-3xl font-bold mt-2">{sensor.pm25} μg/m³</p>
                        </div>
                        <div className="bg-amber-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Factory</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">VOC</p>
                            <p className="text-3xl font-bold mt-2">{sensor.voc} ppb</p>
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Wind</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Estado de calidad del aire */}
            <Card className="p-6 border-2" style={{ borderColor: qualityStatus.color.replace("text-", "") }}>
                <div className="flex items-center gap-4">
                    <div className="text-5xl">{qualityStatus.emoji}</div>
                    <div>
                        <p className="text-sm text-muted-foreground">Calidad del Aire</p>
                        <p className={`text-2xl font-bold mt-1 ${qualityStatus.color}`}>{qualityStatus.estado}</p>
                        <p className="text-xs text-muted-foreground mt-2">Basado en niveles de CO₂</p>
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
                        <YAxis yAxisId="left" domain={["dataMin - 50", "dataMax + 50"]} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="co2"
                            stroke="#f97316"
                            strokeWidth={2}
                            name="CO₂ (ppm)"
                            dot={{ fill: "#f97316", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="pm25"
                            stroke="#ec4899"
                            strokeWidth={2}
                            name="PM2.5 (μg/m³)"
                            dot={{ fill: "#ec4899", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="voc"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            name="VOC (ppb)"
                            dot={{ fill: "#8b5cf6", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Indicadores de riesgo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Estado CO₂</p>
                    <Badge variant={sensor.co2 < 600 ? "default" : "secondary"} className="mt-2">
                        {sensor.co2 < 600 ? "Seguro" : sensor.co2 < 800 ? "Precaución" : "Crítico"}
                    </Badge>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Estado PM2.5</p>
                    <Badge variant={sensor.pm25 < 25 ? "default" : "secondary"} className="mt-2">
                        {sensor.pm25 < 25 ? "Bueno" : sensor.pm25 < 50 ? "Moderado" : "Malo"}
                    </Badge>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Recomendación</p>
                    <p className="text-sm font-medium mt-2">
                        {sensor.co2 > 700 || sensor.pm25 > 30 ? "Ventilar inmediatamente" : "Mantener ventilación regular"}
                    </p>
                </Card>
            </div>
        </div>
    )
}