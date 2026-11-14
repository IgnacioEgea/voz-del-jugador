// "Encuentra tu shooter": el jugador marca lo que le importa y ordenamos los juegos
// según lo que opinan miles de jugadores sobre esas cosas. Usa los datos que ya cargó app.js.

// Cómo lo diría un jugador (y no un analista)
const DESEOS = {
  jugabilidad: "🎮 Que sea divertido", matchmaking_balance: "⚖️ Partidas justas",
  monetizacion: "💸 Sin pay-to-win", bugs_rendimiento: "🛠️ Que vaya fino",
  comunidad_toxicidad: "🤝 Comunidad sana", contenido_actualizaciones: "🆕 Contenido nuevo",
  graficos_arte: "✨ Que entre por los ojos",
};

function pintarSelector(datos) {
  // Un botón por deseo; empezamos con dos marcados para que haya resultado desde el principio
  const marcados = new Set(["jugabilidad", "matchmaking_balance"]);
  $("deseos").innerHTML = Object.entries(DESEOS).map(([clave, texto]) =>
    `<button class="deseo" data-clave="${clave}" aria-pressed="${marcados.has(clave)}">${texto}</button>`).join("");

  $("deseos").addEventListener("click", (e) => {
    const boton = e.target.closest(".deseo");
    if (!boton) return;
    const clave = boton.dataset.clave;
    marcados.has(clave) ? marcados.delete(clave) : marcados.add(clave);
    boton.setAttribute("aria-pressed", marcados.has(clave));
    recomendar(datos, marcados);
  });
  recomendar(datos, marcados);
}

function recomendar(datos, marcados) {
  if (!marcados.size) {
    $("recomendados").innerHTML = `<p class="nota">Marca al menos una cosa que te importe.</p>`;
    return;
  }

  // La afinidad de cada juego es la media de opiniones positivas en lo que has marcado
  const conDatos = datos.juegos.map((j) => {
    const notas = [...marcados].map((clave) => j.aspectos[clave]).filter(Boolean);
    if (notas.length < marcados.size) return null;  // Aún no hay datos suficientes de este juego
    const afinidad = Math.round(notas.reduce((suma, a) => suma + a.pos, 0) / notas.length);
    const peor = [...marcados].sort((x, y) => j.aspectos[x].pos - j.aspectos[y].pos)[0];
    return { j, afinidad, peor };
  }).filter(Boolean).sort((x, y) => y.afinidad - x.afinidad);

  const pendientes = datos.juegos.length - conDatos.length;
  $("recomendados").innerHTML = conDatos.map(({ j, afinidad, peor }, puesto) => `
    <div class="recomendado ${j.rareza}">
      <span class="puesto">#${puesto + 1}</span>
      <img src="${emblema(j.juego)}" alt="" width="64" height="64" loading="lazy">
      <div>
        <h3>${j.juego}</h3>
        <small>Ojo con: ${NOMBRES[peor].toLowerCase()} (${j.aspectos[peor].pos} % positivo)</small>
      </div>
      <strong>${afinidad} %</strong>
    </div>`).join("") +
    (pendientes ? `<p class="nota">${pendientes} juego(s) aún sin datos suficientes: la IA sigue leyendo.</p>` : "");
}
