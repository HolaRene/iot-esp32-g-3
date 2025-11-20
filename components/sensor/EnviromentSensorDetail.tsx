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

export function EnvironmentalSensorDetail({ sensor }: { sensor: EnvironmentalSensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryPoint[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Obtener historial inicial y suscribirse a tiempo real
    useEffect(() => {
        if (!sensor?.id) return

        let isMounted = true

        const fetchHistoryData = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await supabase
                    .from('sensores_ambiental')
                    .select('temperatura, humedad, presion, created_at')
                    .eq('sensor_id', sensor.id)
                    .order('created_at', { ascending: true })
                    .limit(50)

                if (error) throw error

                if (isMounted && data) {
                    const formattedHistory = data.map(point => ({
                        tiempo: new Date(point.created_at).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        }),
                        temperatura: point.temperatura,
                        humedad: point.humedad,
                        presion: point.presion
                    }))
                    setHistory(formattedHistory)
                }
            } catch (error) {
                console.error("Error loading sensor history:", error)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        fetchHistoryData()

        const channel = supabase
            .channel(`realtime-sensor-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "sensores_ambiental",
                    filter: `sensor_id=eq.${sensor.id}`
                },
                (payload) => {
                    const newData = payload.new
                    const tiempo = new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    })

                    if (!isMounted) return

                    setHistory((prev) => {
                        if (prev.length > 0 && prev[prev.length - 1].tiempo === tiempo) {
                            return prev
                        }

                        const updated = [...prev, {
                            tiempo,
                            temperatura: newData.temperatura,
                            humedad: newData.humedad,
                            presion: newData.presion
                        }]

                        return updated.slice(-50)
                    })
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
                    {isLoading && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 animate-spin" />
                            Cargando...
                        </div>
                    )}
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