import { createClient } from "@/lib/supabase/client"

/**
 * 🔔 Utilidad para Evaluar Condiciones de Alerta
 * 
 * Esta función evalúa todas las condiciones activas para un sensor
 * y genera alertas si se cumplen las condiciones.
 */

interface SensorData {
    sensor_id: string
    [key: string]: any
}

interface Condition {
    id: string
    sensor_id: string
    nombre: string
    campo: string
    operador: string
    valor_umbral: number
    severidad: 'critical' | 'warning' | 'info'
    activa: boolean
}

/**
 * Evalúa un valor contra una condición
 */
function evaluateCondition(valor: number, operador: string, umbral: number): boolean {
    switch (operador) {
        case '>':
            return valor > umbral
        case '<':
            return valor < umbral
        case '>=':
            return valor >= umbral
        case '<=':
            return valor <= umbral
        case '==':
            return valor === umbral
        case '!=':
            return valor !== umbral
        default:
            return false
    }
}

/**
 * Evalúa todas las condiciones para un sensor y genera alertas
 */
export async function evaluateAlertConditions(sensorData: SensorData) {
    const supabase = createClient()

    try {
        // Obtener todas las condiciones activas para este sensor
        const { data: conditions, error } = await supabase
            .from('condiciones_alerta')
            .select('*')
            .eq('sensor_id', sensorData.sensor_id)
            .eq('activa', true)

        if (error || !conditions || conditions.length === 0) {
            return
        }

        // Evaluar cada condición
        for (const condition of conditions as Condition[]) {
            const valorActual = sensorData[condition.campo]

            // Si el campo no existe en los datos, saltar
            if (valorActual === undefined || valorActual === null) {
                continue
            }

            // Evaluar la condición
            const cumpleCondicion = evaluateCondition(
                Number(valorActual),
                condition.operador,
                condition.valor_umbral
            )

            if (cumpleCondicion) {
                // Verificar si ya existe una alerta reciente (últimos 5 minutos)
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

                const { data: recentAlerts } = await supabase
                    .from('alertas_generadas')
                    .select('id')
                    .eq('condicion_id', condition.id)
                    .gte('created_at', fiveMinutesAgo)
                    .limit(1)

                // Si ya hay una alerta reciente, no crear otra
                if (recentAlerts && recentAlerts.length > 0) {
                    continue
                }

                // Generar mensaje de alerta
                const operadorTexto = {
                    '>': 'excede',
                    '<': 'está por debajo de',
                    '>=': 'es mayor o igual a',
                    '<=': 'es menor o igual a',
                    '==': 'es igual a',
                    '!=': 'es diferente de'
                }[condition.operador] || 'cumple'

                const mensaje = `${condition.nombre}: ${condition.campo} ${operadorTexto} el umbral de ${condition.valor_umbral} (valor actual: ${valorActual})`

                // Crear la alerta
                await supabase
                    .from('alertas_generadas')
                    .insert([{
                        condicion_id: condition.id,
                        sensor_id: sensorData.sensor_id,
                        mensaje,
                        severidad: condition.severidad,
                        valor_actual: Number(valorActual),
                        leida: false
                    }])
            }
        }
    } catch (error) {
        console.error('Error evaluating alert conditions:', error)
    }
}

/**
 * Hook para evaluar condiciones automáticamente cuando se actualiza un sensor
 * Usar en los componentes de detalles de sensores
 */
export function useAlertEvaluation(sensorId: string, sensorData: any) {
    const supabase = createClient()

    // Evaluar condiciones cuando cambian los datos del sensor
    const evaluateOnUpdate = async () => {
        if (!sensorId || !sensorData) return

        await evaluateAlertConditions({
            sensor_id: sensorId,
            ...sensorData
        })
    }

    return { evaluateOnUpdate }
}
