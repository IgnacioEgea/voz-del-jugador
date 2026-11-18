-- ¿Cómo está cada juego? Reseñas, cuántas ha leído la IA y qué % de jugadores lo recomienda.
-- Es la tabla base del dashboard: una fila por juego.
SELECT
  j.nombre                                          AS juego,
  j.genero,
  j.tienda,
  j.fecha_salida,
  COUNT(r.id)                                       AS resenas,
  SUM(r.id IN (SELECT resena_id FROM temas_ia))     AS clasificadas_ia,  -- reseñas que ya ha leído la IA
  ROUND(100.0 * AVG(r.recomienda), 1)               AS pct_recomienda,
  ROUND(AVG(r.horas), 0)                            AS horas_medias      -- NULL en la App Store (no da horas)
FROM juegos j
JOIN resenas r ON r.juego_id = j.id
GROUP BY j.id
ORDER BY pct_recomienda DESC;
