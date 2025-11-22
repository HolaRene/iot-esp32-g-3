"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Droplets, Beaker, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface SoilSensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    humedad_suelo: number
    ph: number
}

interface HistoryPoint {
    tiempo: string
    humedad_suelo: number
    ph: number
}

function getSoilHealth(humedad: number, ph: number): {
    estado: string
    color: string
    Icon: React.ElementType
} {
    if (humedad >= 40 && humedad <= 60 && ph >= 6.0 && ph <= 7.5) {
        return { estado: "Óptimo", color: "text-green-600", Icon: CheckCircle }
    }
    if (humedad >= 30 && humedad <= 70 && ph >= 5.5 && ph <= 8.0) {
        return { estado: "Bueno", color: "text-blue-600", Icon: CheckCircle }
    }
    if (humedad >= 20 && humedad <= 80 && ph >= 5.0 && ph <= 8.5) {
        return { estado: "Regular", color: "text-yellow-600", Icon: AlertTriangle }
    }
    return { estado: "Crítico", color: "text-red-600", Icon: XCircle }
}

/**
 * 📊 Componente de Sensor de Suelo
 * Muestra humedad del suelo y pH en tiempo real
 * 💾 Tabla BD: sensores_suelo
 */
export function SoilSensorDetail({ sensor }: { sensor: SoilSensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryPoint[]>([])

    const soilHealth = getSoilHealth(sensor.humedad_suelo, sensor.ph)

    useEffect(() => {
        if (!sensor?.id) return

        let isMounted = true

        const initialPoint: HistoryPoint = {
            tiempo: new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }),
            humedad_suelo: sensor.humedad_suelo,
            ph: sensor.ph
        }
        setHistory([initialPoint])

        const channel = supabase
            .channel(`realtime-soil-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sensores_suelo",
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
                            humedad_suelo: newData.humedad_suelo,
                            ph: newData.ph
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
    }, [sensor.id, sensor.humedad_suelo, sensor.ph, supabase])

    return (
        <div className="space-y-4">
            {/* Estado del suelo */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Salud del Suelo</p>
                        <p className={`text-2xl font-bold mt-1 ${soilHealth.color}`}>
                            {soilHealth.estado}
                        </p>
                    </div>
                    <soilHealth.Icon className={`w-10 h-10 ${soilHealth.color}`} />
                </div>
            </Card>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Humedad del Suelo</p>
                            <p className="text-2xl font-bold mt-1">{sensor.humedad_suelo}%</p>
                        </div>
                        <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
                            <Droplets className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">pH del Suelo</p>
                            <p className="text-2xl font-bold mt-1">{sensor.ph}</p>
                        </div>
                        <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
                            <Beaker className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gráfico de tendencias */}
            <Card className="p-4">
                <h3 className="text-base font-semibold mb-3">Tendencias en Tiempo Real</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tiempo" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 14]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="humedad_suelo"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Humedad (%)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="ph"
                            stroke="#a855f7"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="pH"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Recomendaciones */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Recomendaciones de Riego</h3>
                <div className="space-y-2">
                    {sensor.humedad_suelo < 30 && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">Riego Urgente Necesario</p>
                                <p className="text-xs text-muted-foreground">El suelo está muy seco. Regar inmediatamente.</p>
                            </div>
                        </div>
                    )}
                    {sensor.humedad_suelo >= 30 && sensor.humedad_suelo < 40 && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">Considerar Riego</p>
                                <p className="text-xs text-muted-foreground">La humedad está bajando. Planificar riego pronto.</p>
                            </div>
                        </div>
                    )}
                    {sensor.humedad_suelo >= 40 && sensor.humedad_suelo <= 60 && (
                        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">Humedad Óptima</p>
                                <p className="text-xs text-muted-foreground">No se requiere riego en este momento.</p>
                            </div>
                        </div>
                    )}
                    {sensor.humedad_suelo > 70 && (
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                            <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">Exceso de Humedad</p>
                                <p className="text-xs text-muted-foreground">Evitar riego. Mejorar drenaje si es posible.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">Estado del pH</h4>
                    {sensor.ph < 5.5 && (
                        <p className="text-sm text-muted-foreground">pH ácido. Considerar agregar cal para neutralizar.</p>
                    )}
                    {sensor.ph >= 5.5 && sensor.ph <= 7.5 && (
                        <p className="text-sm text-muted-foreground">pH en rango óptimo para la mayoría de cultivos.</p>
                    )}
                    {sensor.ph > 7.5 && (
                        <p className="text-sm text-muted-foreground">pH alcalino. Considerar agregar azufre o materia orgánica.</p>
                    )}
                </div>
            </Card>
        </div>
    )
}