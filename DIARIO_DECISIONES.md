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
| 14 nov 2026 | Web pensada también para jugadores ("Encuentra tu shooter", cartas, kill feed) | Un producto que usan jugadores reales es más único y memorable que un dashboard solo para analistas | Dashboard clásico solo para empresa |
| 14 nov 2026 | App de una sola página con rutas (#/juegos, #/comparar…) y View Transitions | Navegación rápida sin servidor y transiciones suaves; sigue siendo una web estática gratis en GitHub Pages | Framework (React) o varias páginas HTML: más peso o más código repetido |
| 14 nov 2026 | Arte generado con IA (Gemini, gratis), solo objetos originales sin armas, logos ni personajes | Derechos de autor y apto para todos; estilo coherente en toda la colección | Copiar arte oficial de los juegos en el repositorio (problemas legales). *Cambio posterior: las portadas oficiales se enlazan desde la tienda, ver más abajo* |
| 14 nov 2026 | Versión automática en CSS/JS al publicar | Los navegadores guardaban copias viejas y la gente veía la web antigua tras cada cambio | Pedir a la gente que recargue |
| 14 nov 2026 | Explorador con las 150 reseñas más útiles por juego en un archivo aparte | Funciona como una "base de datos" consultable sin servidor y solo se descarga si alguien lo abre | Base de datos con backend (coste y mantenimiento) |
| 14 nov 2026 | Ampliar a 15 F2P (PUBG, CS2, Dota 2, Warframe, Destiny 2, Delta Force, Arknights: Endfield, Wuthering Waves, Zenless Zone Zero) | Más variedad de géneros y juegos muy conocidos; Genshin, Fortnite y Honkai: Star Rail no están en Steam | Quedarse solo en hero shooters |
| 14 nov 2026 | Portadas oficiales enlazadas desde la tienda de Steam (no copiadas), con crédito a los estudios | Es el arte promocional que publican los propios estudios y siempre está actualizado. Cambia la decisión del arte: el arte de IA se queda para iconos y logros, y la portada de cada juego es la oficial | Guardar copias de las imágenes en el repositorio |
| 14 nov 2026 | Reutilizar los emblemas generados como insignias de logros | No se desecha el arte original y añade un toque de juego | Borrarlos |
| 14 nov 2026 | Repartir la clasificación en varios días | La cuota gratuita diaria de Gemini se agota (~400 llamadas al día): coste 0 € a cambio de más tiempo | Pagar la API |
| 14 nov 2026 | Genshin Impact y Honkai: Star Rail desde la App Store (4-5 estrellas = recomienda), marcados con su fuente y con filtro "Solo Steam" | No están en Steam; así entran en la web sin mezclar métodos a escondidas | Dejarlos fuera o mezclarlos sin avisar |
| 14 nov 2026 | Asistente de chat por reglas en el navegador, sin API | Gratis, instantáneo, sin exponer claves y siempre responde con datos reales | Chatbot con IA externa (coste y riesgo de inventar) |
| 14 nov 2026 | Iconos de interfaz generados en hojas de 8 y recortados | 2 peticiones de imagen en vez de 16, mismo estilo en todos | Emojis (poco diegéticos) |
| 14 nov 2026 | Concepto visual: "carta coleccionable" con barras de stats tipo HUD | La rareza de la carta sale de los datos (% de reseñas positivas), así que el diseño explica el dato; las barras se leen más rápido que un radar | HUD táctico puro (demasiado parecido a un dashboard típico) y arcade (la letra pixelada se lee mal en el móvil) |

## Observaciones y hallazgos (ir apuntando)
- **14 nov · Los veteranos de Marvel Rivals se queman.** El 61 % de los novatos lo recomienda, pero solo el 36 % de los veteranos (≥100 h). En TF2 y Paladins los veteranos siguen contentos (77-83 %). Pregunta para la IA: ¿qué aspecto explica la caída? ¿Monetización, matchmaking?
- **14 nov · El que se queja escribe el doble.** Mediana de 114 caracteres en las negativas frente a 63 en las positivas. Bueno para el análisis: las negativas dan más detalle para clasificar.
- **14 nov · ⚠️ Limitación: ventanas de tiempo distintas.** En 5 juegos, las ~1.800 reseñas más recientes cubren solo 3-4 semanas (oct-nov 2026); en Paladins, 14 meses. Los grandes reflejan "el momento actual" (una temporada o un parche pueden pesar mucho); Paladins, una opinión más asentada. Decirlo siempre al comparar.

## 2026-11-15 · Pulido tras revisión de Ignacio
- **Emojis → símbolos SVG neón propios.** Cada sistema pinta los emojis distinto (en Windows el ⬆️ salía como "1"). Dibujarlos en SVG es gratis, nítido a cualquier tamaño y sigue la paleta.
- **Una voz por persona.** Cada reseña solo puede ser "voz real" de un tema por juego.
- **Portada entera a 2:3 y nombre debajo.** El texto encima tapaba el logo y el brillo holográfico quemaba las portadas claras (Arknights).

## 2026-11-16 · Revisión completa de la web
- **Menú móvil 5 + «Más».** Ocho secciones no caben en 375 px; un desplegable es más claro que deslizar a ciegas.
- **Umbral de 30 menciones.** Por debajo, el % se marca como «pocos datos» y no alimenta titulares, patch notes ni puntos fuertes.
- **Tendencia con el historial oficial de Steam**, no con nuestra muestra: la mayoría de juegos solo tiene reseñas del último mes, y un gráfico mensual con eso engañaría.
- **Validación desde la web.** Etiquetar 200 reseñas en Excel es incómodo; la web guarda el progreso y exporta el mismo CSV que lee `validar.py`.
- **Juegos parecidos** por distancia media entre sus % por tema (con un pequeño extra si comparten género).
- **README con capturas**: es lo primero que ve quien abre el repositorio.

## 2026-11-16 · De 21 a 35 juegos
- **9 de Steam:** AION 2, Where Winds Meet, Rainbow Six Siege, Path of Exile, SMITE 2, The First Descendant, Throne and Liberty, Brawlhalla y Highguard.
- **5 de la App Store:** Honor of Kings, Brawl Stars, Clash Royale, PUBG MOBILE y Pokémon TCG Pocket.
- **Highguard se incluye aunque cerró** el 12 de marzo de 2026: sus reseñas siguen en Steam y es el mejor ejemplo de lanzamiento fallido. La web lo marca «fuera de servicio».
- **Descartados:** Fortnite, LoL y Valorant (no están en Steam), Warzone (comparte reseñas con los Call of Duty de pago), Deadlock (no es un lanzamiento F2P) y juegos idle.
- Los iconos de la App Store ya no se escriben a mano: `fechas.py` los busca al publicar.

## 2026-11-24 · Botón de idiomas
- Mismo selector que el portfolio (bandera + código, 10 idiomas, Google Translate oculto). Alternativa descartada: traducir los textos a mano (mucho trabajo y no escala con las reseñas).

## 2026-11-24 · Rediseño «gamer, pero sobrio»
- Elegido por Ignacio entre 3 opciones (gamer sobrio / panel de datos limpio / solo legibilidad).
- Fondo gris-azulado liso (sin cuadrícula), acento único dorado para acciones, texto en Inter, mínimo 14 px (salvo etiquetas del menú móvil, 11 px).
- Menú: 5 secciones + «Más» también en ordenador. Inicio: «¿Qué quieres hacer?» con 3 caminos, datos con etiqueta y frase completa, leyenda de rarezas.

## 2026-11-25 · Revisión antes de publicarlo en LinkedIn
- **Reseñas clasificadas dos veces.** Una tanda cortada guardó 2 reseñas por duplicado y la web contaba 44.512 clasificadas de 44.510. Se borran del CSV y `resumir.py` y `validar.py` se quedan siempre con la última.
- **README con hallazgos y SQL.** Quien abre el repositorio ve primero qué se ha descubierto y qué recomendaría a un estudio, y después cómo está hecho.
