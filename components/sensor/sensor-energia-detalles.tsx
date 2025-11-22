"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Zap, Activity, TrendingUp, Battery } from "lucide-react"

interface EnergySensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    voltaje: number
    corriente: number
    potencia: number
}

interface HistoryPoint {
    tiempo: string
    voltaje: number
    corriente: number
    potencia: number
}

/**
 * 📊 Componente de Sensor de Energía
 * 
 * Muestra datos en tiempo real de voltaje, corriente y potencia.
 * Crea un historial local de los últimos 10 valores recibidos.
 * 
 * 💾 Tabla BD: sensores_energia
 * 🔄 Actualización: Tiempo real con eventos UPDATE
 */
export function EnergySensorDetail({ sensor }: { sensor: EnergySensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryPoint[]>([])
    const [totalConsumoWh, setTotalConsumoWh] = useState(0)

    const eficiencia = sensor.voltaje > 0 && sensor.corriente > 0
        ? Math.min(100, Math.round((sensor.potencia / (sensor.voltaje * sensor.corriente)) * 100))
        : 0

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
            voltaje: sensor.voltaje,
            corriente: sensor.corriente,
            potencia: sensor.potencia
        }
        setHistory([initialPoint])
        setTotalConsumoWh(sensor.potencia / 60) // Consumo inicial

        // Escuchar actualizaciones en tiempo real
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
                    if (!isMounted) return

                    const newData = payload.new
                    const tiempo = new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    })

                    // Agregar nuevo punto al historial (máximo 10 valores)
                    setHistory((prev) => {
                        if (prev.length > 0 && prev[prev.length - 1].tiempo === tiempo) {
                            return prev
                        }

                        const updated = [...prev, {
                            tiempo,
                            voltaje: newData.voltaje,
                            corriente: newData.corriente,
                            potencia: newData.potencia
                        }]

                        // Actualizar consumo acumulado
                        setTotalConsumoWh(prevConsumo => prevConsumo + (newData.potencia / 60))

                        return updated.slice(-10)
                    })
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [sensor.id, sensor.voltaje, sensor.corriente, sensor.potencia, supabase])

    return (
        <div className="space-y-4">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Voltaje</p>
                            <p className="text-2xl font-bold mt-1">{sensor.voltaje} V</p>
                        </div>
                        <div className="bg-yellow-500/10 text-yellow-500 p-2 rounded-lg">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Corriente</p>
                            <p className="text-2xl font-bold mt-1">{sensor.corriente} A</p>
                        </div>
                        <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Potencia</p>
                            <p className="text-2xl font-bold mt-1">{sensor.potencia} W</p>
                        </div>
                        <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Eficiencia</p>
                            <p className="text-2xl font-bold mt-1">{eficiencia}%</p>
                        </div>
                        <div className="bg-green-500/10 text-green-500 p-2 rounded-lg">
                            <Battery className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Consumo acumulado */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold mb-2">Consumo Acumulado</h3>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{totalConsumoWh.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Wh</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Equivalente a {(totalConsumoWh / 1000).toFixed(4)} kWh
                </p>
            </Card>

            {/* Gráfico de tendencias */}
            <Card className="p-4">
                <h3 className="text-base font-semibold mb-3">Tendencias en Tiempo Real</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="tiempo"
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="voltaje"
                            stroke="#eab308"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Voltaje (V)"
                        />
                        <Line
                            type="monotone"
                            dataKey="corriente"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Corriente (A)"
                        />
                        <Line
                            type="monotone"
                            dataKey="potencia"
                            stroke="#a855f7"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Potencia (W)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Información adicional */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Análisis de Consumo</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Potencia Promedio:</span>
                        <span className="font-medium">
                            {history.length > 0
                                ? (history.reduce((sum, p) => sum + p.potencia, 0) / history.length).toFixed(2)
                                : "0.00"} W
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Voltaje Promedio:</span>
                        <span className="font-medium">
                            {history.length > 0
                                ? (history.reduce((sum, p) => sum + p.voltaje, 0) / history.length).toFixed(2)
                                : "0.00"} V
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Corriente Promedio:</span>
                        <span className="font-medium">
                            {history.length > 0
                                ? (history.reduce((sum, p) => sum + p.corriente, 0) / history.length).toFixed(2)
                                : "0.00"} A
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    )
}