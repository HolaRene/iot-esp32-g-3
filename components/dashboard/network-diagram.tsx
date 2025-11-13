"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Folder, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ScrollArea } from "../ui/scroll-area"
// import { AddGroupModal } from "@/components/add-group-modal"

interface SensorGroup {
  id: string
  name: string
  description: string | null
  group_type: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function GroupsOverview() {
  const [groups, setGroups] = useState<SensorGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false)

  // 📡 Función para cargar solo los grupos
  const loadGroups = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      console.log("🔍 Iniciando carga de grupos...")

      // 1. Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error("❌ Error de usuario:", userError)
        setError("Usuario no autenticado")
        return
      }

      console.log("✅ Usuario autenticado:", user.id)

      // 2. Cargar solo los grupos (sin relaciones)
      const { data: groupsData, error: groupsError } = await supabase
        .from("sensor_groups")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false })

      console.log("📦 Grupos cargados:", groupsData)
      console.log("❌ Error grupos:", groupsError)

      if (groupsError) {
        throw new Error(`Error cargando grupos: ${groupsError.message}`)
      }

      setGroups(groupsData || [])
      setError(null)

      console.log("✅ Grupos procesados:", groupsData?.length)

    } catch (err: any) {
      console.error("💥 Error loading groups:", err)
      setError(err.message || "Error al cargar los grupos.")
    } finally {
      setLoading(false)
    }
  }

  // ⚡ Cargar datos al montar el componente
  useEffect(() => {
    loadGroups()

    const supabase = createClient()

    // 🔔 Suscripción a cambios en tiempo real solo de grupos
    const channel = supabase
      .channel("groups-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sensor_groups" },
        (payload) => {
          console.log("🔄 Cambio en grupos:", payload)
          loadGroups()
        }
      )
      .subscribe((status) => {
        console.log("📡 Estado de suscripción:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // 🎯 Función para determinar el estado del grupo
  const getGroupStatus = (group: SensorGroup) => {
    if (!group.is_active) return "inactive"
    return "active"
  }

  // 🎨 Función para obtener el ícono según el tipo de grupo
  const getGroupIcon = (groupType: string) => {
    const icons: { [key: string]: string } = {
      temperature: "🌡️",
      humidity: "💧",
      pressure: "📊",
      air_quality: "🌬️",
      soil: "🌱",
      general: "📦",
      custom: "🔧"
    }
    return icons[groupType] || "📁"
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Grupos de Sensores</h3>
            <p className="text-sm text-muted-foreground">
              {loading ? "Cargando..." : `${groups.length} grupos encontrados`}
            </p>
          </div>
          <div className="flex flex-col md:block items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadGroups}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              Actualizar
            </Button>
            <Button
              size="sm"
              onClick={() => setAddGroupModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Nuevo Grupo
            </Button>
          </div>
        </div>

        {/* 📊 Debug Info */}
        <div className="mb-4 p-3 bg-slate-600 rounded text-xs">
          <div>Estado: {loading ? "Cargando..." : "Completado"}</div>
          <div>Error: {error || "Ninguno"}</div>
          <div>Grupos encontrados: {groups.length}</div>
        </div>

        {/* 📊 Estados de carga y error */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground animate-pulse">Cargando grupos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button onClick={loadGroups} className="mt-2">
              Reintentar
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No hay grupos creados</p>
            <p className="text-sm text-muted-foreground mb-4">
              Comienza organizando tus sensores en grupos
            </p>
            <Button onClick={() => setAddGroupModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Crear Primer Grupo
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[250px] w-full rounded-md borderp-4">
            <div className="grid grid-cols-1  gap-4">
              {groups.map((group) => {
                const status = getGroupStatus(group)

                return (
                  <Card key={group.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: group.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{group.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">
                            {group.group_type}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl flex-shrink-0">
                        {getGroupIcon(group.group_type)}
                      </div>
                    </div>

                    {group.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Creado: {new Date(group.created_at).toLocaleDateString()}
                      </div>
                      <Badge
                        variant={status === "active" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-muted">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        Ver Sensores
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Editar
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Resumen general */}
        {groups.length > 0 && (
          <div className="mt-6 pt-6 border-t border-muted">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{groups.length}</p>
                <p className="text-xs text-muted-foreground">Grupos Totales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {groups.filter(g => g.is_active).length}
                </p>
                <p className="text-xs text-muted-foreground">Grupos Activos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {groups.filter(g => !g.is_active).length}
                </p>
                <p className="text-xs text-muted-foreground">Grupos Inactivos</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* <AddGroupModal 
        open={addGroupModalOpen}
        onOpenChange={setAddGroupModalOpen}
        onGroupCreated={loadGroups}
      /> */}
    </>
  )
}