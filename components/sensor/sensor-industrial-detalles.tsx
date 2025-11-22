"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Activity, Volume2, Ruler, Settings, CheckCircle, AlertTriangle, XCircle, AlertCircle } from "lucide-react"

interface IndustrialSensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    vibracion: number | null
    ruido: number | null
    inclinacion: number | null
    consumo: number | null
}

interface HistoryPoint {
    tiempo: string
    vibracion: number | null
    ruido: number | null
    inclinacion: number | null
    consumo: number | null
}

function getMachineStatus(vibracion: number | null, ruido: number | null): {
    estado: string
    color: string
    Icon: React.ElementType
    borderColor: string
} {
    if (vibracion === null || ruido === null) {
        return {
            estado: "Sin Datos",
            color: "text-gray-500",
            borderColor: "border-gray-500",
            Icon: AlertCircle
        }
    }

    if (vibracion < 4 && ruido < 85) return {
        estado: "Óptimo",
        color: "text-green-600",
        borderColor: "border-green-500",
        Icon: CheckCircle
    }
    if (vibracion < 6 && ruido < 95) return {
        estado: "Normal",
        color: "text-blue-600",
        borderColor: "border-blue-500",
        Icon: CheckCircle
    }
    if (vibracion < 8 && ruido < 105) return {
        estado: "Advertencia",
        color: "text-yellow-600",
        borderColor: "border-yellow-500",
        Icon: AlertTriangle
    }
    return {
        estado: "Crítico",
        color: "text-red-600",
        borderColor: "border-red-500",
        Icon: XCircle
    }
}

/**
 * 📊 Componente de Sensor Industrial
 * Muestra vibración, ruido, inclinación y consumo en tiempo real
 * 💾 Tabla BD: sensores_industrial
 */
export function IndustrialSensorDetail({ sensor }: { sensor: IndustrialSensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryPoint[]>([])

    const machineStatus = getMachineStatus(sensor.vibracion, sensor.ruido)

    useEffect(() => {
        if (!sensor?.id) return

        let isMounted = true

        const initialPoint: HistoryPoint = {
            tiempo: new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }),
            vibracion: sensor.vibracion,
            ruido: sensor.ruido,
            inclinacion: sensor.inclinacion,
            consumo: sensor.consumo
        }
        setHistory([initialPoint])

        const channel = supabase
            .channel(`realtime-industrial-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sensores_industrial",
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
                            vibracion: newData.vibracion,
                            ruido: newData.ruido,
                            inclinacion: newData.inclinacion,
                            consumo: newData.consumo
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
    }, [sensor.id, sensor.vibracion, sensor.ruido, sensor.inclinacion, sensor.consumo, supabase])

    return (
        <div className="space-y-4">
            {/* Estado de la máquina */}
            <Card className={`p-4 border-2 ${machineStatus.borderColor}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Estado de la Máquina</p>
                        <p className={`text-2xl font-bold mt-1 ${machineStatus.color}`}>
                            {machineStatus.estado}
                        </p>
                    </div>
                    <machineStatus.Icon className={`w-10 h-10 ${machineStatus.color}`} />
                </div>
            </Card>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Vibración</p>
                            <p className="text-2xl font-bold mt-1">{sensor.vibracion ?? "—"} mm/s</p>
                        </div>
                        <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Ruido</p>
                            <p className="text-2xl font-bold mt-1">{sensor.ruido ?? "—"} dB</p>
                        </div>
                        <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg">
                            <Volume2 className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Inclinación</p>
                            <p className="text-2xl font-bold mt-1">{sensor.inclinacion ?? "—"}°</p>
                        </div>
                        <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
                            <Ruler className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Consumo</p>
                            <p className="text-2xl font-bold mt-1">{sensor.consumo ?? "—"} W</p>
                        </div>
                        <div className="bg-green-500/10 text-green-500 p-2 rounded-lg">
                            <Settings className="w-5 h-5" />
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
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="vibracion" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} name="Vibración (mm/s)" />
                        <Line type="monotone" dataKey="ruido" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Ruido (dB)" />
                        <Line type="monotone" dataKey="inclinacion" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Inclinación (°)" />
                        <Line type="monotone" dataKey="consumo" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Consumo (W)" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Alertas */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Alertas y Recomendaciones</h3>
                <div className="space-y-2">
                    {sensor.vibracion && sensor.vibracion > 6 && (
                        <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <span className="text-sm">Vibración elevada. Revisar balanceo de la máquina.</span>
                        </div>
                    )}
                    {sensor.ruido && sensor.ruido > 95 && (
                        <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-950 rounded">
                            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                            <span className="text-sm">Nivel de ruido alto. Verificar componentes mecánicos.</span>
                        </div>
                    )}
                    {sensor.inclinacion && Math.abs(sensor.inclinacion) > 3 && (
                        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950 rounded">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <span className="text-sm">Inclinación fuera de rango. Nivelar equipo inmediatamente.</span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}