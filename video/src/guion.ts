// Guion del video de Radar BCS. ESTE es el archivo que se edita para cambiar tiempos o texto.
//
// - Texto: idéntico a la columna "Narración" de docs/entrega/08b-video-shotlist.md (la voz de
//   ElevenLabs lee ese mismo texto). Si cambias una palabra aquí, cámbiala también en 08b y en la voz.
// - Tiempos: en SEGUNDOS desde el inicio del video. Al cambiar la voz se re-tiempan SOLO los
//   TRAMOS_VOZ (abajo); subtítulos, palabras clave, momentos y sonidos salen de ahí (ver README.md).
// - Regla: duración <= 30 s. Cifras solo las del guion (data/salida/indicadores.json).

export const FPS = 30;
export const DURACION_S = 27; // video vertical de respaldo (RadarBCS30s); voz Katie: 26.69 s

// Escenas del video VERTICAL de respaldo (docs/entrega/08c-brief-video.md). Seguidas y sin huecos.
export const ESCENAS = {
  titulo: { desde: 0, hasta: 1.8 },
  inicio: { desde: 1.8, hasta: 6.7 },
  calor: { desde: 6.7, hasta: 12.3 },
  lluvia: { desde: 12.3, hasta: 16.3 },
  mapa: { desde: 16.3, hasta: 19.1 },
  clima: { desde: 19.1, hasta: 20.9 },
  pesca: { desde: 20.9, hasta: 22.9 },
  cierre: { desde: 22.9, hasta: DURACION_S },
} as const;

export type Subtitulo = { texto: string; desde: number; hasta: number };

// VOZ: un solo archivo, un solo lugar. Voz "Katie" de ElevenLabs (2026-11-15), 26.69 s.
export const VOZ = 'narracion-katie.mp3'; // en video/public/ (no se sube al repo)

// Tramos de voz entre pausas, medidos con ffmpeg silencedetect (n=-35 dB, d=0.07 s) sobre
// narracion-katie.mp3 y los cortes de frase de public/voz/tiempos-katie.json.
export const TRAMOS_VOZ: Subtitulo[] = [
  { texto: 'In La Paz, heat, water and the sea touch everyone.', desde: 0.0, hasta: 3.59 },
  { texto: 'Radar BCS', desde: 3.75, hasta: 4.71 },
  { texto: 'turns NASA data into answers.', desde: 4.79, hasta: 6.64 },
  { texto: 'Air temperature rose about 1.5 degrees since 2001,', desde: 6.84, hasta: 10.04 },
  { texto: 'a statistically significant change.', desde: 10.37, hasta: 12.2 },
  { texto: 'Where we are unsure,', desde: 12.4, hasta: 13.53 },
  { texto: 'we say it:', desde: 13.61, hasta: 14.19 },
  { texto: 'rainfall shows no clear change.', desde: 14.53, hasta: 16.25 },
  { texto: 'The map shows where,', desde: 16.4, hasta: 17.43 },
  { texto: 'across', desde: 17.51, hasta: 17.89 },
  { texto: '38 places.', desde: 17.99, hasta: 18.98 },
  { texto: "Today's sea and weather are model estimates,", desde: 19.18, hasta: 21.4 },
  { texto: 'not official warnings.', desde: 21.54, hasta: 22.76 },
  { texto: 'What changed,', desde: 23.07, hasta: 23.32 },
  { texto: 'not why.', desde: 23.39, hasta: 24.09 },
  { texto: 'Radar', desde: 24.37, hasta: 25.07 },
  { texto: 'BCS.', desde: 25.52, hasta: 26.69 },
];

// Subtítulos: cada línea junta tramos (índices de TRAMOS_VOZ). Juntas dicen el guion exacto.
const LINEAS: number[][] = [[0], [1, 2], [3], [4], [5, 6, 7], [8, 9, 10], [11], [12], [13, 14, 15, 16]];
export const SUBTITULOS: Subtitulo[] = LINEAS.map((l) => ({
  texto: l.map((i) => TRAMOS_VOZ[i].texto).join(' '),
  desde: TRAMOS_VOZ[l[0]].desde,
  hasta: TRAMOS_VOZ[l[l.length - 1]].hasta,
}));

// Palabras con tiempo estimado: dentro de cada tramo el tiempo se reparte por sílabas aproximadas.
export type Palabra = { texto: string; desde: number; hasta: number; linea: number };
const silabas = (w: string) => Math.max(1, (w.toLowerCase().match(/[aeiouy]+|[0-9]/g) || []).length);
export const PALABRAS: Palabra[] = LINEAS.flatMap((l, linea) =>
  l.flatMap((ti) => {
    const t = TRAMOS_VOZ[ti];
    const ws = t.texto.split(' ');
    const pesos = ws.map(silabas);
    const total = pesos.reduce((a, b) => a + b, 0);
    let acc = 0;
    return ws.map((w, i) => {
      const desde = t.desde + ((t.hasta - t.desde) * acc) / total;
      acc += pesos[i];
      return { texto: w, desde, hasta: t.desde + ((t.hasta - t.desde) * acc) / total, linea };
    });
  }),
);
// Instante en que empieza la n-ésima aparición de una palabra (sin distinguir mayúsculas).
export function inicioPalabra(w: string, n = 0): number {
  const lista = PALABRAS.filter((p) => p.texto.toLowerCase() === w.toLowerCase());
  if (!lista[n]) throw new Error(`guion.ts: no encuentro la palabra "${w}" (${n})`);
  return lista[n].desde;
}

// Color de acento de las palabras clave en los subtítulos cinéticos.
const AMBAR = '#ffb020';
const CIAN = '#51d8e8';
const ESMERALDA = '#34e08a';
const MAR = '#3fd0b0';
const ROJO = '#ff6b6b';
export const ACENTOS: Record<string, string> = {
  'heat,': '#ff8a3d',
  water: CIAN,
  sea: MAR,
  NASA: CIAN,
  Radar: CIAN,
  BCS: CIAN,
  'BCS.': CIAN,
  '1.5': AMBAR,
  degrees: AMBAR,
  statistically: AMBAR,
  significant: AMBAR,
  no: CIAN,
  clear: CIAN,
  'change.': CIAN,
  '38': ESMERALDA,
  'places.': ESMERALDA,
  model: MAR,
  'estimates,': MAR,
  not: ROJO,
  official: ROJO,
  'warnings.': ROJO,
  'why.': CIAN,
};

export const URL_WEB = 'ingidscarlosdanc21.github.io/radar-BCS';
export const FUENTES_DATOS = 'Data: NASA POWER · MODIS · GRACE · GIBS';

// Video vertical de respaldo: movimiento dentro de cada captura (segundos relativos a la escena).
export type Plano = { marca: string; en: number; modo?: 'scroll' | 'fundido'; duracion?: number };
export const PLANOS: Record<'inicio' | 'calor' | 'lluvia' | 'mapa' | 'clima' | 'pesca', Plano[]> = {
  inicio: [
    { marca: 'arriba', en: 0 },
    { marca: 'tarjetas', en: 0.8, modo: 'scroll', duracion: 0.8 },
    { marca: 'agua', en: 2.0, modo: 'scroll', duracion: 2.0 },
  ],
  calor: [
    { marca: 'arriba', en: 0 },
    { marca: 'significancia', en: 2.7, modo: 'fundido', duracion: 0.5 },
  ],
  lluvia: [{ marca: 'arriba', en: 0 }],
  mapa: [
    { marca: 'lugares', en: 0 },
    { marca: 'mapa', en: 0.6, modo: 'scroll', duracion: 1.0 },
  ],
  clima: [{ marca: 'resumen', en: 0 }],
  pesca: [
    { marca: 'arriba', en: 0 },
    { marca: 'diagnostico', en: 0.9, modo: 'fundido', duracion: 0.4 },
  ],
};
export const DERIVA_PX_S = 14;

// ─────────────────────────────────────────────────────────────────────────────
// TRÁILER horizontal (composición RadarBCSTrailer, 1920x1080, 30 fps, 28 s).
// Rejilla musical: 120 BPM → negra = 0.5 s, compás = 2 s. Los CORTES caen en múltiplos de 0.5 s;
// los momentos de la voz (palabras, cifras) salen de TRAMOS_VOZ y no se redondean.
// ─────────────────────────────────────────────────────────────────────────────
export const TRAILER_DURACION_S = 28;

// Escenas (cortes en la rejilla, justo antes del inicio de cada frase de la voz).
export const TRAILER_ESCENAS = {
  apertura: { desde: 0, hasta: 3.5 }, // satélite + HEAT · WATER · SEA (frase 1)
  titulo: { desde: 3.5, hasta: 6.5 }, // logo + teléfono con la app cambiando de pantalla (frase 2)
  calor: { desde: 6.5, hasta: 12.5 }, // +1.47 °C, gráfica anual real, p < 0.001, simulación (frase 3)
  lluvia: { desde: 12.5, hasta: 16.5 }, // barras de lluvia reales, "No clear change" (frase 4)
  mapa: { desde: 16.5, hasta: 19 }, // satélite + 38 pines + mapa real de la app (frase 5)
  funciones: { desde: 19, hasta: 23 }, // montaje rápido de funciones + "not official warnings" (frase 6)
  cierre: { desde: 23, hasta: TRAILER_DURACION_S }, // "What changed, not why." + logo + URL (frase 7)
} as const;

// Palabras clave de la apertura: su instante sale de la voz.
export const PALABRAS_APERTURA = [
  { texto: 'HEAT', en: inicioPalabra('heat,') },
  { texto: 'WATER', en: inicioPalabra('water') },
  { texto: 'SEA', en: inicioPalabra('sea') },
] as const;

// Momentos clave atados a la VOZ (segundos absolutos), derivados de TRAMOS_VOZ.
export const MOMENTOS = {
  contadorDesde: inicioPalabra('temperature'),
  contadorHasta: inicioPalabra('degrees') + 0.3,
  graficaDesde: inicioPalabra('rose'),
  graficaHasta: inicioPalabra('2001,'),
  sello: inicioPalabra('statistically'),
  noClearChange: inicioPalabra('no'),
  pLluvia: inicioPalabra('change.', 1),
  pinesDesde: inicioPalabra('where,'),
  pinesPaso: 0.25, // separación entre las 4 oleadas de pines (semicorchea a 120 BPM)
  laPaz: inicioPalabra('places.'),
  modelEstimates: inicioPalabra('model'),
  notOfficial: inicioPalabra('not', 0),
  cierreFrase1: inicioPalabra('what'),
  cierreFrase2: inicioPalabra('not', 1),
  logo: inicioPalabra('radar', 1),
  url: inicioPalabra('radar', 1) + 1.0,
  fuentes: inicioPalabra('radar', 1) + 1.4,
} as const;

// Cifras: SOLO las de web/data/indicadores.json.
export const CIFRA_CALOR = '+1.47 °C';
export const P_CALOR = 'p < 0.001';
export const P_LLUVIA = 'p = 0.129';
export const LUGARES = 38;

// Clips REALES de la web grabados por scripts/grabar-clips.mjs (video/public/clips/, no se suben).
// "desde" = segundo del clip donde empieza a usarse.
export type Clip = { archivo: string; desde: number };
export const CLIPS = {
  barra: { archivo: 'clips/barra.mp4', desde: 4.2 },
  cielo: { archivo: 'clips/inicio-cielo.mp4', desde: 0.3 },
  calorSim: { archivo: 'clips/calor-simulacion.mp4', desde: 2.2 },
  calorFicha: { archivo: 'clips/calor-ficha.mp4', desde: 0.5 },
  lluvia: { archivo: 'clips/lluvia-ficha.mp4', desde: 2.0 },
  lugares: { archivo: 'clips/lugares.mp4', desde: 2.0 },
  satelite: { archivo: 'clips/clima-satelite.mp4', desde: 4.0 },
  imerg: { archivo: 'clips/clima-satelite.mp4', desde: 11.0 },
  simSat: { archivo: 'clips/sim-satelite.mp4', desde: 9.8 },
  capas: { archivo: 'clips/lugares.mp4', desde: 7.0 },
  agricola: { archivo: 'clips/agricola.mp4', desde: 1.0 },
  avisos: { archivo: 'clips/avisos.mp4', desde: 5.0 },
} satisfies Record<string, Clip>;

// Montaje rápido de funciones (segundos absolutos; un corte cada 0.5 s en la escena "funciones").
export const MONTAJE_FUNCIONES: { clip: keyof typeof CLIPS; etiqueta: string; desde: number }[] = [
  { clip: 'satelite', etiqueta: 'GOES-WEST CLOUDS · LAST 2 HOURS', desde: 19.0 },
  { clip: 'imerg', etiqueta: 'IMERG RAIN · NASA GPM', desde: 19.5 },
  { clip: 'capas', etiqueta: 'WEATHER MAP · LAYERS', desde: 20.0 },
  { clip: 'agricola', etiqueta: 'FARMING MAP · NDVI', desde: 20.5 },
  { clip: 'simSat', etiqueta: 'GROUND HEAT FROM SPACE', desde: 21.0 },
];

// Efectos de sonido: archivos CC0 de la rama lider/trailer-audio en public/audio/ (fuentes en
// public/audio/LICENCIAS.md). Volúmenes de docs/entrega/09-audio-trailer.md (narración = 1.0).
// "en" = segundo en que EMPIEZA el archivo: risers y reverse terminan justo en el corte;
// los whoosh-short empiezan 0.35 s antes del corte (su pico está en 0.35 s).
export type Senal = { archivo: string; en: number; volumen: number };
export const LECHO = 'audio/bed-120bpm-28s.mp3'; // trae riser 6-12 s e impactos en 12.0 y 24.0 s
const E = TRAILER_ESCENAS;
const M = MOMENTOS;
export const SENALES: Senal[] = [
  { archivo: 'audio/riser-3s.wav', en: E.titulo.desde - 3, volumen: 0.07 },
  ...PALABRAS_APERTURA.map((p) => ({ archivo: 'audio/ui-tick.wav', en: p.en, volumen: 0.15 })),
  ...[E.titulo, E.calor, E.lluvia, E.mapa, E.funciones, E.cierre].map((e) => ({ archivo: 'audio/whoosh-short.wav', en: e.desde - 0.35, volumen: 0.18 })),
  { archivo: 'audio/hit-soft.wav', en: E.titulo.desde, volumen: 0.14 },
  { archivo: 'audio/glitch.wav', en: E.titulo.desde, volumen: 0.18 },
  { archivo: 'audio/whoosh-long.wav', en: E.titulo.desde + 1, volumen: 0.15 },
  { archivo: 'audio/riser-6s.wav', en: E.lluvia.desde - 6, volumen: 0.07 },
  ...Array.from({ length: 9 }, (_, k) => ({ archivo: 'audio/counter-tick.wav', en: M.contadorDesde + (k * (M.contadorHasta - M.contadorDesde)) / 9, volumen: 0.125 + k * 0.007 })),
  { archivo: 'audio/ui-pop.wav', en: M.sello, volumen: 0.2 },
  { archivo: 'audio/reverse-swell.wav', en: E.lluvia.desde - 2, volumen: 0.15 },
  { archivo: 'audio/hit-impact.wav', en: E.lluvia.desde, volumen: 0.15 },
  { archivo: 'audio/ui-tick.wav', en: M.noClearChange, volumen: 0.15 },
  { archivo: 'audio/riser-3s.wav', en: E.mapa.desde - 3, volumen: 0.07 },
  { archivo: 'audio/hit-soft.wav', en: E.mapa.desde, volumen: 0.125 },
  ...[0, 1, 2, 3].map((k) => ({ archivo: 'audio/ui-pop.wav', en: M.pinesDesde + k * M.pinesPaso, volumen: 0.2 })),
  ...MONTAJE_FUNCIONES.slice(1).map((p) => ({ archivo: 'audio/ui-tick.wav', en: p.desde, volumen: 0.15 })),
  { archivo: 'audio/glitch.wav', en: M.notOfficial - 0.1, volumen: 0.18 },
  { archivo: 'audio/ui-pop.wav', en: M.notOfficial + 0.3, volumen: 0.2 },
  { archivo: 'audio/riser-3s.wav', en: E.cierre.desde - 3, volumen: 0.07 },
  { archivo: 'audio/hit-soft.wav', en: E.cierre.desde, volumen: 0.15 },
  { archivo: 'audio/sparkle-reveal.wav', en: M.logo, volumen: 0.175 },
  { archivo: 'audio/tail-outro.wav', en: M.logo + 0.5, volumen: 0.175 },
];
