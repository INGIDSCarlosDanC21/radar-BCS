// Revisión automática de la web a 360 px (Radar BCS).
// Uso: abrir la web con el viewport en 360 px de ancho, abrir la consola y pegar este archivo,
// o cargarlo desde el receptor. Define window.radarRevisar360(rutas) y devuelve un objeto con
// los hallazgos por ruta. No modifica la página.
//   await radarRevisar360(['#inicio', '#mapa', '#ficha/calor', '#agricola', '#acciones'])
(() => {
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (e) => {
    const s = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  };
  const etiqueta = (e) => {
    const t = (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''} "${t}"`;
  };

  function revisar() {
    const ancho = document.documentElement.clientWidth;
    // 1. Scroll horizontal y elementos que se salen del ancho.
    const desborde = document.documentElement.scrollWidth - ancho;
    const fuera = [...document.querySelectorAll('body *')].filter((e) => {
      if (!visible(e)) return false;
      const r = e.getBoundingClientRect();
      return r.right > ancho + 1 && getComputedStyle(e).position !== 'fixed';
    }).filter((e, _, arr) => !arr.some((p) => p !== e && p.contains(e))).map(etiqueta).slice(0, 10);
    // 2. Áreas táctiles menores a 44 × 44 px (WCAG 2.5.5 / guía de Apple y Google).
    const tactiles = [...document.querySelectorAll('a[href], button, input, select, [role="button"], [tabindex="0"]')]
      .filter(visible).map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter(({ r }) => r.width < 44 || r.height < 44)
      .map(({ e, r }) => `${etiqueta(e)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    // 3. Texto visible menor a 12 px.
    const letraChica = {};
    for (const e of document.querySelectorAll('body *')) {
      if (!visible(e) || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const px = parseFloat(getComputedStyle(e).fontSize);
      if (px < 12) { const k = `${px}px`; (letraChica[k] = letraChica[k] || []).push(etiqueta(e)); }
    }
    for (const k in letraChica) letraChica[k] = { total: letraChica[k].length, ejemplos: letraChica[k].slice(0, 4) };
    // 4. Marca de IA junto al logo.
    const cab = document.querySelector('header');
    const marcaIA = !!(cab && /AI-generated|generado con IA/i.test(cab.textContent + [...cab.querySelectorAll('img')].map((i) => i.alt + i.src).join(' ')));
    const logo = !!(cab && cab.querySelector('img[src*="logo"]'));
    return { ancho, desborde, fuera, tactiles: tactiles.slice(0, 15), totalTactilesChicos: tactiles.length, letraChica, logoEnCabecera: logo, marcaIA };
  }

  window.radarRevisar360 = async (rutas = ['#inicio', '#mapa', '#ficha/calor', '#agricola', '#acciones']) => {
    const out = {};
    for (const r of rutas) {
      location.hash = r;
      await esperar(1500);
      window.scrollTo(0, 0);
      out[r] = revisar();
    }
    return out;
  };
})();
