-- ============================================================
-- Datos de ejemplo - Lista de Tareas
-- Usuarios demo (contraseña de prueba: password123)
-- ============================================================

BEGIN;

-- Usuarios demo
INSERT INTO usuarios (id, nombre, email, password_hash, ultimo_login, creado_en)
VALUES
  (1, 'Ana García',        'ana@demo.com',   '$2b$10$79FQKxGJJTQS5TbRiwswDuwrlAjX9r02TllqPHi7VnOY4Ef6a7gju', NOW() - INTERVAL '1 day',    NOW() - INTERVAL '360 days'),
  (2, 'Carlos Pérez',      'carlos@demo.com', '$2b$10$79FQKxGJJTQS5TbRiwswDuwrlAjX9r02TllqPHi7VnOY4Ef6a7gju', NOW() - INTERVAL '2 days',   NOW() - INTERVAL '320 days'),
  (3, 'Lucía Fernández',   'lucia@demo.com', '$2b$10$79FQKxGJJTQS5TbRiwswDuwrlAjX9r02TllqPHi7VnOY4Ef6a7gju', NOW() - INTERVAL '3 hours',  NOW() - INTERVAL '290 days')
ON CONFLICT (email) DO NOTHING;

-- Categorías de Ana (usuario 1)
INSERT INTO categorias (id, usuario_id, nombre, color)
VALUES
  (1, 1, 'Trabajo',   '#0ea5e9'),
  (2, 1, 'Personal',  '#f97316'),
  (3, 1, 'Hogar',     '#22c55e')
ON CONFLICT DO NOTHING;

-- Categorías de Carlos (usuario 2)
INSERT INTO categorias (id, usuario_id, nombre, color)
VALUES
  (4, 2, 'Trabajo',  '#0ea5e9'),
  (5, 2, 'Salud',    '#ef4444'),
  (6, 2, 'Estudios', '#a855f7')
ON CONFLICT DO NOTHING;

-- Categorías de Lucía (usuario 3)
INSERT INTO categorias (id, usuario_id, nombre, color)
VALUES
  (7, 3, 'Trabajo',   '#0ea5e9'),
  (8, 3, 'Compras',   '#eab308'),
  (9, 3, 'Viajes',    '#06b6d4')
ON CONFLICT DO NOTHING;

-- Tareas de Ana (usuario 1)
INSERT INTO tareas (id, usuario_id, categoria_id, titulo, descripcion, prioridad, completada, fecha_vencimiento, completada_en, creado_en)
VALUES
  (1,  1, 1, 'Preparar informe trimestral',   'Consolidar métricas del Q3',      1, TRUE,  CURRENT_DATE - 120, NOW() - INTERVAL '120 days', NOW() - INTERVAL '130 days'),
  (2,  1, 1, 'Revisar pull requests',          'Revisar 10 PR del equipo',        2, TRUE,  CURRENT_DATE - 90,  NOW() - INTERVAL '89 days',  NOW() - INTERVAL '95 days'),
  (3,  1, 1, 'Planificar sprint',              'Definir tareas del siguiente sprint', 1, FALSE, CURRENT_DATE + 2, NULL, NOW() - INTERVAL '3 days'),
  (4,  1, 2, 'Pagar servicios',                'Luz, agua e internet',            4, TRUE,  CURRENT_DATE - 60,  NOW() - INTERVAL '61 days',  NOW() - INTERVAL '70 days'),
  (5,  1, 2, 'Reservar cita médica',           'Control anual',                   2, FALSE, CURRENT_DATE - 15,  NULL, NOW() - INTERVAL '40 days'),
  (6,  1, 3, 'Limpiar garaje',                 'Ordenar cajas y herramientas',    5, TRUE,  CURRENT_DATE - 200, NOW() - INTERVAL '201 days', NOW() - INTERVAL '210 days'),
  (7,  1, 3, 'Cambiar bombillas del pasillo',  '',                                3, FALSE, CURRENT_DATE + 10, NULL, NOW() - INTERVAL '5 days'),
  (8,  1, 1, 'Escribir documentación API',     'Endpoint por endpoint',           3, TRUE,  CURRENT_DATE - 30,  NOW() - INTERVAL '28 days',  NOW() - INTERVAL '35 days'),
  (9,  1, 2, 'Comprar regalo de cumpleaños',   'Para el fin de mes',              2, FALSE, CURRENT_DATE + 15, NULL, NOW() - INTERVAL '10 days'),
  (10, 1, 1, 'Actualizar CV',                  '',                                4, FALSE, CURRENT_DATE + 30, NULL, NOW() - INTERVAL '20 days');

-- Tareas de Carlos (usuario 2)
INSERT INTO tareas (id, usuario_id, categoria_id, titulo, descripcion, prioridad, completada, fecha_vencimiento, completada_en, creado_en)
VALUES
  (11, 2, 4, 'Cerrar contrato cliente Alpha',  'Firmar propuesta final',          1, TRUE,  CURRENT_DATE - 45, NOW() - INTERVAL '45 days',  NOW() - INTERVAL '60 days'),
  (12, 2, 4, 'Métricas de ventas semanales',   '',                                2, TRUE,  CURRENT_DATE - 7,  NOW() - INTERVAL '6 days',   NOW() - INTERVAL '10 days'),
  (13, 2, 5, 'Correr 5 km',                    'Tres veces por semana',           2, FALSE, CURRENT_DATE + 1,  NULL, NOW() - INTERVAL '4 days'),
  (14, 2, 5, 'Chequeo general',                'Laboratorio incluido',            1, FALSE, CURRENT_DATE - 3,  NULL, NOW() - INTERVAL '25 days'),
  (15, 2, 6, 'Estudiar SQL avanzado',          'Capítulos 8 y 9',                 3, TRUE,  CURRENT_DATE - 21, NOW() - INTERVAL '20 days',  NOW() - INTERVAL '30 days'),
  (16, 2, 6, 'Terminar curso de Docker',       'Última unidad',                   3, FALSE, CURRENT_DATE + 20, NULL, NOW() - INTERVAL '8 days'),
  (17, 2, 6, 'Escribir apuntes de TypeScript', '',                                4, FALSE, NULL,              NULL, NOW() - INTERVAL '2 days');

-- Tareas de Lucía (usuario 3)
INSERT INTO tareas (id, usuario_id, categoria_id, titulo, descripcion, prioridad, completada, fecha_vencimiento, completada_en, creado_en)
VALUES
  (18, 3, 7, 'Enviar reporte mensual',         '',                                1, TRUE,  CURRENT_DATE - 75, NOW() - INTERVAL '74 days', NOW() - INTERVAL '80 days'),
  (19, 3, 8, 'Comprar despensa',               'Arroz, pasta, fruta',             3, TRUE,  CURRENT_DATE - 12, NOW() - INTERVAL '11 days', NOW() - INTERVAL '15 days'),
  (20, 3, 8, 'Comprar regalo baby shower',     '',                                4, FALSE, CURRENT_DATE - 2,  NULL, NOW() - INTERVAL '30 days'),
  (21, 3, 9, 'Reservar vuelos a Madrid',       'Comparar precios',                2, FALSE, CURRENT_DATE + 25, NULL, NOW() - INTERVAL '6 days'),
  (22, 3, 9, 'Hacer itinerario de viaje',      '4 días, 3 noches',                3, FALSE, CURRENT_DATE + 28, NULL, NOW() - INTERVAL '5 days'),
  (23, 3, 7, 'Preparar demo de producto',      'Slides + entorno',                1, TRUE,  CURRENT_DATE - 150, NOW() - INTERVAL '151 days', NOW() - INTERVAL '160 days'),
  (24, 3, 8, 'Renovar suscripción streaming',  '',                                5, FALSE, CURRENT_DATE + 5,  NULL, NOW() - INTERVAL '1 day');

-- Etiquetas de Ana (usuario 1)
INSERT INTO etiquetas (id, usuario_id, nombre)
VALUES
  (1, 1, 'importante'),
  (2, 1, 'urgente'),
  (3, 1, 'concentración'),
  (4, 1, 'rutina')
ON CONFLICT DO NOTHING;

-- Etiquetas de Carlos (usuario 2)
INSERT INTO etiquetas (id, usuario_id, nombre)
VALUES
  (5, 2, 'urgente'),
  (6, 2, 'salud'),
  (7, 2, 'estudio')
ON CONFLICT DO NOTHING;

-- Etiquetas de Lucía (usuario 3)
INSERT INTO etiquetas (id, usuario_id, nombre)
VALUES
  (8, 3, 'importante'),
  (9, 3, 'compras'),
  (10, 3, 'viaje')
ON CONFLICT DO NOTHING;

-- Relación tarea <-> etiqueta
INSERT INTO tarea_etiquetas (tarea_id, etiqueta_id)
VALUES
  (1, 1), (1, 3),           -- informe: importante, concentración
  (3, 1), (3, 2),           -- planificar sprint: importante, urgente
  (4, 4),                   -- pagar servicios: rutina
  (5, 3),                   -- cita médica: concentración
  (8, 1),                   -- documentación: importante
  (10, 2), (10, 1),         -- CV: urgente, importante
  (11, 5),                  -- contrato: urgente
  (13, 6),                  -- correr: salud
  (15, 7),                  -- SQL: estudio
  (16, 7),                  -- Docker: estudio
  (18, 8),                  -- reporte: importante
  (20, 9),                  -- baby shower: compras
  (21, 10), (22, 10)        -- vuelos e itinerario: viaje
ON CONFLICT DO NOTHING;

-- Reiniciar secuencias para que los siguientes inserts no colisionen
SELECT setval('usuarios_id_seq',    (SELECT MAX(id) FROM usuarios));
SELECT setval('categorias_id_seq',  (SELECT MAX(id) FROM categorias));
SELECT setval('tareas_id_seq',      (SELECT MAX(id) FROM tareas));
SELECT setval('etiquetas_id_seq',   (SELECT MAX(id) FROM etiquetas));

COMMIT;