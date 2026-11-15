// Inicio de Figma con textos verdaderos y clima del cielo con íconos (issue #144).
// Uso: con el receptor corriendo (python -I diseno/tools/receptor.py .), en la consola de Figma:
//   const c=await (await fetch('http://127.0.0.1:8765/leer?ruta=diseno/tools/inicio-figma.js')).text(); (0,eval)(c);
//   await radarInicio();
// Edita el frame "Inicio" (x < 5000) y el componente "Footer / Pie de página". Es idempotente:
// si ya se aplicó, no duplica la sección "¿Qué cambia?" ni la leyenda.
// Las cifras de "Condiciones" y del mapa siguen siendo DE EJEMPLO (maqueta); las de "¿Qué cambia?"
// son las de web/data/indicadores.json del 2026-11-15.
(() => {
  const R = 'http://127.0.0.1:8765/leer?ruta=';
  const leer = async (ruta, tipo = 'text') => { const r = await fetch(R + ruta); if (!r.ok) throw new Error(ruta + ' ' + r.status); return tipo === 'bytes' ? new Uint8Array(await r.arrayBuffer()) : r.text(); };
  const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
  const C = { tinta: '#000d21', marino: '#0c2340', suave: '#44474d', verde: '#006d3d', ambar: '#d97706', cian: '#0098a6', blanco: '#ffffff', gris: '#74777e', lluvia: '#1f5f99', tormenta: '#4b5f7f' };

  // Estado del cielo (código WMO de Open-Meteo) -> ícono de Material Symbols (web/assets/iconos/cielo/).
  const CIELO = [
    { icono: 'sunny', es: 'Despejado', codigos: '0–1 (día)', color: C.ambar },
    { icono: 'partly_cloudy_day', es: 'Parcialmente nublado', codigos: '2', color: C.ambar },
    { icono: 'cloud', es: 'Nublado', codigos: '3', color: C.gris },
    { icono: 'foggy', es: 'Niebla', codigos: '45, 48', color: C.gris },
    { icono: 'rainy_light', es: 'Llovizna', codigos: '51–57', color: C.lluvia },
    { icono: 'rainy', es: 'Lluvia o chubasco', codigos: '61–67, 80–82', color: C.lluvia },
    { icono: 'thunderstorm', es: 'Tormenta', codigos: '95–99', color: C.tormenta },
  ];

  async function fuentes(nodo) {
    const fs = new Map();
    for (const t of nodo.findAll ? nodo.findAll((n) => n.type === 'TEXT') : [nodo]) {
      for (const s of t.getStyledTextSegments(['fontName'])) fs.set(s.fontName.family + '|' + s.fontName.style, s.fontName);
    }
    for (const f of fs.values()) await figma.loadFontAsync(f);
  }
  function texto(nodo, nuevo) { if (nodo && nodo.characters !== nuevo) nodo.characters = nuevo; }
  const porTexto = (raiz, t) => raiz.findOne((n) => n.type === 'TEXT' && n.characters.trim() === t);
  const cache = {};
  async function icono(nombre, color, lado) {
    if (!cache[nombre]) cache[nombre] = await leer(`web/assets/iconos/cielo/${nombre}.svg`);
    const n = figma.createNodeFromSvg(cache[nombre]);
    n.name = 'Cielo / ' + nombre;
    n.resize(lado, lado);
    for (const v of n.findAll((x) => 'fills' in x)) if (v.fills.length) v.fills = [{ type: 'SOLID', color: hex(color) }];
    return n;
  }
  async function iconoSeccion(archivo, lado) {
    const n = figma.createNodeFromSvg(await leer(`web/assets/iconos/${archivo}.svg`));
    n.name = 'Ícono / ' + archivo; n.resize(lado, lado); return n;
  }
  function reemplazar(viejo, nuevo) {
    const p = viejo.parent; const i = p.children.indexOf(viejo);
    p.insertChild(i, nuevo);
    if (p.layoutMode === 'NONE') { nuevo.x = viejo.x + (viejo.width - nuevo.width) / 2; nuevo.y = viejo.y + (viejo.height - nuevo.height) / 2; }
    viejo.remove();
  }

  window.radarInicio = async () => {
    const log = [];
    const f = figma.currentPage.children.find((n) => n.name === 'Inicio' && n.type === 'FRAME' && n.x < 5000);
    if (!f) throw new Error('No encuentro el frame Inicio');
    await fuentes(f);
    const cont = f.findOne((n) => n.name === 'Container' && n.parent && n.parent.name === 'Main');

    // 1. Héroe: texto verdadero, imagen MODIS real (NASA GIBS, CC0) y sin flechas de carrusel.
    const hero = cont.children[0];
    const t1 = hero.findOne((n) => n.type === 'TEXT' && n.fontSize === 48);
    const base = { fills: t1.getRangeFills(0, 1), deco: t1.getRangeTextDecoration(0, 1) };
    const iRes = t1.characters.indexOf('Baja California');
    const res = iRes >= 0 ? { fills: t1.getRangeFills(iRes, iRes + 1), deco: t1.getRangeTextDecoration(iRes, iRes + 1) } : null;
    if (!t1.characters.startsWith('Cómo ha cambiado')) {
      t1.characters = 'Cómo ha cambiado La Paz desde 2001';
      t1.setRangeFills(0, t1.characters.length, base.fills); t1.setRangeTextDecoration(0, t1.characters.length, base.deco);
      if (res) { const a = t1.characters.indexOf('La Paz'); t1.setRangeFills(a, a + 6, res.fills); t1.setRangeTextDecoration(a, a + 6, res.deco); }
    }
    texto(hero.findOne((n) => n.type === 'TEXT' && n.fontSize === 18),
      'Calor, vegetación, lluvia y agua en La Paz, B.C.S., con datos abiertos de la NASA, y el estado del cielo ahora en la península.');
    texto(porTexto(hero, 'Ver Mapa Interactivo de Radar'), 'Ver mapa de zonas');
    texto(porTexto(hero, 'Consultar Avisos Activos (3)'), 'Qué puedo hacer');
    for (const n of hero.findAll((n) => n.name.startsWith('Button - Diapositiva') || n.name === 'Button - Siguiente diapositiva')) n.remove();
    const modis = figma.createImage(await leer('web/img/bcs-modis-2025-04-20.jpg', 'bytes'));
    for (const r of [hero.findOne((n) => n.type === 'RECTANGLE' && n.name === 'Image'),
      f.findOne((n) => n.type === 'RECTANGLE' && n.name.startsWith('Imagen de Fondo Satelital'))]) {
      if (r) { r.fills = [{ type: 'IMAGE', imageHash: modis.hash, scaleMode: 'FILL' }]; r.name = 'Imagen MODIS Terra 2025-04-20 (NASA GIBS, CC0)'; }
    }
    log.push('héroe');

    // 2. Condiciones: sin "estaciones" ni "oceanográfica"; íconos del cielo en las mini-tarjetas.
    const cond = cont.children.find((n) => n.name.startsWith('Section - 2.'));
    texto(porTexto(cond, 'RED ESTATAL DE ESTACIONES METEOROLÓGICAS'), 'AHORA · MODELO METEOROLÓGICO OPEN-METEO (NO SON ESTACIONES)');
    texto(porTexto(cond, 'Condiciones climáticas BCS'), 'El cielo ahora en BCS');
    texto(cond.findOne((n) => n.type === 'TEXT' && n.characters.startsWith('Actualizado')), 'Actualizado 11:28 · hora de La Paz');
    texto(porTexto(cond, 'ESTACIÓN PRINCIPAL OCEANOGRÁFICA'), 'CAPITAL DEL ESTADO');
    texto(porTexto(cond, 'La Paz & Bahía de La Paz'), 'La Paz');
    const mini = { 'Los Cabos': 'sunny', 'Loreto': 'sunny', 'Comondú': 'partly_cloudy_day', 'Mulegé': 'cloud', 'Gmo. Negro': 'foggy', 'Bahía Magd.': 'rainy_light' };
    for (const [lugar, ic] of Object.entries(mini)) {
      const t = porTexto(cond, lugar); if (!t) continue;
      const fila = t.parent.parent; // Container horizontal: [nombre, ícono]
      const viejo = fila.children.find((n) => n !== t.parent && n !== t && !n.findOne?.((x) => x === t));
      if (viejo && !viejo.name.startsWith('Cielo /')) reemplazar(viejo, await icono(ic, CIELO.find((c) => c.icono === ic).color, 24));
    }
    log.push('condiciones');

    // 3. Mapa: título, origen de la imagen, pines con ícono y leyenda del cielo.
    const mapa = cont.children.find((n) => n.name.startsWith('Section - 3.'));
    texto(mapa.findOne((n) => n.type === 'TEXT' && n.characters.startsWith('Monitoreo Satelital')), 'Monitoreo satelital · Península de Baja California');
    texto(mapa.findOne((n) => n.type === 'TEXT' && n.characters.startsWith('En vivo')), 'Imagen GOES-West · NASA GIBS');
    const pines = { 'Cabo San Lucas': 'sunny', 'La Paz': 'sunny', 'Bahía Magd.': 'rainy_light', 'Loreto': 'sunny', 'Santa Rosalía': 'partly_cloudy_day' };
    for (const [lugar, ic] of Object.entries(pines)) {
      const t = mapa.findOne((n) => n.type === 'TEXT' && n.characters.startsWith(lugar + ' ')); if (!t) continue;
      let pin = t; while (pin.parent && !pin.parent.name.startsWith('Contenedor del Mapa')) pin = pin.parent;
      const oscuro = pin.fills.length && pin.fills[0].type === 'SOLID' && pin.fills[0].color.r < 0.2;
      const viejo = pin.children.find((n) => n.type !== 'TEXT' && !n.findOne?.((x) => x === t) && n.name !== 'Overlay+Shadow' && n.width <= 20);
      if (viejo && !viejo.name.startsWith('Cielo /')) reemplazar(viejo, await icono(ic, oscuro ? C.blanco : CIELO.find((c) => c.icono === ic).color, 16));
      pin.name = 'Pin / ' + lugar;
    }
    const ley = mapa.findOne((n) => n.name === 'Leyenda Meteorológica Flotante Lateral' || n.name === 'Leyenda / Estado del cielo');
    if (ley && ley.name !== 'Leyenda / Estado del cielo') {
      const tit = ley.findOne((n) => n.type === 'TEXT' && n.characters.startsWith('ESCALA'));
      const filaModelo = tit.parent; // se conserva el título
      texto(tit, 'ESTADO DEL CIELO');
      const muestra = ley.findOne((n) => n.type === 'TEXT' && n.characters.startsWith('Llovizna'));
      const fontFila = muestra.fontName;
      for (const n of [...ley.children]) if (n !== filaModelo) n.remove();
      await figma.loadFontAsync(fontFila);
      for (const c of CIELO) {
        const fila = figma.createFrame(); fila.name = 'Fila / ' + c.icono; fila.fills = [];
        fila.layoutMode = 'HORIZONTAL'; fila.counterAxisAlignItems = 'CENTER'; fila.itemSpacing = 8;
        fila.primaryAxisSizingMode = 'AUTO'; fila.counterAxisSizingMode = 'AUTO';
        fila.appendChild(await icono(c.icono, c.color, 18));
        const tx = figma.createText(); tx.fontName = fontFila; tx.fontSize = 12; tx.characters = c.es; tx.fills = [{ type: 'SOLID', color: hex(C.tinta) }];
        fila.appendChild(tx); ley.appendChild(fila);
      }
      const nota = figma.createText(); nota.fontName = fontFila; nota.fontSize = 10; nota.characters = 'Modelo Open-Meteo · códigos WMO';
      nota.fills = [{ type: 'SOLID', color: hex(C.suave) }]; ley.appendChild(nota);
      ley.name = 'Leyenda / Estado del cielo'; ley.primaryAxisSizingMode = 'AUTO'; ley.itemSpacing = 6;
    }
    log.push('mapa');

    // 4. "¿Qué cambia?": las 4 tendencias (cifras reales de web/data/indicadores.json, 2026-11-15).
    if (!cont.children.some((n) => n.name.startsWith('Section - 1b.'))) {
      const q = cond.clone(); q.name = 'Section - 1b. ¿QUÉ CAMBIA? (TENDENCIAS DESDE 2001)';
      cont.insertChild(1, q);
      texto(porTexto(q, 'AHORA · MODELO METEOROLÓGICO OPEN-METEO (NO SON ESTACIONES)'), 'TENDENCIAS DESDE 2001 · DATOS DE LA NASA');
      texto(porTexto(q, 'El cielo ahora en BCS'), '¿Qué cambia?');
      texto(q.findOne((n) => n.type === 'TEXT' && n.characters.startsWith('Actualizado')), 'Datos generados el 2026-11-15');
      texto(porTexto(q, 'CAPITAL DEL ESTADO'), 'INDICADOR PRINCIPAL');
      texto(porTexto(q, 'La Paz'), 'Calor en La Paz');
      texto(q.findOne((n) => n.type === 'TEXT' && n.fontSize === 64), '+1.47');
      texto(q.findOne((n) => n.type === 'TEXT' && n.fontSize === 24 && n.characters === 'C'), '°C');
      texto(porTexto(q, 'Cielo despejado'), 'Tendencia clara');
      texto(q.findOne((n) => n.type === 'TEXT' && n.characters.startsWith('Sensación')), 'Temperatura del aire, 2001-2025 · NASA POWER (MERRA-2)');
      const met = [['Humedad', 'Periodo', '2001-25', ''], ['Viento (SO)', 'Prueba', 'MK', 'Sen'], ['Índice UV', 'p-valor', '< 0.001', ''], ['Presión', 'Fuente', 'POWER', '']];
      for (const [a, et, v, u] of met) {
        const l = porTexto(q, a); if (!l) continue; texto(l, et);
        const caja = l.parent.parent; const ts = caja.findAll((n) => n.type === 'TEXT' && n !== l);
        if (ts[0]) texto(ts[0], v); if (ts[1]) texto(ts[1], u || ' ');
        for (const ic of caja.findAll((n) => n.type === 'VECTOR' || (n.type === 'FRAME' && n.width <= 16 && !n.findOne((x) => x.type === 'TEXT')))) ic.visible = false;
      }
      const tarjetas = { 'Los Cabos': ['Vegetación', '−0.013 NDVI', 'p = 0.004', 'agricultura-factibilidad-y-cultivos'],
        'Loreto': ['Lluvia', 'Sin cambio', 'p = 0.129', 'clima-humedad-y-lluvia'],
        'Comondú': ['Agua (región)', '+1.36 cm', 'p = 0.009', 'agricultura-clima-y-agua'] };
      for (const lugar of ['Mulegé', 'Gmo. Negro', 'Bahía Magd.']) { let c = porTexto(q, lugar); while (c && !c.name.startsWith('Background+Shadow')) c = c.parent; if (c) c.remove(); }
      for (const [lugar, [tit, val, p, ic]] of Object.entries(tarjetas)) {
        const t = porTexto(q, lugar); if (!t) continue;
        let card = t; while (!card.name.startsWith('Background+Shadow')) card = card.parent;
        const ts = card.findAll((n) => n.type === 'TEXT');
        texto(ts[0], tit); texto(ts[1], val); texto(ts[2], p);
        const viejo = card.findOne((n) => n.name.startsWith('Cielo /'));
        if (viejo) reemplazar(viejo, await iconoSeccion(ic, 24));
      }
      // Ícono de la tarjeta principal: se cambia el dibujo dentro del círculo ("Overlay"), no el círculo.
      const ov = q.findOne((n) => n.name === 'Overlay' && Math.round(n.width) === 56);
      const vec = ov && ov.findOne((n) => n.type === 'VECTOR');
      if (vec) reemplazar(vec, await iconoSeccion('clima-calor-y-sensacion-termica', 28));
      log.push('¿Qué cambia?');
    }

    // 5. Pie (componente usado en las 17 pantallas): sin enlaces ni afirmaciones que no existen.
    const pie = figma.currentPage.children.find((n) => n.type === 'COMPONENT' && n.name === 'Footer / Pie de página');
    if (pie) {
      await fuentes(pie);
      const cambios = [
        [(c) => c.startsWith('Plataforma de vigilancia'), 'Tendencias ambientales de La Paz, B.C.S., con datos abiertos de la NASA. Logotipo generado con IA (Gemini) · AI-generated.'],
        [(c) => c === 'MONITOREO', 'PANTALLAS'], [(c) => c === 'Clima satelital', 'Inicio y mapa'], [(c) => c === 'Monitoreo agrícola', 'Mapa Agrícola'], [(c) => c === 'Zona pesquera', 'Qué puedo hacer'],
        [(c) => c === 'ALERTAS & DATOS', 'DATOS Y CÓDIGO'], [(c) => c === 'Alertas costeras', 'Fuentes (NASA)'], [(c) => c === 'API meteorológica', 'Uso de IA'], [(c) => c === 'Red de telemetría', 'Código en GitHub'],
        [(c) => c.startsWith('© 2026 RADAR BCS'), '© 2026 Equipo OptiPaz · NASA Space Apps Challenge 2026 · Licencia Apache-2.0'],
        [(c) => c === 'Privacidad', 'English'], [(c) => c === 'Términos de servicio', 'Licencia Apache-2.0'], [(c) => c === 'Protocolo OGC', 'AI-generated'],
      ];
      for (const t of pie.findAll((n) => n.type === 'TEXT')) for (const [ok, v] of cambios) if (ok(t.characters.trim())) texto(t, v);
      log.push('pie');
    }
    return log;
  };
})();
