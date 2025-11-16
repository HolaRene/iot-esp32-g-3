"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"

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

export function EnvironmentalSensorDetail({ sensor }: { sensor: EnvironmentalSensorData }) {
    const supabase = createClient()
    const isInitialMount = useRef(true)

    const [history, setHistory] = useState<{ tiempo: string; temperatura: number; humedad: number }[]>([])

    // Escucha en realtime los cambios del sensor
    useEffect(() => {
        if (!sensor?.id) return

        const channel = supabase
            .channel(`realtime-sensor-${sensor.id}`)
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "sensores_ambiental", filter: `sensor_id=eq.${sensor.id}` },
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
                            return prev // o actualiza el último
                        }

                        const updated = [...prev, { tiempo, temperatura: newData.temperatura, humedad: newData.humedad }]
                        return updated.slice(-50) // máximo 50 puntos
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [sensor?.id, supabase])
    console.log(history)

    // Solo agregar dato inicial si el historial está vacío
    useEffect(() => {
        if (!sensor || history.length > 0) return

        const tiempo = new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })

        setHistory([{ tiempo, temperatura: sensor.temperatura, humedad: sensor.humedad }])
    }, [sensor, history.length])

    // Solo agregar el dato inicial una vez
    useEffect(() => {
        if (!sensor || !isInitialMount.current) return

        const tiempo = new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })

        setHistory([{ tiempo, temperatura: sensor.temperatura, humedad: sensor.humedad }])
        isInitialMount.current = false
    }, [sensor])

    return (
        <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Temperatura</p>
                            <p className="text-3xl font-bold mt-2">{sensor.temperatura}°C</p>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded-lg">
                            <span className="text-2xl">Temperatura</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Humedad</p>
                            <p className="text-3xl font-bold mt-2">{sensor.humedad}%</p>
                        </div>
                        <div className="bg-cyan-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Humedad</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Presión</p>
                            <p className="text-2xl font-bold mt-2">{sensor.presion} hPa</p>
                        </div>
                        <div className="bg-purple-500/10 p-3 rounded-lg">
                            <span className="text-2xl">Presión</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gráfico de temperatura */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Temperatura (Tiempo Real)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="tiempo"
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey="temperatura"
                            stroke="#3b82f6"
                            fill="url(#colorTemp)"
                            strokeWidth={2}
                            dot={{ fill: "#3b82f6", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            {/* Gráfico de humedad */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Humedad (Tiempo Real)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="tiempo"
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="humedad"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            dot={{ fill: "#06b6d4", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Clima actual */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Estado Climático</h3>
                <div className="flex items-center gap-4">
                    <span className="text-5xl">Clima</span>
                    <div>
                        <p className="text-sm text-muted-foreground">Clima Actual</p>
                        <p className="text-2xl font-bold mt-1">{sensor.clima}</p>
                        <p className="text-xs text-muted-foreground mt-2">Condiciones óptimas para cultivos</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}