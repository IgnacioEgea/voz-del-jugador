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
| 14 nov 2026 | Concepto visual: "carta coleccionable" con barras de stats tipo HUD | La rareza de la carta sale de los datos (% de reseñas positivas), así que el diseño explica el dato; las barras se leen más rápido que un radar | HUD táctico puro (demasiado parecido a un dashboard típico) y arcade (la letra pixelada se lee mal en el móvil) |

## Observaciones y hallazgos (ir apuntando)
-
