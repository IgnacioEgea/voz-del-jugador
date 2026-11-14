// Herramientas interactivas: "Encuentra tu juego", el comparador "versus" y el explorador de reseñas.

// ——— Encuentra tu juego: marcas lo que te importa y ordenamos los juegos ———
const DESEOS = {
  jugabilidad: "🎮 Que sea divertido", matchmaking_balance: "⚖️ Partidas justas", monetizacion: "💸 Sin pay-to-win",
  bugs_rendimiento: "🛠️ Que vaya fino", comunidad_toxicidad: "🤝 Comunidad sana",
  contenido_actualizaciones: "🆕 Contenido nuevo", graficos_arte: "✨ Que entre por los ojos",
};

function vistaEncuentra() {
  return `<header class="cabecera"><p class="etiqueta">// Recomendador</p><h1>Encuentra tu juego</h1>
    <p class="subtitulo">Marca lo que más te importa. Ordenamos los juegos según lo que opinan miles de jugadores sobre esas cosas.</p></header>
    <div class="deseos" id="deseos">${Object.entries(DESEOS).map(([k, t]) =>
      `<button class="deseo" data-clave="${k}" aria-pressed="${k === "jugabilidad" || k === "matchmaking_balance"}">${t}</button>`).join("")}</div>
    <div class="recomendados" id="recomendados" aria-live="polite"></div>`;
}

function activarEncuentra() {
  const pintar = () => {
    const marcados = [...document.querySelectorAll('.deseo[aria-pressed="true"]')].map((b) => b.dataset.clave);
    if (!marcados.length) return ($("recomendados").innerHTML = `<p class="nota">Marca al menos una cosa que te importe.</p>`);
    // La afinidad de cada juego es la media de opiniones positivas en lo que has marcado
    const ranking = datos.juegos.filter((j) => marcados.every((k) => j.aspectos[k])).map((j) => ({
      j, afinidad: Math.round(marcados.reduce((s, k) => s + j.aspectos[k].pos, 0) / marcados.length),
      peor: [...marcados].sort((x, y) => j.aspectos[x].pos - j.aspectos[y].pos)[0],
    })).sort((x, y) => y.afinidad - x.afinidad);
    const faltan = datos.juegos.length - ranking.length;
    $("recomendados").innerHTML = ranking.map(({ j, afinidad, peor }, i) => `
      <a class="recomendado ${j.rareza}" href="#/juego/${slug(j.juego)}" style="animation-delay:${i * 60}ms">
        <span class="puesto">${["🥇", "🥈", "🥉"][i] ?? `#${i + 1}`}</span>
        ${portada(j, "mini", 64)}
        <div><h3>${j.juego}</h3><small>Ojo con: ${NOMBRES[peor].toLowerCase()} (${j.aspectos[peor].pos} % positivo)</small></div>
        <strong>${afinidad} %<small>afinidad</small></strong>
      </a>`).join("") + (faltan ? `<p class="nota">${faltan} juego(s) aún sin datos suficientes: la IA sigue leyendo.</p>` : "");
  };
  $("deseos").addEventListener("click", (e) => {
    const b = e.target.closest(".deseo");
    if (b) b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true");
    pintar();
  });
  pintar();
}

// ——— Comparar: dos juegos frente a frente, tema por tema ———
function vistaComparar(s) {
  const conDatos = datos.juegos.filter((j) => aspectosDe(j).length);
  const a = juegoPorSlug(s) ?? conDatos[0] ?? datos.juegos[0];
  const b = conDatos.find((j) => j !== a) ?? datos.juegos.find((j) => j !== a);
  const opciones = (elegido) => datos.juegos.map((j) =>
    `<option value="${slug(j.juego)}" ${j === elegido ? "selected" : ""}>${j.juego}</option>`).join("");
  return `<header class="cabecera"><p class="etiqueta">// Versus</p><h1>Comparar</h1>
    <p class="subtitulo">Enfrenta dos juegos tema por tema. En cada uno gana el que tiene más opiniones positivas.</p></header>
    <div class="versus-elegir"><select id="va" aria-label="Primer juego">${opciones(a)}</select>
      <span class="vs" aria-hidden="true">VS</span><select id="vb" aria-label="Segundo juego">${opciones(b)}</select></div>
    <div id="duelo"></div>`;
}

function duelo(a, b) {
  let [puntosA, puntosB] = [0, 0];
  const lado = (v, gana) => (v ? `<div class="barra${gana ? " gana" : ""}"><i data-ancho="${v.pos}" style="background:${colorBarra(v.pos)}"></i></div><b>${v.pos} %</b>`
    : `<span class="nota">sin datos</span>`);
  const filas = Object.keys(NOMBRES).map((k) => {
    const [x, y] = [a.aspectos[k], b.aspectos[k]];
    const ganaA = x && y && x.pos > y.pos, ganaB = x && y && y.pos > x.pos;
    puntosA += ganaA; puntosB += ganaB;
    return `<div class="fila-vs"><div class="izq">${lado(x, ganaA)}</div><span>${ICONOS[k]}<br>${NOMBRES[k]}</span><div class="der">${lado(y, ganaB)}</div></div>`;
  }).join("");
  const luchador = (j, puntos) => `<a class="luchador ${j.rareza}" href="#/juego/${slug(j.juego)}">
    ${portada(j, "luchador-img", 160)}<h3>${j.juego}</h3>
    <small>${j.recomienda} % lo recomienda</small><strong>${puntos}</strong></a>`;
  return `<div class="marcador">${luchador(a, puntosA)}<span class="vs">VS</span>${luchador(b, puntosB)}</div>${filas}`;
}

function activarComparar() {
  const pintar = () => {
    $("duelo").innerHTML = duelo(juegoPorSlug($("va").value), juegoPorSlug($("vb").value));
    crecer($("duelo"));
  };
  $("va").onchange = $("vb").onchange = pintar;
  pintar();
}

// ——— Explorar: buscador sobre la base de reseñas (se descarga solo al entrar aquí) ———
let baseResenas;
const TONOS = { pos: "positivo", neg: "negativo", neu: "neutro" };

function vistaExplorar(s) {
  const opciones = (obj, elegido) => Object.entries(obj).map(([k, t]) => `<option value="${k}" ${k === elegido ? "selected" : ""}>${t}</option>`).join("");
  const juegos = Object.fromEntries(datos.juegos.map((j) => [slug(j.juego), j.juego]));
  return `<header class="cabecera"><p class="etiqueta">// Base de datos</p><h1>Explorar reseñas</h1>
    <p class="subtitulo">Las reseñas más votadas como útiles de cada juego, ya clasificadas por la IA. Filtra y busca lo que quieras: se buscan tanto en español (traducción con IA) como en el inglés original.</p></header>
    <div class="filtros">
      <input id="q" type="search" placeholder="Buscar: lag, skins, ranked…" aria-label="Buscar en las reseñas">
      <select id="fj" aria-label="Juego"><option value="">Todos los juegos</option>${opciones(juegos, s)}</select>
      <select id="fa" aria-label="Tema"><option value="">Todos los temas</option>${opciones(NOMBRES)}</select>
      <select id="ft" aria-label="Tono"><option value="">Cualquier tono</option>${opciones(TONOS)}</select>
      <select id="fo" aria-label="Recomienda"><option value="">Recomiende o no</option>${opciones({ true: "👍 Lo recomienda", false: "👎 No lo recomienda" })}</select>
    </div>
    <p class="nota" id="cuenta"></p><div class="lista" id="lista"></div>
    <button class="boton" id="mas" hidden>Ver más reseñas</button>`;
}

function tarjeta(r, q) {
  const j = datos.juegos.find((x) => x.juego === r.j);
  // Resaltamos lo que se ha buscado dentro del texto
  const original = r.e ?? r.t;
  const texto = q ? seguro(original).replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark>$1</mark>") : seguro(original);
  return `<article class="resena"><header><span class="chip ${j?.rareza}">${r.j}</span>
    <span>${r.r ? "👍" : "👎"} · ${miles(r.h)} h · ${miles(r.v)} votos útiles</span></header><p>${texto}</p>${r.e ? `<details><summary>Ver original en inglés</summary><p>${seguro(r.t)}</p></details>` : ""}
    <footer>${Object.entries(r.a).map(([k, t]) => `<span class="tag ${t}">${ICONOS[k]} ${NOMBRES[k]} · ${TONOS[t] ?? t}</span>`).join("")}</footer></article>`;
}

async function activarExplorar() {
  $("lista").innerHTML = `<p class="nota cargando">Cargando la base de reseñas…</p>`;
  baseResenas ??= await fetch("resenas.json", { cache: "no-cache" }).then((r) => r.json());
  let mostradas = 20;
  const pintar = (reiniciar) => {
    if (reiniciar) mostradas = 20;
    const [q, fj, fa, ft, fo] = ["q", "fj", "fa", "ft", "fo"].map((id) => $(id).value.trim());
    const res = baseResenas.filter((r) => (!fj || slug(r.j) === fj) && (!fa || r.a[fa]) && (!fo || String(r.r) === fo)
      && (!ft || (fa ? r.a[fa] === ft : Object.values(r.a).includes(ft))) && (!q || `${r.e ?? ""} ${r.t}`.toLowerCase().includes(q.toLowerCase())));
    $("cuenta").textContent = `${miles(res.length)} reseñas encontradas`;
    $("lista").innerHTML = res.slice(0, mostradas).map((r) => tarjeta(r, q)).join("") || `<p class="nota">Ninguna reseña coincide. Prueba con menos filtros.</p>`;
    $("mas").hidden = res.length <= mostradas;
  };
  ["q", "fj", "fa", "ft", "fo"].forEach((id) => $(id).addEventListener("input", () => pintar(true)));
  $("mas").onclick = () => { mostradas += 20; pintar(); };
  pintar(true);
}
