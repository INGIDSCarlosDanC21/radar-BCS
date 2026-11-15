// Tráiler horizontal de Radar BCS (1920x1080, 30 fps, 28 s). Tiempos y textos: src/guion.ts.
// Capas: escenas (Sequence por escena) → gradación y efectos globales → subtítulos → audio.
import { Audio } from '@remotion/media';
import { AbsoluteFill, interpolate, Sequence, staticFile, Track, useCurrentFrame, useVideoConfig } from 'remotion';
import { FUENTE_CUERPO } from '../estilo';
import { FUENTES_DATOS, SENALES, SUBTITULOS, TRAILER_ESCENAS as E, URL_WEB } from '../guion';
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
const volumenLecho = (f: number, fps: number) => {
  const t = f / fps;
  const habla = SUBTITULOS.some((s) => t >= s.desde - 0.15 && t <= s.hasta + 0.15);
  const base = habla ? 0.32 : 0.6;
  return t > 27 ? base * interpolate(t, [27, 28], [1, 0], CL) : base;
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
        <FugaLuz desde={0.3} hasta={2.8} tono="calido" max={0.55} />
        <FugaLuz desde={3.0} hasta={4.3} tono="cian" max={0.6} />
        <FugaLuz desde={23.3} hasta={25.3} tono="calido" max={0.45} />
        <Destello en={3.0} />
        <Destello en={6.0} color="#ffb070" max={0.6} />
        <Destello en={15.5} color="#9fe8ff" max={0.55} />
        <Destello en={20.0} color="#ffffff" max={0.35} dur={0.15} />
        <Destello en={22.0} max={0.7} />
        <Vineta />
        <Grano />
        <BandaInferior />
        <SubtitulosCine />
      </Track>
      {hayNarracion ? <Audio name="Narración" src={staticFile('narracion.mp3')} volume={1} /> : null}
      {hay('bed-120bpm-28s') ? <Audio name="Lecho 120 BPM" src={staticFile('audio/bed-120bpm-28s.mp3')} volume={(fr) => volumenLecho(fr, fps)} /> : null}
      {SENALES.filter((s) => hay(s.archivo)).map((s, i) => (
        <Sequence key={i} name={`SFX ${s.archivo}`} from={f(s.archivo.startsWith('riser') ? s.en : s.en)} layout="none">
          <Audio src={staticFile(`audio/${s.archivo}.mp3`)} volume={s.volumen} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
