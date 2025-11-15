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

type CategoriaSensor =
    | "ambiental"
    | "calidad_aire"
    | "suelo"
    | "industrial"
    | "energia"
    | "seguridad"
    | "personalizado";


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
        device_id: `Sensor-flexible-${Math.floor(Math.random() * 1000)}`,
        categoria: "ambiental",  // <----- nuevo nombre correcto
        group_id: "",
        location: "",
    })

    const [loading, setLoading] = useState(false)

    // Regenera ID al abrir
    useEffect(() => {
        if (open) {
            setForm(prev => ({
                ...prev,
                device_id: `Sensor-flexible-${Math.floor(Math.random() * 1000)}`
            }))
        }
    }, [open])

    // Cargar grupos
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

    // -------------------------
    // INSERTAR SENSOR
    // -------------------------

    const handleSubmit = async () => {

        if (!form.name || !form.device_id || !form.group_id)
            return toast("Completa todos los campos requeridos")

        setLoading(true)

        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id

        // 1️⃣ Insert en tabla principal
        const { data: sensorRow, error: sensorError } = await supabase
            .from("sensores")
            .insert([
                {
                    usuario_id: userId,
                    grupo_id: form.group_id,
                    nombre: form.name,
                    dispositivo_id: form.device_id,
                    categoria: form.categoria,
                    ubicacion: form.location,
                }
            ])
            .select("id")
            .single()

        if (sensorError) {
            console.error(sensorError)
            toast("❌ Error al guardar el sensor")
            setLoading(false)
            return
        }

        const sensorId = sensorRow.id

        // 2️⃣ Insert según categoría --------------------

        const categoriaTablaMap: Record<CategoriaSensor, string> = {
            ambiental: "sensores_ambiental",
            calidad_aire: "sensores_calidad_aire",
            suelo: "sensores_suelo",
            industrial: "sensores_industrial",
            energia: "sensores_energia",
            seguridad: "sensores_seguridad",
            personalizado: "sensores_personalizado",
        };

        const tabla = categoriaTablaMap[form.categoria]

        if (!tabla) {
            toast("❌ Categoría inválida")
            setLoading(false)
            return
        }

        const { error: catError } = await supabase
            .from(tabla)
            .insert([{ sensor_id: sensorId }])

        if (catError) {
            console.error(catError)
            toast("⚠️ Error al crear datos específicos")
            setLoading(false)
            return
        }

        // Fin ------------------------------------------

        toast("✅ Sensor creado correctamente")

        setForm({
            name: "",
            device_id: `Sensor-flexible-${Math.floor(Math.random() * 1000)}`,
            categoria: "ambiental",
            group_id: "",
            location: "",
        })

        setLoading(false)
        onOpenChange(false)
        onSensorAdded?.()
    }

    // UI ----------------------------------------------------------
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
                        />
                    </div>

                    <div>
                        <Label>ID del dispositivo</Label>
                        <Input
                            value={form.device_id}
                            onChange={(e) => setForm({ ...form, device_id: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label>Categoría</Label>
                        <Select
                            value={form.categoria}
                            onValueChange={(v) => setForm({ ...form, categoria: v })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ambiental">Ambiental</SelectItem>
                                <SelectItem value="calidad_aire">Calidad del aire</SelectItem>
                                <SelectItem value="suelo">Suelo</SelectItem>
                                <SelectItem value="industrial">Industrial</SelectItem>
                                <SelectItem value="energia">Energía</SelectItem>
                                <SelectItem value="seguridad">Seguridad</SelectItem>
                                <SelectItem value="personalizado">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Grupo</Label>
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
                        <Label>Ubicación</Label>
                        <Input
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                        />
                    </div>

                    <div className="pt-3 flex justify-end">
                        <Button disabled={loading} onClick={handleSubmit}>
                            {loading ? "Guardando..." : "Guardar Sensor"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
