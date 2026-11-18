-- ¿Qué pasa con la valoración después de una actualización?
-- Para cada mes en que un juego anunció parches o temporadas, compara el % de votos positivos
-- del mes anterior con el del mes siguiente. Una fila por juego y mes (aunque hubiera varios anuncios).
WITH meses AS (
  SELECT juego_id, mes, 100.0 * positivos / (positivos + negativos) AS pct
  FROM historial_mensual
  WHERE positivos + negativos >= 50              -- solo meses con votos suficientes
),
parches AS (
  SELECT juego_id,
         strftime('%Y-%m', fecha)  AS mes,
         COUNT(*)                  AS anuncios,
         MIN(titulo)               AS ejemplo      -- uno de los títulos, para saber de qué se trataba
  FROM actualizaciones
  GROUP BY juego_id, mes
)
SELECT
  j.nombre                                AS juego,
  p.mes                                   AS mes_actualizacion,
  p.anuncios,
  p.ejemplo,
  ROUND(antes.pct, 1)                     AS pct_mes_anterior,
  ROUND(despues.pct, 1)                   AS pct_mes_siguiente,
  ROUND(despues.pct - antes.pct, 1)       AS cambio_puntos
FROM parches p
JOIN juegos j      ON j.id = p.juego_id
JOIN meses antes   ON antes.juego_id = p.juego_id
                  AND antes.mes = strftime('%Y-%m', p.mes || '-01', '-1 month')
JOIN meses despues ON despues.juego_id = p.juego_id
                  AND despues.mes = strftime('%Y-%m', p.mes || '-01', '+1 month')
ORDER BY ABS(despues.pct - antes.pct) DESC;
