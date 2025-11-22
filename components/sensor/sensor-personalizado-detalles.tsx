"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Settings, TrendingUp } from "lucide-react"

interface CustomSensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    datos: Record<string, any>
}

interface HistoryPoint {
    tiempo: string
    [key: string]: any
}

/**
 * 📊 Componente de Sensor Personalizado
 * Muestra datos JSON personalizados en tiempo real
 * 💾 Tabla BD: sensores_personalizado
 */
export function CustomSensorDetail({ sensor }: { sensor: CustomSensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryPoint[]>([])

    // Extraer campos numéricos del JSON para gráficos
    const numericFields = sensor.datos
        ? Object.entries(sensor.datos)
            .filter(([_, value]) => typeof value === 'number')
            .map(([key]) => key)
        : []

    useEffect(() => {
        if (!sensor?.id) return

        let isMounted = true

        const initialPoint: HistoryPoint = {
            tiempo: new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }),
            ...sensor.datos
        }
        setHistory([initialPoint])

        const channel = supabase
            .channel(`realtime-custom-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sensores_personalizado",
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

                    setHistory((prev) => {
                        if (prev.length > 0 && prev[prev.length - 1].tiempo === tiempo) {
                            return prev
                        }

                        const updated = [...prev, {
                            tiempo,
                            ...newData.datos
                        }]

                        return updated.slice(-10)
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
            {/* Encabezado */}
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <div className="flex items-center gap-3">
                    <Settings className="w-8 h-8 text-purple-600" />
                    <div>
                        <h3 className="text-lg font-semibold">Sensor Personalizado</h3>
                        <p className="text-sm text-muted-foreground">
                            Datos dinámicos en formato JSON
                        </p>
                    </div>
                </div>
            </Card>

            {/* Métricas dinámicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sensor.datos && Object.entries(sensor.datos).map(([key, value]) => (
                    <Card key={key} className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground capitalize">
                                    {key.replace(/_/g, " ")}
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                </p>
                            </div>
                            <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Gráfico de tendencias (solo campos numéricos) */}
            {numericFields.length > 0 && (
                <Card className="p-4">
                    <h3 className="text-base font-semibold mb-3">Tendencias en Tiempo Real</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tiempo" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Legend />
                            {numericFields.map((field, idx) => {
                                const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']
                                return (
                                    <Line
                                        key={field}
                                        type="monotone"
                                        dataKey={field}
                                        stroke={colors[idx % colors.length]}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        name={field.replace(/_/g, " ")}
                                    />
                                )
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Datos JSON completos */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Datos JSON Completos</h3>
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                    {JSON.stringify(sensor.datos, null, 2)}
                </pre>
            </Card>

            {/* Información */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950">
                <h3 className="text-sm font-semibold mb-2">ℹ️ Información</h3>
                <p className="text-xs text-muted-foreground">
                    Este sensor personalizado acepta cualquier estructura de datos en formato JSON.
                    Los campos numéricos se muestran automáticamente en el gráfico de tendencias.
                </p>
            </Card>
        </div>
    )
}