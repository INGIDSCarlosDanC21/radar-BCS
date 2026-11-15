// Guion del video de 30 s de Radar BCS. ESTE es el archivo que se edita para cambiar tiempos o texto.
//
// - Texto: idéntico a la columna "Narración" de docs/entrega/08b-video-shotlist.md (la voz de
//   ElevenLabs lee ese mismo texto). Si cambias una palabra aquí, cámbiala también en 08b y en la voz.
// - Tiempos: en SEGUNDOS desde el inicio del video. Si la voz dura distinto, mueve "desde/hasta"
//   de los subtítulos para que coincidan con lo que se oye, y ajusta las escenas (ver README.md).
// - Regla: DURACION_S <= 30 (objetivo 27). Cifras solo las del guion (data/salida/indicadores.json).

export const FPS = 30;
export const DURACION_S = 27;

// Escenas, una por toma del brief (docs/entrega/08c-brief-video.md). Deben ir seguidas y sin huecos.
export const ESCENAS = {
  titulo: { desde: 0, hasta: 1.8 }, // toma 1: tarjeta "Radar BCS · OptiPaz"
  inicio: { desde: 1.8, hasta: 6 }, // toma 1: Inicio con las 4 tarjetas
  calor: { desde: 6, hasta: 11.5 }, // toma 2: ficha de Calor (+1.47 °C, p < 0.001)
  lluvia: { desde: 11.5, hasta: 16 }, // toma 3: ficha de Lluvia (no clear change)
  mapa: { desde: 16, hasta: 19.5 }, // toma 4: mapa de 38 lugares
  clima: { desde: 19.5, hasta: 21.7 }, // toma 5: Clima (4 tarjetas)
  pesca: { desde: 21.7, hasta: 24 }, // toma 5: Pesca ("model", "not an official warning")
  cierre: { desde: 24, hasta: DURACION_S }, // toma 6: enlace y fuentes
} as const;

export type Subtitulo = { texto: string; desde: number; hasta: number };

// Subtítulos quemados (EN). Una frase larga se parte en dos para que quepa en pantalla;
// juntas dicen exactamente el texto del guion.
export const SUBTITULOS: Subtitulo[] = [
  // Toma 1 (17 palabras)
  { texto: 'In La Paz, heat, water and the sea touch everyone.', desde: 0.2, hasta: 3.0 },
  { texto: 'Radar BCS turns NASA data into answers.', desde: 3.0, hasta: 5.9 },
  // Toma 2 (12)
  { texto: 'Air temperature rose about 1.5 degrees since 2001,', desde: 6.1, hasta: 8.9 },
  { texto: 'a statistically significant change.', desde: 8.9, hasta: 11.3 },
  // Toma 3 (12)
  { texto: 'Where we are unsure, we say it:', desde: 11.6, hasta: 13.6 },
  { texto: 'rainfall shows no clear change.', desde: 13.6, hasta: 15.8 },
  // Toma 4 (7)
  { texto: 'The map shows where, across 38 places.', desde: 16.1, hasta: 19.3 },
  // Toma 5 (10)
  { texto: "Today's sea and weather are model estimates,", desde: 19.6, hasta: 21.9 },
  { texto: 'not official warnings.', desde: 21.9, hasta: 23.9 },
  // Toma 6 (6)
  { texto: 'What changed, not why. Radar BCS.', desde: 24.2, hasta: 26.8 },
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
