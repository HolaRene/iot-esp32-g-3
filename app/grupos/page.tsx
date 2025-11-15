"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Trash2, Edit } from 'lucide-react'
import Link from "next/link"
import { AddGroupModal } from "@/components/devices/add-device-modal"

interface SensorGroup {
    id: string
    name: string
    description?: string | null
    group_type?: string | null
    color?: string | null
    is_active?: boolean
    created_at?: string
    updated_at?: string
    sensorCount?: number
}

export default function GroupsPage() {
    const supabase = createClient()

    const [showAddDevice, setShowAddDevice] = useState(false)
    const [groups, setGroups] = useState<SensorGroup[]>([])

    console.log(groups)

    const fetchGroups = async () => {
        const { data, error } = await supabase
            .from("sensor_groups")
            .select("*, sensores(id)") // trae sensores relacionados
            .order("created_at", { ascending: false })

        if (!error && data) {
            const formatted = data.map((g: any) => ({
                ...g,
                sensorCount: g.sensores?.length || 0,
            }))
            setGroups(formatted)
        }

        if (error) console.log("Error fetching groups:", error)
    }

    const handleDeleteGroup = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este grupo?")) return

        const { error } = await supabase
            .from("sensor_groups")
            .delete()
            .eq("id", id)

        if (error) {
            alert("Error al eliminar el grupo: " + error.message)
        } else {
            // Refresca la tabla
            fetchGroups()
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Grupos de sensores</h1>
                    <p className="text-muted-foreground mt-1">Organiza por grupos de sensores.</p>
                </div>
                <Button className="gap-2" onClick={() => setShowAddDevice(true)}>
                    <Plus size={20} />
                    Nuevo grupo
                </Button>
            </div>

            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Nombre del grupo</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Sensores</TableHead>
                            <TableHead>Estatus</TableHead>
                            <TableHead>Actualizado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groups.map((group) => (
                            <TableRow key={group.id} className="hover:bg-muted/50 transition-smooth">
                                <TableCell className="font-medium">{group.name}</TableCell>
                                <TableCell className="text-sm">{group.description || "Sin descripción"}</TableCell>
                                <TableCell className="text-sm font-medium">{group.sensorCount || 0}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={group.is_active ? "default" : "destructive"}
                                    >
                                        {group.is_active ? "Activo" : "Inactivo"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {group.updated_at ? new Date(group.updated_at).toLocaleString() : "N/A"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View group">
                                            <Link href={`/grupo/${group.id}`}>
                                                <Eye size={16} />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit group">
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            title="Delete group"
                                            onClick={() => handleDeleteGroup(group.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Add Device Modal */}
            <AddGroupModal open={showAddDevice} onOpenChange={setShowAddDevice} />
        </div>
    )
}
