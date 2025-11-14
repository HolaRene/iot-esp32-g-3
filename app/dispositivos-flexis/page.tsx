"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AgregarSensor } from "@/components/devices/AgregarDispositivo"
import Link from "next/link"

export default function DevicesPage() {
  const [sensors, setSensors] = useState<any[]>([])
  // console.log(sensors)
  const [openModal, setOpenModal] = useState(false)
  const supabase = createClient()

  const fetchSensors = async () => {
    const { data, error } = await supabase
      .from("sensors_datos")
      .select("*, sensor_groups(name, group_type)")
      .order("created_at", { ascending: false })

    if (!error && data) setSensors(data)
  }

  useEffect(() => {
    fetchSensors()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sensores IoT</h1>
          <p className="text-muted-foreground mt-1">Gestiona y clasifica tus sensores según su tipo o función.</p>
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
              <TableHead>Tipo</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Último Dato</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sensors.length > 0 ? (
              sensors.map((sensor) => (
                <TableRow key={sensor.id}>
                  <TableCell>
                    <Link href={`/sensor/${sensor.id}`}>{sensor.name}</Link>
                  </TableCell>
                  <TableCell>{sensor.sensor_type}</TableCell>
                  <TableCell>
                    <Badge>{sensor.sensor_groups?.name || "Sin grupo"}</Badge>
                  </TableCell>
                  <TableCell>{sensor.location || "-"}</TableCell>
                  <TableCell>
                    {sensor.temperature
                      ? `${sensor.temperature}°C`
                      : sensor.humidity
                        ? `${sensor.humidity}%`
                        : sensor.soil_moisture
                          ? `${sensor.soil_moisture}%`
                          : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={sensor.is_active ? "default" : "secondary"}
                    >
                      {sensor.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
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
