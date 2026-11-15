/* Textos de la interfaz en español e inglés (issue #93). ES5, sin build.
   - ?lang=en abre en inglés; sin parámetro (o ?lang=es) en español. El idioma del navegador no cambia nada.
   - RBT.t('clave', {var}) da el texto del idioma activo; si falta en inglés, cae al español.
   - RBT.d(obj, 'campo') da obj.campo_en en inglés (si existe) y obj.campo en español: los textos de los datos
     los escribe Luca en data/salida (*_en); aquí no se traducen cifras ni se agregan afirmaciones. */
(function () {
  'use strict';
  var DIC = {
    es: {
      'html.saltar': 'Saltar al contenido',
      'html.cargando': 'Cargando datos…',
      'html.pie': 'Equipo OptiPaz · NASA Space Apps Challenge 2026 · Licencia Apache-2.0',
      'html.ia': 'Código y análisis escritos con ayuda de IA (Claude Code); interfaz diseñada con ayuda de Google Stitch.',
      'html.secciones': 'Secciones',
      'nav.inicio': 'Inicio', 'nav.mapa': 'Mapa', 'nav.ficha': 'Ficha', 'nav.agricola': 'Agro', 'nav.acciones': 'Acciones',
      'titulo.inicio': 'Inicio', 'titulo.mapa': 'Mapa', 'titulo.ficha': 'Ficha', 'titulo.acciones': 'Acciones', 'titulo.agricola': 'Mapa Agrícola',
      'idioma.cambiar': 'English', 'idioma.etiqueta': 'Read this site in English',

      'reg.sinDatos': 'sin datos', 'reg.sinCambio': 'Sin cambio claro', 'reg.sinDatosPend': 'Sin datos (pendiente)', 'reg.pendiente': 'pendiente',
      'met.sen': ' La pendiente de Sen estima cuánto cambia por año.',
      'met.anual': 'Suma la lluvia de cada año y ve si esos totales suben o bajan de forma consistente. Se usa el total anual porque muchos meses no llueve nada.',
      'met.autocorr': 'Compara cada mes del año con los mismos meses de otros años y ve si el dato sube o baja de forma consistente. El p-valor corrige la autocorrelación entre meses (un mes se parece al anterior), así que es más prudente.',
      'met.estacional': 'Compara cada mes del año con los mismos meses de otros años y ve si el dato sube o baja de forma consistente.',

      'et.clara': 'Tendencia clara (estadísticamente significativa)', 'et.noClara': 'Sin tendencia clara', 'et.sinCalcular': 'Sin calcular',
      'franja.datos': 'DATOS DE PRUEBA — no son mediciones reales', 'franja.mapa': 'MAPA DE PRUEBA — las zonas dibujadas no son mediciones',
      'aviso.causa': 'Mostramos qué cambió, no por qué. Una tendencia no prueba la causa.',
      'gen.fecha': 'Datos generados el {f}',
      'gen.fuente': 'Fuente: {f}', 'gen.periodo': 'Periodo: {p}', 'gen.limite': 'Límite:',
      'ini.lead': 'Cómo han cambiado el calor, la vegetación, la lluvia y el agua en La Paz desde 2001, con datos abiertos de la NASA.',

      'mapa.lead': 'Zonas de La Paz según el cambio desde 2001. Elige un indicador.',
      'mapa.grupo': 'Indicador', 'mapa.region': 'Mapa de zonas de La Paz',
      'mapa.calor.que': 'Temperatura de la superficie (satélite MODIS), no la del aire.',
      'mapa.calor.fuente': 'MODIS MOD11A2.061 (temperatura de superficie, 1 km) vía NASA AppEEARS',
      'mapa.calor.nota': 'El periodo termina en 2021: desde 2022 el satélite Terra pasa cada vez más temprano y la superficie se mide antes de calentarse. Más detalle en la ficha de calor.',
      'mapa.veg.que': 'Índice de vegetación (NDVI). Algunos meses no tienen lectura válida en la ciudad: es un panorama aproximado.',
      'mapa.veg.fuente': 'MODIS MOD13Q1.061 (NDVI, 250 m) vía NASA AppEEARS',
      'mapa.periodoPend': 'periodo pendiente', 'mapa.datoPrueba': ' (dato de prueba)',
      'mapa.sinMapa': 'No se pudo cargar el mapa (¿sin conexión?). La lista de zonas de abajo sigue disponible.',
      'mapa.errorMapa': 'No se pudo mostrar el mapa. La lista de zonas sigue disponible.',
      'mapa.leySinDatos': 'sin datos',
      'mapa.hPrueba': 'Zonas de prueba del mapa (no son mediciones): ', 'mapa.hMas': 'Zonas con más cambio: ', 'mapa.hZonas': 'Zonas: ',
      'mapa.regional': 'Este indicador se mide a escala regional, no por zona; por eso el mapa no tiene datos para {t}. Mira la ficha para ver el cambio en La Paz.',
      'mapa.verFicha': 'Ver ficha de {t}',
      'mapa.piePrueba': 'Zonas: datos de prueba sintéticos, no son mediciones; el mapa por zona espera datos de MODIS. El dato real de La Paz está en la ficha.',
      'mapa.pieMetodo': '; Mann-Kendall estacional y pendiente de Sen. Son puntos, no zonas completas: cada uno se dibuja como el píxel de 1 km que lo contiene.',
      'mapa.pieBase': ' Mapa base: © OpenStreetMap contributors.',

      'fic.abrir': 'Abrir la fuente ({h})', 'fic.volver': '← Inicio', 'fic.desde': 'Cambio total desde {a}',
      'fic.sinCifra': 'No se detecta un cambio claro; por eso no se muestra una cifra de cambio.',
      'fic.porDecada': 'Tendencia por década:', 'fic.media': 'Media por década', 'fic.serie': 'Serie por año',
      'fic.sinSerie': 'Sin datos suficientes para la gráfica.',
      'fic.graf': 'Gráfica de línea de {t} de {a} a {b}: pasa de {v1} a {v2} {u}.', 'fic.grafTit': '{t} por año',
      'fic.sig': '¿Es estadísticamente significativo?',
      'fic.si': 'Sí. La tendencia es clara: con p {p} (menor que alfa = {a}) es poco probable que se deba solo al azar.',
      'fic.no': 'No se detecta un cambio claro. Con p = {p} (no menor que alfa = {a}) lo que vemos cabe dentro de la variación normal de un año a otro. Que no se detecte un cambio no prueba que no exista.',
      'fic.nc': 'Todavía no se calcula para este indicador, así que no podemos decir si la tendencia es clara.',
      'fic.metodo': 'Método: {m}.', 'fic.sinCalcular': 'sin calcular', 'fic.sinDato': 'sin dato',
      'fic.pAlfa': 'p-valor: {p} · alfa: {a}. Si p es menor que alfa, la tendencia se considera clara.',
      'fic.fuente': 'Fuente', 'fic.resol': 'Resolución:', 'fic.periodo': 'Periodo:', 'fic.descarga': 'Fecha de descarga:', 'fic.limitacion': 'Limitación:',

      'acc.h1': '¿Qué puedo hacer?', 'acc.calor': 'Contra el calor', 'acc.agua': 'Para ahorrar agua',
      'acc.c1': 'Usa ropa holgada y de colores claros que cubra brazos y piernas, y un sombrero de ala que dé sombra a la cara, las orejas y la nuca.',
      'acc.c2': 'Si puedes, haz tus actividades al aire libre en lo más fresco del día o en la noche.',
      'acc.c3': 'Si tienes aire acondicionado, úsalo; si no, busca un lugar fresco. Aun unas horas en un lugar fresco bajan el riesgo.',
      'acc.c4': 'Usa ventilador solo si adentro hace menos de 32 °C: por encima de eso puede subir la temperatura del cuerpo.',
      'acc.c5': 'Refréscate con una ducha fresca, un paño húmedo o un rociador con agua fresca.',
      'acc.c6': 'Toma agua, que suele ser la mejor bebida, y evita el alcohol porque deshidrata.',
      'acc.a1': 'Cierra la llave mientras te lavas los dientes o te rasuras.',
      'acc.a2': 'Lava el carro con agua de una cubeta, no con la manguera abierta.',
      'acc.a3': 'Barre la banqueta, la entrada y los escalones en lugar de lavarlos con manguera.',
      'acc.a4': 'Revisa cada año tus instalaciones de plomería y tu sistema de riego.',
      'acc.aviso': 'Consejos generales de CDC y EPA, adaptados al español. Revisados contra las páginas citadas el 14 de noviembre de 2026; no sustituyen la atención médica.',

      'err.datos': 'No se pudieron cargar los datos', 'err.detalle': 'Detalle: {d}.',
      'err.file': 'Si abriste el archivo con doble clic (file://), no funciona: usa un servidor local, por ejemplo <code>python -m http.server -d web 8000</code> y abre http://localhost:8000.',
      'err.agro': 'No se pudieron cargar los datos agrícolas', 'agro.cargando': 'Cargando datos agrícolas…',

      'home.h1': 'Cómo ha cambiado <span class="hm-resalte">La Paz</span> desde 2001',
      'home.sub': 'Calor, vegetación, lluvia y agua en La Paz, B.C.S., con datos abiertos de la NASA.',
      'home.btnMapa': 'Ver mapa de zonas', 'home.btnAcc': 'Qué puedo hacer',
      'home.tend': 'Tendencias {r} · NASA', 'home.tendSin': 'Tendencias · NASA', 'home.h2': '¿Qué cambia?',
      'home.principal': 'Indicador principal', 'home.enLaPaz': '{t} en La Paz',
      'home.dPeriodo': 'Periodo', 'home.dDecada': 'Cambio por década', 'home.dPrueba': 'Prueba', 'home.dDataset': 'Dataset',
      'home.verFichaDe': 'Ver ficha de {t}', 'home.verFicha': 'Ver ficha',
      'home.hMapa': 'Baja California Sur vista por el satélite Terra (MODIS)',
      'home.alt': 'Imagen de satélite de Baja California Sur, 20 de abril de 2025',
      'home.cred': 'Imagen: NASA EOSDIS GIBS, MODIS Terra, 20 abr 2025 (CC0)',
      'home.btnZonas': 'Ver zonas de La Paz',
      'home.pieDesc': 'Tendencias ambientales de La Paz, B.C.S., con datos abiertos de la NASA.',
      'home.pantallas': 'Pantallas', 'home.piePag': 'Pie de página', 'home.fichas': 'Fichas',
      'home.copy': '© 2026 Equipo OptiPaz · NASA Space Apps Challenge 2026 · Licencia Apache-2.0'
    },
    en: {
      'html.saltar': 'Skip to content',
      'html.cargando': 'Loading data…',
      'html.pie': 'Team OptiPaz · NASA Space Apps Challenge 2026 · Apache-2.0 License',
      'html.ia': 'Code and analysis written with AI assistance (Claude Code); interface designed with help from Google Stitch.',
      'html.secciones': 'Sections',
      'nav.inicio': 'Home', 'nav.mapa': 'Map', 'nav.ficha': 'Details', 'nav.agricola': 'Farming', 'nav.acciones': 'Actions',
      'titulo.inicio': 'Home', 'titulo.mapa': 'Map', 'titulo.ficha': 'Details', 'titulo.acciones': 'Actions', 'titulo.agricola': 'Farming Map',
      'idioma.cambiar': 'Español', 'idioma.etiqueta': 'Ver este sitio en español',

      'reg.sinDatos': 'no data', 'reg.sinCambio': 'No clear change', 'reg.sinDatosPend': 'No data (pending)', 'reg.pendiente': 'pending',
      'met.sen': " Sen's slope estimates how much it changes per year.",
      'met.anual': 'It adds up the rain of each year and checks whether those totals rise or fall consistently. Annual totals are used because many months have no rain at all.',
      'met.autocorr': 'It compares each month with the same month in other years and checks whether the value rises or falls consistently. The p-value is corrected for autocorrelation between months (one month resembles the previous one), so it is more cautious.',
      'met.estacional': 'It compares each month with the same month in other years and checks whether the value rises or falls consistently.',

      'et.clara': 'Clear trend (statistically significant)', 'et.noClara': 'No clear trend', 'et.sinCalcular': 'Not calculated',
      'franja.datos': 'TEST DATA — not real measurements', 'franja.mapa': 'TEST MAP — the zones drawn are not measurements',
      'aviso.causa': 'We show what changed, not why. A trend does not prove the cause.',
      'gen.fecha': 'Data generated on {f}',
      'gen.fuente': 'Source: {f}', 'gen.periodo': 'Period: {p}', 'gen.limite': 'Limitation:',
      'ini.lead': 'How heat, vegetation, rainfall and water have changed in La Paz since 2001, using NASA open data.',

      'mapa.lead': 'Zones of La Paz by change since 2001. Choose an indicator.',
      'mapa.grupo': 'Indicator', 'mapa.region': 'Map of La Paz zones',
      'mapa.calor.que': 'Land surface temperature (MODIS satellite), not air temperature.',
      'mapa.calor.fuente': 'MODIS MOD11A2.061 (land surface temperature, 1 km) via NASA AppEEARS',
      'mapa.calor.nota': 'The period ends in 2021: since 2022 the Terra satellite passes over earlier and earlier, so the surface is measured before it warms up. More detail on the heat page.',
      'mapa.veg.que': 'Vegetation index (NDVI). Some months have no valid reading in the city: this is an approximate picture.',
      'mapa.veg.fuente': 'MODIS MOD13Q1.061 (NDVI, 250 m) via NASA AppEEARS',
      'mapa.periodoPend': 'period pending', 'mapa.datoPrueba': ' (test data)',
      'mapa.sinMapa': 'The map could not be loaded (offline?). The list of zones below is still available.',
      'mapa.errorMapa': 'The map could not be shown. The list of zones is still available.',
      'mapa.leySinDatos': 'no data',
      'mapa.hPrueba': 'Test zones on the map (not measurements): ', 'mapa.hMas': 'Zones with the most change: ', 'mapa.hZonas': 'Zones: ',
      'mapa.regional': 'This indicator is measured at a regional scale, not by zone, so the map has no data for {t}. See its page for the change in La Paz.',
      'mapa.verFicha': 'See the {t} page',
      'mapa.piePrueba': 'Zones: synthetic test data, not measurements; the zone map is waiting for MODIS data. The real value for La Paz is on the indicator page.',
      'mapa.pieMetodo': "; seasonal Mann-Kendall and Sen's slope. These are points, not whole zones: each one is drawn as the 1 km pixel that contains it.",
      'mapa.pieBase': ' Base map: © OpenStreetMap contributors.',

      'fic.abrir': 'Open the source ({h})', 'fic.volver': '← Home', 'fic.desde': 'Total change since {a}',
      'fic.sinCifra': 'No clear change is detected, so no change figure is shown.',
      'fic.porDecada': 'Trend per decade:', 'fic.media': 'Average per decade', 'fic.serie': 'Yearly series',
      'fic.sinSerie': 'Not enough data for the chart.',
      'fic.graf': 'Line chart of {t} from {a} to {b}: it goes from {v1} to {v2} {u}.', 'fic.grafTit': '{t} per year',
      'fic.sig': 'Is it statistically significant?',
      'fic.si': 'Yes. The trend is clear: with p {p} (less than alpha = {a}) it is unlikely to be due to chance alone.',
      'fic.no': 'No clear change is detected. With p = {p} (not less than alpha = {a}) what we see fits within the normal variation from one year to the next. Not detecting a change does not prove there is none.',
      'fic.nc': 'This has not been calculated for this indicator yet, so we cannot say whether the trend is clear.',
      'fic.metodo': 'Method: {m}.', 'fic.sinCalcular': 'not calculated', 'fic.sinDato': 'no data',
      'fic.pAlfa': 'p-value: {p} · alpha: {a}. If p is less than alpha, the trend is considered clear.',
      'fic.fuente': 'Source', 'fic.resol': 'Resolution:', 'fic.periodo': 'Period:', 'fic.descarga': 'Download date:', 'fic.limitacion': 'Limitation:',

      'acc.h1': 'What can I do?', 'acc.calor': 'Against the heat', 'acc.agua': 'To save water',
      'acc.c1': 'Wear loose, light-colored clothing that covers your arms and legs, and a wide-brimmed hat that shades your face, ears and neck.',
      'acc.c2': 'If you can, do outdoor activities during the coolest part of the day or at night.',
      'acc.c3': 'If you have air conditioning, use it; if not, find a cool place. Even a few hours in a cool place lowers the risk.',
      'acc.c4': 'Use a fan only if it is below 32 °C indoors: above that it can raise your body temperature.',
      'acc.c5': 'Cool off with a cool shower, a damp cloth or a spray bottle with cool water.',
      'acc.c6': 'Drink water, which is usually the best choice, and avoid alcohol because it dehydrates you.',
      'acc.a1': 'Turn off the tap while brushing your teeth or shaving.',
      'acc.a2': 'Wash the car with water from a bucket, not with a running hose.',
      'acc.a3': 'Sweep sidewalks, driveways and steps instead of hosing them down.',
      'acc.a4': 'Check your plumbing and irrigation system every year.',
      'acc.aviso': 'General advice from the CDC and the EPA. Checked against the cited pages on November 14, 2026; it does not replace medical care.',

      'err.datos': 'The data could not be loaded', 'err.detalle': 'Detail: {d}.',
      'err.file': 'Opening the file with a double click (file://) does not work: use a local server, for example <code>python -m http.server -d web 8000</code>, and open http://localhost:8000.',
      'err.agro': 'The farming data could not be loaded', 'agro.cargando': 'Loading farming data…',

      'home.h1': 'How <span class="hm-resalte">La Paz</span> has changed since 2001',
      'home.sub': 'Heat, vegetation, rainfall and water in La Paz, Baja California Sur, Mexico, using NASA open data.',
      'home.btnMapa': 'See the zone map', 'home.btnAcc': 'What can I do?',
      'home.tend': 'Trends {r} · NASA', 'home.tendSin': 'Trends · NASA', 'home.h2': 'What is changing?',
      'home.principal': 'Main indicator', 'home.enLaPaz': '{t} in La Paz',
      'home.dPeriodo': 'Period', 'home.dDecada': 'Change per decade', 'home.dPrueba': 'Test', 'home.dDataset': 'Dataset',
      'home.verFichaDe': 'See the {t} page', 'home.verFicha': 'See details',
      'home.hMapa': 'Baja California Sur seen by the Terra satellite (MODIS)',
      'home.alt': 'Satellite image of Baja California Sur, April 20, 2025',
      'home.cred': 'Image: NASA EOSDIS GIBS, MODIS Terra, Apr 20, 2025 (CC0)',
      'home.btnZonas': 'See the zones of La Paz',
      'home.pieDesc': 'Environmental trends in La Paz, Baja California Sur, using NASA open data.',
      'home.pantallas': 'Screens', 'home.piePag': 'Footer', 'home.fichas': 'Details',
      'home.copy': '© 2026 Team OptiPaz · NASA Space Apps Challenge 2026 · Apache-2.0 License'
    }
  };
  var UNIDADES_EN = { 'mm/año': 'mm/year' };

  function idioma(search) {
    var m = /[?&]lang=([a-z]{2})(?:&|$)/i.exec(search || '');
    return m && m[1].toLowerCase() === 'en' ? 'en' : 'es';
  }
  var lang = (typeof location !== 'undefined') ? idioma(location.search) : 'es';

  function t(k, v) {
    var s = DIC[lang][k];
    if (s == null) s = DIC.es[k];
    if (s == null) return k;
    return v ? s.replace(/\{(\w+)\}/g, function (_, n) { return v[n] != null ? v[n] : ''; }) : s;
  }
  function d(o, campo) {
    if (!o) return o;
    var en = o[campo + '_en'];
    return (lang === 'en' && en != null && en !== '') ? en : o[campo];
  }
  function unidad(u) { return lang === 'en' && UNIDADES_EN[u] ? UNIDADES_EN[u] : u; }
  function locale() { return lang === 'en' ? 'en-US' : 'es-MX'; }
  /* URL del otro idioma conservando ruta y hash: ?lang=en para inglés; sin parámetro para español. */
  function urlOtro(loc) {
    var q = String(loc.search || '').replace(/^\?/, '').split('&').filter(function (p) { return p && !/^lang=/i.test(p); });
    if (lang === 'es') q.push('lang=en');
    return loc.pathname + (q.length ? '?' + q.join('&') : '') + (loc.hash || '');
  }
  /* Textos fijos de index.html: data-t pone textContent, data-t-aria pone aria-label. */
  function aplicar(doc) {
    doc.documentElement.lang = lang;
    doc.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    doc.querySelectorAll('[data-t-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-t-aria'))); });
    var b = doc.getElementById('idioma');
    if (b) {
      b.textContent = t('idioma.cambiar');
      b.setAttribute('aria-label', t('idioma.etiqueta'));
      b.setAttribute('lang', lang === 'en' ? 'es' : 'en');
      b.setAttribute('hreflang', lang === 'en' ? 'es' : 'en');
      b.href = urlOtro(location);
      b.onclick = function () { b.href = urlOtro(location); };
    }
  }

  var RBT = { t: t, d: d, unidad: unidad, locale: locale, idioma: idioma, urlOtro: urlOtro, aplicar: aplicar, DIC: DIC,
    lang: function () { return lang; }, setLang: function (l) { lang = l === 'en' ? 'en' : 'es'; } };
  if (typeof window !== 'undefined') window.RBT = RBT;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBT;
})();
