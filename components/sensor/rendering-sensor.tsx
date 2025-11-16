"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

import { EnvironmentalSensorDetail } from "@/components/sensor/EnviromentSensorDetail"
import { AirQualitySensorDetail } from "@/components/sensor/calidad-aire-detalles"
import { EnergySensorDetail } from "@/components/sensor/sensor-energia-detalles"
import { IndustrialSensorDetail } from "@/components/sensor/sensor-industrial-detalles"
import { SecuritySensorDetail } from "@/components/sensor/sensor-seguridad-detalles"
import { SoilSensorDetail } from "@/components/sensor/sensor-suelo-detalles"
import { CustomSensorDetail } from "@/components/sensor/sensor-personalizado-detalles"

type SensorCategoria =
    | "ambiental"
    | "calidad_aire"
    | "energia"
    | "industrial"
    | "seguridad"
    | "suelo"
    | "personalizado"

const categoriaTablaMap: Record<SensorCategoria, string> = {
    ambiental: "sensores_ambiental",
    calidad_aire: "sensores_calidad_aire",
    suelo: "sensores_suelo",
    industrial: "sensores_industrial",
    energia: "sensores_energia",
    seguridad: "sensores_seguridad",
    personalizado: "sensores_personalizado",
}

// ... (importaciones iguales)

export function SensorDetailsPage({ id }: { id: string }) {
    const supabase = createClient()
    const [sensor, setSensor] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [categoria, setCategoria] = useState<SensorCategoria | null>(null)

    const fetchSensor = async () => {
        setLoading(true)

        // 1. Obtener sensor base
        const { data: sensorData, error } = await supabase
            .from("sensores")
            .select("*")
            .eq("id", id)
            .single()

        if (error || !sensorData) {
            console.error("Error cargando sensor base:", error)
            setSensor(null)
            setLoading(false)
            return
        }

        const tabla = categoriaTablaMap[sensorData.categoria as SensorCategoria]
        setCategoria(sensorData.categoria as SensorCategoria)

        let detalles: any = {}

        if (tabla) {
            const { data: detalleData } = await supabase
                .from(tabla)
                .select("*")
                .eq("sensor_id", id)
                .single()

            if (detalleData) {
                detalles = detalleData
            }
            // Si no hay datos, detalles = {} → los campos serán undefined
        }

        // Combinar: base + detalles (detalles sobrescriben si hay conflicto)
        setSensor({ ...sensorData, ...detalles })
        setLoading(false)
    }

    useEffect(() => {
        if (id) fetchSensor()
    }, [id])

    // Realtime (igual, sin cambios)
    useEffect(() => {
        if (!categoria) return
        const tablaDetalles = categoriaTablaMap[categoria]

        const channel = supabase
            .channel(`sensor-${id}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "sensores", filter: `id=eq.${id}` },
                () => fetchSensor()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: tablaDetalles, filter: `sensor_id=eq.${id}` },
                () => fetchSensor()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, categoria])

    // Render
    if (loading) return <p className="text-center py-10">Cargando datos del sensor...</p>
    if (!sensor) return <p className="text-center py-10 text-red-500">Sensor no encontrado.</p>

    function renderSensorDetail() {
        switch (sensor.categoria) {
            case "ambiental":
                return <EnvironmentalSensorDetail sensor={sensor} />
            case "calidad_aire":
                return <AirQualitySensorDetail sensor={sensor} />
            case "energia":
                return <EnergySensorDetail sensor={sensor} />
            case "industrial":
                return <IndustrialSensorDetail sensor={sensor} />
            case "seguridad":
                return <SecuritySensorDetail sensor={sensor} />
            case "suelo":
                return <SoilSensorDetail sensor={sensor} />
            case "personalizado":
                return <CustomSensorDetail sensor={sensor} />
            default:
                return <Card className="p-6"><p>Tipo no soportado</p></Card>
        }
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dispositivos-flexis">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{sensor.nombre}</h1>
                            <Badge variant={sensor.activo ? "default" : "secondary"}>
                                {sensor.activo ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Categoría: {sensor.categoria.replace(/_/g, " ")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon"><Edit size={20} /></Button>
                    <Button variant="outline" size="icon"><Trash2 size={20} /></Button>
                </div>
            </div>

            {/* INFO GENERAL */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground">Ubicación</p>
                    <p className="text-lg font-bold mt-2">{sensor.ubicacion || "—"}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground">Dispositivo ID</p>
                    <p className="font-bold mt-2 font-mono text-sm">{sensor.dispositivo_id || "—"}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground">Grupo</p>
                    <p className="text-lg font-bold mt-2">{sensor.grupo_id || "—"}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground">Creado</p>
                    <p className="text-lg font-bold mt-2">
                        {sensor.creado_en ? new Date(sensor.creado_en).toLocaleDateString("es-ES") : "—"}
                    </p>
                </Card>
            </div>

            {/* DETALLES ESPECÍFICOS */}
            {renderSensorDetail()}
        </div>
    )
}
