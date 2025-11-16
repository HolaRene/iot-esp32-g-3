"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Activity, Cpu, Zap, Gauge, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CustomSensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    datos_json: Record<string, unknown> | null
}

interface HistoryEntry {
    tiempo: string
    [key: string]: number | string
}

function isNumericValue(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value)
}

function getFieldIcon(fieldName: string): React.FC<any> {
    const name = fieldName.toLowerCase()
    if (name.includes("voltaje") || name.includes("voltage")) return Zap
    if (name.includes("corriente") || name.includes("current")) return Gauge
    if (name.includes("temperatura") || name.includes("temp")) return Cpu
    if (name.includes("presion") || name.includes("pressure")) return Gauge
    if (name.includes("nivel") || name.includes("level")) return Gauge
    return Activity
}

export function CustomSensorDetail({ sensor }: { sensor: CustomSensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryEntry[]>([])

    const jsonData = sensor.datos_json || {}
    const numericFields = Object.entries(jsonData).filter(([, value]) => isNumericValue(value))

    // Realtime: escucha cambios en sensores_personalizado
    useEffect(() => {
        if (!sensor?.id) return

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
                    const newData = payload.new.datos_json || {}
                    const tiempo = new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                    })

                    const entry: HistoryEntry = { tiempo }
                    Object.entries(newData).forEach(([key, value]) => {
                        if (isNumericValue(value)) {
                            entry[key] = value
                        }
                    })

                    setHistory((prev) => {
                        const updated = [...prev, entry]
                        return updated.slice(-48) // Últimas 48 lecturas (~24h)
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
        if (!sensor || history.length > 0 || !sensor.datos_json) return

        const tiempo = new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit"
        })

        const entry: HistoryEntry = { tiempo }
        Object.entries(sensor.datos_json).forEach(([key, value]) => {
            if (isNumericValue(value)) {
                entry[key] = value
            }
        })

        if (Object.keys(entry).length > 1) {
            setHistory([entry])
        }
    }, [sensor, history.length])

    return (
        <div className="space-y-6">
            {/* Métricas del JSON (hasta 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {numericFields.slice(0, 4).map(([key, value]) => {
                    const Icon = getFieldIcon(key)
                    const color = Icon === Zap ? "bg-yellow-500/10 text-yellow-600" :
                        Icon === Gauge ? "bg-blue-500/10 text-blue-600" :
                            Icon === Cpu ? "bg-red-500/10 text-red-600" :
                                "bg-purple-500/10 text-purple-600"

                    return (
                        <Card key={key} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground capitalize">
                                        {key.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-3xl font-bold mt-2">
                                        value
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg ${color}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                            </div>
                        </Card>
                    )
                })}
                {numericFields.length === 0 && (
                    <Card className="p-6 col-span-full">
                        <p className="text-center text-muted-foreground">No hay datos numéricos disponibles</p>
                    </Card>
                )}
            </div>

            {/* Gráfico dinámico */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Tendencias en Tiempo Real</h3>
                {history.length > 0 && numericFields.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="tiempo"
                                tick={{ fontSize: 11 }}
                                interval="preserveStartEnd"
                                minTickGap={30}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {numericFields.slice(0, 3).map(([key], index) => {
                                const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
                                return (
                                    <Line
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={colors[index % colors.length]}
                                        strokeWidth={2}
                                        name={key.replace(/_/g, " ")}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                )
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <Activity className="w-6 h-6 animate-pulse mr-2" />
                        Esperando datos en tiempo real...
                    </div>
                )}
            </Card>

            {/* Datos JSON completos */}
            <Card className="p-6 overflow-x-auto">
                <h3 className="text-lg font-bold mb-4">Datos Completos del Sensor</h3>
                <div className="space-y-3">
                    {Object.entries(jsonData).length > 0 ? (
                        Object.entries(jsonData).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                                <span className="text-sm font-mono">
                                    {value === null ? "—"
                                        : typeof value === "object" ? JSON.stringify(value)
                                            : String(value)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            No hay datos disponibles
                        </p>
                    )}
                </div>
            </Card>

            {/* Información del sensor */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Información del Sensor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="text-lg font-medium mt-2">{sensor.nombre || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Ubicación</p>
                        <p className="text-lg font-medium mt-2">{sensor.ubicacion || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant={sensor.activo ? "default" : "secondary"} className="mt-2">
                            {sensor.activo ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <p className="text-lg font-medium mt-2 flex items-center gap-2">
                            <Cpu className="w-5 h-5" />
                            Personalizado
                        </p>
                    </div>
                </div>
            </Card>

            {/* Tip de personalización */}
            <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-bold mb-2">Tip de Personalización</h3>
                        <p className="text-sm">
                            Este componente se adapta automáticamente a cualquier estructura JSON.
                            Crea sensores personalizados con los datos que necesites monitorear: voltaje, presión, flujo, conteo, etc.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}