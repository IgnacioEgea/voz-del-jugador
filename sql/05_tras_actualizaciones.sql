-- ¿Qué pasa con la valoración después de una actualización?
-- Compara el % de votos positivos del mes anterior con el del mes siguiente a cada parche.
WITH meses AS (
  SELECT juego_id, mes, positivos + negativos AS votos,
         100.0 * positivos / (positivos + negativos) AS pct
  FROM historial_mensual
  WHERE positivos + negativos >= 50       -- solo meses con votos suficientes
)
SELECT
  j.nombre                                AS juego,
  a.fecha,
  a.titulo,
  ROUND(antes.pct, 1)                     AS pct_mes_anterior,
  ROUND(despues.pct, 1)                   AS pct_mes_siguiente,
  ROUND(despues.pct - antes.pct, 1)       AS cambio_puntos
FROM actualizaciones a
JOIN juegos j      ON j.id = a.juego_id
JOIN meses antes   ON antes.juego_id = a.juego_id
                  AND antes.mes = strftime('%Y-%m', a.fecha, 'start of month', '-1 month')
JOIN meses despues ON despues.juego_id = a.juego_id
                  AND despues.mes = strftime('%Y-%m', a.fecha, 'start of month', '+1 month')
ORDER BY ABS(despues.pct - antes.pct) DESC;
