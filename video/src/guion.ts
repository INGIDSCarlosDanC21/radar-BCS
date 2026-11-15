// Guion del video de 30 s de Radar BCS. ESTE es el archivo que se edita para cambiar tiempos o texto.
//
// - Texto: idéntico a la columna "Narración" de docs/entrega/08b-video-shotlist.md (la voz de
//   ElevenLabs lee ese mismo texto). Si cambias una palabra aquí, cámbiala también en 08b y en la voz.
// - Tiempos: en SEGUNDOS desde el inicio del video. Si la voz dura distinto, mueve "desde/hasta"
//   de los subtítulos para que coincidan con lo que se oye, y ajusta las escenas (ver README.md).
// - Regla: DURACION_S <= 30 (objetivo 27). Cifras solo las del guion (data/salida/indicadores.json).

export const FPS = 30;
export const DURACION_S = 26; // voz de ElevenLabs (Sarah, velocidad 1.15): 25.4 s

// Escenas, una por toma del brief (docs/entrega/08c-brief-video.md). Deben ir seguidas y sin huecos.
export const ESCENAS = {
  titulo: { desde: 0, hasta: 1.8 }, // toma 1: tarjeta "Radar BCS · OptiPaz"
  inicio: { desde: 1.8, hasta: 6.2 }, // toma 1: Inicio con las 4 tarjetas
  calor: { desde: 6.2, hasta: 12 }, // toma 2: ficha de Calor (+1.47 °C, p < 0.001)
  lluvia: { desde: 12, hasta: 15.6 }, // toma 3: ficha de Lluvia (no clear change)
  mapa: { desde: 15.6, hasta: 18.2 }, // toma 4: mapa de 38 lugares
  clima: { desde: 18.2, hasta: 19.9 }, // toma 5: Clima (4 tarjetas)
  pesca: { desde: 19.9, hasta: 21.7 }, // toma 5: Pesca ("model", "not an official warning")
  cierre: { desde: 21.7, hasta: DURACION_S }, // toma 6: enlace y fuentes
} as const;

export type Subtitulo = { texto: string; desde: number; hasta: number };

// Subtítulos quemados (EN). Una frase larga se parte en dos para que quepa en pantalla;
// juntas dicen exactamente el texto del guion.
export const SUBTITULOS: Subtitulo[] = [
  // Tiempos medidos con alineación forzada de ElevenLabs sobre narracion.mp3 (2026-11-15)
  { texto: "In La Paz, heat, water and the sea touch everyone.", desde: 0.2, hasta: 3.0 },
  { texto: "Radar BCS turns NASA data into answers.", desde: 3.3, hasta: 6.0 },
  { texto: "Air temperature rose about 1.5 degrees since 2001,", desde: 6.4, hasta: 9.8 },
  { texto: "a statistically significant change.", desde: 9.8, hasta: 11.8 },
  { texto: "Where we are unsure, we say it:", desde: 12.1, hasta: 13.5 },
  { texto: "rainfall shows no clear change.", desde: 13.5, hasta: 15.5 },
  { texto: "The map shows where, across 38 places.", desde: 15.7, hasta: 18.0 },
  { texto: "Today's sea and weather are model estimates,", desde: 18.4, hasta: 20.1 },
  { texto: "not official warnings.", desde: 20.1, hasta: 21.5 },
  { texto: "What changed, not why. Radar BCS.", desde: 21.8, hasta: 25.2 },
];

// Movimiento dentro de cada captura (segundos relativos al inicio de la escena).
// "marca" = punto guardado por scripts/capturar-video.mjs en video/public/tomas/tomas.json.
// modo "scroll" = desplazamiento suave; "fundido" = cambio con fundido (para saltos largos).
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

// Deriva lenta (px del video por segundo) para que la pantalla no se vea congelada.
export const DERIVA_PX_S = 14;

export const LINEA_IA = 'AI-generated voice (ElevenLabs)';
export const URL_WEB = 'ingidscarlosdanc21.github.io/radar-BCS';
export const FUENTES_DATOS = 'Data: NASA POWER · MODIS · GRACE · GIBS';

// ─────────────────────────────────────────────────────────────────────────────
// TRÁILER horizontal (composición RadarBCSTrailer, 1920x1080, 30 fps, 28 s).
// Rejilla musical: 120 BPM → negra = 0.5 s, compás = 2 s. Todo corte cae en múltiplo de 0.5 s.
// La voz y los subtítulos son los mismos de arriba (SUBTITULOS); aquí solo van escenas y golpes.
// ─────────────────────────────────────────────────────────────────────────────
export const TRAILER_DURACION_S = 28;

export const TRAILER_ESCENAS = {
  apertura: { desde: 0, hasta: 3 }, // satélite + HEAT · WATER · SEA
  titulo: { desde: 3, hasta: 6 }, // logo con glitch + teléfono que sube (Inicio)
  calor: { desde: 6, hasta: 12 }, // +1.47 °C, gráfica anual real, p < 0.001
  lluvia: { desde: 12, hasta: 15.5 }, // barras de lluvia reales, "No clear change"
  mapa: { desde: 15.5, hasta: 18.5 }, // satélite inclinado + 38 pines
  avisos: { desde: 18.5, hasta: 22 }, // cortes rápidos: Clima, Pesca, "not official warnings"
  cierre: { desde: 22, hasta: TRAILER_DURACION_S }, // "What changed, not why." + logo + URL
} as const;

// Palabras clave de la apertura, en el instante en que la voz las dice (rejilla de 0.5 s).
export const PALABRAS_APERTURA = [
  { texto: 'HEAT', en: 1.0 },
  { texto: 'WATER', en: 1.5 },
  { texto: 'SEA', en: 2.0 },
] as const;

// Cifras: SOLO las de web/data/indicadores.json (copiadas tal cual; ver Trailer/datos.ts).
export const CIFRA_CALOR = '+1.47 °C';
export const P_CALOR = 'p < 0.001';
export const P_LLUVIA = 'p = 0.129';
export const LUGARES = 38;

// Efectos de sonido (archivos de la rama lider/trailer-audio en public/audio/).
// "en" = segundo del golpe; los risers terminan EXACTO en el corte (empiezan en en - duración).
export type Senal = { archivo: string; en: number; volumen: number };
export const SENALES: Senal[] = [
  { archivo: 'riser-3s', en: 0, volumen: 0.5 }, // culmina en 3.0 (corte al título)
  { archivo: 'hit-soft', en: 1.0, volumen: 0.5 },
  { archivo: 'hit-soft', en: 1.5, volumen: 0.5 },
  { archivo: 'hit-soft', en: 2.0, volumen: 0.5 },
  { archivo: 'hit-impact', en: 3.0, volumen: 0.8 },
  { archivo: 'glitch', en: 3.0, volumen: 0.45 },
  { archivo: 'whoosh-long', en: 4.0, volumen: 0.5 },
  { archivo: 'whoosh-short', en: 5.9, volumen: 0.5 },
  { archivo: 'hit-impact', en: 6.0, volumen: 0.6 },
  { archivo: 'counter-tick', en: 6.5, volumen: 0.4 },
  { archivo: 'ui-pop', en: 10.0, volumen: 0.6 },
  { archivo: 'whoosh-short', en: 11.8, volumen: 0.6 },
  { archivo: 'hit-soft', en: 12.0, volumen: 0.5 },
  { archivo: 'reverse-swell', en: 12.5, volumen: 0.4 },
  { archivo: 'ui-tick', en: 13.5, volumen: 0.5 },
  { archivo: 'whoosh-long', en: 15.2, volumen: 0.5 },
  { archivo: 'hit-impact', en: 15.5, volumen: 0.55 },
  { archivo: 'ui-pop', en: 16.0, volumen: 0.45 },
  { archivo: 'ui-pop', en: 16.5, volumen: 0.45 },
  { archivo: 'ui-pop', en: 17.0, volumen: 0.45 },
  { archivo: 'ui-pop', en: 17.5, volumen: 0.45 },
  { archivo: 'whoosh-short', en: 18.4, volumen: 0.5 },
  { archivo: 'ui-tick', en: 19.0, volumen: 0.5 },
  { archivo: 'ui-tick', en: 19.5, volumen: 0.5 },
  { archivo: 'glitch', en: 20.0, volumen: 0.4 },
  { archivo: 'riser-3s', en: 19.0, volumen: 0.45 }, // culmina en 22.0 (corte al cierre)
  { archivo: 'hit-impact', en: 22.0, volumen: 0.75 },
  { archivo: 'sparkle-reveal', en: 23.5, volumen: 0.6 },
  { archivo: 'hit-soft', en: 23.5, volumen: 0.5 },
  { archivo: 'tail-outro', en: 24.0, volumen: 0.6 },
];
