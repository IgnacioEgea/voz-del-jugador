// Efectos que hacen que la web se sienta viva: partículas de neón, parallax en la portada,
// luz que sigue al ratón y secciones que aparecen al llegar a ellas. Todo se apaga si se pide menos movimiento.

// Partículas: chispas de colores flotando muy despacio al fondo (pocas, para que vaya fluido)
function particulas() {
  const lienzo = $("particulas"), ctx = lienzo.getContext("2d");
  const colores = ["#B58CFF", "#FFC93C", "#4FB3FF", "#3DDC97"];
  let chispas = [];
  const medir = () => {
    lienzo.width = innerWidth; lienzo.height = innerHeight;
    chispas = Array.from({ length: Math.min(45, Math.round(innerWidth / 30)) }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.8 + 0.4,
      v: Math.random() * 0.35 + 0.1, c: colores[Math.floor(Math.random() * colores.length)], f: Math.random() * 6,
    }));
  };
  const dibujar = (t) => {
    if (!document.hidden) {
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      for (const p of chispas) {
        p.y -= p.v;
        if (p.y < -5) { p.y = innerHeight + 5; p.x = Math.random() * innerWidth; }
        ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t / 700 + p.f);  // Parpadeo suave
        ctx.fillStyle = p.c;
        ctx.shadowColor = p.c; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x + Math.sin(t / 2000 + p.f) * 8, p.y, p.r, 0, 7); ctx.fill();
      }
    }
    requestAnimationFrame(dibujar);
  };
  medir();
  addEventListener("resize", medir);
  requestAnimationFrame(dibujar);
}

// Parallax: la ilustración de la portada se mueve más despacio que el texto, y un poco con el ratón
function parallax() {
  let raton = 0;
  const mover = () => {
    const arte = document.querySelector(".portada-arte");
    if (arte) arte.style.transform = `translate(${raton * -18}px, ${scrollY * 0.25}px)`;
  };
  addEventListener("scroll", mover, { passive: true });
  addEventListener("pointermove", (e) => {
    raton = e.clientX / innerWidth - 0.5;
    document.body.style.setProperty("--cx", `${e.clientX}px`);
    document.body.style.setProperty("--cy", `${e.clientY}px`);
    mover();
  }, { passive: true });
}

// Las secciones aparecen con un pequeño deslizamiento cuando llegan a la pantalla
function revelar() {
  const observador = new IntersectionObserver((vistas) => vistas.forEach((v) => {
    if (v.isIntersecting) { v.target.classList.add("visto"); observador.unobserve(v.target); }
  }), { threshold: 0.12 });
  new MutationObserver(() => document.querySelectorAll("#vista > section:not(.visto), .ideas li:not(.visto)")
    .forEach((s) => observador.observe(s))).observe($("vista"), { childList: true });
}

// "EN DIRECTO": se enciende mientras la IA todavía está leyendo reseñas
function directo() {
  const espera = setInterval(() => {
    if (!datos.total) return;
    clearInterval(espera);
    $("directo").hidden = terminado();
    $("directo").title = `La IA lleva ${miles(datos.clasificadas)} de ${miles(datos.total)} reseñas`;
  }, 300);
}

directo();
if (!quieto) {
  document.body.classList.add("con-vida");
  particulas();
  parallax();
  revelar();
}
