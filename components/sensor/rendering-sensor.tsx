"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Copy, Edit, Trash2 } from 'lucide-react'
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

import { AirQualitySensorDetail } from "@/components/sensor/calidad-aire-detalles"
import { EnergySensorDetail } from "@/components/sensor/sensor-energia-detalles"
import { IndustrialSensorDetail } from "@/components/sensor/sensor-industrial-detalles"
import { SecuritySensorDetail } from "@/components/sensor/sensor-seguridad-detalles"
import { SoilSensorDetail } from "@/components/sensor/sensor-suelo-detalles"
import { CustomSensorDetail } from "@/components/sensor/sensor-personalizado-detalles"
import { EnvironmentalSensorDetail } from "./EnviromentSensorDetail"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Input } from "../ui/input"

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

const getExpectedFields = (categoria: SensorCategoria) => {
    switch (categoria) {
        case "ambiental":
            return [
                { field: "temperatura", type: "numeric(5,2)" },
                { field: "humedad", type: "numeric(5,2)" },
                { field: "presion", type: "numeric(6,2)" },
                { field: "clima", type: "varchar(50)" },
            ];
        case "calidad_aire":
            return [
                { field: "co2", type: "numeric(6,2)" },
                { field: "pm25", type: "numeric(6,2)" },
                { field: "voc", type: "numeric(6,2)" },
            ];
        case "energia":
            return [
                { field: "voltaje", type: "numeric(6,2)" },
                { field: "corriente", type: "numeric(6,2)" },
                { field: "potencia", type: "numeric(8,2)" },
            ];
        case "industrial":
            return [
                { field: "vibracion", type: "numeric(6,2)" },
                { field: "ruido", type: "numeric(6,2)" },
                { field: "inclinacion", type: "numeric(5,2)" },
                { field: "consumo", type: "numeric(8,2)" },
            ];
        case "seguridad":
            return [
                { field: "movimiento", type: "boolean" },
                { field: "puerta", type: "boolean" },
                { field: "humo", type: "boolean" },
                { field: "agua", type: "boolean" },
                { field: "distancia", type: "real" },
                { field: "luces", type: "boolean" },
                { field: "alarma", type: "boolean" },
            ];
        case "suelo":
            return [
                { field: "humedad_suelo", type: "numeric(5,2)" },
                { field: "ph", type: "numeric(4,2)" },
            ];
        case "personalizado":
            return [
                { field: "datos", type: "jsonb" },
            ];
        default:
            return [];
    }
};


export function SensorDetailsPage({ id }: { id: string }) {
    const supabase = createClient()
    const [sensor, setSensor] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [categoria, setCategoria] = useState<SensorCategoria | null>(null)
    const [copied, setCopied] = useState("")

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(""), 2000)
    }



    const fetchSensor = async () => {
        setLoading(true)

        // 1. Obtener sensor base con JOIN
        const { data: sensorData, error } = await supabase
            .from("sensores")
            .select(`
            *,
            sensor_groups (
                id,
                name
            )
        `)
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
        }

        // 2. Insertar grupo_nombre
        setSensor({
            ...sensorData,
            grupo_nombre: sensorData.grupos?.nombre ?? null,
            ...detalles
        })

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
                    {/* BOTÓN CONECTAR */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="default" size="sm">Conectar</Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[320px] pl-3">
                            <SheetHeader>
                                <SheetTitle>Conectar Sensor</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4 mt-4">
                                {/* Sensor ID */}
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Sensor ID</p>
                                    <div className="flex items-center gap-2">
                                        <Input readOnly value={sensor.id} className="font-mono text-sm" />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard(sensor.id, "sensor-id")}
                                        >
                                            {copied === "sensor-id" ? <Check size={16} /> : <Copy size={16} />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Endpoint */}
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Endpoint</p>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            readOnly
                                            value={`https://api-iot-control.up.railway.app/sensors/${sensor.id}`}
                                            className="font-mono text-sm"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                copyToClipboard(
                                                    `https://api-iot-control.up.railway.app/sensors/${sensor.id}`,
                                                    "sensor-endpoint"
                                                )
                                            }
                                        >
                                            {copied === "sensor-endpoint" ? <Check size={16} /> : <Copy size={16} />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Campos esperados según categoría */}
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Campos esperados</p>
                                    <div className="flex flex-col gap-2">
                                        {getExpectedFields(sensor.categoria).map(({ field, type }) => (
                                            <div key={field} className="flex items-center justify-between p-2 rounded border">
                                                <span className="font-mono text-sm font-medium">{field}</span>
                                                <Badge variant="outline" className="text-xs font-mono">{type}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <SheetFooter>
                                <Button variant="secondary" onClick={() => console.log("Cerrar sheet")}>Cerrar</Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
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
                    <p className="text-lg font-bold mt-2">{sensor.sensor_groups.name || "—"}</p>
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
