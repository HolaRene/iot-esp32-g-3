"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export function AgregarSensor({
    open,
    onOpenChange,
    onSensorAdded,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    onSensorAdded?: () => void
}) {
    const supabase = createClient()
    const [groups, setGroups] = useState<any[]>([])
    const [form, setForm] = useState({
        name: "",
        device_id: "",
        sensor_type: "dht22",
        group_id: "",
        location: "",
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchGroups = async () => {
            const { data } = await supabase
                .from("sensor_groups")
                .select("id, name, group_type")
                .eq("is_active", true)
            if (data) setGroups(data)
        }
        fetchGroups()
    }, [])

    const handleSubmit = async () => {
        if (!form.name || !form.device_id || !form.group_id)
            return toast("Completa todos los campos requeridos")

        setLoading(true)
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id

        const { error } = await supabase.from("sensors_datos").insert([
            {
                user_id: userId,
                group_id: form.group_id,
                name: form.name,
                device_id: form.device_id,
                sensor_type: form.sensor_type,
                location: form.location,
            },
        ])

        setLoading(false)

        if (error) {
            console.error(error)
            toast("❌ Error al guardar el sensor")
        } else {
            toast("✅ Sensor creado correctamente")
            setForm({
                name: "",
                device_id: "",
                sensor_type: "dht22",
                group_id: "",
                location: "",
            })
            onOpenChange(false)
            onSensorAdded?.()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nuevo Sensor</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Nombre del sensor</Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Sensor Temp / Aire / Planta"
                        />
                    </div>

                    <div>
                        <Label>ID del dispositivo (ESP32)</Label>
                        <Input
                            value={form.device_id}
                            onChange={(e) => setForm({ ...form, device_id: e.target.value })}
                            placeholder="ESP32-01"
                        />
                    </div>

                    <div>
                        <Label>Tipo de sensor</Label>
                        <Select
                            value={form.sensor_type}
                            onValueChange={(v) => setForm({ ...form, sensor_type: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dht22">Temperatura / Humedad (DHT22)</SelectItem>
                                <SelectItem value="bmp280">Presión / Altitud (BMP280)</SelectItem>
                                <SelectItem value="soil">Sensor de Tierra / Humedad Suelo</SelectItem>
                                <SelectItem value="air">Calidad del Aire</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Grupo de categoría</Label>
                        <Select
                            value={form.group_id}
                            onValueChange={(v) => setForm({ ...form, group_id: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona grupo" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((g) => (
                                    <SelectItem key={g.id} value={g.id}>
                                        {g.name} ({g.group_type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Ubicación física</Label>
                        <Input
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="Ej: Invernadero, Taller..."
                        />
                    </div>

                    <div className="pt-3 flex justify-end">
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Sensor"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
