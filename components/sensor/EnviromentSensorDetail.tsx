"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Thermometer, Droplets, Gauge, CloudSun, Clock } from "lucide-react"

interface EnvironmentalSensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    temperatura: number
    humedad: number
    presion: number
    clima: string
}

interface HistoryPoint {
    tiempo: string
    temperatura: number
    humedad: number
    presion: number
}

/**
 * 📊 Componente de Sensor Ambiental
 * 
 * Muestra datos en tiempo real de temperatura, humedad y presión.
 * Crea un historial local de los últimos 10 valores recibidos.
 * 
 * 💾 Tabla BD: sensores_ambiental
 * 🔄 Actualización: Tiempo real con eventos UPDATE
 */
export function EnvironmentalSensorDetail({ sensor }: { sensor: EnvironmentalSensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryPoint[]>([])

    // Suscripción en tiempo real para actualizar el historial
    useEffect(() => {
        if (!sensor?.id) return

        let isMounted = true

        // Agregar valor inicial al historial
        const initialPoint: HistoryPoint = {
            tiempo: new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }),
            temperatura: sensor.temperatura,
            humedad: sensor.humedad,
            presion: sensor.presion
        }
        setHistory([initialPoint])

        // Escuchar actualizaciones en tiempo real
        const channel = supabase
            .channel(`realtime-sensor-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sensores_ambiental",
                    filter: `sensor_id=eq.${sensor.id}`
                },
                (payload) => {
                    if (!isMounted) return

                    const newData = payload.new
                    const tiempo = new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    })

                    // Agregar nuevo punto al historial (máximo 10 valores)
                    setHistory((prev) => {
                        // Evitar duplicados por timestamp
                        if (prev.length > 0 && prev[prev.length - 1].tiempo === tiempo) {
                            return prev
                        }

                        const updated = [...prev, {
                            tiempo,
                            temperatura: newData.temperatura,
                            humedad: newData.humedad,
                            presion: newData.presion
                        }]

                        // Mantener solo los últimos 10 valores
                        return updated.slice(-10)
                    })
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [sensor.id, sensor.temperatura, sensor.humedad, sensor.presion, supabase])

    return (
        <div className="space-y-4">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Temperatura</p>
                            <p className="text-2xl font-bold mt-1">{sensor.temperatura}°C</p>
                        </div>
                        <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
                            <Thermometer className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Humedad</p>
                            <p className="text-2xl font-bold mt-1">{sensor.humedad}%</p>
                        </div>
                        <div className="bg-cyan-500/10 text-cyan-500 p-2 rounded-lg">
                            <Droplets className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Presión</p>
                            <p className="text-lg font-bold mt-1">{sensor.presion} hPa</p>
                        </div>
                        <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
                            <Gauge className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gráfico combinado */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">Tendencias en Tiempo Real</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Últimos {history.length} valores
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="tiempo"
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                            minTickGap={20}
                        />
                        <YAxis yAxisId="left" domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="temperatura"
                            stroke="#3b82f6"
                            fill="url(#colorTemp)"
                            strokeWidth={1.5}
                            dot={{ r: 3 }}
                            activeDot={{ r: 4 }}
                            name="Temp (°C)"
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="humedad"
                            stroke="#06b6d4"
                            fill="url(#colorHum)"
                            strokeWidth={1.5}
                            dot={{ r: 3 }}
                            activeDot={{ r: 4 }}
                            name="Humedad (%)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            {/* Clima actual */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Estado Climático</h3>
                <div className="flex items-center gap-3">
                    <CloudSun className="w-8 h-8 text-yellow-500" />
                    <div>
                        <p className="text-xs text-muted-foreground">Clima Actual</p>
                        <p className="text-lg font-semibold">{sensor.clima}</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}