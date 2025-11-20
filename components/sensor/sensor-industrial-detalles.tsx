"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Activity, Volume2, Ruler, Settings, CheckCircle, Info, AlertTriangle, XCircle, AlertCircle, Clock } from "lucide-react"

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
        Icon: Info
    }
    if (vibracion < 8 && ruido < 105) return {
        estado: "Alerta",
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

export function IndustrialSensorDetail({ sensor }: { sensor: IndustrialSensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryPoint[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const machineStatus = getMachineStatus(sensor.vibracion, sensor.ruido)

    // Obtener historial inicial y suscribirse a tiempo real
    useEffect(() => {
        if (!sensor?.id) return

        let isMounted = true

        const fetchHistoryData = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await supabase
                    .from('sensores_industrial')
                    .select('vibracion, ruido, inclinacion, consumo, created_at')
                    .eq('sensor_id', sensor.id)
                    .order('created_at', { ascending: true })
                    .limit(60)

                if (error) throw error

                if (isMounted && data) {
                    const formattedHistory = data.map(point => ({
                        tiempo: new Date(point.created_at).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        }),
                        vibracion: point.vibracion,
                        ruido: point.ruido,
                        inclinacion: point.inclinacion,
                        consumo: point.consumo
                    }))
                    setHistory(formattedHistory)
                }
            } catch (error) {
                console.error("Error loading industrial history:", error)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        fetchHistoryData()

        const channel = supabase
            .channel(`realtime-industrial-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "sensores_industrial",
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
                            vibracion: newData.vibracion,
                            ruido: newData.ruido,
                            inclinacion: newData.inclinacion,
                            consumo: newData.consumo
                        }]

                        return updated.slice(-60)
                    })
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [sensor.id, supabase])

    // Alertas dinámicas con manejo de null
    const alertas = [
        {
            texto: sensor.vibracion !== null
                ? (sensor.vibracion < 6 ? "Vibración normal" : "Vibración alta")
                : "Vibración: sin datos",
            color: sensor.vibracion !== null ? (sensor.vibracion < 6 ? "text-green-600" : "text-yellow-600") : "text-gray-500",
            Icon: sensor.vibracion !== null ? (sensor.vibracion < 6 ? CheckCircle : AlertTriangle) : AlertCircle
        },
        {
            texto: sensor.ruido !== null
                ? (sensor.ruido > 90 ? "Ruido elevado" : "Ruido normal")
                : "Ruido: sin datos",
            color: sensor.ruido !== null ? (sensor.ruido > 90 ? "text-yellow-600" : "text-green-600") : "text-gray-500",
            Icon: sensor.ruido !== null ? (sensor.ruido > 90 ? AlertTriangle : CheckCircle) : AlertCircle
        },
        {
            texto: sensor.inclinacion !== null
                ? (Math.abs(sensor.inclinacion) > 5 ? "Inclinación fuera de rango" : "Inclinación normal")
                : "Inclinación: sin datos",
            color: sensor.inclinacion !== null ? (Math.abs(sensor.inclinacion) > 5 ? "text-yellow-600" : "text-green-600") : "text-gray-500",
            Icon: sensor.inclinacion !== null ? (Math.abs(sensor.inclinacion) > 5 ? AlertTriangle : CheckCircle) : AlertCircle
        }
    ]

    return (
        <div className="space-y-4">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Vibración</p>
                            <p className="text-2xl font-bold mt-1">
                                {sensor.vibracion !== null ? `${sensor.vibracion.toFixed(1)} mm/s` : "—"}
                            </p>
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
                            <p className="text-2xl font-bold mt-1">
                                {sensor.ruido !== null ? `${sensor.ruido} dB` : "—"}
                            </p>
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
                            <p className="text-2xl font-bold mt-1">
                                {sensor.inclinacion !== null ? `${sensor.inclinacion.toFixed(1)}°` : "—"}
                            </p>
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
                            <p className="text-2xl font-bold mt-1">
                                {sensor.consumo !== null ? `${sensor.consumo} kW` : "—"}
                            </p>
                        </div>
                        <div className="bg-red-500/10 text-red-500 p-2 rounded-lg">
                            <Settings className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Estado de la máquina */}
            <Card className={`p-4 border-2 ${machineStatus.borderColor}`}>
                <div className="flex items-center gap-3">
                    <machineStatus.Icon className={`w-10 h-10 ${machineStatus.color}`} />
                    <div>
                        <p className="text-xs text-muted-foreground">Estado de la Máquina</p>
                        <p className={`text-xl font-bold mt-0.5 ${machineStatus.color}`}>{machineStatus.estado}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Basado en vibración y ruido</p>
                    </div>
                </div>
            </Card>

            {/* Gráfico en tiempo real */}
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
                    <LineChart data={history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="tiempo"
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                            minTickGap={20}
                        />
                        <YAxis yAxisId="vib" domain={[0, 10]} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="ruido" orientation="right" domain={[60, 120]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line
                            yAxisId="vib"
                            type="monotone"
                            dataKey="vibracion"
                            stroke="#9333ea"
                            strokeWidth={1.5}
                            name="Vibración (mm/s)"
                            dot={{ r: 3 }}
                            activeDot={{ r: 4 }}
                            connectNulls // Importante para manejar datos null
                        />
                        <Line
                            yAxisId="ruido"
                            type="monotone"
                            dataKey="ruido"
                            stroke="#f97316"
                            strokeWidth={1.5}
                            name="Ruido (dB)"
                            dot={{ r: 3 }}
                            activeDot={{ r: 4 }}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Alertas y recomendaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="p-4">
                    <h3 className="text-base font-semibold mb-3">Alertas Activas</h3>
                    <div className="space-y-2">
                        {alertas.map((alerta, i) => (
                            <Badge key={i} variant="outline" className="w-full justify-start text-xs py-1.5 px-2">
                                <alerta.Icon className={`w-3.5 h-3.5 mr-2 ${alerta.color}`} />
                                {alerta.texto}
                            </Badge>
                        ))}
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="text-base font-semibold mb-3">Mantenimiento Recomendado</h3>
                    <ul className="space-y-1.5 text-xs">
                        {sensor.vibracion !== null && sensor.vibracion > 5 && (
                            <li className="flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                                <span>Inspección de rodamientos urgente</span>
                            </li>
                        )}
                        {sensor.ruido !== null && sensor.ruido > 95 && (
                            <li className="flex items-center gap-2">
                                <Volume2 className="w-3.5 h-3.5 text-yellow-500" />
                                <span>Revisar aislamiento acústico</span>
                            </li>
                        )}
                        <li className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>Próximo mantenimiento: {sensor.activo ? "Activo" : "Pendiente"}</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    )
}