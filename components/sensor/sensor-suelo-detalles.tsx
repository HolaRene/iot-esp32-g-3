"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Droplet, FlaskConical, AlertTriangle, BarChart3, Sprout, Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SoilSensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    humedad_suelo: number | null
    ph: number | null
}

interface SoilHistory {
    tiempo: string
    humedad: number
    ph: number
}

function getSoilHealth(humedad: number | null, ph: number | null): { estado: string; color: string; Icon: React.FC<any> } {
    if (humedad === null || ph === null) return { estado: "Sin datos", color: "text-muted-foreground", Icon: AlertTriangle }
    if (humedad > 60 && ph > 6.5 && ph < 7.5) return { estado: "Óptimo", color: "text-green-500", Icon: Sprout }
    if (humedad > 40 && ph > 6 && ph < 8) return { estado: "Bueno", color: "text-blue-500", Icon: BarChart3 }
    return { estado: "Crítico", color: "text-red-500", Icon: AlertTriangle }
}

function getWateringRecommendation(humedad: number | null): string {
    if (humedad === null) return "Esperando datos..."
    if (humedad < 40) return "Riego urgente recomendado"
    if (humedad < 50) return "Riego moderado recomendado"
    if (humedad > 75) return "Esperar antes de riego"
    return "Condiciones óptimas"
}

export function SoilSensorDetail({ sensor }: { sensor: SoilSensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<SoilHistory[]>([])

    const soilHealth = getSoilHealth(sensor.humedad_suelo, sensor.ph)
    const HealthIcon = soilHealth.Icon

    // Realtime
    useEffect(() => {
        if (!sensor?.id) return

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
                    const newData = payload.new
                    const tiempo = new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                    })

                    setHistory((prev) => {
                        const updated = [...prev, {
                            tiempo,
                            humedad: newData.humedad_suelo ?? 0,
                            ph: newData.ph ?? 0
                        }]
                        return updated.slice(-48)
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
            minute: "2-digit"
        })

        if (sensor.humedad_suelo !== null && sensor.ph !== null) {
            setHistory([{
                tiempo,
                humedad: sensor.humedad_suelo,
                ph: sensor.ph
            }])
        }
    }, [sensor, history.length])

    return (
        <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Humedad del Suelo</p>
                            <p className="text-3xl font-bold mt-2">
                                {sensor.humedad_suelo !== null ? `${sensor.humedad_suelo}%` : "—"}
                            </p>
                        </div>
                        <div className="bg-cyan-500/10 p-3 rounded-lg">
                            <Droplet className="w-8 h-8 text-cyan-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Nivel de pH</p>
                            <p className="text-3xl font-bold mt-2">
                                {sensor.ph !== null ? sensor.ph.toFixed(1) : "—"}
                            </p>
                        </div>
                        <div className="bg-orange-500/10 p-3 rounded-lg">
                            <FlaskConical className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Estado de salud del suelo */}
            <Card className="p-6 border-2" style={{ borderColor: soilHealth.color.replace("text-", "") }}>
                <div className="flex items-center gap-4">
                    <div className="text-5xl">
                        <HealthIcon className="w-12 h-12" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Salud del Suelo</p>
                        <p className={`text-2xl font-bold mt-1 ${soilHealth.color}`}>
                            {soilHealth.estado}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {sensor.humedad_suelo === null || sensor.ph === null
                                ? "Esperando primeros datos..."
                                : "Basado en humedad y pH"}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Gráfico en tiempo real */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Tendencias en Tiempo Real</h3>
                {history.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="tiempo"
                                tick={{ fontSize: 11 }}
                                interval="preserveStartEnd"
                                minTickGap={30}
                            />
                            <YAxis yAxisId="left" domain={[0, 100]} />
                            <YAxis yAxisId="right" orientation="right" domain={[5, 9]} />
                            <Tooltip />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="humedad"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                name="Humedad (%)"
                                dot={{ fill: "#06b6d4", r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="ph"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                name="pH"
                                dot={{ fill: "#f59e0b", r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <Activity className="w-6 h-6 animate-pulse mr-2" />
                        Esperando datos en tiempo real...
                    </div>
                )}
            </Card>

            {/* Recomendación de riego */}
            <Card className={`p-6 border-2 ${sensor.humedad_suelo === null ? "bg-gray-50 dark:bg-gray-900 border-gray-300" : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"}`}>
                <h3 className="text-lg font-bold mb-4">Recomendación de Riego</h3>
                <div className="flex items-center gap-4">
                    <Droplet className="w-12 h-12 text-cyan-600" />
                    <div>
                        <p className="text-lg font-bold">{getWateringRecommendation(sensor.humedad_suelo)}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            {sensor.humedad_suelo === null ? "—" : "Próximo riego recomendado en 2-3 días"}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Indicadores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Clasificación pH</p>
                    <Badge
                        variant={sensor.ph !== null && sensor.ph >= 6.5 && sensor.ph <= 7.5 ? "default" : "secondary"}
                        className="mt-2"
                    >
                        {sensor.ph === null ? "—" : sensor.ph < 6 ? "Ácido" : sensor.ph <= 7.5 ? "Neutro" : "Alcalino"}
                    </Badge>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Estado de Humedad</p>
                    <Badge
                        variant={sensor.humedad_suelo !== null && sensor.humedad_suelo > 40 && sensor.humedad_suelo < 75 ? "default" : "secondary"}
                        className="mt-2"
                    >
                        {sensor.humedad_suelo === null ? "—" : sensor.humedad_suelo < 40 ? "Seco" : sensor.humedad_suelo < 75 ? "Óptimo" : "Saturado"}
                    </Badge>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Nutrientes</p>
                    <Badge variant="outline" className="mt-2">
                        Verificar disponibilidad
                    </Badge>
                </Card>
            </div>

            {/* Detalles técnicos */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Detalles del Sensor</h3>
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
                </div>
            </Card>
        </div>
    )
}