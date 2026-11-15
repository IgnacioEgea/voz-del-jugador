// Pantallas de texto: conclusiones (calculadas a partir de los datos, se actualizan solas) y método.

// Ranking global de temas: media de opiniones positivas de todos los juegos, pesada por menciones
function rankingTemas() {
  return Object.keys(NOMBRES).map((k) => {
    const v = datos.juegos.map((j) => j.aspectos[k]).filter(Boolean);
    const menciones = v.reduce((s, a) => s + a.menciones, 0);
    return { k, menciones, pos: menciones ? Math.round(v.reduce((s, a) => s + a.pos * a.menciones, 0) / menciones) : null };
  }).filter((t) => t.pos !== null).sort((x, y) => y.pos - x.pos);
}

function vistaConclusiones() {
  const temas = rankingTemas();
  if (!temas.length) return `<p class="aviso">${simbolo("espera")} Las conclusiones aparecerán cuando la IA haya leído las primeras reseñas.</p>`;
  const [mejor, peor] = [temas[0], temas[temas.length - 1]];
  const conDatos = datos.juegos.filter((j) => aspectosDe(j).length);
  const vecesPeor = conDatos.filter((j) => aspectosDe(j).at(-1).clave === peor.k).length;
  const quemados = datos.juegos.filter((j) => j.perfiles.novato - j.perfiles.veterano >= 10);  // Los de App Store no tienen horas
  const puestoMoney = temas.findIndex((t) => t.k === "monetizacion") + 1;

  const ideas = [
    [`${peor.pos} %`, `El talón de Aquiles: ${NOMBRES[peor.k].toLowerCase()}`,
      `Es el tema peor valorado del género: solo el ${peor.pos} % de quienes hablan de ello lo hace en positivo, y es el punto más débil en ${vecesPeor} de ${conDatos.length} juegos analizados.`],
    [`${mejor.pos} %`, `Lo que salva al género: ${NOMBRES[mejor.k].toLowerCase()}`,
      `Cuando un jugador recomienda un free-to-play, suele ser por esto. Es el gancho que hay que proteger en cada actualización.`],
    [`${quemados.length}`, "El desgaste del veterano",
      quemados.length ? `En ${quemados.map((j) => j.juego).join(", ")}, los jugadores con 100 h o más lo recomiendan al menos 10 puntos menos que los novatos: el juego quema a quien más le da.`
        : "En ningún juego los veteranos lo valoran mucho peor que los novatos: el desgaste no es un patrón general."],
    [`#${puestoMoney}`, "¿Y el famoso pay-to-win?",
      puestoMoney && puestoMoney <= temas.length - 2
        ? `Contra el tópico, la monetización queda en el puesto ${puestoMoney} de ${temas.length}: molesta, pero no es lo que más pesa en las reseñas.`
        : `Confirma el tópico: la monetización está entre los temas peor valorados (puesto ${puestoMoney} de ${temas.length}).`],
  ];

  return `<header class="cabecera"><p class="etiqueta">// Informe</p><h1>Conclusiones</h1>
    <p class="subtitulo">Qué hace que un jugador recomiende o abandone un juego gratuito, contado con datos.
    ${terminado() ? "" : `<br><b>Provisional:</b> basado en ${miles(datos.clasificadas)} de ${miles(datos.total)} reseñas.`}</p></header>
  <ol class="ideas">${ideas.map(([cifra, titulo, texto], i) => `<li><span class="idea-num">0${i + 1}</span>
    <strong>${cifra}</strong><h3>${titulo}</h3><p>${texto}</p></li>`).join("")}</ol>

  <section aria-labelledby="t-ranking"><h2 id="t-ranking">Ranking de temas en todo el género</h2>
    <p class="nota">% de opiniones positivas sobre cada tema, sumando todos los juegos.</p>
    ${temas.map((t) => barra(`${ICONOS[t.k]} ${NOMBRES[t.k]}`, t.pos, `<small class="nota">${miles(t.menciones)} menciones · </small>`)).join("")}</section>

  <section aria-labelledby="t-hacer"><h2 id="t-hacer">Qué haría con esto un estudio</h2>
    <div class="dos-columnas">
      <div class="panel"><h3>${simbolo("hotfix")} Para el equipo de diseño</h3><ul>
        <li>Priorizar <b>${NOMBRES[peor.k].toLowerCase()}</b> en la hoja de ruta: es lo que más hunde las reseñas.</li>
        <li>Medir la satisfacción por horas jugadas para detectar a tiempo el desgaste de los veteranos.</li>
        <li>Proteger <b>${NOMBRES[mejor.k].toLowerCase()}</b> en cada parche: es lo que hace que te recomienden.</li></ul></div>
      <div class="panel"><h3>📣 Para el equipo de marketing</h3><ul>
        <li>Abrir la ficha de tienda con <b>${NOMBRES[mejor.k].toLowerCase()}</b>, lo que más valoran los propios jugadores.</li>
        <li>Usar frases reales de reseñas positivas: suenan más creíbles que cualquier eslogan.</li>
        <li>Responder en público a las quejas sobre ${NOMBRES[peor.k].toLowerCase()}: muestra que el estudio escucha.</li></ul></div>
    </div></section>

  <section class="cta-final"><h2>¿Y si solo quieres jugar?</h2>
    <p>Usa el recomendador: marca lo que te importa y te decimos qué juego encaja contigo.</p>
    <a class="boton principal" href="#/encuentra">${icono("encuentra")} Encuentra tu juego</a></section>`;
}

function vistaMetodo() {
  const pasos = [
    ["📥", "Datos", `${miles(datos.total)} reseñas recientes en inglés de ${datos.juegos.length} juegos gratuitos, descargadas de la API oficial de Steam (sin scraping).`],
    ["🧹", "Limpieza", "Fuera duplicados, textos de menos de 20 caracteres y spam (dibujos con símbolos o palabras repetidas). Horas jugadas al escribir la reseña."],
    ["🤖", "IA", "Gemini clasifica cada reseña en 7 temas con su tono (positivo, negativo o neutro), en lotes de 20 y con temperatura 0 para respuestas estables."],
    ["✅", "Validación", "200 reseñas al azar se etiquetan a mano para medir cuánto acierta la IA. Resultado: pendiente de publicar."],
    ["⚙️", "Automatización", "Robots de GitHub Actions descargan, clasifican por tandas y publican esta web solos. Coste: 0 €."],
  ];
  const limites = [
    "Sesgo de autoselección: escribe reseña quien está muy contento o muy enfadado.",
    "Solo reseñas en inglés: la opinión de otros mercados puede ser distinta.",
    `Ventanas de tiempo distintas: en los juegos más populares, ${miles(1800)} reseñas cubren unas semanas; en los menos, más de un año.`,
    "Steam filtra las «bombas de reseñas» (ataques coordinados), así que no aparecen aquí.",
    "La IA se equivoca a veces, sobre todo con la ironía: por eso se valida a mano y se publica su acierto.",
  ];
  return `<header class="cabecera"><p class="etiqueta">// Cómo está hecho</p><h1>Método y limitaciones</h1>
    <p class="subtitulo">Para que puedas fiarte de los números, aquí está todo el proceso y lo que estos datos <b>no</b> pueden decir.</p></header>
  <ol class="pasos metodo">${pasos.map(([i, t, p]) => `<li><b>${i} ${t}</b><p>${p}</p></li>`).join("")}</ol>
  <section aria-labelledby="t-limites"><h2 id="t-limites">Limitaciones</h2><ul class="lista-limpia">${limites.map((l) => `<li>${simbolo("aviso")} ${l}</li>`).join("")}</ul></section>
  <section aria-labelledby="t-stack"><h2 id="t-stack">Herramientas</h2>
    <p class="chips">${["Python", "pandas", "API de Steam", "Gemini (IA)", "GitHub Actions", "GitHub Pages", "HTML · CSS · JS", "Arte generado con IA"]
      .map((t) => `<span class="chip">${t}</span>`).join("")}</p>
    <div class="botones"><a class="boton principal" href="https://github.com/IgnacioEgea/voz-del-jugador">${icono("metodo")} Ver el código</a>
      <a class="boton" href="https://github.com/IgnacioEgea/voz-del-jugador/blob/main/DIARIO_DECISIONES.md">${icono("conclusiones")} Diario de decisiones</a></div></section>`;
}

// Sobre el proyecto: qué es, por qué, cómo está montado, quién lo hizo y cómo encaja con sus habilidades
function vistaSobre() {
  const habilidades = [
    ["metodo", "Datos", "Python y pandas para descargar, limpiar y resumir miles de reseñas desde la API oficial de Steam."],
    ["chat", "IA aplicada", "Un modelo de lenguaje clasifica cada reseña; se valida a mano y se publica su acierto. La IA ayuda, las decisiones son mías."],
    ["conclusiones", "Marketing", "Las conclusiones se traducen en acciones: qué destacar en la ficha de tienda y cómo responder a las quejas."],
    ["juegos", "Diseño y UX", "Concepto de cartas coleccionables, arte, animaciones, accesibilidad y diseño adaptado al móvil."],
    ["encuentra", "Producto", "No es solo un informe: los jugadores pueden usarlo para elegir juego, y eso lo hace útil de verdad."],
    ["comparar", "Automatización", "Robots de GitHub descargan, clasifican, traducen y publican solos. Coste: 0 €."],
  ];
  return `<header class="cabecera"><p class="etiqueta">// Sobre el proyecto</p><h1>La voz del jugador</h1>
    <p class="subtitulo">Un proyecto de portfolio que junta mis tres mundos: el diseño de productos interactivos,
      el marketing digital y el análisis de datos con IA.</p></header>

  <section aria-labelledby="t-porque"><h2 id="t-porque">Por qué existe</h2>
    <p>Los juegos gratuitos viven de que la gente los recomiende y siga jugando. Las reseñas de Steam son la opinión
      más honesta que existe sobre ellos, pero nadie lee miles de reseñas. Quería responder con datos a una pregunta
      sencilla: <b>¿qué hace que un jugador recomiende o abandone un free-to-play?</b> Y que la respuesta sirviera a la vez
      a un estudio (qué arreglar) y a un jugador (a qué jugar).</p></section>

  <section aria-labelledby="t-como"><h2 id="t-como">Cómo está montado</h2>
    <ol class="pasos">
      <li><b>01 · Datos</b><p>La API oficial de Steam da las reseñas recientes de cada juego. Python las limpia y quita el spam.</p></li>
      <li><b>02 · IA</b><p>Gemini separa cada reseña en 7 temas con su tono, por lotes y de forma reanudable, sin coste.</p></li>
      <li><b>03 · Web</b><p>Una app estática (HTML, CSS y JavaScript sin frameworks) en GitHub Pages, ligera y rápida.</p></li>
      <li><b>04 · Robots</b><p>GitHub Actions lo actualiza todo automáticamente: los datos de la web nunca se quedan viejos.</p></li>
    </ol></section>

  <section aria-labelledby="t-yo"><h2 id="t-yo">Quién lo ha hecho</h2>
    <div class="panel autor">
      <p><b>Ignacio Egea Villalba</b> · Madrid</p>
      <ul>
        <li>Grado en Diseño de Productos Interactivos (U-tad).</li>
        <li>Máster en Marketing Digital (UCM), con premio al mejor TFM.</li>
        <li>Máster en Big Data, Data Science y Business Analytics (UCM), en curso.</li>
        <li>Experiencia en marketing digital, UX, e-learning y en el lanzamiento de un videojuego free-to-play con más de 5.000 descargas en Steam.</li>
      </ul>
      <div class="botones"><a class="boton principal" href="https://www.linkedin.com/in/nacho-egea/">${icono("comunidad_toxicidad")} LinkedIn</a>
        <a class="boton" href="https://web-portfolio-psi-eosin.vercel.app/">${icono("juegos")} Portfolio</a>
        <a class="boton" href="https://github.com/IgnacioEgea/voz-del-jugador">${icono("metodo")} Código</a></div>
    </div></section>

  <section aria-labelledby="t-habilidades"><h2 id="t-habilidades">Cómo encaja con mis habilidades</h2>
    <div class="habilidades">${habilidades.map(([i, t, p]) => `<div class="panel">${icono(i, 40)}<h3>${t}</h3><p>${p}</p></div>`).join("")}</div>
  </section>`;
}
