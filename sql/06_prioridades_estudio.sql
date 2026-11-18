-- ¿Qué debería arreglar primero el estudio? Para cada juego y tema calculamos:
--   cuantos  = % de reseñas que critican ese tema (lo extendida que está la queja)
--   caida    = cuántos puntos baja la recomendación cuando alguien lo critica (lo grave que es)
--   prioridad = cuantos × caida / 100 → puntos de recomendación que se pierden por ese tema
WITH base AS (                            -- reseñas leídas por la IA, con su % de recomendación por juego
  SELECT r.juego_id, COUNT(*) AS total, AVG(r.recomienda) AS media
  FROM resenas r
  WHERE r.id IN (SELECT resena_id FROM temas_ia)
  GROUP BY r.juego_id
),
critica AS (                              -- reseñas que critican cada tema
  SELECT r.juego_id, t.tema, COUNT(*) AS n, AVG(r.recomienda) AS media
  FROM temas_ia t
  JOIN resenas r ON r.id = t.resena_id
  WHERE t.sentimiento = 'neg'
  GROUP BY r.juego_id, t.tema
)
SELECT
  j.nombre                                                 AS juego,
  c.tema,
  ROUND(100.0 * c.n / b.total, 1)                          AS pct_lo_critica,
  ROUND(100.0 * (b.media - c.media), 1)                    AS caida_puntos,
  ROUND(100.0 * c.n / b.total * (b.media - c.media), 2)    AS prioridad
FROM critica c
JOIN base b   ON b.juego_id = c.juego_id
JOIN juegos j ON j.id = c.juego_id
WHERE c.n >= 30                           -- con menos de 30 quejas el dato no es fiable
ORDER BY juego, prioridad DESC;
