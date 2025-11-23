"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Trash2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

// Interfaces corregidas alineadas con el esquema
interface Sensor {
    id: string
    dispositivo_id: string // CORREGIDO
    categoria: string
    ubicacion: string | null
    activo: boolean | null
    grupo_id: string | null
    creado_en: string // CORREGIDO
    // Datos específicos
    [key: string]: any // Para datos dinámicos
}

interface GroupData {
    id: string
    name: string
    description: string | null
    is_active: boolean | null
    sensorCount: number
}

export default function GroupDetailsPage({ id }: { id: string }) {
    const router = useRouter()
    const supabase = createClient()
    const [sensors, setSensors] = useState<Sensor[]>([])
    const [groupData, setGroupData] = useState<GroupData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Obtener usuario actual para RLS
    const getCurrentUser = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    }, [supabase])

    // Obtener información del grupo (CORREGIDO)
    const fetchGroupData = useCallback(async () => {
        const user = await getCurrentUser()
        if (!user) return

        const { data, error } = await supabase
            .from("sensor_groups")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single()

        if (error) {
            console.error("Error fetching group:", error)
            setError("No se pudo cargar el grupo")
            return
        }

        // Contar sensores del grupo con RPC para evitar N+1
        const { count } = await supabase
            .from("sensores")
            .select("id", { count: "exact", head: true })
            .eq("grupo_id", id)
            .eq("usuario_id", user.id) // RLS

        if (data) {
            setGroupData({
                id: data.id,
                name: data.name,
                description: data.description,
                is_active: data.is_active,
                sensorCount: count || 0
            })
        }
    }, [id, supabase, getCurrentUser])

    // Obtener datos de múltiples sensores en paralelo optimizado
    const fetchSensorSpecificData = useCallback(async (sensorIds: string[]) => {
        const user = await getCurrentUser()
        if (!user) return {}

        const tableMap: Record<string, string> = {
            ambiental: "sensores_ambiental",
            calidad_aire: "sensores_calidad_aire",
            energia: "sensores_energia",
            industrial: "sensores_industrial",
            seguridad: "sensores_seguridad",
            suelo: "sensores_suelo",
            personalizado: "sensores_personalizado"
        }

        // Query múltiple con OR para mejor rendimiento
        const promises = Object.entries(tableMap).map(async ([categoria, tabla]) => {
            const { data } = await supabase
                .from(tabla)
                .select("*")
                .in("sensor_id", sensorIds)
                .eq("usuario_id", user.id) // RLS

            return { categoria, data }
        })

        const results = await Promise.all(promises)
        const dataMap: Record<string, any> = {}

        results.forEach(({ data }) => {
            data?.forEach(item => {
                dataMap[item.sensor_id] = item
            })
        })

        return dataMap
    }, [supabase, getCurrentUser])

    // Obtener sensores del grupo (CORREGIDO)
    const fetchGroupSensors = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        const user = await getCurrentUser()
        if (!user) {
            setIsLoading(false)
            return
        }

        try {
            const { data: sensorsData, error: sensorsError } = await supabase
                .from("sensores")
                .select(`
          id,
          dispositivo_id,
          categoria,
          ubicacion,
          activo,
          grupo_id,
          creado_en
        `)
                .eq("grupo_id", id)
                .eq("usuario_id", user.id) // CRÍTICO: RLS
                .order("creado_en", { ascending: false })

            if (sensorsError) throw sensorsError

            // Obtener datos específicos en batch
            const sensorIds = sensorsData?.map(s => s.id) || []
            const specificDataMap = await fetchSensorSpecificData(sensorIds)

            // Combinar datos
            const sensorsWithData = (sensorsData || []).map(sensor => ({
                ...sensor,
                ...specificDataMap[sensor.id]
            }))

            setSensors(sensorsWithData)
        } catch (err) {
            console.error("Error fetching sensors:", err)
            setError("No se pudieron cargar los sensores")
        } finally {
            setIsLoading(false)
        }
    }, [id, supabase, getCurrentUser, fetchSensorSpecificData])

    // Calcular estadísticas con seguridad
    const calculateStats = useCallback(() => {
        const ambientalSensors = sensors.filter(s => s.categoria === "ambiental")
        const hasAmbiental = ambientalSensors.length > 0

        return {
            avgTemp: hasAmbiental
                ? (ambientalSensors.reduce((sum, s) => sum + (s.temperatura || 0), 0) / ambientalSensors.length).toFixed(1)
                : "--",
            avgHumidity: hasAmbiental
                ? (ambientalSensors.reduce((sum, s) => sum + (s.humedad || 0), 0) / ambientalSensors.length).toFixed(1)
                : "--",
            onlineCount: sensors.filter(s => s.activo).length
        }
    }, [sensors])

    const stats = calculateStats()

    // Suscripción en tiempo real CORREGIDA
    useEffect(() => {
        if (!id) return

        fetchGroupData()
        fetchGroupSensors()

        // Canal principal para cambios en sensores del grupo
        const channel = supabase
            .channel(`group-sensors-${id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "sensores",
                    filter: `grupo_id=eq.${id}`
                },
                () => {
                    fetchGroupSensors()
                }
            )
            // Suscribirse a cambios en todas las tablas de datos
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "sensores_ambiental"
                },
                () => fetchGroupSensors()
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "sensores_calidad_aire"
                },
                () => fetchGroupSensors()
            )
            // ... REPETIR PARA CADA TABLA O USAR UN WILDCARD CON RPC
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, fetchGroupData, fetchGroupSensors, supabase])

    // Eliminar sensor del grupo con verificación (CORREGIDO)
    const handleDeleteSensor = useCallback(async (sensorId: string) => {
        if (!confirm("¿Estás seguro de quitar este sensor del grupo?")) return

        try {
            const user = await getCurrentUser()
            if (!user) throw new Error("No autorizado")

            // Verificar que el sensor pertenece al grupo y usuario
            const { data: sensor, error: verifyError } = await supabase
                .from("sensores")
                .select("id")
                .eq("id", sensorId)
                .eq("grupo_id", id)
                .eq("usuario_id", user.id)
                .single()

            if (verifyError || !sensor) {
                throw new Error("Sensor no encontrado o no autorizado")
            }

            const { error } = await supabase
                .from("sensores")
                .update({ grupo_id: null })
                .eq("id", sensorId)
                .eq("usuario_id", user.id) // RLS

            if (error) throw error

            // Refrescar datos
            fetchGroupSensors()
            fetchGroupData()
        } catch (err) {
            console.error("Error removing sensor:", err)
            setError("No se pudo quitar el sensor del grupo")
        }
    }, [id, supabase, getCurrentUser, fetchGroupSensors, fetchGroupData])

    // Estado de carga
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Estado de error
    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <Card className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => fetchGroupSensors()}>
                        Reintentar
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{groupData?.name || "Grupo"}</h1>
                        <p className="text-muted-foreground mt-1">
                            {groupData?.description || "Monitorea todos los sensores en tiempo real."}
                        </p>
                    </div>
                </div>
                <Link href="/dispositivos-flexis">
                    <Button className="gap-2">
                        <Plus size={20} />
                        Agregar Sensor
                    </Button>
                </Link>
            </div>

            {/* Summary Cards - SOLO MUESTRA SI HAY DATOS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Total Sensores</p>
                    <p className="text-2xl font-bold mt-2">{sensors.length}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Activos</p>
                    <p className="text-2xl font-bold mt-2 text-green-600">{stats.onlineCount}</p>
                </Card>
                {/* Solo muestra si hay sensores ambientales */}
                {sensors.some(s => s.categoria === "ambiental") && (
                    <>
                        <Card className="p-6">
                            <p className="text-sm font-medium text-muted-foreground">Temp. Promedio</p>
                            <p className="text-2xl font-bold mt-2">{stats.avgTemp}°C</p>
                        </Card>
                        <Card className="p-6">
                            <p className="text-sm font-medium text-muted-foreground">Humedad Promedio</p>
                            <p className="text-2xl font-bold mt-2">{stats.avgHumidity}%</p>
                        </Card>
                    </>
                )}
            </div>

            {/* Sensors Table */}
            <Card className="overflow-hidden">
                {sensors.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground">
                            No hay sensores en este grupo.{" "}
                            <Link href="/dispositivos-flexis" className="text-primary hover:underline">
                                Agrega sensores
                            </Link>{" "}
                            desde la página de dispositivos.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Dispositivo ID</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sensors.map(sensor => (
                                <TableRow key={sensor.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">
                                        <Link href={`/sensor/${sensor.id}`} className="hover:underline">
                                            {sensor.dispositivo_id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {sensor.categoria.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {sensor.ubicacion || "Sin ubicación"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={sensor.activo ? "default" : "secondary"}>
                                            {sensor.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/sensor/${sensor.id}`}>
                                                <Button variant="ghost" size="icon" title="Ver detalles">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Quitar del grupo"
                                                onClick={() => handleDeleteSensor(sensor.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    )
}