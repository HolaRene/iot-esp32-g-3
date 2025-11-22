"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, CheckCircle, Info, Loader2 } from "lucide-react"
import Link from "next/link"

interface Alert {
  id: string
  condicion_id: string | null
  sensor_id: string
  mensaje: string
  severidad: 'critical' | 'warning' | 'info'
  valor_actual: number | null
  leida: boolean
  created_at: string
  sensor?: {
    nombre: string
    ubicacion: string
  }
}

/**
 * 📊 Página de Alertas
 * Muestra alertas generadas automáticamente por condiciones de sensores
 */
export default function AlertsPage() {
  const supabase = createClient()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')

  // Obtener alertas de la base de datos
  const fetchAlerts = async () => {
    setIsLoading(true)

    let query = supabase
      .from('alertas_generadas')
      .select(`
                *,
                sensor:sensores(nombre, ubicacion)
            `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filter === 'unread') {
      query = query.eq('leida', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching alerts:', error)
    } else if (data) {
      setAlerts(data as any)
    }

    setIsLoading(false)
  }

  // Marcar alerta como leída
  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('alertas_generadas')
      .update({ leida: true })
      .eq('id', id)

    if (!error) {
      setAlerts(alerts.map(alert =>
        alert.id === id ? { ...alert, leida: true } : alert
      ))
    }
  }

  // Eliminar alerta
  const dismissAlert = async (id: string) => {
    const { error } = await supabase
      .from('alertas_generadas')
      .delete()
      .eq('id', id)

    if (!error) {
      setAlerts(alerts.filter(alert => alert.id !== id))
    }
  }

  // Obtener icono según severidad
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  // Obtener tiempo relativo
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Justo ahora'
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  }

  // Suscripción en tiempo real
  useEffect(() => {
    fetchAlerts()

    const channel = supabase
      .channel('realtime-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alertas_generadas'
        },
        () => {
          // Refrescar alertas cuando se genera una nueva
          fetchAlerts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter, supabase])

  const unreadCount = alerts.filter(a => !a.leida).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alertas</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
          </p>
        </div>
        <Link href="/alertas/condiciones">
          <Button variant="outline">
            Gestionar Condiciones
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          No leídas ({unreadCount})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : alerts.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <p className="text-muted-foreground">
              {filter === 'unread'
                ? '¡No hay alertas sin leer! Todo está bajo control.'
                : 'No hay alertas en este momento.'}
            </p>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 transition-smooth ${!alert.leida ? "bg-primary/5 border-primary/20" : ""
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  {getSeverityIcon(alert.severidad)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        variant={
                          alert.severidad === "critical"
                            ? "destructive"
                            : alert.severidad === "warning"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {alert.severidad === 'critical' ? 'Crítico' :
                          alert.severidad === 'warning' ? 'Advertencia' : 'Info'}
                      </Badge>
                      {!alert.leida && (
                        <span className="inline-block w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="font-medium text-foreground">{alert.mensaje}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.sensor?.nombre || 'Sensor'} •{' '}
                      {alert.sensor?.ubicacion || 'Sin ubicación'} •{' '}
                      {getRelativeTime(alert.created_at)}
                    </p>
                    {alert.valor_actual !== null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Valor actual: {alert.valor_actual}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!alert.leida && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(alert.id)}
                    >
                      Marcar como leída
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dismissAlert(alert.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
