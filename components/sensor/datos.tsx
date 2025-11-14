"use client"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DatosProps {
    id: string
}

export interface SensorGroup {
    name: string;
    group_type?: string | null;
}

export interface SensorData {
    id: string;
    user_id: string;
    group_id?: string | null;
    device_id: string;
    name: string;
    description?: string | null;
    device_type?: string | null;
    sensor_type?: string | null;
    location?: string | null;
    temperature?: number | null;
    humidity?: number | null;
    pressure?: number | null;
    soil_moisture?: number | null;
    light_intensity?: number | null;
    battery_level?: number | null;
    is_active?: boolean | null;
    last_seen?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    sensor_groups?: SensorGroup; // relación opcional
}

const Datos = ({ id }: DatosProps) => {
    const supabase = createClient()
    const [sensor, setSensor] = useState<SensorData | null>(null)


    const fetchSensor = async () => {
        const { data, error } = await supabase
            .from("sensors_datos")
            .select("*, sensor_groups(name, group_type)")
            .eq("id", id)
            .single()

        if (!error && data) setSensor(data)
        if (error) console.log("Error fetching sensor:", error)
    }

    useEffect(() => {
        if (!id) return

        // Carga inicial
        fetchSensor()

        // Configurar Realtime
        const channel = supabase
            .channel('public:sensors_datos')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'sensors_datos',
                    filter: `id=eq.${id}`
                },
                (payload) => {
                    setSensor(payload.new as SensorData)

                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id])

    if (!sensor) return <div className="p-6">Cargando sensor...</div>

    return (
        <div className="p-6 space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                    <h1 className="text-3xl font-bold">{sensor.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        Grupo: {sensor.sensor_groups?.name || "Sin grupo"} | Tipo: {sensor.sensor_type}
                    </p>
                </div>
                <Badge
                    variant={sensor.is_active ? "default" : "destructive"}
                    className="uppercase px-4 py-1 text-sm"
                >
                    {sensor.is_active ? "Activo" : "Inactivo"}
                </Badge>
            </div>

            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Temperatura</CardTitle>
                        <CardDescription>Última lectura</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{sensor.temperature} °C</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Humedad</CardTitle>
                        <CardDescription>Última lectura</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{sensor.humidity} %</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Presión</CardTitle>
                        <CardDescription>Última lectura</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{sensor.pressure} hPa</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Humedad del suelo</CardTitle>
                        <CardDescription>Última lectura</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{sensor.soil_moisture} %</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Luminosidad</CardTitle>
                        <CardDescription>Última lectura</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{sensor.light_intensity} lx</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Batería</CardTitle>
                        <CardDescription>Nivel actual</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{sensor.battery_level} %</p>
                    </CardContent>
                </Card>
            </div>

            {/* Información adicional */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalles</CardTitle>
                    <CardDescription>Información general del sensor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p><span className="font-medium">Ubicación:</span> {sensor.location || "No asignada"}</p>
                    <p><span className="font-medium">Descripción:</span> {sensor.description || "Sin descripción"}</p>
                    <p>
                        <span className="font-medium">Última actualización:</span>{" "}
                        {sensor.updated_at ? new Date(sensor.updated_at).toLocaleString() : "N/A"}
                    </p>
                    <p><span className="font-medium">Creado en:</span> {sensor.created_at ? new Date(sensor.created_at).toLocaleString() : "N/A"}</p>
                </CardContent>
            </Card>
        </div>
    )
}

export default Datos
