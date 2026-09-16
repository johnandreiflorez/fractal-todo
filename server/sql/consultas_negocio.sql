-- ============================================================
-- CONSULTAS DE INTELIGENCIA DE NEGOCIO (10 preguntas)
-- Base de datos: lista de tareas
-- ============================================================

-- ------------------------------------------------------------
-- 1) Análisis de Participación de Usuarios
--    ¿Cuál es el promedio de tareas creadas por usuario en los
--    últimos 30 días y cómo se compara con los 30 anteriores?
--
-- Formato de salida: periodo | tareas_creadas | total_usuarios | promedio_por_usuario
-- ------------------------------------------------------------
WITH periodo_tareas AS (
    SELECT
        CASE
            WHEN creado_en >= NOW() - INTERVAL '30 days' THEN 'ultimos_30_dias'
            ELSE 'previos_30_dias'
        END AS periodo,
        COUNT(*) AS tareas_creadas
    FROM tareas
    WHERE creado_en >= NOW() - INTERVAL '60 days'
    GROUP BY 1
)
SELECT
    periodo,
    tareas_creadas,
    (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
    ROUND(
        tareas_creadas::numeric / NULLIF((SELECT COUNT(*) FROM usuarios), 0),
        2
    ) AS promedio_por_usuario
FROM periodo_tareas
ORDER BY periodo;

-- ------------------------------------------------------------
-- 2) Tendencias de Tasa de Completado
--    Tasa de completado diaria de tareas en los últimos 90 días
--    agrupada por nivel de prioridad.
--
-- Formato: dia | prioridad | creadas | completadas | tasa_completado
-- ------------------------------------------------------------
WITH creadas AS (
    SELECT creado_en::date AS dia, prioridad, COUNT(*) AS n
    FROM tareas
    WHERE creado_en >= NOW() - INTERVAL '90 days'
    GROUP BY 1, 2
),
completadas AS (
    SELECT completada_en::date AS dia, prioridad, COUNT(*) AS n
    FROM tareas
    WHERE completada_en >= NOW() - INTERVAL '90 days'
    GROUP BY 1, 2
)
SELECT
    c.dia,
    c.prioridad,
    c.n AS creadas,
    COALESCE(cm.n, 0) AS completadas,
    ROUND(
        COALESCE(cm.n, 0)::numeric / NULLIF(c.n, 0),
        4
    ) AS tasa_completado
FROM creadas c
LEFT JOIN completadas cm
    ON cm.dia = c.dia AND cm.prioridad = c.prioridad
ORDER BY c.dia, c.prioridad;

-- ------------------------------------------------------------
-- 3) Rendimiento por Categoría
--    Categorías con tasas de completado más altas y más bajas,
--    y tiempo promedio de completado por categoría.
--
-- Formato: categoria | total_tareas | completadas | tasa_completado_pct | dias_promedio_completado
-- ------------------------------------------------------------
SELECT
    c.nombre AS categoria,
    COUNT(t.id) AS total_tareas,
    COUNT(t.id) FILTER (WHERE t.completada) AS completadas,
    ROUND(
        100.0 * COUNT(t.id) FILTER (WHERE t.completada) / NULLIF(COUNT(t.id), 0),
        2
    ) AS tasa_completado_pct,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (t.completada_en - t.creado_en)) / 86400.0),
        1
    ) AS dias_promedio_completado
FROM categorias c
LEFT JOIN tareas t ON t.categoria_id = c.id
GROUP BY c.id, c.nombre
HAVING COUNT(t.id) > 0
ORDER BY tasa_completado_pct DESC;

-- ------------------------------------------------------------
-- 4) Patrones de Productividad del Usuario
--    Horas pico y días de la semana cuando los usuarios crean y
--    completan más tareas.
--
-- Formato: tipo | hora_pico | tareas_hora_pico | dia_pico | tareas_dia_pico
-- ------------------------------------------------------------
WITH eventos AS (
    SELECT 'creacion' AS tipo, creado_en AS ts FROM tareas
    UNION ALL
    SELECT 'completado', completada_en FROM tareas
    WHERE completada_en IS NOT NULL
),
por_hora AS (
    SELECT
        tipo,
        EXTRACT(HOUR FROM ts)::int AS hora,
        COUNT(*) AS cantidad,
        ROW_NUMBER() OVER (PARTITION BY tipo ORDER BY COUNT(*) DESC) AS rn
    FROM eventos
    GROUP BY tipo, EXTRACT(HOUR FROM ts)
),
por_dia AS (
    SELECT
        tipo,
        EXTRACT(ISODOW FROM ts)::int AS dia_semana,
        COUNT(*) AS cantidad,
        ROW_NUMBER() OVER (PARTITION BY tipo ORDER BY COUNT(*) DESC) AS rn
    FROM eventos
    GROUP BY tipo, EXTRACT(ISODOW FROM ts)
)
SELECT
    h.tipo,
    h.hora AS hora_pico,
    h.cantidad AS tareas_hora_pico,
    d.dia_semana AS dia_pico,
    d.cantidad AS tareas_dia_pico
FROM por_hora h
JOIN por_dia d ON d.tipo = h.tipo
WHERE h.rn = 1 AND d.rn = 1
ORDER BY h.tipo;

-- ------------------------------------------------------------
-- 5) Análisis de Tareas Vencidas
--    Tareas vencidas agrupadas por usuario y categoría, con el
--    promedio de días que llevan vencidas.
--
-- Formato: usuario | categoria | tareas_vencidas | dias_promedio_vencidas
-- ------------------------------------------------------------
SELECT
    u.nombre AS usuario,
    COALESCE(c.nombre, '(sin categoría)') AS categoria,
    COUNT(t.id) AS tareas_vencidas,
    ROUND(AVG(CURRENT_DATE - t.fecha_vencimiento), 1) AS dias_promedio_vencidas
FROM tareas t
JOIN usuarios u ON u.id = t.usuario_id
LEFT JOIN categorias c ON c.id = t.categoria_id
WHERE t.fecha_vencimiento < CURRENT_DATE
  AND NOT t.completada
GROUP BY u.id, u.nombre, c.nombre
ORDER BY tareas_vencidas DESC, dias_promedio_vencidas DESC;

-- ------------------------------------------------------------
-- 6) Estadísticas de Uso de Etiquetas
--    Etiquetas más frecuentes y su tasa de completado asociada.
--
-- Formato: etiqueta | tareas_con_etiqueta | tasa_completado_pct
-- ------------------------------------------------------------
SELECT
    e.nombre AS etiqueta,
    COUNT(DISTINCT t.id) AS tareas_con_etiqueta,
    ROUND(
        100.0 * COUNT(DISTINCT t.id) FILTER (WHERE t.completada)
            / NULLIF(COUNT(DISTINCT t.id), 0),
        2
    ) AS tasa_completado_pct
FROM etiquetas e
JOIN tarea_etiquetas te ON te.etiqueta_id = e.id
JOIN tareas t ON t.id = te.tarea_id
GROUP BY e.id, e.nombre
ORDER BY tareas_con_etiqueta DESC;

-- ------------------------------------------------------------
-- 7) Métricas de Retención de Usuarios
--    Usuarios que crearon al menos una tarea en cada una de las
--    últimas 4 semanas, y tasa de retención semana a semana.
--
-- Formato: semana | usuarios_activos | semana_anterior | tasa_retencion_pct | usuarios_en_todas_4_semanas
-- ------------------------------------------------------------
WITH actividad AS (
    SELECT
        t.usuario_id,
        date_trunc('week', t.creado_en)::date AS semana
    FROM tareas t
    WHERE t.creado_en >= date_trunc('week', NOW()) - INTERVAL '3 weeks'
    GROUP BY t.usuario_id, date_trunc('week', t.creado_en)
),
activos_por_semana AS (
    SELECT semana, COUNT(*) AS usuarios_activos
    FROM actividad
    GROUP BY semana
)
SELECT
    s.semana,
    s.usuarios_activos,
    LAG(s.usuarios_activos) OVER (ORDER BY s.semana) AS semana_anterior,
    ROUND(
        100.0 * s.usuarios_activos
            / NULLIF(LAG(s.usuarios_activos) OVER (ORDER BY s.semana), 0),
        2
    ) AS tasa_retencion_pct,
    (
        SELECT COUNT(*)
        FROM (
            SELECT usuario_id
            FROM actividad
            GROUP BY usuario_id
            HAVING COUNT(DISTINCT semana) = 4
        ) leales
    ) AS usuarios_en_todas_4_semanas
FROM activos_por_semana s
ORDER BY s.semana;

-- ------------------------------------------------------------
-- 8) Análisis de Distribución de Prioridad
--    Distribución de tareas por prioridad para usuarios activos
--    (con login en los últimos 7 días).
--
-- Formato: prioridad | etiqueta_prioridad | total_tareas | distribucion_pct
-- ------------------------------------------------------------
WITH activos AS (
    SELECT id FROM usuarios WHERE ultimo_login >= NOW() - INTERVAL '7 days'
)
SELECT
    t.prioridad,
    CASE t.prioridad
        WHEN 1 THEN 'Urgente'
        WHEN 2 THEN 'Alta'
        WHEN 3 THEN 'Media'
        WHEN 4 THEN 'Normal'
        WHEN 5 THEN 'Baja'
    END AS etiqueta_prioridad,
    COUNT(*) AS total_tareas,
    ROUND(
        100.0 * COUNT(*) / NULLIF((
            SELECT COUNT(*) FROM tareas t2
            WHERE t2.usuario_id IN (SELECT id FROM activos)
        ), 0),
        2
    ) AS distribucion_pct
FROM tareas t
WHERE t.usuario_id IN (SELECT id FROM activos)
GROUP BY t.prioridad
ORDER BY t.prioridad;

-- ------------------------------------------------------------
-- 9) Tendencias Estacionales
--    Creación y completado de tareas por mes en el último año.
--
-- Formato: mes | tareas_creadas | tareas_completadas
-- ------------------------------------------------------------
SELECT
    date_trunc('month', t.creado_en)::date AS mes,
    COUNT(*) AS tareas_creadas,
    COUNT(t.id) FILTER (WHERE t.completada) AS tareas_completadas
FROM tareas t
WHERE t.creado_en >= NOW() - INTERVAL '12 months'
GROUP BY date_trunc('month', t.creado_en)
ORDER BY mes;

-- ------------------------------------------------------------
-- 10) Benchmarking de Rendimiento
--     Usuarios en el 10% superior por tasa de completado y su
--     promedio de tareas en curso (abiertas simultáneamente).
--
-- Formato: usuario | total_tareas | completadas | tasa_completado_pct | abiertas_simultaneas
-- ------------------------------------------------------------
WITH resumen AS (
    SELECT
        u.id,
        u.nombre,
        COUNT(t.id) AS total_tareas,
        COUNT(t.id) FILTER (WHERE t.completada) AS completadas,
        ROUND(
            100.0 * COUNT(t.id) FILTER (WHERE t.completada)
                / NULLIF(COUNT(t.id), 0),
            2
        ) AS tasa_completado_pct,
        COUNT(t.id) FILTER (WHERE NOT t.completada) AS abiertas_simultaneas
    FROM usuarios u
    LEFT JOIN tareas t ON t.usuario_id = u.id
    GROUP BY u.id, u.nombre
),
percentil_90 AS (
    SELECT percentile_cont(0.9) WITHIN GROUP (ORDER BY tasa_completado_pct) AS p90
    FROM resumen
)
SELECT
    nombre AS usuario,
    total_tareas,
    completadas,
    tasa_completado_pct,
    abiertas_simultaneas
FROM resumen
CROSS JOIN percentil_90 p
WHERE resumen.tasa_completado_pct >= p.p90
ORDER BY tasa_completado_pct DESC;