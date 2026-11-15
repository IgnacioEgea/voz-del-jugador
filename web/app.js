// Arranque de la web: carga los datos con una pantalla de carga y cambia de "pantalla" según el enlace (#/...).
// Aquí viven también las piezas pequeñas que usan todas las pantallas (nombres, colores, barras).

const NOMBRES = {
  jugabilidad: "Jugabilidad", monetizacion: "Monetización", bugs_rendimiento: "Bugs y rendimiento",
  contenido_actualizaciones: "Contenido y actualizaciones", graficos_arte: "Gráficos y arte",
  comunidad_toxicidad: "Comunidad", matchmaking_balance: "Matchmaking y balance",
};
// Iconos de interfaz (ilustraciones originales generadas con IA, en img/iconos/)
const icono = (nombre, tam = 22) => `<img class="icono" src="img/iconos/${nombre}.webp" alt="" width="${tam}" height="${tam}" loading="lazy">`;
const ICONOS = Object.fromEntries(Object.keys(NOMBRES).map((k) => [k, icono(k)]));
const RAREZAS = { legendaria: "Legendaria", epica: "Épica", rara: "Rara", comun: "Común" };
const datos = { juegos: [] };  // Se rellena al cargar data.json
const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Piezas pequeñas que se usan en todas partes
const $ = (id) => document.getElementById(id);
const miles = (n) => n.toLocaleString("es-ES");
const slug = (juego) => juego.toLowerCase().replace(/ /g, "-");
const emblema = (juego) => `img/${slug(juego)}.webp`;
// Portada oficial del juego, servida desde la tienda de Steam; si falla, enseñamos nuestra ilustración
const portada = (j, clase = "", ancho = 600) => `<img class="${clase}" src="${j.portada}" alt="Portada de ${j.juego}"
  width="${ancho}" height="${ancho * 1.5}" loading="lazy" decoding="async" referrerpolicy="no-referrer"
  onerror="this.onerror=null;this.src='img/portada-800.webp'">`;
const nivel = (pos) => Math.max(1, Math.round(pos / 10));
const juegoPorSlug = (s) => datos.juegos.find((j) => slug(j.juego) === s);
const colorBarra = (pos) => (pos >= 55 ? "var(--bien)" : pos >= 35 ? "var(--medio)" : "var(--mal)");
const terminado = () => datos.clasificadas >= datos.total;

// Protege el texto de las reseñas para que nunca se interprete como código HTML
const seguro = (texto) => texto.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Los aspectos con datos suficientes de un juego, del mejor al peor valorado
const aspectosDe = (juego) =>
  Object.entries(juego.aspectos).filter(([, a]) => a).map(([clave, a]) => ({ clave, ...a })).sort((x, y) => y.pos - x.pos);

// Símbolos pequeños dibujados a mano en SVG, con brillo neón (sustituyen a los emojis, que cada sistema pinta distinto)
const TRAZOS = {
  hotfix: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z",
  buff: "m17 11-5-5-5 5M17 18l-5-5-5 5",
  si: "M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9Z",
  no: "M17 14V2M9 18.1 10 14H4.2a2 2 0 0 1-1.9-2.6l2.3-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.8a2 2 0 0 0-1.8 1.1L12 22a3.1 3.1 0 0 1-3-3.9Z",
  info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 16v-4M12 8h.01",
  espera: "M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2",
  aviso: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
};
const simbolo = (n) => `<svg class="simbolo ${n}" viewBox="0 0 24 24" aria-hidden="true"><path d="${TRAZOS[n]}"/></svg>`;
const pulgar = (si) => simbolo(si ? "si" : "no");

// Una barra de stats con su nombre, su % y su nivel
const barra = (texto, pos, extra = "") => `
  <div class="stat">
    <div class="stat-nombre"><span>${texto}</span><span>${extra}<b>${pos} %</b></span></div>
    <div class="barra" role="img" aria-label="${texto.replace(/<[^>]*>/g, "").trim()}: ${pos} %"><i data-ancho="${pos}" style="background:${colorBarra(pos)}"></i></div>
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
  explorar: "Explorar", conclusiones: "Conclusiones", metodo: "Metodo", sobre: "Sobre",
};

function navegar() {
  const [ruta = "", parametro] = location.hash.replace(/^#\/?/, "").split("/");
  const nombre = RUTAS[ruta] ?? "Inicio";
  const pintar = () => {
    $("vista").innerHTML = window[`vista${nombre}`](parametro);
    window[`activar${nombre}`]?.(parametro);
    window.logro?.(ruta, parametro);  // Logros por visitar secciones (logros.js)
    crecer($("vista"));
    // Marcamos en el menú la sección en la que estás
    document.querySelectorAll(".ranuras a").forEach((a) =>
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
  "Consejo: pulsa / para buscar cualquier juego o sección al instante.",
  "Consejo: pasa el ratón por una carta para ver su punto fuerte y su punto débil.",
  "¿Sabías que…? La rareza de cada carta sale del % de jugadores que lo recomiendan.",
  "Consejo: en «Comparar» puedes enfrentar dos juegos aspecto por aspecto.",
];
async function arrancar() {
  let i = 0;
  const rotar = setInterval(() => ($("consejo").textContent = CONSEJOS[i++ % CONSEJOS.length]), 1200);
  try {
    const [cargados] = await Promise.all([fetch("data.json", { cache: "no-cache" }).then((r) => r.json()), new Promise((r) => setTimeout(r, quieto ? 0 : 900))]);
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
