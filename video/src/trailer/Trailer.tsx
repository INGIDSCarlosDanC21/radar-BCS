// Tráiler horizontal de Radar BCS (1920x1080, 30 fps, 28 s). Tiempos y textos: src/guion.ts.
// Capas: escenas (Sequence por escena) → gradación y efectos globales → subtítulos → audio.
import { Audio } from '@remotion/media';
import { AbsoluteFill, interpolate, Sequence, staticFile, Track, useCurrentFrame, useVideoConfig } from 'remotion';
import { FUENTE_CUERPO } from '../estilo';
import { FUENTES_DATOS, LECHO, SENALES, MOMENTOS as M, SUBTITULOS, TRAILER_DURACION_S, TRAILER_ESCENAS as E, URL_WEB } from '../guion';
import { CL, Destello, FugaLuz, Gradacion, Grano, Vineta } from './comun';
import { Apertura, Avisos, Calor, Cierre, Lluvia, Mapa, Titulo } from './Escenas';

export type PropsTrailer = { audios: string[]; hayNarracion: boolean };

// Subtítulos estilo cine: tercio inferior, fundido suave, sombra; sin caja.
const SubtitulosCine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = SUBTITULOS.find((x) => t >= x.desde && t < x.hasta + 0.1);
  if (!s) return null;
  const o = interpolate(t, [s.desde, s.desde + 0.15, s.hasta - 0.05, s.hasta + 0.1], [0, 1, 1, 0], CL);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 64, pointerEvents: 'none' }}>
      <div
        style={{
          fontFamily: FUENTE_CUERPO,
          fontWeight: 600,
          fontSize: 40,
          color: '#fff',
          opacity: o,
          translate: `0px ${(1 - o) * 8}px`,
          textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 24px rgba(0,0,0,0.85)',
          maxWidth: 1500,
          textAlign: 'center',
        }}
      >
        {s.texto}
      </div>
    </AbsoluteFill>
  );
};

// Banda oscura inferior para que los subtítulos se lean sobre cualquier fondo.
const BandaInferior: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 78%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' }} />
);

// Lecho musical con "ducking": baja mientras habla la voz.
// Volúmenes de docs/entrega/09-audio-trailer.md: 0.20 mientras habla la voz (0–25.4 s), rampa a 1.0
// entre 25.4 y 26.4 s, y fundido a 0 en 27.5–28 s junto con la imagen.
const volumenLecho = (f: number, fps: number) => {
  const t = f / fps;
  const finVoz = SUBTITULOS[SUBTITULOS.length - 1].hasta + 0.2; // fin real de la voz (25.4 s hoy)
  const sube = interpolate(t, [finVoz, finVoz + 1], [0.2, 1], CL);
  return sube * interpolate(t, [TRAILER_DURACION_S - 0.5, TRAILER_DURACION_S], [1, 0], CL);
};

export const TrailerRadarBCS: React.FC<PropsTrailer> = ({ audios, hayNarracion }) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const dur = (e: { desde: number; hasta: number }) => f(e.hasta) - f(e.desde);
  const hay = (a: string) => audios.includes(a);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Track name="Escenas">
        <Sequence name="1 Apertura" from={f(E.apertura.desde)} durationInFrames={dur(E.apertura)}>
          <Apertura />
        </Sequence>
        <Sequence name="2 Título" from={f(E.titulo.desde)} durationInFrames={dur(E.titulo)}>
          <Titulo />
        </Sequence>
        <Sequence name="3 Calor" from={f(E.calor.desde)} durationInFrames={dur(E.calor)}>
          <Calor />
          <Gradacion tono="#ff7a2a" fuerza={0.35} />
        </Sequence>
        <Sequence name="4 Lluvia" from={f(E.lluvia.desde)} durationInFrames={dur(E.lluvia)}>
          <Lluvia />
          <Gradacion tono="#2a7aff" fuerza={0.35} />
        </Sequence>
        <Sequence name="5 Mapa" from={f(E.mapa.desde)} durationInFrames={dur(E.mapa)}>
          <Mapa />
        </Sequence>
        <Sequence name="6 Avisos" from={f(E.avisos.desde)} durationInFrames={dur(E.avisos)}>
          <Avisos />
        </Sequence>
        <Sequence name="7 Cierre" from={f(E.cierre.desde)} durationInFrames={dur(E.cierre)}>
          <Cierre url={URL_WEB} fuentes={FUENTES_DATOS} />
        </Sequence>
      </Track>
      <Track name="Efectos">
        <FugaLuz desde={E.apertura.desde + 0.3} hasta={E.titulo.desde - 0.2} tono="calido" max={0.55} />
        <FugaLuz desde={E.titulo.desde} hasta={E.titulo.desde + 1.3} tono="cian" max={0.6} />
        <FugaLuz desde={M.logo - 0.2} hasta={M.logo + 1.8} tono="calido" max={0.45} />
        <Destello en={E.titulo.desde} />
        <Destello en={E.calor.desde} color="#ffb070" max={0.6} />
        <Destello en={E.mapa.desde} color="#9fe8ff" max={0.55} />
        <Destello en={M.modelEstimates} color="#ffffff" max={0.35} dur={0.15} />
        <Destello en={E.cierre.desde} max={0.7} />
        <Vineta />
        <Grano />
        <BandaInferior />
        <SubtitulosCine />
      </Track>
      {hayNarracion ? <Audio name="Narración" src={staticFile('narracion.mp3')} volume={1} /> : null}
      {hay(LECHO) ? <Audio name="Lecho 120 BPM" src={staticFile(LECHO)} volume={(fr) => volumenLecho(fr, fps)} /> : null}
      {SENALES.filter((s) => hay(s.archivo)).map((s, i) => (
        <Sequence key={i} name={`SFX ${s.archivo}`} from={f(s.en)} layout="none">
          <Audio src={staticFile(s.archivo)} volume={s.volumen} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
