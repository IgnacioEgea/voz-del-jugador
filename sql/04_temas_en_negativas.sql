-- ¿De qué se quejan los que NO recomiendan el juego?
-- Para cada juego y tema: en qué % de sus reseñas negativas sale ese tema criticado.
WITH negativas AS (                       -- reseñas negativas que ya ha leído la IA
  SELECT r.id, r.juego_id
  FROM resenas r
  WHERE r.recomienda = 0 AND r.id IN (SELECT resena_id FROM temas_ia)
)
SELECT
  j.nombre                                                       AS juego,
  t.tema,
  COUNT(*)                                                       AS quejas,
  ROUND(100.0 * COUNT(*) /
        (SELECT COUNT(*) FROM negativas n2 WHERE n2.juego_id = j.id), 1) AS pct_de_las_negativas
FROM negativas n
JOIN temas_ia t ON t.resena_id = n.id AND t.sentimiento = 'neg'
JOIN juegos j   ON j.id = n.juego_id
GROUP BY j.id, t.tema
ORDER BY juego, quejas DESC;
