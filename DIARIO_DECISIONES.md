# Diario de decisiones · P1 · La voz del jugador
Tu chuleta para las entrevistas. Una línea por decisión importante: **qué** y **por qué**.

| Fecha | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| 14 nov 2026 | Usar la API pública de reseñas de Steam | Oficial, gratuita y sin scraping | Scraping de la web (frágil y menos ético) |
| 14 nov 2026 | Clasificación con IA + validación manual de 200 reseñas | Sin datos etiquetados no se puede entrenar un modelo propio; la validación da credibilidad | Entrenar BERT desde cero |
| 14 nov 2026 | Web estática con datos agregados en JSON | Rápida, gratis en GitHub Pages y fácil de revisar | Backend con servidor (innecesario) |
| 14 nov 2026 | Reseñas en inglés; la web, en español | Mucho más volumen en inglés y la web habla a un público español | Solo español (pocas reseñas en algunos juegos) |
| 14 nov 2026 | Horas jugadas *en el momento de la reseña* | Un "novato" lo era de verdad cuando opinó | Horas totales actuales (mezcla novatos que luego siguieron jugando) |
| 14 nov 2026 | Descargar las reseñas más recientes primero | Refleja el estado actual de cada juego | Las "más útiles" (sesgadas hacia reseñas antiguas) |
| 14 nov 2026 | Descarga y clasificación reanudables | Si se corta internet o se acaba la cuota, no se pierde nada | Empezar de cero cada vez |
| 14 nov 2026 | Spam = menos del 50 % de letras o palabras muy repetidas | Reglas simples y explicables | Un modelo de detección de spam (excesivo) |
| 14 nov 2026 | Perfiles: novato < 10 h, medio, veterano ≥ 100 h | Cortes fáciles de entender para negocio | Cuartiles (cambian según el juego y cuestan de explicar) |
| 14 nov 2026 | IA: Gemini (plan gratuito), lotes de 20, JSON, temperatura 0 | Entiende la ironía, es gratis y la temperatura 0 da respuestas estables | Modelo local zero-shot (lento y peor con la ironía) |
| 14 nov 2026 | Las definiciones de los aspectos del prompt sirven también de guía para etiquetar a mano | La IA y yo usamos el mismo criterio, así que el acierto es justo | Etiquetar "a ojo" |
| 14 nov 2026 | Migrar a la nueva API de Steam (`IUserReviewsService/GetAppReviews`) | Valve retiró `appreviews` el 22 oct 2026; la nueva es oficial, gratuita y sin clave. Por defecto filtra las "bombas de reseñas" (off-topic) | Seguir con la API antigua (ya no responde) |
| 14 nov 2026 | Descarga y limpieza en GitHub Actions | Se ejecuta en los servidores de GitHub con un botón, gratis y repetible: el pipeline queda documentado | Ejecutarlo a mano en el PC |
| 14 nov 2026 | Modelo `gemini-flash-lite-latest` en vez de `gemini-flash-latest` | El modelo "flash" se quedaba pensando más de 2 min por lote; el "lite" responde en segundos, tiene más cuota gratuita y la validación medirá si acierta lo suficiente | Modelo más grande (lento y con menos cuota) |
| 14 nov 2026 | El robot se pone al día (`git pull --rebase`) antes de guardar | Una tanda perdió ~1.000 reseñas porque subí la web mientras clasificaba y GitHub rechazó su guardado | Prohibir subir cambios mientras clasifica (frágil) |
| 14 nov 2026 | Web publicada sola con GitHub Actions + Pages tras cada tanda | Los resultados se ven en vivo y el `data.json` nunca se queda viejo | Publicar a mano |
| 14 nov 2026 | Concepto visual: "carta coleccionable" con barras de stats tipo HUD | La rareza de la carta sale de los datos (% de reseñas positivas), así que el diseño explica el dato; las barras se leen más rápido que un radar | HUD táctico puro (demasiado parecido a un dashboard típico) y arcade (la letra pixelada se lee mal en el móvil) |

## Observaciones y hallazgos (ir apuntando)
- **14 nov · Los veteranos de Marvel Rivals se queman.** El 61 % de los novatos lo recomienda, pero solo el 36 % de los veteranos (≥100 h). En TF2 y Paladins los veteranos siguen contentos (77-83 %). Pregunta para la IA: ¿qué aspecto explica la caída? ¿Monetización, matchmaking?
- **14 nov · El que se queja escribe el doble.** Mediana de 114 caracteres en las negativas frente a 63 en las positivas. Bueno para el análisis: las negativas dan más detalle para clasificar.
- **14 nov · ⚠️ Limitación: ventanas de tiempo distintas.** En 5 juegos, las ~1.800 reseñas más recientes cubren solo 3-4 semanas (oct-nov 2026); en Paladins, 14 meses. Los grandes reflejan "el momento actual" (una temporada o un parche pueden pesar mucho); Paladins, una opinión más asentada. Decirlo siempre al comparar.
