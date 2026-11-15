import { Audio } from '@remotion/media';
import { AbsoluteFill, Sequence, staticFile, Track, useVideoConfig } from 'remotion';
import { Subtitulos } from './componentes/Subtitulos';
import { TarjetaCierre } from './escenas/TarjetaCierre';
import { TarjetaTitulo } from './escenas/TarjetaTitulo';
import { TomaPantalla } from './escenas/TomaPantalla';
import { COLOR } from './estilo';
import { ESCENAS, PLANOS } from './guion';
import type { PropsVideo } from './tipos';

// Video de 30 s de Radar BCS: una secuencia por toma (tiempos en guion.ts), subtítulos quemados,
// y la narración de ElevenLabs si existe public/narracion.mp3.
export const VideoRadarBCS: React.FC<PropsVideo> = ({ hayNarracion, tomas }) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const dur = (e: { desde: number; hasta: number }) => f(e.hasta) - f(e.desde);
  const toma = (id: string) => tomas?.tomas[id];

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLOR.marino} 0%, ${COLOR.tinta} 100%)` }}>
      <Track name="Tomas">
        <Sequence name="1a Título" from={f(ESCENAS.titulo.desde)} durationInFrames={dur(ESCENAS.titulo)}>
          <TarjetaTitulo />
        </Sequence>
        <Sequence name="1b Inicio" from={f(ESCENAS.inicio.desde)} durationInFrames={dur(ESCENAS.inicio)}>
          <TomaPantalla nombre="toma1-inicio" toma={toma('toma1-inicio')} planos={PLANOS.inicio} />
        </Sequence>
        <Sequence name="2 Ficha Calor" from={f(ESCENAS.calor.desde)} durationInFrames={dur(ESCENAS.calor)}>
          <TomaPantalla nombre="toma2-calor" toma={toma('toma2-calor')} planos={PLANOS.calor} />
        </Sequence>
        <Sequence name="3 Ficha Lluvia" from={f(ESCENAS.lluvia.desde)} durationInFrames={dur(ESCENAS.lluvia)}>
          <TomaPantalla nombre="toma3-lluvia" toma={toma('toma3-lluvia')} planos={PLANOS.lluvia} />
        </Sequence>
        <Sequence name="4 Mapa de lugares" from={f(ESCENAS.mapa.desde)} durationInFrames={dur(ESCENAS.mapa)}>
          <TomaPantalla nombre="toma4-mapa" toma={toma('toma4-mapa')} planos={PLANOS.mapa} />
        </Sequence>
        <Sequence name="5a Clima" from={f(ESCENAS.clima.desde)} durationInFrames={dur(ESCENAS.clima)}>
          <TomaPantalla nombre="toma5a-clima" toma={toma('toma5a-clima')} planos={PLANOS.clima} />
        </Sequence>
        <Sequence name="5b Pesca" from={f(ESCENAS.pesca.desde)} durationInFrames={dur(ESCENAS.pesca)}>
          <TomaPantalla nombre="toma5b-pesca" toma={toma('toma5b-pesca')} planos={PLANOS.pesca} />
        </Sequence>
        <Sequence name="6 Cierre" from={f(ESCENAS.cierre.desde)} durationInFrames={dur(ESCENAS.cierre)}>
          <TarjetaCierre />
        </Sequence>
      </Track>
      <Subtitulos />
      {hayNarracion ? <Audio name="Narración (ElevenLabs)" src={staticFile('narracion.mp3')} /> : null}
    </AbsoluteFill>
  );
};
