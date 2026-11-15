// Auditoría y exportación del archivo de Figma "Radar paceño" (Radar BCS).
// Uso: abrir el archivo en Figma (navegador, con permiso de edición), abrir la consola
// de desarrollador y pegar este archivo. Requiere el receptor local:
//   python -I diseno/tools/receptor.py .
// Define window.radarAuditar() y window.radarExportar(); ambos envían archivos al receptor.
// No modifica el diseño: solo lee y exporta.

(() => {
  const RECEPTOR = 'http://127.0.0.1:8765/guardar?ruta=';
  const PESTANAS = ['Inicio', 'Clima', 'Agricultura', 'Pesca', 'Avisos y Alertas'];
  // Pantallas del conjunto final (lado izquierdo del lienzo). Las de x >= 5000 son borradores.
  // Las versiones de celular ("… · 360") se auditan aparte (movil).
  const esMovil = (n) => n.type === 'FRAME' && n.x < 5000 && / · 360$/.test(n.name);
  const esFinal = (n) => n.type === 'FRAME' && n.x < 5000 && !esMovil(n) && !['Login', 'Registrar', 'Logo', 'Logo con marca AI-generated'].includes(n.name);
  const seccionDe = (nombre) => {
    if (nombre === 'Inicio') return 'Inicio';
    if (nombre === 'Avisos y Alertas') return 'Avisos y Alertas';
    const pre = nombre.split(' - ')[0];
    return PESTANAS.includes(pre) ? pre : null;
  };
  const AFIRMACIONES = /RED ESTATAL DE ESTACIONES|dBZ|Avisos Activos|ESTACIÓN PRINCIPAL OCEANOGRÁFICA|GOES-18|En vivo|API meteorológica|Red de telemetría|Protocolo OGC|Todos los derechos reservados/i;
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  const pintura = (p) => p.type === 'SOLID' ? hex(p.color)
    : p.type.startsWith('GRADIENT') ? `${p.type}(${p.gradientStops.map((g) => hex(g.color)).join('>')})` : p.type;
  const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, 'y').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  async function enviar(ruta, cuerpo) {
    const r = await fetch(RECEPTOR + encodeURIComponent(ruta).replace(/%2F/g, '/'), { method: 'POST', body: cuerpo });
    if (!r.ok) throw new Error(`${ruta}: ${r.status}`);
    return r.text();
  }

  function auditarPantalla(f) {
    const header = f.children.find((c) => c.name === 'Header');
    const footer = f.children.find((c) => c.name === 'Footer');
    const main = f.children.find((c) => c.name === 'Main');
    let activas = [];
    if (header) {
      const nav = header.findOne((n) => n.name === 'Nav');
      activas = nav ? nav.children.filter((l) => (l.fills || []).some((p) => p.type === 'SOLID' && p.visible !== false))
        .map((l) => l.findOne((n) => n.type === 'TEXT').characters) : [];
    }
    const fuentes = {};
    for (const t of f.findAll((n) => n.type === 'TEXT')) {
      for (const s of t.getStyledTextSegments(['fontName'])) fuentes[s.fontName.family] = (fuentes[s.fontName.family] || 0) + 1;
    }
    const titulo = main && main.findOne((n) => n.type === 'TEXT' && /^Mapa (Meteorológico|Agrícola|Pesquero)$/.test(n.characters.trim()));
    const acento = f.findOne((n) => n.name === 'Acento de sección');
    const boton = f.findOne((n) => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.name === 'Botón / Iniciar simulación');
    const textos = f.findAll((n) => n.type === 'TEXT').map((t) => t.characters);
    return {
      id: f.id, nombre: f.name, archivo: `diseno/pantallas/${slug(f.name)}.png`,
      seccion: seccionDe(f.name), ancho: Math.round(f.width), alto: Math.round(f.height),
      header: header ? { tipo: header.type, componente: header.mainComponent ? header.mainComponent.name : null, y: Math.round(header.y), alto: Math.round(header.height) } : null,
      pestanasActivas: activas,
      marcaIAJuntoAlLogo: !!(header && header.findOne((n) => n.name === 'Marca AI-generated' && n.findOne((t) => t.type === 'TEXT' && t.characters === 'AI-generated'))),
      footer: footer ? { tipo: footer.type, componente: footer.mainComponent ? footer.mainComponent.name : null } : null,
      fuentes,
      tituloX: titulo ? Math.round(titulo.absoluteTransform[0][2] - f.absoluteTransform[0][2]) : null,
      tituloTexto: titulo ? titulo.characters.trim() : null,
      acento: acento ? acento.fills.map(pintura) : null,
      botonSimulacion: boton ? boton.mainComponent.name : null,
      erratas: textos.filter((t) => /simulaciónl|Lorem|DATOS DE PRUEBA/i.test(t)).map((t) => t.slice(0, 60)),
      // Nombres de personas reales usados como ejemplo (no deben aparecer en maquetas).
      nombresDeEjemplo: textos.filter((t) => /Bare[ñn]o|Armando Castro/i.test(t)).map((t) => t.slice(0, 60)),
      // Afirmaciones del mockup sin fuente real (#144): estaciones, radar, avisos, enlaces inexistentes.
      afirmacionesSinFuente: textos.filter((t) => AFIRMACIONES.test(t)).map((t) => t.slice(0, 60)),
      // Íconos del estado del cielo (web/assets/iconos/cielo/) presentes en la pantalla.
      iconosCielo: f.findAll((n) => n.name.startsWith('Cielo / ')).map((n) => n.name.slice(8)),
    };
  }

  function paleta(frames) {
    const usos = {};
    for (const f of frames) for (const n of f.findAll((x) => 'fills' in x && Array.isArray(x.fills))) {
      for (const p of n.fills) if (p.type === 'SOLID' && p.visible !== false) { const h = hex(p.color); usos[h] = (usos[h] || 0) + 1; }
    }
    return Object.entries(usos).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([color, usos]) => ({ color, usos }));
  }

  function acentosMaestros() {
    const out = {};
    const maestros = { Clima: 'Clima - Mapa', Agricultura: 'Agricultura - Mapa', Pesca: 'Pesca - Mapa' };
    for (const [sec, nombre] of Object.entries(maestros)) {
      const f = figma.currentPage.children.find((n) => n.name === nombre);
      if (!f) continue;
      out[sec] = f.findAll((n) => n.type === 'RECTANGLE' && n.height <= 6 && n.width > 500).map((b) => {
        const t = b.parent.findOne((x) => x.type === 'TEXT' && x.fontSize >= 16);
        return { tarjeta: t ? t.characters.replace(/\n/g, ' ').trim() : b.parent.name, alto: b.height, relleno: b.fills.map(pintura) };
      });
    }
    return out;
  }

  window.radarAuditar = async () => {
    const frames = figma.currentPage.children.filter(esFinal);
    const comps = figma.currentPage.children.filter((n) => n.type === 'COMPONENT').map((c) => ({ id: c.id, nombre: c.name, ancho: Math.round(c.width), alto: Math.round(c.height) }));
    const header = figma.currentPage.children.find((n) => n.type === 'COMPONENT' && n.name === 'Header / Navegación principal');
    const nav = header && header.findOne((n) => n.name === 'Nav');
    const datos = {
      archivo: 'Figma "Radar paceño" (ae9KMSMZUexeV0dBhDkNR1)', generado: new Date().toISOString(),
      pestanas: nav ? nav.children.map((l) => l.findOne((n) => n.type === 'TEXT').characters) : [],
      componentes: comps,
      acentosPorSeccion: acentosMaestros(),
      paleta: paleta(frames),
      pantallas: frames.map(auditarPantalla).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
      movil: figma.currentPage.children.filter(esMovil).map((f) => {
        const textos = f.findAll((n) => n.type === 'TEXT');
        const fuentes = {}; for (const t of textos) for (const s of t.getStyledTextSegments(['fontName', 'fontSize'])) { fuentes[s.fontName.family] = (fuentes[s.fontName.family] || 0) + 1; }
        const chicos = textos.filter((t) => t.getStyledTextSegments(['fontSize']).some((s) => s.fontSize < 12)).map((t) => t.characters.slice(0, 40));
        const fuera = f.findAll((n) => 'absoluteBoundingBox' in n && n.absoluteBoundingBox && n.visible !== false && n.absoluteBoundingBox.x + n.absoluteBoundingBox.width > f.absoluteBoundingBox.x + f.width + 0.5).map((n) => n.name).slice(0, 10);
        const tactiles = f.findAll((n) => /^(Botón|Pestaña) /.test(n.name)).map((n) => ({ nombre: n.name, alto: Math.round(n.height), ancho: Math.round(n.width) }));
        return { nombre: f.name, archivo: `diseno/pantallas/${slug(f.name)}.png`, ancho: Math.round(f.width), alto: Math.round(f.height), fuentes,
          textoMenorA12: chicos, fueraDelAncho: fuera, tactiles,
          afirmacionesSinFuente: textos.map((t) => t.characters).filter((t) => AFIRMACIONES.test(t)),
          marcaIA: textos.some((t) => t.characters === 'AI-generated'),
          iconosCielo: [...new Set(f.findAll((n) => n.name.startsWith('Cielo / ')).map((n) => n.name.slice(8)))] };
      }),
    };
    await enviar('diseno/figma-auditoria.json', JSON.stringify(datos, null, 2));
    return { pantallas: datos.pantallas.length, componentes: comps.length };
  };

  window.radarExportar = async ({ escala = 1 } = {}) => {
    const log = [];
    const frames = figma.currentPage.children.filter(esFinal);
    for (const f of frames) {
      let s = escala, bytes;
      do { bytes = await f.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: s } }); s -= 0.25; }
      while (bytes.length > 4.5 * 1024 * 1024 && s > 0.25);
      log.push(f.name + ' ' + await enviar(`diseno/pantallas/${slug(f.name)}.png`, bytes));
    }
    for (const f of figma.currentPage.children.filter(esMovil)) {
      log.push(f.name + ' ' + await enviar(`diseno/pantallas/${slug(f.name)}.png`, await f.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } })));
    }
    for (const nombre of ['Login', 'Registrar']) {
      const f = figma.currentPage.children.find((n) => n.name === nombre);
      if (f) log.push(nombre + ' ' + await enviar(`diseno/pantallas/${slug(nombre)}.png`, await f.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } })));
    }
    for (const c of figma.currentPage.children.filter((n) => n.type === 'COMPONENT')) {
      log.push(c.name + ' ' + await enviar(`diseno/componentes/${slug(c.name)}.png`, await c.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } })));
    }
    // Logotipo: el de la pantalla de Login (relleno de imagen).
    const login = figma.currentPage.children.find((n) => n.name === 'Login');
    const logo = login && login.findOne((n) => n.name.startsWith('Figure - Brand Logo'));
    if (logo) log.push('logo ' + await enviar('web/assets/logo-radar-bcs.png', await logo.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 3 } })));
    // Logotipo con la marca visible "AI-generated" al lado (versión que usa el sitio).
    const conMarca = figma.currentPage.children.find((n) => n.name === 'Logo con marca AI-generated');
    if (conMarca) log.push('logo con marca ' + await enviar('web/assets/logo-radar-bcs-ai-generated.png', await conMarca.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 3 } })));
    // Íconos de las tarjetas de sección de las pantallas maestras (vectores).
    for (const nombre of ['Clima - Mapa', 'Agricultura - Mapa', 'Pesca - Mapa']) {
      const f = figma.currentPage.children.find((n) => n.name === nombre);
      if (!f) continue;
      for (const b of f.findAll((n) => n.type === 'RECTANGLE' && n.height <= 6 && n.width > 500)) {
        const tarjeta = b.parent;
        const t = tarjeta.findOne((x) => x.type === 'TEXT' && x.fontSize >= 16);
        const icono = tarjeta.findOne((n) => n.type === 'VECTOR' && n.width <= 32 && n.height <= 32);
        if (!t || !icono) continue;
        const ruta = `web/assets/iconos/${slug(nombre.split(' - ')[0])}-${slug(t.characters.replace(/\n/g, ' '))}.svg`;
        log.push(ruta + ' ' + await enviar(ruta, await icono.exportAsync({ format: 'SVG' })));
      }
    }
    return log;
  };
})();
