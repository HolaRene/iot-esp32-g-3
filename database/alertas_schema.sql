-- ============================================
-- SISTEMA DE ALERTAS DINÁMICAS
-- ============================================

-- Tabla para almacenar condiciones/reglas de alertas
CREATE TABLE IF NOT EXISTS condiciones_alerta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id UUID NOT NULL REFERENCES sensores(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    campo TEXT NOT NULL,  -- 'temperatura', 'humedad', 'co2', 'pm25', etc.
    operador TEXT NOT NULL CHECK (operador IN ('>', '<', '>=', '<=', '==', '!=')),
    valor_umbral NUMERIC NOT NULL,
    severidad TEXT NOT NULL CHECK (severidad IN ('critical', 'warning', 'info')),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para almacenar alertas generadas
CREATE TABLE IF NOT EXISTS alertas_generadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condicion_id UUID REFERENCES condiciones_alerta(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES sensores(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    severidad TEXT NOT NULL CHECK (severidad IN ('critical', 'warning', 'info')),
    valor_actual NUMERIC,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_condiciones_sensor ON condiciones_alerta(sensor_id);
CREATE INDEX IF NOT EXISTS idx_condiciones_activa ON condiciones_alerta(activa);
CREATE INDEX IF NOT EXISTS idx_alertas_sensor ON alertas_generadas(sensor_id);
CREATE INDEX IF NOT EXISTS idx_alertas_leida ON alertas_generadas(leida);
CREATE INDEX IF NOT EXISTS idx_alertas_created ON alertas_generadas(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en condiciones_alerta
CREATE TRIGGER update_condiciones_alerta_updated_at
    BEFORE UPDATE ON condiciones_alerta
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE condiciones_alerta IS 'Almacena las condiciones/reglas para generar alertas automáticas basadas en datos de sensores';
COMMENT ON TABLE alertas_generadas IS 'Almacena las alertas generadas cuando se cumplen las condiciones definidas';
COMMENT ON COLUMN condiciones_alerta.campo IS 'Campo del sensor a evaluar (temperatura, humedad, co2, etc.)';
COMMENT ON COLUMN condiciones_alerta.operador IS 'Operador de comparación: >, <, >=, <=, ==, !=';
COMMENT ON COLUMN condiciones_alerta.valor_umbral IS 'Valor umbral para comparar con el campo del sensor';
COMMENT ON COLUMN condiciones_alerta.severidad IS 'Nivel de severidad: critical, warning, info';
