// Asistente de chat: recomienda y valora juegos con los datos de la web, para quien prefiera preguntar.
// Funciona en el navegador, sin IA externa ni coste: busca palabras clave y responde con los números reales.

// Palabras que suelen usar los jugadores para cada tema y cada género
const PISTAS = {
  jugabilidad: ["divert", "jugabilidad", "gameplay", "fun", "entreten", "adict"],
  monetizacion: ["pay", "p2w", "pagar", "dinero", "gratis", "monetiz", "micropago", "gacha", "skins", "tienda", "pase"],
  bugs_rendimiento: ["bug", "lag", "fps", "rendimiento", "optimiz", "fino", "crash", "servidor", "cheat", "tramp", "hacker"],
  contenido_actualizaciones: ["contenido", "actualiz", "mapas", "modos", "eventos", "temporada", "nuevo"],
  graficos_arte: ["gráfic", "grafic", "bonito", "arte", "visual", "estética", "ojos"],
  comunidad_toxicidad: ["comunidad", "tóxic", "toxic", "gente", "amigos", "chat"],
  matchmaking_balance: ["matchmaking", "emparej", "justo", "balance", "equilibr", "ranked", "competitiv"],
};
const GENEROS = { shooter: "Shooter", "hero": "Hero shooter", "battle": "Battle royale", moba: "MOBA", gacha: "Gacha y RPG", rpg: "Gacha y RPG", "acción": "Acción y RPG" };
const ALIAS = { cs: "Counter-Strike 2", csgo: "Counter-Strike 2", counter: "Counter-Strike 2", pubg: "PUBG: BATTLEGROUNDS", dota: "Dota 2",
  ow: "Overwatch 2", overwatch: "Overwatch 2", tf2: "Team Fortress 2", apex: "Apex Legends", finals: "THE FINALS", rivals: "Marvel Rivals",
  wuwa: "Wuthering Waves", wuthering: "Wuthering Waves", zzz: "Zenless Zone Zero", zenless: "Zenless Zone Zero", endfield: "Arknights: Endfield",
  arknights: "Arknights: Endfield", destiny: "Destiny 2", warframe: "Warframe", delta: "Delta Force", paladins: "Paladins" };

const normal = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const enlace = (j) => `<a href="#/juego/${slug(j.juego)}">${j.juego}</a>`;

// Busca qué juegos, temas y géneros se mencionan en la pregunta
function entender(pregunta) {
  const t = normal(pregunta);
  const juegos = [...new Set([...datos.juegos.filter((j) => t.includes(normal(j.juego))).map((j) => j.juego),
    ...Object.entries(ALIAS).filter(([a]) => new RegExp(`\\b${a}\\b`).test(t)).map(([, n]) => n)])].map((n) => datos.juegos.find((j) => j.juego === n)).filter(Boolean);
  const temas = Object.keys(PISTAS).filter((k) => PISTAS[k].some((p) => t.includes(normal(p))));
  const genero = Object.entries(GENEROS).find(([p]) => t.includes(p))?.[1];
  return { t, juegos, temas, genero };
}

function responder(pregunta) {
  const { t, juegos, temas, genero } = entender(pregunta);
  if (/^(hola|buenas|hey|ey)/.test(t)) return "¡Hola! Pregúntame, por ejemplo: <i>«recomiéndame un juego sin pay-to-win»</i>, <i>«¿qué tal Warframe?»</i> o <i>«compara Dota 2 y CS2»</i>.";

  // Comparar dos juegos
  if (juegos.length >= 2) {
    const [a, b] = juegos;
    const gana = Object.keys(NOMBRES).filter((k) => a.aspectos[k] && b.aspectos[k]);
    const puntosA = gana.filter((k) => a.aspectos[k].pos > b.aspectos[k].pos).length;
    return `${enlace(a)} (${a.recomienda} % lo recomienda) contra ${enlace(b)} (${b.recomienda} %). ` +
      (gana.length ? `Tema a tema gana <b>${puntosA >= gana.length - puntosA ? a.juego : b.juego}</b> (${Math.max(puntosA, gana.length - puntosA)} de ${gana.length}).` : "Aún no tengo los temas de los dos.") +
      ` <a href="#/comparar/${slug(a.juego)}">Ver el duelo completo →</a>`;
  }

  // Valorar un juego concreto
  if (juegos.length === 1) {
    const j = juegos[0], asp = aspectosDe(j);
    const resumen = asp.length ? ` Lo mejor: <b>${NOMBRES[asp[0].clave].toLowerCase()}</b> (${asp[0].pos} %). Lo peor: <b>${NOMBRES[asp.at(-1).clave].toLowerCase()}</b> (${asp.at(-1).pos} %).`
      : " La IA todavía está leyendo sus reseñas, así que aún no tengo el detalle por temas.";
    return `${enlace(j)} es carta <b>${RAREZAS[j.rareza]}</b>: lo recomienda el ${j.recomienda} % de ${miles(j.resenas)} jugadores.${resumen}`;
  }

  // Recomendar según lo que le importa y el género que busca
  if (temas.length || genero || /recomien|que juego|qué juego|a que juego|mejor/.test(t)) {
    let lista = datos.juegos.filter((j) => !genero || j.genero === genero);
    const nota = (j) => (temas.length ? temas.reduce((s, k) => s + (j.aspectos[k]?.pos ?? 0), 0) / temas.length : j.recomienda);
    lista = lista.filter((j) => !temas.length || temas.every((k) => j.aspectos[k])).sort((x, y) => nota(y) - nota(x)).slice(0, 3);
    if (!lista.length) return "Con esos filtros aún no tengo datos suficientes. Prueba con otro tema o género.";
    const por = temas.length ? ` en ${temas.map((k) => NOMBRES[k].toLowerCase()).join(" y ")}` : "";
    return `Te recomiendo${por}${genero ? ` (${genero})` : ""}:<ol>${lista.map((j) => `<li>${enlace(j)} · ${Math.round(nota(j))} %</li>`).join("")}</ol>`;
  }
  return "No te he entendido del todo 😅. Prueba con un juego (<i>«¿qué tal Apex?»</i>), un tema (<i>«sin bugs»</i>) o un género (<i>«un gacha»</i>).";
}

// La ventana del chat: mensajes, botones de sugerencia y caja para escribir
function abrirChat() {
  const d = ventana(`<h2>${icono("chat", 32)} Asistente</h2><div class="chat" id="chat-msgs" aria-live="polite"></div>
    <div class="sugerencias">${["Recomiéndame algo divertido", "Sin pay-to-win", "Un gacha", "¿Qué tal Warframe?", "Compara Dota 2 y CS2"]
      .map((s) => `<button class="deseo">${s}</button>`).join("")}</div>
    <form class="chat-form"><input id="chat-q" placeholder="Pregúntame algo…" aria-label="Tu pregunta" autocomplete="off"><button class="boton principal">Enviar</button></form>`);
  const decir = (html, quien) => {
    $("chat-msgs").insertAdjacentHTML("beforeend", `<p class="msg ${quien}">${html}</p>`);
    $("chat-msgs").scrollTop = $("chat-msgs").scrollHeight;
  };
  const preguntar = (texto) => {
    if (!texto.trim()) return;
    decir(seguro(texto), "yo");
    decir('<span class="escribiendo">● ● ●</span>', "bot");
    setTimeout(() => { $("chat-msgs").lastElementChild.remove(); decir(responder(texto), "bot"); }, quieto ? 0 : 600);
  };
  d.querySelector(".chat-form").addEventListener("submit", (e) => { e.preventDefault(); preguntar($("chat-q").value); $("chat-q").value = ""; });
  d.querySelector(".sugerencias").addEventListener("click", (e) => e.target.matches(".deseo") && preguntar(e.target.textContent));
  decir(`¡Hola! Conozco la opinión de ${miles(datos.total)} jugadores sobre ${datos.juegos.length} juegos. ¿Qué te apetece?`, "bot");
  $("chat-q").focus();
}

$("abrir-chat").addEventListener("click", abrirChat);
