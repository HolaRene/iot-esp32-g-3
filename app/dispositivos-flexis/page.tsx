"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AgregarSensor } from "@/components/devices/AgregarDispositivo"
import Link from "next/link"

export default function DevicesPage() {
  const [sensors, setSensors] = useState<any[]>([])
  const [openModal, setOpenModal] = useState(false)
  const supabase = createClient()

  // Map de categorías a tabla de detalle
  const categoriaTablaMap: Record<string, string> = {
    ambiental: "sensores_ambiental",
    calidad_aire: "sensores_calidad_aire",
    suelo: "sensores_suelo",
    industrial: "sensores_industrial",
    energia: "sensores_energia",
    seguridad: "sensores_seguridad",
    personalizado: "sensores_personalizado",
  }

  const fetchSensors = async () => {
    // Traemos los sensores principales
    const { data: sensoresData, error: errorSensores } = await supabase
      .from("sensores")
      .select("*")
      .order("creado_en", { ascending: false })

    if (errorSensores) {
      console.error(errorSensores)
      return
    }

    if (!sensoresData) return

    // Por simplicidad, no hacemos join con tablas de detalle aquí
    setSensors(sensoresData)
  }

  useEffect(() => {
    fetchSensors()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este sensor?")) return

    const { error } = await supabase
      .from("sensores")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Error al eliminar el sensor: " + error.message)
    } else {
      fetchSensors()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sensores IoT</h1>
          <p className="text-muted-foreground mt-1">Gestiona y clasifica tus sensores según su categoría.</p>
        </div>
        <Button onClick={() => setOpenModal(true)} className="gap-2">
          <Plus size={20} /> Nuevo Sensor
        </Button>
      </div>

      <Card className="overflow-hidden">
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
            {sensors.length > 0 ? (
              sensors.map((sensor) => (
                <TableRow key={sensor.id}>
                  <TableCell>
                    <Link href={`/sensor/${sensor.id}`}>{sensor.nombre}</Link>
                  </TableCell>
                  <TableCell>
                    <Badge>{sensor.categoria}</Badge>
                  </TableCell>
                  <TableCell>{sensor.ubicacion || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={sensor.activo ? "default" : "secondary"}>
                      {sensor.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Eliminar sensor"
                      onClick={() => handleDelete(sensor.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No hay sensores registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AgregarSensor open={openModal} onOpenChange={setOpenModal} onSensorAdded={fetchSensors} />
    </div>
  )
}
