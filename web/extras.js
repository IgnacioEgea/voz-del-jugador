// Extras que dan vida a la web: barra de experiencia al hacer scroll, kill feed de reseñas reales,
// patch notes con recomendaciones y cifras que cuentan hacia arriba. Usa los datos que cargó app.js.

const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Barra de "experiencia": se llena según lo que llevas leído de la página
function barraXP() {
  const pintar = () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    $("xp").style.width = `${total > 0 ? (scrollY / total) * 100 : 0}%`;
  };
  addEventListener("scroll", pintar, { passive: true });
  pintar();
}

// Kill feed: frases reales de jugadores pasando como el registro de bajas de un shooter
function pintarFeed(datos) {
  const voces = datos.juegos.flatMap((j) => aspectosDe(j).map((a) => ({ j, a })));
  if (!voces.length) return;
  const corta = (t) => (t.length > 90 ? `${t.slice(0, 90).replace(/\s\S*$/, "")}…` : t);
  const tira = voces.map(({ j, a }) => `
    <span class="baja ${j.rareza}"><b>${j.juego}</b> ${a.voz.recomienda ? "👍" : "👎"}
      “${seguro(corta(a.voz.texto))}” <small>${Math.round(a.voz.horas)} h · ${NOMBRES[a.clave]}</small></span>`).join("");
  // Repetimos la tira dos veces para que el bucle no tenga cortes
  $("feed").innerHTML = tira + tira;
  $("feed").style.animationDuration = `${voces.length * 7}s`;
}

// Patch notes: arreglos urgentes (hotfix) y puntos fuertes que destacar (buff), sacados de los datos
function pintarParches(datos) {
  const linea = (tipo, a, texto) =>
    `<li><span class="tag ${tipo}">${tipo === "hotfix" ? "🔧 HOTFIX" : "⬆️ BUFF"}</span> <b>${NOMBRES[a.clave]}</b>: ${texto}</li>`;

  $("parches").innerHTML = datos.juegos.filter((j) => aspectosDe(j).length).map((j) => {
    const aspectos = aspectosDe(j);
    const hotfix = aspectos.filter((a) => a.pos < 35).slice(-2).reverse();  // Los dos peores
    const buff = aspectos.filter((a) => a.pos >= 60).slice(0, 2);            // Los dos mejores
    return `<article class="parche ${j.rareza}">
      <header><img src="${emblema(j.juego)}" alt="" width="40" height="40" loading="lazy">
        <div><h3>${j.juego}</h3><small>Parche v1.0 · basado en ${miles(j.clasificadas)} reseñas</small></div></header>
      <ul>
        ${hotfix.map((a) => linea("hotfix", a, `solo el ${a.pos} % habla bien. Prioridad para diseño.`)).join("")}
        ${buff.map((a) => linea("buff", a, `lo valora el ${a.pos} %. Destácalo en la ficha de tienda.`)).join("")}
        ${hotfix.length || buff.length ? "" : "<li>Sin cambios urgentes: opiniones equilibradas.</li>"}
      </ul>
    </article>`;
  }).join("") || `<p class="nota">Las patch notes aparecerán cuando la IA termine de leer las reseñas.</p>`;
}

// Las cifras grandes de la portada cuentan desde cero, como un marcador
function contar() {
  if (quieto) return;
  document.querySelectorAll(".hallazgo strong").forEach((el) => {
    const final = el.textContent;
    const numero = parseInt(final.replace(/\D/g, ""), 10);
    if (!numero) return;
    let inicio;
    const paso = (t) => {
      inicio ??= t;
      const avance = Math.min((t - inicio) / 1000, 1);
      el.textContent = final.replace(/\d+/, Math.round(numero * (1 - (1 - avance) ** 3)));
      if (avance < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
}

function pintarExtras(datos) {
  barraXP();
  pintarFeed(datos);
  pintarParches(datos);
  contar();
}
