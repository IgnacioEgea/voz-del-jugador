// Arranque de la web: carga los datos con una pantalla de carga y cambia de "pantalla" según el enlace (#/...).
// Aquí viven también las piezas pequeñas que usan todas las pantallas (nombres, colores, barras).

const NOMBRES = {
  jugabilidad: "Jugabilidad", monetizacion: "Monetización", bugs_rendimiento: "Bugs y rendimiento",
  contenido_actualizaciones: "Contenido y actualizaciones", graficos_arte: "Gráficos y arte",
  comunidad_toxicidad: "Comunidad", matchmaking_balance: "Matchmaking y balance",
};
const ICONOS = {
  jugabilidad: "🎮", monetizacion: "💸", bugs_rendimiento: "🛠️", contenido_actualizaciones: "🆕",
  graficos_arte: "✨", comunidad_toxicidad: "🤝", matchmaking_balance: "⚖️",
};
const RAREZAS = { legendaria: "Legendaria", epica: "Épica", rara: "Rara", comun: "Común" };
const datos = { juegos: [] };  // Se rellena al cargar data.json
const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Piezas pequeñas que se usan en todas partes
const $ = (id) => document.getElementById(id);
const miles = (n) => n.toLocaleString("es-ES");
const slug = (juego) => juego.toLowerCase().replace(/ /g, "-");
const emblema = (juego) => `img/${slug(juego)}.webp`;
const nivel = (pos) => Math.max(1, Math.round(pos / 10));
const juegoPorSlug = (s) => datos.juegos.find((j) => slug(j.juego) === s);
const colorBarra = (pos) => (pos >= 55 ? "var(--bien)" : pos >= 35 ? "var(--medio)" : "var(--mal)");
const terminado = () => datos.clasificadas >= datos.total;

// Protege el texto de las reseñas para que nunca se interprete como código HTML
const seguro = (texto) => texto.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Los aspectos con datos suficientes de un juego, del mejor al peor valorado
const aspectosDe = (juego) =>
  Object.entries(juego.aspectos).filter(([, a]) => a).map(([clave, a]) => ({ clave, ...a })).sort((x, y) => y.pos - x.pos);

// Una barra de stats con su nombre, su % y su nivel
const barra = (texto, pos, extra = "") => `
  <div class="stat">
    <div class="stat-nombre"><span>${texto}</span><span>${extra}<b>${pos} %</b></span></div>
    <div class="barra" role="img" aria-label="${texto}: ${pos} %"><i data-ancho="${pos}" style="background:${colorBarra(pos)}"></i></div>
  </div>`;

// Las barras crecen desde cero cuando aparecen en pantalla, como los stats de un personaje
function crecer(zona = document) {
  const observador = new IntersectionObserver((vistas) => vistas.forEach((v) => {
    if (!v.isIntersecting) return;
    v.target.style.width = `${v.target.dataset.ancho}%`;
    observador.unobserve(v.target);
  }));
  zona.querySelectorAll(".barra i").forEach((b) => observador.observe(b));
}

// Cada ruta del enlace (#/algo) corresponde a una pantalla: vistaAlgo() la dibuja y activarAlgo() le da vida
const RUTAS = {
  "": "Inicio", encuentra: "Encuentra", juegos: "Juegos", juego: "Juego", comparar: "Comparar",
  explorar: "Explorar", conclusiones: "Conclusiones", metodo: "Metodo",
};

function navegar() {
  const [ruta = "", parametro] = location.hash.replace(/^#\/?/, "").split("/");
  const nombre = RUTAS[ruta] ?? "Inicio";
  const pintar = () => {
    $("vista").innerHTML = window[`vista${nombre}`](parametro);
    window[`activar${nombre}`]?.(parametro);
    crecer($("vista"));
    // Marcamos en el menú la sección en la que estás
    document.querySelectorAll(".hud a").forEach((a) =>
      a.dataset.ruta === (ruta === "juego" ? "juegos" : ruta) ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
    scrollTo({ top: 0, behavior: "instant" });
    $("vista").focus({ preventScroll: true });
  };
  // Transición suave entre pantallas en los navegadores que la soportan
  document.startViewTransition && !quieto ? document.startViewTransition(pintar) : pintar();
}

// Barra de "experiencia": se llena según lo que llevas leído de la pantalla
addEventListener("scroll", () => {
  const total = document.documentElement.scrollHeight - innerHeight;
  $("xp").style.width = `${total > 0 ? (scrollY / total) * 100 : 0}%`;
}, { passive: true });

// Pantalla de carga con consejos, como al entrar en una partida
const CONSEJOS = [
  "Consejo: en «Encuentra» marca lo que te importa y te recomendamos un juego.",
  "Consejo: pasa el ratón por una carta para ver su punto fuerte y su punto débil.",
  "¿Sabías que…? La rareza de cada carta sale del % de jugadores que lo recomiendan.",
  "Consejo: en «Comparar» puedes enfrentar dos juegos aspecto por aspecto.",
];
async function arrancar() {
  let i = 0;
  const rotar = setInterval(() => ($("consejo").textContent = CONSEJOS[i++ % CONSEJOS.length]), 1200);
  try {
    const [cargados] = await Promise.all([fetch("data.json").then((r) => r.json()), new Promise((r) => setTimeout(r, quieto ? 0 : 900))]);
    Object.assign(datos, cargados);
    navegar();
    $("carga").classList.add("fuera");
    setTimeout(() => $("carga").remove(), 700);
  } catch {
    $("consejo").textContent = "No se han podido cargar los datos. Recarga la página en un momento.";
  } finally {
    clearInterval(rotar);
  }
}

addEventListener("hashchange", navegar);
arrancar();
