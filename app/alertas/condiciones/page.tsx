"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from "next/link"

interface Condition {
    id: string
    sensor_id: string
    nombre: string
    campo: string
    operador: string
    valor_umbral: number
    severidad: 'critical' | 'warning' | 'info'
    activa: boolean
    created_at: string
    sensor?: {
        nombre: string
        categoria: string
    }
}

interface Sensor {
    id: string
    nombre: string
    categoria: string
}

/**
 * 📊 Página de Gestión de Condiciones de Alerta
 * Permite crear y gestionar reglas que generan alertas automáticas
 */
export default function ConditionsPage() {
    const supabase = createClient()
    const [conditions, setConditions] = useState<Condition[]>([])
    const [sensors, setSensors] = useState<Sensor[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingCondition, setEditingCondition] = useState<Condition | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        sensor_id: '',
        nombre: '',
        campo: '',
        operador: '>',
        valor_umbral: '',
        severidad: 'warning' as 'critical' | 'warning' | 'info'
    })

    // Obtener condiciones
    const fetchConditions = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('condiciones_alerta')
            .select(`
                *,
                sensor:sensores(nombre, categoria)
            `)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setConditions(data as any)
        }
        setIsLoading(false)
    }

    // Obtener sensores para el selector
    const fetchSensors = async () => {
        const { data } = await supabase
            .from('sensores')
            .select('id, nombre, categoria')
            .eq('activo', true)
            .order('nombre')

        if (data) {
            setSensors(data)
        }
    }

    // Crear o actualizar condición
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const conditionData = {
            ...formData,
            valor_umbral: parseFloat(formData.valor_umbral)
        }

        if (editingCondition) {
            // Actualizar
            const { error } = await supabase
                .from('condiciones_alerta')
                .update(conditionData)
                .eq('id', editingCondition.id)

            if (!error) {
                fetchConditions()
                resetForm()
            }
        } else {
            // Crear
            const { error } = await supabase
                .from('condiciones_alerta')
                .insert([conditionData])

            if (!error) {
                fetchConditions()
                resetForm()
            }
        }
    }

    // Eliminar condición
    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta condición?')) return

        const { error } = await supabase
            .from('condiciones_alerta')
            .delete()
            .eq('id', id)

        if (!error) {
            fetchConditions()
        }
    }

    // Activar/desactivar condición
    const toggleActive = async (id: string, activa: boolean) => {
        const { error } = await supabase
            .from('condiciones_alerta')
            .update({ activa: !activa })
            .eq('id', id)

        if (!error) {
            fetchConditions()
        }
    }

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            sensor_id: '',
            nombre: '',
            campo: '',
            operador: '>',
            valor_umbral: '',
            severidad: 'warning'
        })
        setEditingCondition(null)
        setShowDialog(false)
    }

    // Editar condición
    const handleEdit = (condition: Condition) => {
        setEditingCondition(condition)
        setFormData({
            sensor_id: condition.sensor_id,
            nombre: condition.nombre,
            campo: condition.campo,
            operador: condition.operador,
            valor_umbral: condition.valor_umbral.toString(),
            severidad: condition.severidad
        })
        setShowDialog(true)
    }

    // Obtener campos disponibles según categoría
    const getFieldsForCategory = (categoria: string): string[] => {
        const fieldsMap: Record<string, string[]> = {
            'ambiental': ['temperatura', 'humedad', 'presion'],
            'calidad_aire': ['co2', 'pm25', 'voc'],
            'energia': ['voltaje', 'corriente', 'potencia'],
            'industrial': ['vibracion', 'ruido', 'inclinacion', 'consumo'],
            'suelo': ['humedad_suelo', 'ph'],
            'seguridad': ['distancia'],
        }
        return fieldsMap[categoria] || []
    }

    const selectedSensor = sensors.find(s => s.id === formData.sensor_id)
    const availableFields = selectedSensor ? getFieldsForCategory(selectedSensor.categoria) : []

    useEffect(() => {
        fetchConditions()
        fetchSensors()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/alertas">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Condiciones de Alerta</h1>
                        <p className="text-muted-foreground mt-1">
                            Configura reglas para generar alertas automáticas
                        </p>
                    </div>
                </div>
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => resetForm()}>
                            <Plus size={20} />
                            Nueva Condición
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCondition ? 'Editar Condición' : 'Nueva Condición'}
                                </DialogTitle>
                                <DialogDescription>
                                    Define una regla que generará alertas cuando se cumpla
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sensor">Sensor</Label>
                                    <Select
                                        value={formData.sensor_id}
                                        onValueChange={(value) => setFormData({ ...formData, sensor_id: value, campo: '' })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un sensor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sensors.map(sensor => (
                                                <SelectItem key={sensor.id} value={sensor.id}>
                                                    {sensor.nombre} ({sensor.categoria})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="nombre">Nombre de la Condición</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Ej: Temperatura alta en cocina"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="campo">Campo</Label>
                                        <Select
                                            value={formData.campo}
                                            onValueChange={(value) => setFormData({ ...formData, campo: value })}
                                            required
                                            disabled={!formData.sensor_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Campo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableFields.map(field => (
                                                    <SelectItem key={field} value={field}>
                                                        {field}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="operador">Operador</Label>
                                        <Select
                                            value={formData.operador}
                                            onValueChange={(value) => setFormData({ ...formData, operador: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value=">">Mayor que (&gt;)</SelectItem>
                                                <SelectItem value="<">Menor que (&lt;)</SelectItem>
                                                <SelectItem value=">=">Mayor o igual (≥)</SelectItem>
                                                <SelectItem value="<=">Menor o igual (≤)</SelectItem>
                                                <SelectItem value="==">Igual (=)</SelectItem>
                                                <SelectItem value="!=">Diferente (≠)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="valor">Valor Umbral</Label>
                                        <Input
                                            id="valor"
                                            type="number"
                                            step="0.01"
                                            value={formData.valor_umbral}
                                            onChange={(e) => setFormData({ ...formData, valor_umbral: e.target.value })}
                                            placeholder="35"
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="severidad">Severidad</Label>
                                        <Select
                                            value={formData.severidad}
                                            onValueChange={(value: any) => setFormData({ ...formData, severidad: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="warning">Advertencia</SelectItem>
                                                <SelectItem value="critical">Crítico</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                                    <div className="flex gap-2">
                                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            Esta condición generará una alerta cuando{' '}
                                            <strong>{formData.campo || 'campo'}</strong>{' '}
                                            {formData.operador}{' '}
                                            <strong>{formData.valor_umbral || 'valor'}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingCondition ? 'Actualizar' : 'Crear'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabla de condiciones */}
            <Card className="overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : conditions.length === 0 ? (
                    <div className="p-12 text-center">
                        <AlertCircle className="mx-auto text-muted-foreground mb-4" size={48} />
                        <p className="text-muted-foreground">
                            No hay condiciones configuradas. Crea una para empezar a recibir alertas.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Nombre</TableHead>
                                <TableHead>Sensor</TableHead>
                                <TableHead>Condición</TableHead>
                                <TableHead>Severidad</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {conditions.map((condition) => (
                                <TableRow key={condition.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{condition.nombre}</TableCell>
                                    <TableCell className="text-sm">
                                        {condition.sensor?.nombre || 'Sensor eliminado'}
                                    </TableCell>
                                    <TableCell className="text-sm font-mono">
                                        {condition.campo} {condition.operador} {condition.valor_umbral}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                condition.severidad === 'critical'
                                                    ? 'destructive'
                                                    : condition.severidad === 'warning'
                                                        ? 'secondary'
                                                        : 'default'
                                            }
                                        >
                                            {condition.severidad === 'critical' ? 'Crítico' :
                                                condition.severidad === 'warning' ? 'Advertencia' : 'Info'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleActive(condition.id, condition.activa)}
                                        >
                                            <Badge variant={condition.activa ? 'default' : 'secondary'}>
                                                {condition.activa ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(condition)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleDelete(condition.id)}
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
