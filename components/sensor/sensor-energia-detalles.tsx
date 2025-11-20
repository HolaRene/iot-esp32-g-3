"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Zap, Plug, Lightbulb, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react"

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

export function EnergySensorDetail({ sensor }: { sensor: EnergySensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryPoint[]>([])
    const [totalConsumoWh, setTotalConsumoWh] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const eficiencia = sensor.voltaje > 0 && sensor.corriente > 0
        ? Math.min(100, Math.round((sensor.potencia / (sensor.voltaje * sensor.corriente)) * 100))
        : 0

    // Obtener historial inicial y suscribirse a tiempo real
    useEffect(() => {
        if (!sensor?.id) return

        let isMounted = true

        const fetchHistoryData = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await supabase
                    .from('sensores_energia')
                    .select('voltaje, corriente, potencia, created_at')
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
                        voltaje: point.voltaje,
                        corriente: point.corriente,
                        potencia: point.potencia
                    }))

                    setHistory(formattedHistory)

                    // Calcular consumo acumulado
                    const consumo = formattedHistory.reduce((sum, p) => sum + p.potencia / 60, 0)
                    setTotalConsumoWh(consumo)
                }
            } catch (error) {
                console.error("Error loading energy history:", error)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        fetchHistoryData()

        const channel = supabase
            .channel(`realtime-energy-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
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

                    if (!isMounted) return

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

                        return updated.slice(-60)
                    })

                    setTotalConsumoWh(prev => prev + newData.potencia / 60)
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [sensor.id, supabase])

    const potenciaPromedio = history.length > 0
        ? Math.round(history.slice(-30).reduce((sum, p) => sum + p.potencia, 0) / Math.min(30, history.length))
        : sensor.potencia

    return (
        <div className="space-y-4">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                            <Plug className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Potencia</p>
                            <p className="text-2xl font-bold mt-1">{sensor.potencia} W</p>
                        </div>
                        <div className="bg-green-500/10 text-green-500 p-2 rounded-lg">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gráfico en tiempo real */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">Consumo de Potencia (Tiempo Real)</h3>
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
                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="tiempo"
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                            minTickGap={20}
                        />
                        <YAxis domain={["dataMin - 50", "dataMax + 50"]} tick={{ fontSize: 10 }} />
                        <Tooltip
                            formatter={(value: number) => [`${value} W`, "Potencia"]}
                            labelFormatter={(label) => `Hora: ${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="potencia"
                            stroke="#f59e0b"
                            fill="url(#colorPower)"
                            strokeWidth={1.5}
                            dot={{ r: 3 }}
                            activeDot={{ r: 4 }}
                            name="Potencia (W)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            {/* Estadísticas dinámicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground">Consumo Total</p>
                    <p className="text-xl font-bold mt-1">{(totalConsumoWh / 1000)} kWh</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Acumulado</p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground">Eficiencia Eléctrica</p>
                    <p className="text-xl font-bold mt-1">{eficiencia}%</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Ratio V·A/W</p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground">Potencia Promedio</p>
                    <p className="text-xl font-bold mt-1">{potenciaPromedio} W</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Últimos 30 min</p>
                </Card>
            </div>

            {/* Recomendaciones dinámicas */}
            <Card className={`p-4 border-2 ${eficiencia >= 90 ? "border-green-500" : "border-yellow-500"}`}>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recomendaciones
                </h3>
                <ul className="space-y-1.5 text-xs">
                    {eficiencia >= 95 ? (
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            <span>Eficiencia óptima detectada</span>
                        </li>
                    ) : eficiencia >= 85 ? (
                        <li className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                            <span>Buena eficiencia, mantener configuración</span>
                        </li>
                    ) : (
                        <li className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            <span>Revisar conexiones o reducir carga</span>
                        </li>
                    )}
                    <li className="flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                        <span>Programar uso intensivo en horas valle</span>
                    </li>
                </ul>
            </Card>
        </div>
    )
}