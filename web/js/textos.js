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
      'html.desc': 'Radar BCS: cómo han cambiado el calor, la vegetación, la lluvia y el agua en La Paz, B.C.S. desde 2001, con datos abiertos de la NASA.',
      'html.ogTitulo': 'Radar BCS: tendencias ambientales de La Paz, B.C.S.',
      'html.cargando': 'Cargando datos…',
      'html.pie': 'Equipo OptiPaz · NASA Space Apps Challenge 2026 · Licencia Apache-2.0',
      'html.ia': 'Código y análisis escritos con ayuda de IA (Claude Code); interfaz diseñada con ayuda de Google Stitch; logotipo generado con IA (Gemini).',
      'html.logo': 'Radar BCS, inicio', 'html.logoIA': 'Logotipo generado con IA',
      'html.secciones': 'Secciones',
      'nav.inicio': 'Inicio', 'nav.mapa': 'Mapa', 'nav.ficha': 'Ficha', 'nav.agricola': 'Agro', 'nav.acciones': 'Acciones',
      'titulo.inicio': 'Inicio', 'titulo.mapa': 'Mapa', 'titulo.ficha': 'Ficha', 'titulo.acciones': 'Acciones', 'titulo.agricola': 'Mapa Agrícola',
      'idioma.cambiar': 'English', 'idioma.etiqueta': 'Read this site in English',

      'reg.sinDatos': 'sin datos', 'reg.sinCambio': 'Sin cambio claro', 'reg.sinDatosPend': 'Sin datos (pendiente)', 'reg.pendiente': 'pendiente',
      'met.sen': ' La pendiente de Sen estima cuánto cambia por año.',
      'met.anual': 'Suma la lluvia de cada año y ve si esos totales suben o bajan de forma consistente. Se usa el total anual porque muchos meses no llueve nada.',
      'met.autocorr': 'Compara cada mes del año con los mismos meses de otros años y ve si el dato sube o baja de forma consistente. El p-valor corrige la autocorrelación entre meses (un mes se parece al anterior), así que es más prudente.',
      'met.estacional': 'Compara cada mes del año con los mismos meses de otros años y ve si el dato sube o baja de forma consistente.',

      'et.clara': 'Tendencia clara (no es casualidad)', 'et.noClara': 'Sin tendencia clara', 'et.sinCalcular': 'Sin calcular',
      'franja.datos': 'DATOS DE PRUEBA — no son mediciones reales', 'franja.mapa': 'MAPA DE PRUEBA — las zonas dibujadas no son mediciones',
      'aviso.causa': 'Mostramos qué cambió, no por qué. Una tendencia no prueba la causa.',
      'gen.fecha': 'Datos generados el {f}',
      'gen.fuente': 'Fuente: {f}', 'gen.periodo': 'Periodo: {p}', 'gen.limite': 'Límite:',
      'ini.lead': 'Cómo han cambiado el calor, la vegetación, la lluvia y el agua en La Paz desde 2001, con datos abiertos de la NASA.',

      'mapa.lead': 'Zonas de La Paz según el cambio desde 2001. Elige un indicador.',
      'mapa.grupo': 'Indicador', 'mapa.region': 'Mapa de zonas de La Paz',
      'mapa.calor.que': 'Qué tan caliente está el suelo visto desde el satélite, no el aire. La cifra de calor de Inicio es la temperatura del aire.',
      'mapa.calor.tit': 'Zonas: calor del suelo (orientativo)', 'mapa.orient': 'orientativo',
      'mapa.calor.fuente': 'MODIS MOD11A2.061 (temperatura de superficie, 1 km) vía NASA AppEEARS',
      'mapa.calor.nota': 'Calor del suelo visto por el satélite Terra, 2001-2021. El otro satélite (Aqua) no confirma esta subida, así que las cifras por zona son solo una idea aproximada (orientativas), no una conclusión.',
      'mapa.veg.que': 'Qué tan verde se ve el suelo desde el satélite (índice NDVI: más alto, más plantas). Algunos meses no tienen lectura válida en la ciudad: es un panorama aproximado.',
      'mapa.veg.fuente': 'MODIS MOD13Q1.061 (NDVI, 250 m) vía NASA AppEEARS',
      'mapa.periodoPend': 'periodo pendiente', 'mapa.datoPrueba': ' (dato de prueba)',
      'mapa.sinMapa': 'No se pudo cargar el mapa (¿sin conexión?). La lista de zonas de abajo sigue disponible.',
      'mapa.errorMapa': 'No se pudo mostrar el mapa. La lista de zonas sigue disponible.',
      'mapa.leySinDatos': 'sin datos', 'mapa.leySinCambio': 'sin cambio claro',
      'mapa.hPrueba': 'Zonas de prueba del mapa (no son mediciones): ', 'mapa.hMas': 'Zonas con más cambio: ', 'mapa.hZonas': 'Zonas: ',
      'mapa.regional': 'Este indicador se mide a escala regional, no por zona; por eso el mapa no tiene datos para {t}. Mira su tarjeta en Inicio para ver el cambio en La Paz.',
      'mapa.verFicha': 'Ver ficha de {t}',
      'mapa.piePrueba': 'Zonas: datos de prueba sintéticos, no son mediciones; el mapa por zona espera datos de MODIS. El dato real de La Paz está en Inicio.',
      'mapa.pieMetodo': '. Cada zona es un punto: se dibuja como el cuadro de 1 km del satélite que lo contiene. Cómo se calcula el cambio: ver la Ficha.',
      'mapa.pieBase': ' Mapa base: © OpenStreetMap contributors.',

      'fic.abrir': 'Abrir la fuente ({h})', 'fic.volver': '← Volver a las tendencias de Inicio', 'fic.desde': 'Cambio total desde {a}',
      'fic.sinCifra': 'No se detecta un cambio claro; por eso no se muestra una cifra de cambio.',
      'fic.porDecada': 'Tendencia por década:', 'fic.media': 'Media por década', 'fic.serie': 'Serie por año',
      'fic.sinSerie': 'Sin datos suficientes para la gráfica.',
      'fic.graf': 'Gráfica de línea de {t} de {a} a {b}: pasa de {v1} a {v2} {u}.', 'fic.grafTit': '{t} por año',
      'fic.sig': '¿Es estadísticamente significativo?',
      'fic.si': 'Sí. La tendencia es clara: es muy poco probable que se deba solo al azar (p {p}, menor que alfa = {a}).',
      'fic.no': 'No se detecta un cambio claro: lo que vemos cabe dentro de la variación normal de un año a otro (p = {p}, no menor que alfa = {a}). Que no se detecte un cambio no prueba que no exista.',
      'fic.nc': 'Todavía no se calcula para este indicador, así que no podemos decir si la tendencia es clara.',
      'fic.metodo': 'Método: {m}.', 'fic.sinCalcular': 'sin calcular', 'fic.sinDato': 'sin dato',
      'fic.pAlfa': 'p-valor: {p} · alfa: {a}. Si p es menor que alfa, la tendencia se considera clara.',
      'fic.fuente': 'Fuente', 'fic.sobre': 'Sobre los datos', 'fic.resol': 'Resolución:', 'fic.periodo': 'Periodo:', 'fic.descarga': 'Fecha de descarga:', 'fic.limitacion': 'Limitación:',
      'fic.detalles': 'Detalles técnicos',
      'fic.sub.calor': 'Qué tan caliente está el aire, en promedio, cada año.', 'fic.sub.vegetacion': 'Qué tan verde se ve La Paz desde el satélite.',
      'fic.sub.lluvia': 'Cuánta lluvia cae en total cada año.', 'fic.sub.agua': 'Cuánta agua hay almacenada en la región (suelo, subsuelo y superficie).',

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
      'home.tend': 'Tendencias {r} · datos de la NASA', 'home.tendSin': 'Tendencias · datos de la NASA', 'home.h2': '¿Qué cambia?',
      'home.principal': 'Indicador principal', 'home.enLaPaz': '{t} en La Paz',
      'home.dPeriodo': 'Periodo', 'home.dDecada': 'Cambio por década', 'home.dPrueba': 'Prueba', 'home.dDataset': 'Dataset',
      'home.verFichaDe': 'Ver ficha de {t}', 'home.verFicha': 'Ver ficha',
      'home.hMapa': 'Monitoreo satelital · Península de Baja California',
      'cielo.h2': 'El cielo ahora en BCS',
      'cielo.actualizado': 'Actualizado {h} · hora de La Paz', 'cielo.viejo': 'El dato tiene más de 1 hora; puede no reflejar el cielo de ahora.',
      'cielo.capital': 'Capital del estado', 'cielo.sensacion': 'Sensación térmica {v} °C', 'cielo.humedad': 'Humedad', 'cielo.viento': 'Viento',
      'cielo.uv': 'Índice UV', 'cielo.presion': 'Presión', 'cielo.min': 'Mín {v}°C',
      'cielo.uv.bajo': 'Bajo', 'cielo.uv.moderado': 'Moderado', 'cielo.uv.alto': 'Alto', 'cielo.uv.muyAlto': 'Muy alto', 'cielo.uv.extremo': 'Extremo',
      'cielo.leyenda': 'Estado del cielo', 'cielo.sincro': 'Mismos datos que las tarjetas · {h}', 'cielo.leyendaNota': 'Modelo Open-Meteo · códigos WMO',
      'cielo.cargando': 'Cargando el cielo de ahora…', 'cielo.error': 'No pudimos cargar el clima de ahora. Las tendencias siguen disponibles.',
      'cielo.altGoes': 'Imagen más reciente del satélite GOES-West sobre la península de Baja California',
      'cielo.play': 'Reproducir', 'cielo.pausa': 'Pausar', 'cielo.animAria': 'Animación de las últimas 2 horas de imágenes del satélite',
      'cielo.insignia': 'Imagen GOES-West · NASA GIBS', 'cielo.cred': 'Imagen: NASA GIBS, GOES-West ABI GeoColor (NOAA), la más reciente (cada 10 min)',
      'home.insignia': 'Imagen MODIS Terra · NASA GIBS', 'home.dP': 'p-valor', 'home.dFuente': 'Fuente',
      'home.datosCodigo': 'Datos y código', 'home.fuentesNasa': 'Fuentes (NASA)', 'home.usoIA': 'Uso de IA', 'home.codigo': 'Código en GitHub', 'home.licencia': 'Licencia Apache-2.0', 'home.irIdioma': 'English',
      'home.alt': 'Imagen de satélite de Baja California Sur, 20 de abril de 2025',
      'home.cred': 'Imagen: NASA EOSDIS GIBS, MODIS Terra, 20 abr 2025 (CC0)',
      'home.btnZonas': 'Ver zonas de La Paz',
      'home.pieDesc': 'Tendencias ambientales de La Paz, B.C.S., con datos abiertos de la NASA.',
      'home.pantallas': 'Pantallas', 'home.piePag': 'Pie de página', 'home.fichas': 'Fichas',
      'home.copy': '© 2026 Equipo OptiPaz · NASA Space Apps Challenge 2026 · Licencia Apache-2.0'
    },
    en: {
      'html.saltar': 'Skip to content',
      'html.desc': 'Radar BCS: how heat, vegetation, rainfall and water have changed in La Paz, Baja California Sur, since 2001, with open NASA data.',
      'html.ogTitulo': 'Radar BCS: environmental trends in La Paz, Baja California Sur',
      'html.cargando': 'Loading data…',
      'html.pie': 'Team OptiPaz · NASA Space Apps Challenge 2026 · Apache-2.0 License',
      'html.ia': 'Code and analysis written with AI assistance (Claude Code); interface designed with help from Google Stitch; AI-generated logo (Gemini).',
      'html.logo': 'Radar BCS, home', 'html.logoIA': 'AI-generated logo',
      'html.secciones': 'Sections',
      'nav.inicio': 'Home', 'nav.mapa': 'Map', 'nav.ficha': 'Details', 'nav.agricola': 'Farming', 'nav.acciones': 'Actions',
      'titulo.inicio': 'Home', 'titulo.mapa': 'Map', 'titulo.ficha': 'Details', 'titulo.acciones': 'Actions', 'titulo.agricola': 'Farming Map',
      'idioma.cambiar': 'Español', 'idioma.etiqueta': 'Ver este sitio en español',

      'reg.sinDatos': 'no data', 'reg.sinCambio': 'No clear change', 'reg.sinDatosPend': 'No data (pending)', 'reg.pendiente': 'pending',
      'met.sen': " Sen's slope estimates how much it changes per year.",
      'met.anual': 'It adds up the rainfall of each year and checks whether those totals rise or fall consistently. Annual totals are used because many months have no rain at all.',
      'met.autocorr': 'It compares each month with the same month in other years and checks whether the value rises or falls consistently. The p-value is corrected for autocorrelation between months (one month resembles the previous one), so it is more cautious.',
      'met.estacional': 'It compares each month with the same month in other years and checks whether the value rises or falls consistently.',

      'et.clara': 'Clear trend (not just chance)', 'et.noClara': 'No clear trend', 'et.sinCalcular': 'Not calculated',
      'franja.datos': 'TEST DATA — not real measurements', 'franja.mapa': 'TEST MAP — the zones drawn are not measurements',
      'aviso.causa': 'We show what changed, not why. A trend does not prove the cause.',
      'gen.fecha': 'Data generated on {f}',
      'gen.fuente': 'Source: {f}', 'gen.periodo': 'Period: {p}', 'gen.limite': 'Limitation:',
      'ini.lead': 'How heat, vegetation, rainfall and water have changed in La Paz since 2001, using NASA open data.',

      'mapa.lead': 'Zones of La Paz by change since 2001. Choose an indicator.',
      'mapa.grupo': 'Indicator', 'mapa.region': 'Map of La Paz zones',
      'mapa.calor.que': 'How hot the ground looks from the satellite, not the air. The heat figure on Home is the air temperature.',
      'mapa.calor.tit': 'Zones: ground heat (indicative)', 'mapa.orient': 'indicative',
      'mapa.calor.fuente': 'MODIS MOD11A2.061 (land surface temperature, 1 km) via NASA AppEEARS',
      'mapa.calor.nota': 'Ground heat seen by the Terra satellite, 2001-2021. The other satellite (Aqua) does not confirm this rise, so the figures by zone are only a rough idea (indicative), not a conclusion.',
      'mapa.veg.que': 'How green the ground looks from the satellite (NDVI index: higher means more plants). Some months have no valid reading in the city: this is an approximate picture.',
      'mapa.veg.fuente': 'MODIS MOD13Q1.061 (NDVI, 250 m) via NASA AppEEARS',
      'mapa.periodoPend': 'period pending', 'mapa.datoPrueba': ' (test data)',
      'mapa.sinMapa': 'The map could not be loaded (offline?). The list of zones below is still available.',
      'mapa.errorMapa': 'The map could not be shown. The list of zones is still available.',
      'mapa.leySinDatos': 'no data', 'mapa.leySinCambio': 'no clear change',
      'mapa.hPrueba': 'Test zones on the map (not measurements): ', 'mapa.hMas': 'Zones with the most change: ', 'mapa.hZonas': 'Zones: ',
      'mapa.regional': 'This indicator is measured at a regional scale, not by zone, so the map has no data for {t}. See its card on Home for the change in La Paz.',
      'mapa.verFicha': 'See {t} details',
      'mapa.piePrueba': 'Zones: synthetic test data, not measurements; the zone map is waiting for MODIS data. The real value for La Paz is on Home.',
      'mapa.pieMetodo': '. Each zone is one point, drawn as the 1 km satellite square that contains it. How the change is calculated: see the Details.',
      'mapa.pieBase': ' Base map: © OpenStreetMap contributors.',

      'fic.abrir': 'Open the source ({h})', 'fic.volver': '← Back to the trends on Home', 'fic.desde': 'Total change since {a}',
      'fic.sinCifra': 'No clear change is detected, so no change figure is shown.',
      'fic.porDecada': 'Trend per decade:', 'fic.media': 'Average per decade', 'fic.serie': 'Year by year',
      'fic.sinSerie': 'Not enough data for the chart.',
      'fic.graf': 'Line chart of {t} from {a} to {b}: it goes from {v1} to {v2} {u}.', 'fic.grafTit': '{t} per year',
      'fic.sig': 'Is it statistically significant?',
      'fic.si': 'Yes. The trend is clear: it is very unlikely to be due to chance alone (p {p}, less than alpha = {a}).',
      'fic.no': 'No clear change is detected: what we see fits within the normal variation from one year to the next (p = {p}, not less than alpha = {a}). Not detecting a change does not prove there is none.',
      'fic.nc': 'This has not been calculated for this indicator yet, so we cannot say whether the trend is clear.',
      'fic.metodo': 'Method: {m}.', 'fic.sinCalcular': 'not calculated', 'fic.sinDato': 'no data',
      'fic.pAlfa': 'p-value: {p} · alpha: {a}. If p is less than alpha, the trend is considered clear.',
      'fic.fuente': 'Source', 'fic.sobre': 'About the data', 'fic.resol': 'Resolution:', 'fic.periodo': 'Period:', 'fic.descarga': 'Downloaded on:', 'fic.limitacion': 'Limitation:',
      'fic.detalles': 'Technical details',
      'fic.sub.calor': 'How hot the air is, on average, each year.', 'fic.sub.vegetacion': 'How green La Paz looks from the satellite.',
      'fic.sub.lluvia': 'How much rain falls in total each year.', 'fic.sub.agua': 'How much water is stored in the region (soil, groundwater and surface water).',

      'acc.h1': 'What can I do?', 'acc.calor': 'Against the heat', 'acc.agua': 'To save water',
      'acc.c1': 'Wear loose, light-colored clothing that covers your arms and legs, and a wide-brimmed hat that shades your face, ears and neck.',
      'acc.c2': 'If you can, do outdoor activities during the coolest part of the day or at night.',
      'acc.c3': 'If you have air conditioning, use it; if not, find a cool place. Even a few hours in a cool place lowers the risk.',
      'acc.c4': 'Use a fan only if the temperature indoors is below 32 °C: above that it can raise your body temperature.',
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
      'home.tend': 'Trends {r} · NASA data', 'home.tendSin': 'Trends · NASA data', 'home.h2': 'What is changing?',
      'home.principal': 'Main indicator', 'home.enLaPaz': '{t} in La Paz',
      'home.dPeriodo': 'Period', 'home.dDecada': 'Change per decade', 'home.dPrueba': 'Statistical test', 'home.dDataset': 'Dataset',
      'home.verFichaDe': 'See {t} details', 'home.verFicha': 'See details',
      'home.hMapa': 'Satellite monitoring · Baja California Peninsula',
      'cielo.h2': 'The sky now in BCS',
      'cielo.actualizado': 'Updated {h} · La Paz time', 'cielo.viejo': 'This data is more than 1 hour old; it may not show the sky right now.',
      'cielo.capital': 'State capital', 'cielo.sensacion': 'Feels like {v} °C', 'cielo.humedad': 'Humidity', 'cielo.viento': 'Wind',
      'cielo.uv': 'UV index', 'cielo.presion': 'Pressure', 'cielo.min': 'Low {v}°C',
      'cielo.uv.bajo': 'Low', 'cielo.uv.moderado': 'Moderate', 'cielo.uv.alto': 'High', 'cielo.uv.muyAlto': 'Very high', 'cielo.uv.extremo': 'Extreme',
      'cielo.leyenda': 'Sky condition', 'cielo.sincro': 'Same data as the cards · {h}', 'cielo.leyendaNota': 'Open-Meteo model · WMO codes',
      'cielo.cargando': 'Loading the sky now…', 'cielo.error': "We couldn't load the current weather. The trends are still available.",
      'cielo.altGoes': 'Latest GOES-West satellite image of the Baja California peninsula',
      'cielo.play': 'Play', 'cielo.pausa': 'Pause', 'cielo.animAria': 'Animation of the last 2 hours of satellite images',
      'cielo.insignia': 'GOES-West image · NASA GIBS', 'cielo.cred': 'Image: NASA GIBS, GOES-West ABI GeoColor (NOAA), latest available (every 10 min)',
      'home.insignia': 'MODIS Terra image · NASA GIBS', 'home.dP': 'p-value', 'home.dFuente': 'Source',
      'home.datosCodigo': 'Data and code', 'home.fuentesNasa': 'Sources (NASA)', 'home.usoIA': 'Use of AI', 'home.codigo': 'Code on GitHub', 'home.licencia': 'Apache-2.0 License', 'home.irIdioma': 'Español',
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
    // Descripción y vista previa al compartir (#119 D3)
    function meta(sel, v) { var m = doc.querySelector(sel); if (m) m.setAttribute('content', v); }
    meta('meta[name="description"]', t('html.desc'));
    meta('meta[property="og:description"]', t('html.desc'));
    meta('meta[property="og:title"]', t('html.ogTitulo'));
    meta('meta[property="og:image:alt"]', t('home.alt'));
    meta('meta[property="og:locale"]', lang === 'en' ? 'en_US' : 'es_MX');
    meta('meta[property="og:locale:alternate"]', lang === 'en' ? 'es_MX' : 'en_US');
    doc.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    doc.querySelectorAll('[data-t-alt]').forEach(function (el) { el.setAttribute('alt', t(el.getAttribute('data-t-alt'))); });
    doc.querySelectorAll('[data-t-title]').forEach(function (el) { el.setAttribute('title', t(el.getAttribute('data-t-title'))); });
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
