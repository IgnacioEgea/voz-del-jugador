// Pantalla #/validar: etiquetar a mano las 200 reseñas de control para medir cuánto acierta la IA.
// Lo que marcas se guarda en tu navegador; al final descargas el CSV que lee src/validar.py.

const CLAVE = "validacion";  // Nombre del cajón de localStorage donde guardamos tus etiquetas
const OPCIONES = [["", "No lo menciona"], ["pos", "Positivo"], ["neu", "Neutro"], ["neg", "Negativo"]];
const val = { lista: [], marcas: {}, i: 0 };

const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify({ marcas: val.marcas, i: val.i })); } catch {} };
const hecha = (r) => r.id in val.marcas;  // Una reseña cuenta como hecha cuando pulsas "Siguiente" en ella

function vistaValidar() {
  return `<section class="validar"><h1>Valida a la IA</h1>
    <p class="nota">Lee cada reseña y marca qué dice de cada tema. Si no habla de un tema, déjalo en «No lo menciona».
      Tu progreso se guarda en este navegador. Cuando acabes, descarga el CSV y compararemos tus respuestas con las de la IA.</p>
    <div id="val-zona"><p class="nota">${simbolo("espera")} Cargando reseñas…</p></div></section>`;
}

async function activarValidar() {
  if (!val.lista.length) val.lista = await fetch("validacion.json", { cache: "no-cache" }).then((r) => r.json());
  try { Object.assign(val, JSON.parse(localStorage.getItem(CLAVE)) ?? {}); } catch {}
  pintarValidar();
}

function pintarValidar() {
  const r = val.lista[val.i], marcas = val.marcas[r.id] ?? {};
  const hechas = val.lista.filter(hecha).length;
  $("val-zona").innerHTML = `
    <div class="val-progreso"><b>${val.i + 1} / ${val.lista.length}</b> · ${hechas} hechas
      ${celdas(Math.round((100 * hechas) / val.lista.length))}</div>
    <article class="voz-card val-resena"><small>${r.juego}</small><blockquote>“${r.texto}”</blockquote></article>
    <div class="val-temas">${Object.keys(NOMBRES).map((k) => `<fieldset class="val-tema" data-tema="${k}">
      <legend>${ICONOS[k]} ${NOMBRES[k]}</legend>
      ${OPCIONES.map(([v, t]) => `<button type="button" class="val-op${(marcas[k] ?? "") === v ? " elegida" : ""}" data-v="${v}">${t}</button>`).join("")}
    </fieldset>`).join("")}</div>
    <div class="val-nav">
      <button class="boton" id="val-atras" ${val.i ? "" : "disabled"}>← Anterior</button>
      <button class="boton principal" id="val-sig">${val.i < val.lista.length - 1 ? "Siguiente →" : "Terminar"}</button>
      <button class="boton" id="val-csv">Descargar CSV (${hechas})</button>
    </div>`;

  // Elegir una opción: solo una por tema
  document.querySelectorAll(".val-tema").forEach((f) => f.addEventListener("click", (e) => {
    const b = e.target.closest(".val-op");
    if (!b) return;
    f.querySelectorAll(".val-op").forEach((x) => x.classList.toggle("elegida", x === b));
  }));
  $("val-atras").onclick = () => mover(-1);
  $("val-sig").onclick = () => mover(1);
  $("val-csv").onclick = descargarCsv;
}

// Guarda lo marcado en la reseña actual y pasa a otra
function mover(paso) {
  const r = val.lista[val.i];
  val.marcas[r.id] = Object.fromEntries([...document.querySelectorAll(".val-tema")]
    .map((f) => [f.dataset.tema, f.querySelector(".elegida")?.dataset.v ?? ""]));
  val.i = Math.min(Math.max(val.i + paso, 0), val.lista.length - 1);
  guardar();
  pintarValidar();
  if (val.lista.every(hecha)) aviso("¡Las 200 hechas! Descarga el CSV y pásamelo");
  $("val-zona").scrollIntoView({ block: "start", behavior: quieto ? "instant" : "smooth" });
}

// Crea el mismo CSV que src/validar.py espera: separado por ";" y con BOM para que Excel lo abra bien
function descargarCsv() {
  const temas = Object.keys(NOMBRES);
  const celda = (t) => `"${String(t).replace(/"/g, '""')}"`;
  const filas = val.lista.map((r) => [r.id, r.juego, celda(r.texto), ...temas.map((k) => val.marcas[r.id]?.[k] ?? "")].join(";"));
  const csv = "﻿" + [["id", "juego", "texto", ...temas].join(";"), ...filas].join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "validacion_manual.csv" });
  a.click();
  URL.revokeObjectURL(a.href);
}
