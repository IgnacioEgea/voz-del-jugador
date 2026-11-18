-- % de votos positivos por juego y mes, con el historial oficial de Steam (todos los idiomas).
-- Nuestras reseñas son recientes, así que para ver la evolución usamos este historial.
SELECT
  j.nombre                                                        AS juego,
  h.mes,                                                          -- "2026-03"
  h.positivos + h.negativos                                       AS votos,
  ROUND(100.0 * h.positivos / (h.positivos + h.negativos), 1)     AS pct_positivas
FROM historial_mensual h
JOIN juegos j ON j.id = h.juego_id
WHERE h.positivos + h.negativos >= 20                             -- meses con muy pocos votos dan picos falsos
ORDER BY juego, h.mes;
