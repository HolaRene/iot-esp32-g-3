"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import Link from "next/link"

interface Sensor {
    id: string
    nombre: string
    categoria: string
    ubicacion: string
    activo: boolean
    grupo_id: string | null
    created_at: string
    // Datos específicos por categoría
    temperatura?: number
    humedad?: number
    presion?: number
    co2?: number
    pm25?: number
    voc?: number
    voltaje?: number
    corriente?: number
    potencia?: number
}

interface GroupData {
    id: string
    name: string
    description: string | null
    is_active: boolean
    sensorCount: number
}

/**
 * 📊 Página de Detalles de Grupo
 * Muestra todos los sensores de un grupo con datos en tiempo real
 */
export default function GroupDetailsPage({ id }: { id: string }) {
    const supabase = createClient()
    const [sensors, setSensors] = useState<Sensor[]>([])
    const [groupData, setGroupData] = useState<GroupData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Obtener información del grupo
    const fetchGroupData = async () => {
        const { data, error } = await supabase
            .from('sensor_groups')
            .select('*, sensores(id)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching group:', error)
            return
        }

        if (data) {
            setGroupData({
                id: data.id,
                name: data.name,
                description: data.description,
                is_active: data.is_active,
                sensorCount: data.sensores?.length || 0
            })
        }
    }

    // Obtener sensores del grupo con sus datos
    const fetchGroupSensors = async () => {
        setIsLoading(true)

        const { data: sensorsData, error } = await supabase
            .from('sensores')
            .select(`
                id,
                nombre,
                categoria,
                ubicacion,
                activo,
                grupo_id,
                created_at
            `)
            .eq('grupo_id', id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching sensors:', error)
            setIsLoading(false)
            return
        }

        // Obtener datos específicos de cada sensor según su categoría
        const sensorsWithData = await Promise.all(
            (sensorsData || []).map(async (sensor) => {
                let specificData = {}

                try {
                    const tableMap: Record<string, string> = {
                        'ambiental': 'sensores_ambiental',
                        'calidad_aire': 'sensores_calidad_aire',
                        'energia': 'sensores_energia',
                        'industrial': 'sensores_industrial',
                        'seguridad': 'sensores_seguridad',
                        'suelo': 'sensores_suelo',
                        'personalizado': 'sensores_personalizado'
                    }

                    const tableName = tableMap[sensor.categoria]
                    if (tableName) {
                        const { data } = await supabase
                            .from(tableName)
                            .select('*')
                            .eq('sensor_id', sensor.id)
                            .single()

                        if (data) {
                            specificData = data
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching data for sensor ${sensor.id}:`, err)
                }

                return {
                    ...sensor,
                    ...specificData
                }
            })
        )

        setSensors(sensorsWithData)
        setIsLoading(false)
    }

    // Calcular estadísticas del grupo
    const calculateStats = () => {
        const ambientalSensors = sensors.filter(s => s.categoria === 'ambiental')
        const avgTemp = ambientalSensors.length > 0
            ? ambientalSensors.reduce((sum, s) => sum + (s.temperatura || 0), 0) / ambientalSensors.length
            : 0

        const avgHumidity = ambientalSensors.length > 0
            ? ambientalSensors.reduce((sum, s) => sum + (s.humedad || 0), 0) / ambientalSensors.length
            : 0

        const onlineCount = sensors.filter(s => s.activo).length

        return {
            avgTemp: avgTemp.toFixed(1),
            avgHumidity: avgHumidity.toFixed(1),
            onlineCount
        }
    }

    const stats = calculateStats()

    // Suscripción en tiempo real
    useEffect(() => {
        if (!id) return

        fetchGroupData()
        fetchGroupSensors()

        // Suscribirse a cambios en los sensores del grupo
        const channel = supabase
            .channel(`group-sensors-${id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sensores',
                    filter: `grupo_id=eq.${id}`
                },
                () => {
                    // Refrescar sensores cuando hay cambios
                    fetchGroupSensors()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, supabase])

    const handleDeleteSensor = async (sensorId: string) => {
        if (!confirm("¿Estás seguro de eliminar este sensor del grupo?")) return

        const { error } = await supabase
            .from('sensores')
            .update({ grupo_id: null }) // Solo quitamos del grupo, no eliminamos el sensor
            .eq('id', sensorId)

        if (error) {
            alert("Error al quitar el sensor del grupo")
        } else {
            fetchGroupSensors()
            fetchGroupData()
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/grupos">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{groupData?.name || 'Grupo'}</h1>
                        <p className="text-muted-foreground mt-1">
                            {groupData?.description || 'Monitorea todos los sensores de este grupo en tiempo real.'}
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Total Sensores</p>
                    <p className="text-2xl font-bold mt-2">{sensors.length}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Activos</p>
                    <p className="text-2xl font-bold mt-2 text-green-500">{stats.onlineCount}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Temp. Promedio</p>
                    <p className="text-2xl font-bold mt-2">{stats.avgTemp}°C</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Humedad Promedio</p>
                    <p className="text-2xl font-bold mt-2">{stats.avgHumidity}%</p>
                </Card>
            </div>

            {/* Sensors Table */}
            <Card className="overflow-hidden">
                {sensors.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground">
                            No hay sensores en este grupo. Agrega sensores desde la página de dispositivos.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sensors.map((sensor) => (
                                <TableRow key={sensor.id} className="hover:bg-muted/50 transition-smooth">
                                    <TableCell className="font-medium">
                                        <Link href={`/sensor/${sensor.id}`} className="hover:underline">
                                            {sensor.nombre}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {sensor.categoria.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {sensor.ubicacion || 'Sin ubicación'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={sensor.activo ? "default" : "secondary"}>
                                            {sensor.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/sensor/${sensor.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalles">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
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
