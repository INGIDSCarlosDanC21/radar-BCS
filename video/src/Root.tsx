import { Composition, staticFile, type CalculateMetadataFunction } from 'remotion';
import { DURACION_S, FPS } from './guion';
import type { Manifiesto, PropsVideo } from './tipos';
import { VideoRadarBCS } from './Video';
import { TrailerRadarBCS, type PropsTrailer } from './trailer/Trailer';
import { LECHO, SENALES, TRAILER_DURACION_S } from './guion';

// Lo dinámico: duración (de guion.ts), si existe la narración y el manifiesto de capturas.
const calculateMetadata: CalculateMetadataFunction<PropsVideo> = async ({ props }) => {
  if (DURACION_S > 30) throw new Error(`DURACION_S = ${DURACION_S}: la entrega exige 30 s o menos (guion.ts).`);

  let tomas: Manifiesto | null = null;
  try {
    const r = await fetch(staticFile('tomas/tomas.json'));
    if (r.ok) tomas = (await r.json()) as Manifiesto;
  } catch {
    // sin archivo: se avisa abajo
  }
  if (!tomas) console.warn('[radar-bcs] Faltan las capturas: corre "node scripts/capturar-video.mjs" desde la raíz del repo.');

  let hayNarracion = false;
  try {
    const r = await fetch(staticFile('narracion.mp3'), { method: 'HEAD' });
    hayNarracion = r.ok;
  } catch {
    // sin archivo: se avisa abajo
  }
  if (!hayNarracion) {
    console.warn('[radar-bcs] AVISO: no existe public/narracion.mp3. El video se renderiza EN SILENCIO (solo prueba).');
  } else {
    const segundos = await duracionAudio(staticFile('narracion.mp3'));
    if (segundos != null) {
      console.warn(`[radar-bcs] Narración: ${segundos.toFixed(2)} s; video: ${DURACION_S} s.`);
      if (segundos > DURACION_S) console.warn('[radar-bcs] AVISO: la voz dura más que el video. Ajusta los tiempos en guion.ts (máximo 30 s).');
    }
  }

  return { durationInFrames: Math.round(DURACION_S * FPS), fps: FPS, props: { ...props, hayNarracion, tomas } };
};

function duracionAudio(src: string): Promise<number | null> {
  return new Promise((resolve) => {
    const a = document.createElement('audio');
    const fin = (v: number | null) => {
      clearTimeout(reloj);
      resolve(v);
    };
    const reloj = setTimeout(() => fin(null), 5000);
    a.preload = 'metadata';
    a.onloadedmetadata = () => fin(Number.isFinite(a.duration) ? a.duration : null);
    a.onerror = () => fin(null);
    a.src = src;
  });
}

// Tráiler: comprueba qué audios existen en public/ (voz y efectos de la rama lider/trailer-audio).
const existe = async (ruta: string) => {
  try {
    const r = await fetch(staticFile(ruta), { method: 'HEAD' });
    return r.ok;
  } catch {
    return false;
  }
};
const metadatosTrailer: CalculateMetadataFunction<PropsTrailer> = async ({ props }) => {
  if (TRAILER_DURACION_S > 30) throw new Error('El tráiler debe durar 30 s o menos (guion.ts).');
  const nombres = [...new Set([LECHO, ...SENALES.map((s) => s.archivo)])];
  const audios: string[] = [];
  for (const n of nombres) if (await existe(n)) audios.push(n);
  const hayNarracion = await existe('narracion.mp3');
  if (!hayNarracion) console.warn('[radar-bcs] AVISO: falta public/narracion.mp3 (tráiler sin voz).');
  if (audios.length === 0) console.warn('[radar-bcs] AVISO: no hay efectos en public/audio/ (rama lider/trailer-audio).');
  return { durationInFrames: TRAILER_DURACION_S * FPS, fps: FPS, props: { ...props, audios, hayNarracion } };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="RadarBCSTrailer"
      component={TrailerRadarBCS}
      durationInFrames={840}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={metadatosTrailer}
      defaultProps={{ audios: [], hayNarracion: false }}
    />
    <Composition
      id="RadarBCS30s"
      component={VideoRadarBCS}
      durationInFrames={810}
      fps={30}
      width={1080}
      height={1920}
      calculateMetadata={calculateMetadata}
      defaultProps={{ hayNarracion: false, tomas: null }}
    />
    </>
  );
};
