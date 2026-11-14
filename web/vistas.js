// Pantallas principales: inicio, galería de cartas y ficha completa de cada juego.
// Cada vistaX() devuelve el HTML de la pantalla y activarX() le añade movimiento y botones.

// Una carta coleccionable: delante el emblema, detrás el punto fuerte y el débil (se gira al pasar el ratón)
function carta(j) {
  const aspectos = aspectosDe(j);
  const [mejor, peor] = [aspectos[0], aspectos[aspectos.length - 1]];
  const dorso = aspectos.length
    ? `<small>Punto fuerte</small><p class="nivel">${ICONOS[mejor.clave]} ${NOMBRES[mejor.clave]} <b>Lv. ${nivel(mejor.pos)}</b></p>
       <small>Punto débil</small><p class="nivel">${ICONOS[peor.clave]} ${NOMBRES[peor.clave]} <b class="rojo">Lv. ${nivel(peor.pos)}</b></p>
       <span class="ver">Ver ficha →</span>`
    : `<small>La IA aún está leyendo sus reseñas…</small><span class="ver">Ver ficha →</span>`;
  return `<a class="carta ${j.rareza}" data-genero="${j.genero}" href="#/juego/${slug(j.juego)}" aria-label="${j.juego}: carta ${RAREZAS[j.rareza]}, ${j.recomienda} % lo recomienda">
    <div class="carta-int">
      <div class="cara frente">
        ${portada(j, "carta-portada")}
        <div class="carta-info"><h3>${j.juego}</h3>
          <span class="rareza">${RAREZAS[j.rareza]} · ${j.recomienda} %</span></div>
      </div>
      <div class="cara dorso">${dorso}</div>
    </div></a>`;
}

// Las cartas se inclinan siguiendo el ratón y el brillo holográfico se mueve con él
function inclinar(zona) {
  if (quieto || !matchMedia("(hover: hover)").matches) return;
  zona.addEventListener("pointermove", (e) => {
    const c = e.target.closest(".carta");
    if (!c) return;
    const caja = c.getBoundingClientRect();
    const x = (e.clientX - caja.left) / caja.width, y = (e.clientY - caja.top) / caja.height;
    c.style.cssText = `--ry:${(x - 0.5) * 18}deg;--rx:${(0.5 - y) * 18}deg;--mx:${x * 100}%;--my:${y * 100}%`;
  });
  zona.addEventListener("pointerout", (e) => {
    const c = e.target.closest(".carta");
    if (c && !c.contains(e.relatedTarget)) c.style.cssText = "";
  });
}

// Kill feed: frases reales de jugadores pasando como el registro de bajas de un shooter
function feed() {
  const voces = datos.juegos.flatMap((j) => aspectosDe(j).map((a) => ({ j, a })));
  const corta = (t) => (t.length > 90 ? `${t.slice(0, 90).replace(/\s\S*$/, "")}…` : t);
  const tira = voces.map(({ j, a }) => `<span class="baja ${j.rareza}"><b>${j.juego}</b> ${a.voz.recomienda ? "👍" : "👎"}
    “${seguro(corta(a.voz.es ?? a.voz.texto))}” <small>${Math.round(a.voz.horas)} h · ${NOMBRES[a.clave]}</small></span>`).join("");
  return voces.length ? `<section class="feed" aria-label="Frases reales de jugadores">
    <div class="feed-pista" style="animation-duration:${voces.length * 7}s">${tira}${tira}</div></section>` : "";
}

function vistaInicio() {
  const h = hallazgos();
  return `
  <header class="portada">
    <img class="portada-arte" src="img/portada-1600.webp" srcset="img/portada-800.webp 800w, img/portada-1600.webp 1600w"
      sizes="(max-width: 700px) 100vw, 900px" alt="" fetchpriority="high">
    <p class="etiqueta">// ${miles(datos.total)} reseñas de Steam · ${datos.juegos.length} juegos free-to-play · analizadas con IA</p>
    <h1>¿Por qué los jugadores recomiendan o abandonan un juego free‑to‑play?</h1>
    <p class="subtitulo">Leímos lo que escriben los jugadores en Steam y una IA lo separó por temas: jugabilidad, monetización,
      bugs, matchmaking… El resultado sirve para elegir a qué jugar y para que los estudios sepan qué arreglar.</p>
    ${terminado() ? "" : `<p class="aviso">⏳ Datos provisionales: la IA lleva el ${Math.round(datos.clasificadas / datos.total * 100)} % de las reseñas. La web se actualiza sola.</p>`}
    <div class="hallazgos">${h.map(([num, frase, color]) =>
      `<div class="hallazgo"><strong style="color:${color}" data-contar>${num}</strong><p>${frase}</p></div>`).join("")}</div>
    <div class="botones">
      <a class="boton principal" href="#/encuentra">🎯 Encuentra tu juego</a>
      <a class="boton" href="#/conclusiones">📊 Ver conclusiones</a>
    </div>
  </header>
  ${feed()}
  <section aria-labelledby="t-pasos">
    <h2 id="t-pasos">Cómo funciona</h2>
    <ol class="pasos">
      <li><b>01 · Escuchamos</b><p>Descargamos ${miles(datos.total)} reseñas recientes de Steam de ${datos.juegos.length} juegos gratuitos.</p></li>
      <li><b>02 · La IA lee</b><p>Cada reseña se separa en 7 temas y se marca si habla bien o mal de cada uno.</p></li>
      <li><b>03 · Tú decides</b><p>Elige juego como jugador, o descubre qué arreglar si trabajas en un estudio.</p></li>
    </ol>
  </section>
  <section aria-labelledby="t-cartas">
    <h2 id="t-cartas">Elige tu juego</h2>
    <p class="nota">Pasa el ratón por una carta para girarla. Púlsala para ver su ficha completa.</p>
    <div class="cartas" id="cartas">${datos.juegos.map(carta).join("")}</div>
  </section>`;
}

// Los titulares de la portada se calculan solos a partir de los datos
function hallazgos() {
  const todos = datos.juegos.flatMap((j) => aspectosDe(j).map((a) => ({ ...a, juego: j.juego })));
  const peor = todos.sort((x, y) => x.pos - y.pos)[0];
  const caida = datos.juegos.map((j) => ({ juego: j.juego, d: j.perfiles.novato - j.perfiles.veterano })).sort((x, y) => y.d - x.d)[0];
  const top = datos.juegos[0];
  return [
    peor && [`${peor.pos} %`, `de las opiniones sobre ${NOMBRES[peor.clave].toLowerCase()} en ${peor.juego} son positivas`, "var(--mal)"],
    [`−${caida.d} pts`, `recomiendan los veteranos de ${caida.juego} frente a los novatos`, "var(--legendaria)"],
    [`${top.recomienda} %`, `de los jugadores recomienda ${top.juego}, el mejor valorado`, "var(--bien)"],
  ].filter(Boolean);
}

function activarInicio() {
  inclinar($("cartas"));
  // Las cifras grandes cuentan desde cero, como un marcador
  if (quieto) return;
  document.querySelectorAll("[data-contar]").forEach((el) => {
    const final = el.textContent, numero = parseInt(final.replace(/\D/g, ""), 10);
    let inicio;
    const paso = (t) => {
      inicio ??= t;
      const avance = Math.min((t - inicio) / 1100, 1);
      el.textContent = final.replace(/\d+/, Math.round(numero * (1 - (1 - avance) ** 3)));
      if (avance < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
}

function vistaJuegos() {
  return `<header class="cabecera"><p class="etiqueta">// Selección de personaje</p><h1>Elige tu juego</h1>
    <p class="subtitulo">Cada juego es una carta. Su rareza depende del % de jugadores que lo recomiendan:
      <span class="chip legendaria">Legendaria ≥ 80 %</span> <span class="chip epica">Épica ≥ 65 %</span>
      <span class="chip rara">Rara ≥ 50 %</span> <span class="chip comun">Común &lt; 50 %</span></p></header>
    <div class="deseos" id="generos" role="group" aria-label="Filtrar por género">${["Todos", ...new Set(datos.juegos.map((j) => j.genero))]
      .map((g, i) => `<button class="deseo" data-genero="${g}" aria-pressed="${i === 0}">${g}</button>`).join("")}</div>
    <div class="cartas grandes" id="cartas">${datos.juegos.map(carta).join("")}</div>`;
}
function activarJuegos() {
  inclinar($("cartas"));
  // Filtro por género: escondemos las cartas que no son de ese tipo de juego
  $("generos").addEventListener("click", (e) => {
    const boton = e.target.closest(".deseo");
    if (!boton) return;
    document.querySelectorAll("#generos .deseo").forEach((b) => b.setAttribute("aria-pressed", b === boton));
    document.querySelectorAll("#cartas .carta").forEach((c) =>
      (c.hidden = boton.dataset.genero !== "Todos" && c.dataset.genero !== boton.dataset.genero));
  });
}
