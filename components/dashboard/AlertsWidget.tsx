"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, ArrowRight, Bell } from "lucide-react"
import Link from "next/link"

interface Alert {
    id: string
    mensaje: string
    severidad: 'critical' | 'warning' | 'info'
    created_at: string
    sensor?: {
        nombre: string
    }
}

export function AlertsWidget() {
    const supabase = createClient()
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)

    const fetchRecentAlerts = async () => {
        const { data } = await supabase
            .from('alertas_generadas')
            .select(`
                id,
                mensaje,
                severidad,
                created_at,
                sensor:sensores(nombre)
            `)
            .eq('leida', false)
            .order('created_at', { ascending: false })
            .limit(5)

        if (data) {
            setAlerts(data as any)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchRecentAlerts()

        const channel = supabase
            .channel('dashboard-alerts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'alertas_generadas'
                },
                () => {
                    fetchRecentAlerts()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-50 dark:bg-red-950/20'
            case 'warning': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
            default: return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'
        }
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Alertas Recientes
                </CardTitle>
                <Link href="/alertas">
                    <Button variant="ghost" size="sm" className="text-xs">
                        Ver todas <ArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                            Cargando alertas...
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="mx-auto text-green-500 mb-2 w-8 h-8" />
                            <p className="text-sm text-muted-foreground">
                                Todo tranquilo. No hay alertas nuevas.
                            </p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                                <div className={`p-2 rounded-full ${getSeverityColor(alert.severidad)}`}>
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {alert.sensor?.nombre}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {alert.mensaje}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {new Date(alert.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
