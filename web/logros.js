// Extras para que la web se sienta como un juego: logros con insignias, avisos emergentes,
// buscador rápido (tecla /) y botón de compartir. Las insignias son los emblemas originales que generamos.

const LOGROS = {
  inicio: { nombre: "Primera partida", texto: "Entraste en La voz del jugador", img: "team-fortress-2" },
  encuentra: { nombre: "Elegido", texto: "Usaste el recomendador", img: "paladins" },
  comparar: { nombre: "Duelo", texto: "Enfrentaste dos juegos", img: "overwatch-2" },
  explorar: { nombre: "Explorador", texto: "Abriste la base de reseñas", img: "apex-legends" },
  conclusiones: { nombre: "Rompe-mitos", texto: "Leíste las conclusiones", img: "the-finals" },
  coleccionista: { nombre: "Coleccionista", texto: "Viste 5 fichas de juegos distintas", img: "marvel-rivals" },
};

// Guardamos los logros en el navegador (si el navegador no deja, simplemente no se recuerdan)
const memoria = {
  leer: (clave, vacio) => { try { return JSON.parse(localStorage.getItem(clave)) ?? vacio; } catch { return vacio; } },
  guardar: (clave, valor) => { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin memoria */ } },
};
let conseguidos = memoria.leer("logros", []);
const fichasVistas = new Set(memoria.leer("fichas", []));

// Aviso pequeño en una esquina, como cuando desbloqueas algo en un juego
function aviso(html) {
  const caja = document.createElement("div");
  caja.className = "toast";
  caja.setAttribute("role", "status");
  caja.innerHTML = html;
  document.body.append(caja);
  setTimeout(() => caja.classList.add("fuera"), 3200);
  setTimeout(() => caja.remove(), 3800);
}

function desbloquear(id) {
  if (conseguidos.includes(id)) return;
  conseguidos.push(id);
  memoria.guardar("logros", conseguidos);
  pintarContador();
  const l = LOGROS[id];
  aviso(`<img src="img/${l.img}.webp" alt="" width="48" height="48"><div><small>🏆 ¡Logro desbloqueado!</small><b>${l.nombre}</b><span>${l.texto}</span></div>`);
}

// app.js llama a esta función cada vez que cambias de pantalla
window.logro = (ruta, parametro) => {
  if (LOGROS[ruta || "inicio"]) desbloquear(ruta || "inicio");
  if (ruta === "juego" && parametro) {
    fichasVistas.add(parametro);
    memoria.guardar("fichas", [...fichasVistas]);
    if (fichasVistas.size >= 5) desbloquear("coleccionista");
  }
};

const pintarContador = () => ($("cuenta-logros").textContent = `${conseguidos.length}/${Object.keys(LOGROS).length}`);

// Ventana emergente reutilizable (logros y buscador)
function ventana(html) {
  const d = document.createElement("dialog");
  d.className = "ventana";
  d.innerHTML = `<button class="cerrar" aria-label="Cerrar">✕</button>${html}`;
  d.addEventListener("close", () => d.remove());
  d.addEventListener("click", (e) => (e.target === d || e.target.closest(".cerrar") || e.target.closest("a")) && d.close());
  document.body.append(d);
  d.showModal();
  return d;
}

function verLogros() {
  ventana(`<h2>Tus logros</h2><p class="nota">${conseguidos.length} de ${Object.keys(LOGROS).length}. Se guardan en este navegador.</p>
    <ul class="logros">${Object.entries(LOGROS).map(([id, l]) => `<li class="${conseguidos.includes(id) ? "" : "bloqueado"}">
      <img src="img/${l.img}.webp" alt="" width="64" height="64"><b>${l.nombre}</b><small>${l.texto}</small></li>`).join("")}</ul>`);
}

// Buscador rápido: escribe y salta a cualquier juego o sección
function buscar() {
  const secciones = [["Inicio", "#/"], ["Encuentra tu juego", "#/encuentra"], ["Juegos", "#/juegos"], ["Comparar", "#/comparar"],
    ["Explorar reseñas", "#/explorar"], ["Conclusiones", "#/conclusiones"], ["Método", "#/metodo"]];
  const opciones = [...datos.juegos.map((j) => [`🃏 ${j.juego} · ${j.genero}`, `#/juego/${slug(j.juego)}`]), ...secciones.map(([t, h]) => [`➜ ${t}`, h])];
  const d = ventana(`<input type="search" id="buscar-q" placeholder="Busca un juego o una sección…" aria-label="Buscar">
    <ul class="resultados" id="buscar-res"></ul>`);
  const pintar = () => {
    const q = $("buscar-q").value.toLowerCase();
    $("buscar-res").innerHTML = opciones.filter(([t]) => t.toLowerCase().includes(q)).slice(0, 8)
      .map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("") || `<li class="nota">Nada por aquí.</li>`;
  };
  $("buscar-q").addEventListener("input", pintar);
  $("buscar-q").addEventListener("keydown", (e) => e.key === "Enter" && d.querySelector(".resultados a")?.click());
  pintar();
}

// Compartir la ficha de un juego: menú nativo del móvil o, si no hay, copiar el enlace
document.addEventListener("click", async (e) => {
  const boton = e.target.closest("[data-compartir]");
  if (!boton) return;
  const datosCompartir = { title: `${boton.dataset.compartir} · La voz del jugador`, url: location.href };
  try {
    if (navigator.share) await navigator.share(datosCompartir);
    else { await navigator.clipboard.writeText(location.href); aviso("<div><b>🔗 Enlace copiado</b><span>Pégalo donde quieras.</span></div>"); }
  } catch { /* La persona canceló */ }
});

$("abrir-logros").addEventListener("click", verLogros);
$("abrir-buscar").addEventListener("click", buscar);
addEventListener("keydown", (e) => {
  if (e.key === "/" && !/input|select|textarea/i.test(document.activeElement.tagName) && !document.querySelector("dialog[open]")) {
    e.preventDefault();
    buscar();
  }
});
pintarContador();
