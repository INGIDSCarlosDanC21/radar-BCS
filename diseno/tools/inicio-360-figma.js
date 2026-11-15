// Inicio a 360 px (celular), propuesta de UI/UX para #144. Crea (o rehace) el frame "Inicio · 360".
// Uso en la consola de Figma, con el receptor corriendo (python -I diseno/tools/receptor.py .):
//   const c=await (await fetch('http://127.0.0.1:8765/leer?ruta=diseno/tools/inicio-360-figma.js')).text(); (0,eval)(c);
//   await radarInicio360();
// Mismo contenido que el frame "Inicio" de escritorio, en una columna: héroe, ¿Qué cambia? (cifras reales de
// web/data/indicadores.json del 2026-11-15), El cielo ahora (cifras DE EJEMPLO), mapa con pines e íconos del
// cielo, leyenda debajo del mapa, pie y barra inferior de la web (Inicio, Mapa, Ficha, Agro, Acciones).
(() => {
  const R = 'http://127.0.0.1:8765/leer?ruta=';
  const leer = async (r, bytes) => { const x = await fetch(R + r); if (!x.ok) throw new Error(r); return bytes ? new Uint8Array(await x.arrayBuffer()) : x.text(); };
  const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
  const solido = (h, o = 1) => [{ type: 'SOLID', color: hex(h), opacity: o }];
  const T = { tinta: '#000d21', marino: '#0c2340', suave: '#44474d', fondo: '#f7f9fc', blanco: '#ffffff', gris110: '#f2f4f7', borde: '#c4c6ce', verde: '#006d3d', pildora: '#97f3b5', pildoraT: '#047240', cian: '#51d8e8', ambar: '#d97706', gris: '#74777e', lluvia: '#1f5f99', tormenta: '#4b5f7f' };
  const F = {};
  const svgCache = {};

  async function cargarFuentes() {
    const pares = { titulo: ['Space Grotesk', 'Bold'], cuerpo: ['Manrope', 'Regular'], mono: ['JetBrains Mono', 'Medium'] };
    for (const [k, [family, style]] of Object.entries(pares)) { F[k] = { family, style }; await figma.loadFontAsync(F[k]); }
  }
  function marco(nombre, dir = 'VERTICAL', o = {}) {
    const f = figma.createFrame(); f.name = nombre; f.layoutMode = dir; f.fills = o.fill ? solido(o.fill) : [];
    f.itemSpacing = o.gap ?? 0; f.paddingTop = f.paddingBottom = o.py ?? 0; f.paddingLeft = f.paddingRight = o.px ?? 0;
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
    if (o.radio) f.cornerRadius = o.radio;
    if (o.sombra) f.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.06 }, offset: { x: 0, y: 1 }, radius: 3, spread: 0, visible: true, blendMode: 'NORMAL' }];
    if (o.centro) f.counterAxisAlignItems = 'CENTER';
    return f;
  }
  function texto(chars, fuente, tam, color, o = {}) {
    const t = figma.createText(); t.fontName = F[fuente]; t.fontSize = tam; t.characters = chars; t.fills = solido(color);
    if (o.alto) t.lineHeight = { value: o.alto, unit: 'PIXELS' };
    if (o.mayus) t.textCase = 'UPPER';
    if (o.ancho) { t.textAutoResize = 'HEIGHT'; t.resize(o.ancho, t.height); }
    return t;
  }
  const llenar = (n) => { n.layoutSizingHorizontal = 'FILL'; return n; };
  async function svg(ruta, color, lado, nombre) {
    if (!svgCache[ruta]) svgCache[ruta] = await leer(ruta);
    const n = figma.createNodeFromSvg(svgCache[ruta]); n.name = nombre; n.resize(lado, lado);
    if (color) for (const v of n.findAll((x) => 'fills' in x)) if (v.fills.length) v.fills = solido(color);
    return n;
  }
  const cielo = (ic, color, lado) => svg(`web/assets/iconos/cielo/${ic}.svg`, color, lado, 'Cielo / ' + ic);
  const seccionIco = (ic, lado) => svg(`web/assets/iconos/${ic}.svg`, null, lado, 'Ícono / ' + ic);
  const COLOR = { sunny: T.ambar, partly_cloudy_day: T.ambar, cloud: T.gris, foggy: T.gris, rainy_light: T.lluvia, rainy: T.lluvia, thunderstorm: T.tormenta };

  function cabeceraSeccion(kicker, titulo, pastilla) {
    const h = marco('Header de sección', 'VERTICAL', { gap: 6 });
    const k = marco('Kicker', 'HORIZONTAL', { gap: 8, centro: true });
    const punto = figma.createEllipse(); punto.resize(8, 8); punto.fills = solido(T.verde); punto.name = 'Punto';
    k.appendChild(punto); k.appendChild(texto(kicker, 'mono', 12, T.suave, { ancho: 296 }));
    h.appendChild(k); h.appendChild(texto(titulo, 'titulo', 28, T.tinta));
    if (pastilla) { const p = marco('Pastilla', 'HORIZONTAL', { px: 8, py: 4, radio: 999, fill: T.gris110 }); p.appendChild(texto(pastilla, 'mono', 12, T.suave)); h.appendChild(p); }
    return h;
  }

  window.radarInicio360 = async () => {
    await cargarFuentes();
    const viejo = figma.currentPage.children.find((n) => n.name === 'Inicio · 360'); if (viejo) viejo.remove();
    const desk = figma.currentPage.children.find((n) => n.name === 'Inicio' && n.x < 5000);
    const raiz = marco('Inicio · 360', 'VERTICAL', { fill: T.fondo });
    raiz.counterAxisSizingMode = 'FIXED'; raiz.resize(360, 100); raiz.x = desk.x - 360 - 200; raiz.y = desk.y;
    raiz.clipsContent = true;

    // Cabecera: logo + marca AI-generated (copiados del componente) + English.
    const cab = marco('Cabecera', 'HORIZONTAL', { px: 16, py: 10, fill: T.blanco, centro: true, gap: 8 });
    const brand = figma.getNodeById('158:4').clone(); brand.name = 'Brand'; brand.rescale(0.8);
    // La etiqueta AI-generated no baja de 12 px en celular (spec §6), aunque el logo se reduzca.
    for (const t of brand.findAll((n) => n.type === 'TEXT')) { await figma.loadFontAsync(t.fontName); t.fontSize = 12; }
    cab.appendChild(brand);
    cab.primaryAxisAlignItems = 'SPACE_BETWEEN';
    const en = marco('Botón English', 'HORIZONTAL', { px: 14, py: 14, radio: 999 }); en.strokes = solido(T.marino); en.strokeWeight = 1;
    en.appendChild(texto('English', 'mono', 12, T.marino)); cab.appendChild(en);
    raiz.appendChild(cab); llenar(cab);

    // Héroe con la imagen MODIS (NASA GIBS, CC0).
    const modis = figma.createImage(await leer('web/img/bcs-modis-2025-04-20.jpg', true));
    const hero = marco('Héroe', 'VERTICAL', { px: 16, py: 48, gap: 16 });
    hero.fills = [{ type: 'IMAGE', imageHash: modis.hash, scaleMode: 'FILL' }, { type: 'SOLID', color: hex(T.tinta), opacity: 0.72 }];
    const h1 = texto('Cómo ha cambiado La Paz desde 2001', 'titulo', 32, T.blanco, { ancho: 328, alto: 38 });
    const a = h1.characters.indexOf('La Paz'); h1.setRangeFills(a, a + 6, solido(T.cian)); h1.setRangeTextDecoration(a, a + 6, 'UNDERLINE');
    hero.appendChild(h1);
    hero.appendChild(texto('Calor, vegetación, lluvia y agua en La Paz, B.C.S., con datos abiertos de la NASA, y el estado del cielo ahora en la península.', 'cuerpo', 16, '#d5d8db', { ancho: 328, alto: 24 }));
    for (const [et, fondo, color] of [['Ver mapa de zonas', T.blanco, T.tinta], ['Qué puedo hacer', T.marino, T.blanco]]) {
      const b = marco('Botón / ' + et, 'HORIZONTAL', { px: 16, py: 16, radio: 8, fill: fondo, centro: true }); b.primaryAxisAlignItems = 'CENTER';
      b.appendChild(texto(et, 'titulo', 15, color)); hero.appendChild(b); llenar(b);
    }
    raiz.appendChild(hero); llenar(hero);

    // ¿Qué cambia? (cifras reales, web/data/indicadores.json del 2026-11-15).
    const q = marco('Sección / ¿Qué cambia?', 'VERTICAL', { px: 16, py: 32, gap: 16 });
    q.appendChild(cabeceraSeccion('Tendencias desde 2001 · datos de la NASA', '¿Qué cambia?', 'Datos generados el 2026-11-15'));
    const IND = [
      ['clima-calor-y-sensacion-termica', 'Calor en La Paz', '+1.47 °C', 'Tendencia clara', 'p < 0.001 · aire, 2001-2025 · NASA POWER', true],
      ['agricultura-factibilidad-y-cultivos', 'Vegetación', '−0.013 NDVI', 'Tendencia clara', 'p = 0.004 · MODIS MOD13Q1', true],
      ['clima-humedad-y-lluvia', 'Lluvia', 'Sin cambio claro', 'Sin tendencia clara', 'p = 0.129 · NASA POWER', false],
      ['agricultura-clima-y-agua', 'Agua (región)', '+1.36 cm', 'Tendencia clara', 'p = 0.009 · GRACE/GRACE-FO', true],
    ];
    for (const [ic, tit, val, est, pie, clara] of IND) {
      const c = marco('Tarjeta / ' + tit, 'VERTICAL', { px: 16, py: 16, gap: 8, radio: 12, fill: T.blanco, sombra: true });
      const fila = marco('Título', 'HORIZONTAL', { gap: 8, centro: true }); fila.appendChild(await seccionIco(ic, 24)); fila.appendChild(texto(tit, 'titulo', 18, T.tinta));
      c.appendChild(fila); c.appendChild(texto(val, 'titulo', 32, T.tinta));
      const pil = marco('Estado', 'HORIZONTAL', { px: 10, py: 4, radio: 12, fill: clara ? T.pildora : T.gris110 }); pil.appendChild(texto(est, 'mono', 12, clara ? T.pildoraT : T.suave)); c.appendChild(pil);
      c.appendChild(texto(pie, 'mono', 12, T.suave, { ancho: 296 }));
      q.appendChild(c); llenar(c);
    }
    const aviso = marco('Aviso', 'HORIZONTAL', { px: 12, py: 10, radio: 8, fill: '#fff4d6' });
    aviso.appendChild(texto('Mostramos qué cambió, no por qué. Una tendencia no prueba la causa.', 'cuerpo', 14, T.tinta, { ancho: 304 })); q.appendChild(aviso); llenar(aviso);
    raiz.appendChild(q); llenar(q);

    // El cielo ahora (cifras DE EJEMPLO; la web las toma de Open-Meteo).
    const s = marco('Sección / El cielo ahora', 'VERTICAL', { px: 16, py: 32, gap: 16 });
    s.appendChild(cabeceraSeccion('Ahora · modelo Open-Meteo (no son estaciones)', 'El cielo ahora en BCS', 'Actualizado 11:28 · hora de La Paz'));
    const lp = marco('Tarjeta / La Paz', 'VERTICAL', { px: 16, py: 16, gap: 12, radio: 12, fill: T.blanco, sombra: true });
    const f1 = marco('Título', 'HORIZONTAL', { gap: 8, centro: true }); f1.appendChild(texto('La Paz', 'titulo', 20, T.tinta)); f1.primaryAxisAlignItems = 'SPACE_BETWEEN'; f1.appendChild(await cielo('sunny', T.ambar, 32));
    lp.appendChild(f1); llenar(f1);
    const f2 = marco('Temperatura', 'HORIZONTAL', { gap: 8, centro: true }); f2.appendChild(texto('28°C', 'titulo', 48, T.tinta)); const c2 = marco('Condición', 'VERTICAL', { gap: 2 });
    c2.appendChild(texto('Despejado', 'titulo', 18, T.tinta)); c2.appendChild(texto('Sensación térmica 29.4 °C', 'cuerpo', 13, T.suave)); f2.appendChild(c2); lp.appendChild(f2);
    const met = marco('Métricas', 'HORIZONTAL', { gap: 8 }); met.layoutWrap = 'WRAP'; met.counterAxisSpacing = 8;
    for (const [k, v] of [['Humedad', '62 %'], ['Viento (SO)', '18 km/h'], ['Presión', '1013 hPa'], ['Mínima', '20 °C']]) {
      const m = marco('Métrica / ' + k, 'VERTICAL', { px: 8, py: 8, gap: 2, radio: 8, fill: T.gris110 }); m.counterAxisSizingMode = 'FIXED'; m.resize(144, 50);
      m.appendChild(texto(k, 'mono', 12, T.suave)); m.appendChild(texto(v, 'titulo', 18, T.tinta)); met.appendChild(m);
    }
    lp.appendChild(met); llenar(met); s.appendChild(lp); llenar(lp);
    const grid = marco('Localidades', 'HORIZONTAL', { gap: 8 }); grid.layoutWrap = 'WRAP'; grid.counterAxisSpacing = 8;
    for (const [lugar, ic, t, mn] of [['Los Cabos', 'sunny', '27°C', '20°C'], ['Loreto', 'sunny', '31°C', '19°C'], ['Comondú', 'partly_cloudy_day', '32°C', '15°C'], ['Mulegé', 'cloud', '28°C', '17°C'], ['Gmo. Negro', 'foggy', '22°C', '14°C'], ['Bahía Magd.', 'rainy_light', '24°C', '16°C']]) {
      const m = marco('Localidad / ' + lugar, 'VERTICAL', { px: 12, py: 12, gap: 4, radio: 12, fill: T.blanco, sombra: true }); m.counterAxisSizingMode = 'FIXED'; m.resize(160, 80);
      const r = marco('Fila', 'HORIZONTAL', { centro: true }); r.appendChild(texto(lugar, 'titulo', 15, T.tinta)); r.primaryAxisAlignItems = 'SPACE_BETWEEN'; r.appendChild(await cielo(ic, COLOR[ic], 22)); m.appendChild(r); llenar(r);
      const r2 = marco('Valores', 'HORIZONTAL', { gap: 8, centro: true }); r2.appendChild(texto(t, 'titulo', 20, T.tinta)); r2.appendChild(texto('Mín ' + mn, 'mono', 12, T.suave)); m.appendChild(r2);
      grid.appendChild(m);
    }
    s.appendChild(grid); llenar(grid);
    raiz.appendChild(s); llenar(s);

    // Monitoreo satelital: mapa 328x360 con pines y leyenda debajo.
    const mp = marco('Sección / Monitoreo satelital', 'VERTICAL', { px: 16, py: 32, gap: 12 });
    mp.appendChild(texto('Monitoreo satelital · Península de Baja California', 'titulo', 20, T.tinta, { ancho: 328 }));
    const bd = marco('Origen de la imagen', 'HORIZONTAL', { px: 8, py: 4, radio: 999, fill: T.gris110, gap: 6, centro: true });
    const pv = figma.createEllipse(); pv.resize(6, 6); pv.fills = solido(T.verde); bd.appendChild(pv); bd.appendChild(texto('Imagen GOES-West · NASA GIBS', 'mono', 12, T.suave)); mp.appendChild(bd);
    const mapa = figma.createFrame(); mapa.name = 'Mapa'; mapa.resize(328, 380); mapa.cornerRadius = 12; mapa.clipsContent = true;
    mapa.fills = [{ type: 'IMAGE', imageHash: modis.hash, scaleMode: 'FILL' }];
    // Pines en su lugar real: la imagen MODIS cubre lat 22.8–28.1 y lon −115.3 a −109.3 (web/img/FUENTES.md),
    // 1200x1060 px, escalada para llenar 328x380 (se recorta a los lados). El punto del pin queda en la coordenada.
    const esc = 380 / 1060, anchoImg = 1200 * esc, corte = (anchoImg - 328) / 2;
    const px = (lon) => (lon + 115.3) / 6 * anchoImg - corte, py = (lat) => (28.1 - lat) / 5.3 * 380;
    // Coordenadas aproximadas de cada localidad (centro urbano), solo para la maqueta.
    for (const [lugar, ic, t, lat, lon, osc] of [['Santa Rosalía', 'partly_cloudy_day', '28°', 27.34, -112.27], ['Loreto', 'sunny', '31°', 26.01, -111.35], ['Bahía Magd.', 'rainy_light', '24°', 24.79, -112.11], ['La Paz', 'sunny', '28°', 24.14, -110.31, true], ['Cabo San Lucas', 'sunny', '27°', 22.89, -109.91]]) {
      const x = px(lon), y = py(lat);
      const p = marco('Pin / ' + lugar, 'HORIZONTAL', { px: 8, py: 4, gap: 4, radio: 999, fill: osc ? T.tinta : T.blanco, centro: true, sombra: true });
      p.appendChild(await cielo(ic, osc ? T.blanco : COLOR[ic], 16)); p.appendChild(texto(`${lugar} ${t}`, 'titulo', 12, osc ? T.blanco : T.tinta));
      mapa.appendChild(p);
      p.x = Math.max(4, Math.min(328 - p.width - 4, Math.round(x - 14))); p.y = Math.max(4, Math.min(380 - p.height - 4, Math.round(y - p.height / 2)));
    }
    mp.appendChild(mapa);
    const ley = marco('Leyenda / Estado del cielo', 'VERTICAL', { px: 12, py: 12, gap: 8, radio: 12, fill: T.blanco, sombra: true });
    ley.appendChild(texto('ESTADO DEL CIELO', 'mono', 12, T.tinta));
    const items = marco('Estados', 'HORIZONTAL', { gap: 12 }); items.layoutWrap = 'WRAP'; items.counterAxisSpacing = 8;
    for (const [ic, et] of [['sunny', 'Despejado'], ['partly_cloudy_day', 'Parcialmente nublado'], ['cloud', 'Nublado'], ['foggy', 'Niebla'], ['rainy_light', 'Llovizna'], ['rainy', 'Lluvia o chubasco'], ['thunderstorm', 'Tormenta']]) {
      const it = marco('Fila / ' + ic, 'HORIZONTAL', { gap: 6, centro: true }); it.appendChild(await cielo(ic, COLOR[ic], 18)); it.appendChild(texto(et, 'mono', 12, T.tinta)); items.appendChild(it);
    }
    ley.appendChild(items); llenar(items); ley.appendChild(texto('Modelo Open-Meteo · códigos WMO', 'mono', 12, T.suave));
    mp.appendChild(ley); llenar(ley);
    raiz.appendChild(mp); llenar(mp);

    // Pie apilado.
    const pie = marco('Pie', 'VERTICAL', { px: 16, py: 24, gap: 12, fill: T.gris110 });
    const marcaPie = marco('Marca', 'HORIZONTAL', { gap: 8, centro: true }); const pp = figma.createEllipse(); pp.resize(8, 8); pp.fills = solido(T.verde); marcaPie.appendChild(pp); marcaPie.appendChild(texto('RADAR BCS', 'titulo', 18, T.tinta)); pie.appendChild(marcaPie);
    pie.appendChild(texto('Tendencias ambientales de La Paz, B.C.S., con datos abiertos de la NASA. Logotipo generado con IA (Gemini) · AI-generated.', 'cuerpo', 14, T.suave, { ancho: 328 }));
    pie.appendChild(texto('© 2026 Equipo OptiPaz · NASA Space Apps Challenge 2026 · Licencia Apache-2.0', 'mono', 12, T.suave, { ancho: 328 }));
    raiz.appendChild(pie); llenar(pie);

    // Barra inferior de la web (5 pestañas de 44 px o más; Inicio activa).
    const barra = marco('Barra inferior', 'HORIZONTAL', { fill: T.blanco }); barra.strokes = solido(T.borde); barra.strokeWeight = 1; barra.strokeTopWeight = 1; barra.strokeBottomWeight = 0; barra.strokeLeftWeight = 0; barra.strokeRightWeight = 0;
    for (const [et, act] of [['Inicio', true], ['Mapa'], ['Ficha'], ['Agro'], ['Acciones']]) {
      const b = marco('Pestaña / ' + et, 'VERTICAL', { py: 10, gap: 4, centro: true }); b.primaryAxisAlignItems = 'CENTER'; b.counterAxisSizingMode = 'FIXED'; b.resize(72, 56);
      if (act) { b.strokes = solido(T.marino); b.strokeTopWeight = 3; b.strokeBottomWeight = 0; b.strokeLeftWeight = 0; b.strokeRightWeight = 0; }
      const d = figma.createEllipse(); d.resize(6, 6); d.fills = solido(act ? T.marino : T.borde); b.appendChild(d);
      b.appendChild(texto(et, 'mono', 12, act ? T.marino : T.suave)); barra.appendChild(b);
    }
    raiz.appendChild(barra); llenar(barra);
    return { id: raiz.id, alto: Math.round(raiz.height) };
  };
})();
