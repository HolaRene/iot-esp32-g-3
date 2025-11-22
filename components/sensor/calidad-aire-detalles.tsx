"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Wind, Droplets, Leaf, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface AirQualitySensorData {
    id: string
    nombre: string
    ubicacion: string
    activo: boolean
    co2: number
    pm25: number
    voc: number
}

interface HistoryPoint {
    tiempo: string
    co2: number
    pm25: number
    voc: number
}

function getAirQualityStatus(co2: number): {
    estado: string
    color: string
    borderColor: string
    Icon: React.ElementType
} {
    if (co2 < 600) return {
        estado: "Buena",
        color: "text-green-600",
        borderColor: "border-green-500",
        Icon: CheckCircle
    }
    if (co2 < 800) return {
        estado: "Regular",
        color: "text-yellow-600",
        borderColor: "border-yellow-500",
        Icon: AlertTriangle
    }
    return {
        estado: "Mala",
        color: "text-red-600",
        borderColor: "border-red-500",
        Icon: XCircle
    }
}

/**
 * 📊 Componente de Sensor de Calidad de Aire
 * 
 * Muestra datos en tiempo real de CO₂, PM2.5 y VOC.
 * Crea un historial local de los últimos 10 valores recibidos.
 * 
 * 💾 Tabla BD: sensores_calidad_aire
 * 🔄 Actualización: Tiempo real con eventos UPDATE
 */
export function AirQualitySensorDetail({ sensor }: { sensor: AirQualitySensorData }) {
    const supabase = createClient()
    const [history, setHistory] = useState<HistoryPoint[]>([])

    const qualityStatus = getAirQualityStatus(sensor.co2)

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
            co2: sensor.co2,
            pm25: sensor.pm25,
            voc: sensor.voc
        }
        setHistory([initialPoint])

        // Escuchar actualizaciones en tiempo real
        const channel = supabase
            .channel(`realtime-air-${sensor.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sensores_calidad_aire",
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
                            co2: newData.co2,
                            pm25: newData.pm25,
                            voc: newData.voc
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
    }, [sensor.id, sensor.co2, sensor.pm25, sensor.voc, supabase])

    return (
        <div className="space-y-4">
            {/* Estado de calidad del aire */}
            <Card className={`p-4 border-2 ${qualityStatus.borderColor}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Calidad del Aire</p>
                        <p className={`text-2xl font-bold mt-1 ${qualityStatus.color}`}>
                            {qualityStatus.estado}
                        </p>
                    </div>
                    <qualityStatus.Icon className={`w-10 h-10 ${qualityStatus.color}`} />
                </div>
            </Card>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">CO₂</p>
                            <p className="text-2xl font-bold mt-1">{sensor.co2} ppm</p>
                        </div>
                        <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg">
                            <Wind className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">PM2.5</p>
                            <p className="text-2xl font-bold mt-1">{sensor.pm25} µg/m³</p>
                        </div>
                        <div className="bg-gray-500/10 text-gray-500 p-2 rounded-lg">
                            <Droplets className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">VOC</p>
                            <p className="text-2xl font-bold mt-1">{sensor.voc} ppb</p>
                        </div>
                        <div className="bg-green-500/10 text-green-500 p-2 rounded-lg">
                            <Leaf className="w-5 h-5" />
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
                            dataKey="co2"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="CO₂ (ppm)"
                        />
                        <Line
                            type="monotone"
                            dataKey="pm25"
                            stroke="#6b7280"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="PM2.5 (µg/m³)"
                        />
                        <Line
                            type="monotone"
                            dataKey="voc"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="VOC (ppb)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Recomendaciones */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Recomendaciones</h3>
                <ul className="space-y-2 text-sm">
                    {sensor.co2 > 800 && (
                        <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span>Nivel de CO₂ elevado. Ventila el espacio.</span>
                        </li>
                    )}
                    {sensor.pm25 > 25 && (
                        <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span>Partículas PM2.5 altas. Considera usar purificador de aire.</span>
                        </li>
                    )}
                    {sensor.voc > 200 && (
                        <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span>Compuestos orgánicos volátiles detectados. Mejora la ventilación.</span>
                        </li>
                    )}
                    {sensor.co2 < 600 && sensor.pm25 < 12 && sensor.voc < 100 && (
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>Calidad del aire óptima. Mantén la ventilación actual.</span>
                        </li>
                    )}
                </ul>
            </Card>
        </div>
    )
}