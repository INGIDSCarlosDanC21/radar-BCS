// Tráiler horizontal de Radar BCS (1920x1080, 30 fps, 28 s). Tiempos y textos: src/guion.ts.
// Capas: escenas (Sequence por escena) → gradación y efectos globales → subtítulos → audio.
import { Audio } from '@remotion/media';
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, Track, useCurrentFrame, useVideoConfig } from 'remotion';
import { FUENTE_TITULO } from '../estilo';
import { ACENTOS, FUENTES_DATOS, LECHO, MOMENTOS as M, PALABRAS, SENALES, SUBTITULOS, TRAILER_DURACION_S, TRAILER_ESCENAS as E, TRAMOS_VOZ, URL_WEB, VOZ } from '../guion';
import { CL, Destello, FugaLuz, Gradacion, Grano, Vineta } from './comun';
import { Apertura, Calor, Cierre, Funciones, Lluvia, Mapa, Titulo } from './Escenas';

export type PropsTrailer = { audios: string[]; hayNarracion: boolean };

// Subtítulos cinéticos: palabra por palabra al ritmo de la voz (PALABRAS de guion.ts), color de
// acento en las palabras clave (ACENTOS), píldora oscura desenfocada detrás, tipografía de marca.
const SubtitulosCineticos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const linea = SUBTITULOS.findIndex((x) => t >= x.desde - 0.05 && t < x.hasta + 0.25);
  if (linea < 0) return null;
  const s = SUBTITULOS[linea];
  const caja = interpolate(t, [s.desde - 0.05, s.desde + 0.12, s.hasta + 0.05, s.hasta + 0.25], [0, 1, 1, 0], CL);
  const palabras = PALABRAS.filter((p) => p.linea === linea);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 54, pointerEvents: 'none' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 14px',
          maxWidth: 1560,
          padding: '14px 34px 16px',
          borderRadius: 999,
          background: 'rgba(2,10,22,0.55)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)',
          opacity: caja,
          scale: `${interpolate(caja, [0, 1], [0.96, 1])}`,
        }}
      >
        {palabras.map((p, i) => {
          const q = interpolate(t, [p.desde - 0.04, p.desde + 0.16], [0, 1], { ...CL, easing: Easing.out(Easing.cubic) });
          // "not" solo se marca en rojo cuando es "not official warnings"; en "not why." va en cian.
          const esNotWarnings = p.texto !== 'not' || palabras[i + 1]?.texto === 'official';
          const acento = esNotWarnings ? ACENTOS[p.texto] : ACENTOS['why.'];
          const marcado = acento === '#ff6b6b';
          return (
            <span
              key={i}
              style={{
                fontFamily: FUENTE_TITULO,
                fontSize: 44,
                lineHeight: 1.25,
                color: marcado ? '#fff' : acento ?? '#ffffff',
                background: marcado ? `rgba(255,80,90,${0.85 * q})` : undefined,
                padding: marcado ? '0 8px' : undefined,
                borderRadius: 8,
                opacity: interpolate(q, [0, 1], [0.18, 1]),
                translate: `0px ${(1 - q) * 10}px`,
                textShadow: acento && !marcado ? `0 0 18px ${acento}88, 0 2px 4px rgba(0,0,0,0.9)` : '0 2px 4px rgba(0,0,0,0.9)',
              }}
            >
              {p.texto}
            </span>
          );
        })}
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
  const finVoz = TRAMOS_VOZ[TRAMOS_VOZ.length - 1].hasta; // fin real de la voz (26.69 s hoy)
  const habla = TRAMOS_VOZ.some((x) => t >= x.desde - 0.1 && t <= x.hasta + 0.1);
  const sube = t > finVoz ? interpolate(t, [finVoz, finVoz + 0.8], [0.2, 1], CL) : habla ? 0.2 : 0.28;
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
          <Gradacion tono="#ff7a2a" fuerza={0.25} />
        </Sequence>
        <Sequence name="4 Lluvia" from={f(E.lluvia.desde)} durationInFrames={dur(E.lluvia)}>
          <Lluvia />
          <Gradacion tono="#22c4e8" fuerza={0.25} />
        </Sequence>
        <Sequence name="5 Mapa" from={f(E.mapa.desde)} durationInFrames={dur(E.mapa)}>
          <Mapa />
        </Sequence>
        <Sequence name="6 Funciones" from={f(E.funciones.desde)} durationInFrames={dur(E.funciones)}>
          <Funciones />
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
        <SubtitulosCineticos />
      </Track>
      {hayNarracion ? <Audio name="Narración" src={staticFile(VOZ)} volume={1} /> : null}
      {hay(LECHO) ? <Audio name="Lecho 120 BPM" src={staticFile(LECHO)} volume={(fr) => volumenLecho(fr, fps)} /> : null}
      {SENALES.filter((s) => hay(s.archivo)).map((s, i) => (
        <Sequence key={i} name={`SFX ${s.archivo}`} from={f(s.en)} layout="none">
          <Audio src={staticFile(s.archivo)} volume={s.volumen} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
