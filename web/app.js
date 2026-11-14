// Dibuja la web a partir de data.json: portada, cartas de los juegos y la ficha del juego elegido.
// Todo sale de los datos: cuando se regeneran, la web se actualiza sola.

const NOMBRES = {
  jugabilidad: "Jugabilidad", monetizacion: "Monetización", bugs_rendimiento: "Bugs y rendimiento",
  contenido_actualizaciones: "Contenido y actualizaciones", graficos_arte: "Gráficos y arte",
  comunidad_toxicidad: "Comunidad", matchmaking_balance: "Matchmaking y balance",
};
const RAREZAS = { legendaria: "Legendaria", epica: "Épica", rara: "Rara", comun: "Común" };
const $ = (id) => document.getElementById(id);
const miles = (n) => n.toLocaleString("es-ES");

// Protege el texto de las reseñas para que nunca se interprete como código HTML
const seguro = (texto) => texto.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Color de la barra: verde si hablan bien, gris si está dividido, rojo si hablan mal
const colorBarra = (pos) => (pos >= 55 ? "var(--bien)" : pos >= 35 ? "var(--medio)" : "var(--mal)");

// Las barras crecen desde cero cuando aparecen en pantalla, como los stats de un personaje
const crecer = (zona) => new IntersectionObserver((vistas, observador) => vistas.forEach((v) => {
  if (!v.isIntersecting) return;
  v.target.querySelectorAll(".barra i").forEach((b) => (b.style.width = `${b.dataset.ancho}%`));
  observador.disconnect();
})).observe(zona);

// Los aspectos con datos suficientes de un juego, del mejor al peor valorado
const aspectosDe = (juego) =>
  Object.entries(juego.aspectos).filter(([, a]) => a).map(([clave, a]) => ({ clave, ...a })).sort((x, y) => y.pos - x.pos);

function pintarPortada(datos) {
  $("resumen").textContent = `${miles(datos.total)} reseñas de ${datos.juegos.length} shooters free-to-play. ` +
    `La IA ya ha leído ${miles(datos.clasificadas)} y las ha separado por aspecto: jugabilidad, monetización, bugs…`;

  // Mientras la IA no haya terminado, avisamos de que los datos son provisionales
  if (datos.clasificadas < datos.total) {
    $("aviso").hidden = false;
    $("aviso").textContent = `⏳ Datos provisionales: la IA lleva ${Math.round(datos.clasificadas / datos.total * 100)} % de las reseñas. ` +
      "La web se actualiza sola cada vez que avanza.";
  }

  // Hallazgo 1: el aspecto peor valorado de todos los juegos
  const peor = datos.juegos.flatMap((j) => aspectosDe(j).map((a) => ({ ...a, juego: j.juego })))
    .sort((x, y) => x.pos - y.pos)[0];
  // Hallazgo 2: el juego donde más cae la opinión de novatos a veteranos
  const caida = datos.juegos.map((j) => ({ juego: j.juego, puntos: j.perfiles.novato - j.perfiles.veterano }))
    .sort((x, y) => y.puntos - x.puntos)[0];

  const hallazgos = [
    peor && [`${peor.pos} %`, `de las opiniones sobre ${NOMBRES[peor.clave].toLowerCase()} en ${peor.juego} son positivas`, "var(--mal)"],
    [`−${caida.puntos} pts`, `recomiendan los veteranos de ${caida.juego} frente a los novatos`, "var(--legendaria)"],
  ].filter(Boolean);
  $("hallazgos").innerHTML = hallazgos
    .map(([num, frase, color]) => `<div class="hallazgo"><strong style="color:${color}">${num}</strong>${frase}</div>`).join("");
}

// Nombre del archivo del emblema: "THE FINALS" → "the-finals"
const emblema = (juego) => `img/${juego.toLowerCase().replace(/ /g, "-")}.webp`;
// Nivel del 1 al 10 a partir del % de menciones positivas, como el nivel de un personaje
const nivel = (pos) => Math.max(1, Math.round(pos / 10));

function dorso(j) {
  // Detrás de la carta: su mejor y su peor aspecto, en niveles
  const aspectos = aspectosDe(j);
  if (!aspectos.length) return `<small>La IA está leyendo sus reseñas…</small>`;
  const [mejor, peor] = [aspectos[0], aspectos[aspectos.length - 1]];
  return `<small>Punto fuerte</small><div class="nivel"><span>${NOMBRES[mejor.clave]}</span><b>Lv. ${nivel(mejor.pos)}</b></div>
    <small>Punto débil</small><div class="nivel"><span>${NOMBRES[peor.clave]}</span><b style="color:var(--mal)">Lv. ${nivel(peor.pos)}</b></div>
    <small>Pulsa para ver la ficha completa ↓</small>`;
}

function pintarCartas(datos) {
  // Una carta por juego: delante el emblema y la rareza, detrás sus puntos fuerte y débil
  $("cartas").innerHTML = datos.juegos.map((j, i) => `
    <button class="carta ${j.rareza}" data-i="${i}" aria-pressed="false" aria-label="${j.juego}, carta ${RAREZAS[j.rareza]}">
      <div class="carta-int">
        <div class="cara frente">
          <img src="${emblema(j.juego)}" alt="" width="512" height="512" loading="lazy">
          <h3>${j.juego}</h3>
          <span class="rareza">${RAREZAS[j.rareza]} · ${j.recomienda} %</span>
          <small>${j.clasificadas ? `${miles(j.clasificadas)} reseñas analizadas` : "La IA las está leyendo…"}</small>
        </div>
        <div class="cara dorso">${dorso(j)}</div>
      </div>
    </button>`).join("");

  // Al pulsar una carta: se gira y se abre su ficha debajo
  $("cartas").addEventListener("click", (e) => {
    const carta = e.target.closest(".carta");
    if (!carta) return;
    document.querySelectorAll(".carta").forEach((c) => c.setAttribute("aria-pressed", c === carta));
    pintarFicha(datos.juegos[carta.dataset.i]);
    if (!e.isTrusted) return;
    carta.classList.toggle("girada");
    $("ficha").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // La carta se inclina y el brillo sigue al ratón (salvo si la persona prefiere menos movimiento)
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  $("cartas").addEventListener("pointermove", (e) => {
    const carta = e.target.closest(".carta");
    if (!carta) return;
    const caja = carta.getBoundingClientRect();
    const x = (e.clientX - caja.left) / caja.width, y = (e.clientY - caja.top) / caja.height;
    carta.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
    carta.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    carta.style.setProperty("--mx", `${x * 100}%`);
    carta.style.setProperty("--my", `${y * 100}%`);
  });
  $("cartas").addEventListener("pointerout", (e) => {
    const carta = e.target.closest(".carta");
    if (carta && !carta.contains(e.relatedTarget)) ["--rx", "--ry"].forEach((v) => carta.style.removeProperty(v));
  });
}

function pintarFicha(juego) {
  const ficha = $("ficha");
  const aspectos = aspectosDe(juego);
  ficha.className = `ficha ${juego.rareza}`;
  ficha.style.setProperty("--r", `var(--${juego.rareza})`);

  if (!aspectos.length) {
    ficha.innerHTML = `<h3>${juego.juego}</h3><p class="nota">La IA todavía está leyendo sus reseñas. Vuelve en un rato.</p>`;
    return;
  }

  // La voz real del aspecto peor valorado, para poner cara a los números
  const peor = aspectos[aspectos.length - 1];
  ficha.innerHTML = `
    <h3>${juego.juego}</h3>
    <p class="nota">% de menciones positivas por aspecto · ${miles(juego.clasificadas)} reseñas analizadas</p>
    ${aspectos.map((a) => `
      <div class="stat">
        <div class="stat-nombre"><span>${NOMBRES[a.clave]}</span><span>${a.pos} % <small class="nota">· ${miles(a.menciones)} menciones</small></span></div>
        <div class="barra" role="img" aria-label="${NOMBRES[a.clave]}: ${a.pos} % positivo"><i data-ancho="${a.pos}" style="background:${colorBarra(a.pos)}"></i></div>
      </div>`).join("")}
    <blockquote class="voz">“${seguro(peor.voz.texto)}” — jugador con ${Math.round(peor.voz.horas)} h, sobre ${NOMBRES[peor.clave].toLowerCase()}</blockquote>`;

  crecer(ficha);
}

function pintarPerfiles(datos) {
  // Para cada juego, tres barras: cuánto lo recomiendan novatos, medios y veteranos
  const PERFILES = [["novato", "Novatos"], ["medio", "Medios"], ["veterano", "Veteranos"]];
  $("perfiles").innerHTML = datos.juegos.map((j) => {
    const caida = j.perfiles.novato - j.perfiles.veterano;
    const cambio = caida > 0 ? `−${caida} pts` : `+${-caida} pts`;
    return `<div class="perfil ${j.rareza}">
      <h3>${j.juego} <small class="nota">${cambio} de novato a veterano</small></h3>
      ${PERFILES.map(([clave, texto]) => `
        <div class="fila"><span>${texto}</span>
          <div class="barra"><i data-ancho="${j.perfiles[clave]}" style="background:var(--r)"></i></div>
          <span>${j.perfiles[clave]} %</span></div>`).join("")}
    </div>`;
  }).join("");
  crecer($("perfiles"));
}

// Cargamos los datos y dibujamos todo; abrimos la ficha del primer juego que ya tenga análisis
fetch("data.json")
  .then((r) => r.json())
  .then((datos) => {
    pintarPortada(datos);
    pintarCartas(datos);
    pintarPerfiles(datos);
    const primero = datos.juegos.findIndex((j) => j.clasificadas);
    if (primero >= 0) document.querySelector(`.carta[data-i="${primero}"]`).click();
  });
