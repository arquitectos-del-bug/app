-- Tabla para almacenar caudales históricos y diarios (COES)
CREATE TABLE IF NOT EXISTS hydrology_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rio VARCHAR(100) NOT NULL,
    cuenca VARCHAR(100) NOT NULL,
    caudal_m3s NUMERIC NOT NULL,
    fecha DATE NOT NULL,
    fuente VARCHAR(50) DEFAULT 'COES',
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_rio_fecha UNIQUE (rio, fecha)
);

-- Tabla para almacenar alertas de distrito vigentes (Sembradas offline)
CREATE TABLE IF NOT EXISTS active_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distrito VARCHAR(100) NOT NULL,
    nivel VARCHAR(20) NOT NULL, -- "amarillo" | "naranja" | "rojo"
    fuente VARCHAR(50) NOT NULL,
    vigencia_desde TIMESTAMPTZ NOT NULL,
    vigencia_hasta TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_hydro_rio_fecha ON hydrology_readings(rio, fecha);
CREATE INDEX IF NOT EXISTS idx_alerts_distrito ON active_alerts(distrito);
