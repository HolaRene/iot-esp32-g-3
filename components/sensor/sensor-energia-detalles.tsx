"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"

interface EnergySensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    voltaje: number
    corriente: number
    potencia: number
}

export function EnergySensorDetail({ sensor }: { sensor: EnergySensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<{ tiempo: string; potencia: number }[]>([])
    const [totalConsumoWh, setTotalConsumoWh] = useState(0) // Wh acumulados

    // Calcular eficiencia (ejemplo: basado en voltaje/corriente vs potencia)
    const eficiencia = sensor.voltaje > 0 && sensor.corriente > 0
        ? Math.min(100, Math.round((sensor.potencia / (sensor.voltaje * sensor.corriente)) * 100))
        : 0

    // Escucha en tiempo real
    useEffect(() => {
        if (!sensor?.id) return

        const channel = supabase
            .channel(`realtime-energy-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sensores_energia",
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

                        const updated = [...prev, { tiempo, potencia: newData.potencia }]
                        return updated.slice(-60) // Última hora (60 puntos si 1 por minuto)
                    })

                    // Acumular consumo: potencia (W) * intervalo (asumimos 1 min = 1/60 h)
                    setTotalConsumoWh((prev) => prev + newData.potencia / 60)
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

        setHistory([{ tiempo, potencia: sensor.potencia }])
        setTotalConsumoWh(sensor.potencia / 60) // Primer punto
    }, [sensor, history.length])

    // Potencia promedio (últimos 30 puntos)
    const potenciaPromedio = history.length > 0
        ? Math.round(history.slice(-30).reduce((sum, p) => sum + p.potencia, 0) / Math.min(30, history.length))
        : sensor.potencia

    return (
        <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Voltaje</p>
                            <p className="text-3xl font-bold mt-2">{sensor.voltaje.toFixed(1)} V</p>
                        </div>
                        <div className="bg-yellow-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Lightning</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Corriente</p>
                            <p className="text-3xl font-bold mt-2">{sensor.corriente.toFixed(2)} A</p>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Plug</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Potencia</p>
                            <p className="text-3xl font-bold mt-2">{sensor.potencia} W</p>
                        </div>
                        <div className="bg-green-500/10 p-3 rounded-lg">
                            <span className="text-3xl">Light Bulb</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gráfico en tiempo real */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Consumo de Potencia (Tiempo Real)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="tiempo"
                            tick={{ fontSize: 11 }}
                            interval="preserveStartEnd"
                            minTickGap={30}
                        />
                        <YAxis domain={["dataMin - 100", "dataMax + 100"]} />
                        <Tooltip
                            formatter={(value: number) => [`${value} W`, "Potencia"]}
                            labelFormatter={(label) => `Hora: ${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="potencia"
                            stroke="#f59e0b"
                            fill="url(#colorPower)"
                            strokeWidth={2}
                            dot={{ fill: "#f59e0b", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            {/* Estadísticas dinámicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Consumo Total (hasta ahora)</p>
                    <p className="text-3xl font-bold mt-2">{(totalConsumoWh / 1000).toFixed(3)} kWh</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Eficiencia Eléctrica</p>
                    <p className="text-3xl font-bold mt-2">{eficiencia}%</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Potencia Promedio</p>
                    <p className="text-3xl font-bold mt-2">{potenciaPromedio} W</p>
                </Card>
            </div>

            {/* Recomendaciones dinámicas */}
            <Card className={`p-6 border-2 ${eficiencia >= 90 ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"}`}>
                <h3 className="text-lg font-bold mb-2">Recomendaciones de Eficiencia</h3>
                <ul className="space-y-2 text-sm">
                    {eficiencia >= 95 ? (
                        <li className="flex gap-2"><span>Excellent</span> <span>Eficiencia óptima detectada</span></li>
                    ) : eficiencia >= 85 ? (
                        <li className="flex gap-2"><span>Good</span> <span>Buena eficiencia, mantener</span></li>
                    ) : (
                        <li className="flex gap-2"><span>Warning</span> <span>Revisar conexiones o carga</span></li>
                    )}
                    <li className="flex gap-2">
                        <span>Checkmark</span>
                        <span>Consumo en rango normal para esta hora</span>
                    </li>
                    <li className="flex gap-2">
                        <span>Light Bulb</span>
                        <span>Programar uso intensivo en horas valle</span>
                    </li>
                </ul>
            </Card>
        </div>
    )
}