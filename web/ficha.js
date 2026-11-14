// Ficha completa de un juego (#/juego/the-finals): stats, patch notes, novatos vs. veteranos y voces reales.

// Patch notes de un juego: arreglos urgentes (hotfix) y puntos fuertes que destacar (buff)
function parche(j) {
  const aspectos = aspectosDe(j);
  const hotfix = aspectos.filter((a) => a.pos < 35).slice(-2).reverse();
  const buff = aspectos.filter((a) => a.pos >= 60).slice(0, 2);
  const linea = (tipo, a, texto) =>
    `<li><span class="tag ${tipo}">${tipo === "hotfix" ? "🔧 HOTFIX" : "⬆️ BUFF"}</span> <b>${NOMBRES[a.clave]}</b>: ${texto}</li>`;
  return `<ul class="notas">
    ${hotfix.map((a) => linea("hotfix", a, `solo el ${a.pos} % habla bien. Prioridad para el equipo de diseño.`)).join("")}
    ${buff.map((a) => linea("buff", a, `lo valora el ${a.pos} %. Es lo que hay que destacar en la ficha de tienda.`)).join("")}
    ${hotfix.length || buff.length ? "" : "<li>Sin cambios urgentes: las opiniones están equilibradas.</li>"}
  </ul>`;
}

// Una frase que resume cómo cambia la opinión con las horas jugadas
function frasePerfiles(j) {
  const d = j.perfiles.veterano - j.perfiles.novato;
  if (Math.abs(d) < 5) return "La opinión apenas cambia con las horas: lo que ves al principio es lo que hay.";
  return d > 0
    ? `Mejora con el tiempo: los veteranos lo recomiendan ${d} puntos más que los novatos. Engancha a quien le da una oportunidad.`
    : `Desgaste: los veteranos lo recomiendan ${-d} puntos menos que los novatos. Algo quema a quien más juega.`;
}

function vistaJuego(s) {
  const j = juegoPorSlug(s);
  if (!j) return `<p class="nota">No encontramos ese juego. <a href="#/juegos">Volver a los juegos</a></p>`;
  const i = datos.juegos.indexOf(j), n = datos.juegos.length;
  const [anterior, siguiente] = [datos.juegos[(i - 1 + n) % n], datos.juegos[(i + 1) % n]];
  const aspectos = aspectosDe(j);

  return `<a class="volver" href="#/juegos">← Todos los juegos</a>
  <header class="ficha-cabecera ${j.rareza}">
    ${portada(j, "ficha-emblema")}
    <div>
      <span class="rareza">${RAREZAS[j.rareza]}</span> <span class="chip">${j.genero}</span>
      <h1>${j.juego}</h1>
      <p class="gran-cifra"><b>${j.recomienda} %</b> de ${miles(j.resenas)} jugadores lo recomienda</p>
      <div class="botones">
        <a class="boton principal" href="#/comparar/${s}">${icono("comparar")} Comparar</a>
        <a class="boton" href="#/explorar/${s}">${icono("explorar")} Leer sus reseñas</a>
        <button class="boton" data-compartir="${j.juego}">${icono("chat")} Compartir</button>
        <a class="boton" href="${j.tienda}" target="_blank" rel="noopener">${icono("juegos")} Ver en ${j.fuente}</a>
      </div>
    </div>
  </header>

  <section aria-labelledby="t-stats">
    <h2 id="t-stats">Stats del personaje</h2>
    <p class="nota">De las reseñas que hablan de cada tema, % que lo hace en positivo. El nivel va del 1 al 10.
      ${j.clasificadas < j.resenas ? `Basado en ${miles(j.clasificadas)} de ${miles(j.resenas)} reseñas (la IA sigue leyendo).` : ""}</p>
    ${aspectos.length ? aspectos.map((a) => barra(`${ICONOS[a.clave]} ${NOMBRES[a.clave]}`, a.pos,
      `<small class="nota">Lv. ${nivel(a.pos)} · ${miles(a.menciones)} menciones · </small>`)).join("")
      : `<p class="aviso">⏳ La IA todavía no ha leído las reseñas de este juego. Vuelve en un rato.</p>`}
  </section>

  ${aspectos.length ? `<section aria-labelledby="t-parche"><h2 id="t-parche">Patch notes</h2>
    <p class="nota">Lo que cambiaríamos según sus propios jugadores.</p>${parche(j)}</section>` : ""}

  ${j.perfiles.novato != null ? `  <section aria-labelledby="t-perfiles">
    <h2 id="t-perfiles">Novatos vs. veteranos</h2>
    <p class="nota">${frasePerfiles(j)}</p>
    ${barra(`${icono("inicio")} Novatos (menos de 10 h)`, j.perfiles.novato)}
    ${barra(`${icono("encuentra")} Medios`, j.perfiles.medio)}
    ${barra(`${icono("logros")} Veteranos (100 h o más)`, j.perfiles.veterano)}
  </section>` : `<p class="nota">ℹ️ Las reseñas de la App Store no dicen cuántas horas ha jugado cada persona, así que aquí no hay comparación novatos vs. veteranos.</p>`}

  ${aspectos.length ? `<section aria-labelledby="t-voces"><h2 id="t-voces">Voces reales</h2>
    <p class="nota">La reseña más votada como útil sobre cada tema. Traducidas al español con IA: puedes ver el original en inglés.</p>
    <div class="voces">${aspectos.map((a) => `<figure class="voz-card">
      <blockquote>“${seguro(a.voz.es ?? a.voz.texto)}”</blockquote>
      ${a.voz.es ? `<details><summary>Ver original en inglés</summary><p>${seguro(a.voz.texto)}</p></details>` : ""}
      <figcaption>${a.voz.recomienda ? "👍 Lo recomienda" : "👎 No lo recomienda"} · ${Math.round(a.voz.horas)} h · ${ICONOS[a.clave]} ${NOMBRES[a.clave]}</figcaption>
    </figure>`).join("")}</div></section>` : ""}

  <nav class="pasar" aria-label="Otros juegos">
    <a href="#/juego/${slug(anterior.juego)}">← ${anterior.juego}</a>
    <a href="#/juego/${slug(siguiente.juego)}">${siguiente.juego} →</a>
  </nav>`;
}
