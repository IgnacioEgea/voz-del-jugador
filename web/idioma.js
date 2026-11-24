// Botón de idiomas (igual que en el portfolio de Ignacio): bandera + código y un menú con los idiomas.
// Traduce con Google Translate, pero su barra y su selector quedan ocultos (ver .idioma en style.css).
// Google solo se descarga si el visitante ya eligió un idioma (cookie googtrans).

const IDIOMAS = [
  { code: "es", flag: "es", name: "Español" },
  { code: "en", flag: "gb", name: "English" },
  { code: "fr", flag: "fr", name: "Français" },
  { code: "de", flag: "de", name: "Deutsch" },
  { code: "it", flag: "it", name: "Italiano" },
  { code: "gl", flag: "es-ga", name: "Galego" },
  { code: "bg", flag: "bg", name: "Български" },
  { code: "uk", flag: "ua", name: "Українська" },
  { code: "ja", flag: "jp", name: "日本語" },
  { code: "ko", flag: "kr", name: "한국어" },
];

// Bandera real (flagcdn): Windows no dibuja los emojis de banderas. Si falla, queda el código.
const bandera = (i, ancho = 22) =>
  `<img class="bandera" src="https://flagcdn.com/w40/${i.flag}.png" srcset="https://flagcdn.com/w80/${i.flag}.png 2x"
    width="${ancho}" height="${Math.round(ancho * 0.72)}" alt="" onerror="this.outerHTML='<b class=bandera-txt>${i.code.toUpperCase()}</b>'">`;

function idiomaActual() {
  const m = document.cookie.match(/googtrans=\/es\/([^;]+)/);
  return IDIOMAS.find((i) => i.code === m?.[1]) || IDIOMAS[0];
}

function cambiarIdioma(i) {
  const host = location.hostname;
  if (i.code === "es") {
    // Borramos la cookie (con y sin dominio) y recargamos en español
    for (const d of ["", `; domain=${host}`]) document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${d}`;
    return location.reload();
  }
  const select = document.querySelector(".goog-te-combo");
  if (select) { select.value = i.code; select.dispatchEvent(new Event("change")); pintarIdioma(i); }
  else { document.cookie = `googtrans=/es/${i.code}; path=/`; location.reload(); }
}

function pintarIdioma(actual = idiomaActual()) {
  const caja = document.getElementById("idioma");
  caja.innerHTML = `
    <button class="hud-boton idioma-boton" aria-label="Cambiar idioma" aria-expanded="false">
      ${bandera(actual)}<span>${actual.code.toUpperCase()}</span><span class="idioma-flecha" aria-hidden="true">▾</span>
    </button>
    <div class="idioma-menu notranslate" hidden>
      ${IDIOMAS.map((i) => `<button data-code="${i.code}" class="${i.code === actual.code ? "activo" : ""}">
        ${bandera(i, 24)}<span>${i.name}</span></button>`).join("")}
    </div>`;
  const boton = caja.querySelector(".idioma-boton");
  const menu = caja.querySelector(".idioma-menu");
  boton.onclick = (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    boton.setAttribute("aria-expanded", String(!menu.hidden));
  };
  menu.onclick = (e) => {
    const b = e.target.closest("button[data-code]");
    if (b) cambiarIdioma(IDIOMAS.find((i) => i.code === b.dataset.code));
  };
}

// Cerrar el menú al pulsar fuera o con Esc
document.addEventListener("click", (e) => {
  const menu = document.querySelector(".idioma-menu");
  if (menu && !menu.hidden && !e.target.closest("#idioma")) menu.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelector(".idioma-menu")?.setAttribute("hidden", "");
});

pintarIdioma();

// Cargamos Google Translate solo si hace falta
if (/googtrans=\/es\//.test(document.cookie)) {
  window.vozTraductorListo = () => {
    if (!window.google?.translate?.TranslateElement) return;
    new google.translate.TranslateElement(
      { pageLanguage: "es", includedLanguages: IDIOMAS.slice(1).map((i) => i.code).join(","), autoDisplay: false },
      "google_translate_element");
  };
  const s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=vozTraductorListo";
  s.async = true;
  document.body.appendChild(s);
}
