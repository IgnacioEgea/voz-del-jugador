-- Mapa de calor del dashboard: para cada juego y tema, cuántos lo mencionan y en qué tono.
SELECT
  j.nombre                                                              AS juego,
  t.tema,
  COUNT(*)                                                              AS menciones,
  ROUND(100.0 * SUM(t.sentimiento = 'pos') / COUNT(*), 1)               AS pct_positivo,
  ROUND(100.0 * SUM(t.sentimiento = 'neg') / COUNT(*), 1)               AS pct_negativo
FROM temas_ia t
JOIN resenas r ON r.id = t.resena_id
JOIN juegos j  ON j.id = r.juego_id
GROUP BY j.id, t.tema
ORDER BY juego, menciones DESC;
