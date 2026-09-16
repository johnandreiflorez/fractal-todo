-- ============================================================
-- Esquema de base de datos - Lista de Tareas (PostgreSQL)
-- ============================================================

BEGIN;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    ultimo_login    TIMESTAMPTZ,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre          VARCHAR(100) NOT NULL,
    color           VARCHAR(20),
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, nombre)
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tareas (
    id                SERIAL PRIMARY KEY,
    usuario_id        INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id      INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    titulo            VARCHAR(255) NOT NULL,
    descripcion       TEXT,
    -- Escala prioridad: 1=Urgente, 2=Alta, 3=Media, 4=Normal, 5=Baja
    prioridad         SMALLINT NOT NULL DEFAULT 3 CHECK (prioridad BETWEEN 1 AND 5),
    completada        BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_vencimiento DATE,
    completada_en     TIMESTAMPTZ,
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de etiquetas
CREATE TABLE IF NOT EXISTS etiquetas (
    id           SERIAL PRIMARY KEY,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre       VARCHAR(50) NOT NULL,
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, nombre)
);

-- Tabla pivote tarea <-> etiqueta (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS tarea_etiquetas (
    tarea_id     INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
    etiqueta_id  INTEGER NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
    PRIMARY KEY (tarea_id, etiqueta_id)
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_usuarios_email        ON usuarios (email);
CREATE INDEX IF NOT EXISTS idx_categorias_usuario    ON categorias (usuario_id);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario        ON tareas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_comp   ON tareas (usuario_id, completada);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_prio   ON tareas (usuario_id, prioridad);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_fecha  ON tareas (usuario_id, fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_creado ON tareas (usuario_id, creado_en);
CREATE INDEX IF NOT EXISTS idx_tareas_categoria      ON tareas (categoria_id);
CREATE INDEX IF NOT EXISTS idx_etiquetas_usuario     ON etiquetas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarea_etq_etiqueta    ON tarea_etiquetas (etiqueta_id);

-- Actualización automática de actualizado_en
CREATE OR REPLACE FUNCTION set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tareas_actualizado ON tareas;
CREATE TRIGGER trg_tareas_actualizado
BEFORE UPDATE ON tareas
FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

DROP TRIGGER IF EXISTS trg_categorias_actualizado ON categorias;
CREATE TRIGGER trg_categorias_actualizado
BEFORE UPDATE ON categorias
FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

DROP TRIGGER IF EXISTS trg_usuarios_actualizado ON usuarios;
CREATE TRIGGER trg_usuarios_actualizado
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

COMMIT;