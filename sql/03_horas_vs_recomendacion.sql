-- ¿Recomiendan más los que juegan más? % de recomendación por tramo de horas jugadas.
-- Si cae en los tramos altos, el juego "quema" a sus veteranos: un aviso de abandono.
SELECT
  j.nombre AS juego,
  CASE
    WHEN r.horas < 2    THEN '1. Menos de 2 h'
    WHEN r.horas < 10   THEN '2. De 2 a 10 h'
    WHEN r.horas < 50   THEN '3. De 10 a 50 h'
    WHEN r.horas < 200  THEN '4. De 50 a 200 h'
    WHEN r.horas < 1000 THEN '5. De 200 a 1.000 h'
    ELSE                     '6. Más de 1.000 h'
  END                                     AS tramo_horas,
  COUNT(*)                                AS resenas,
  ROUND(100.0 * AVG(r.recomienda), 1)     AS pct_recomienda
FROM resenas r
JOIN juegos j ON j.id = r.juego_id
WHERE r.horas IS NOT NULL                 -- solo Steam da las horas jugadas
GROUP BY juego, tramo_horas
ORDER BY juego, tramo_horas;
