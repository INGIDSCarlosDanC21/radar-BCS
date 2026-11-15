import { AbsoluteFill, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR, CUADRO, FUENTE_CUERPO, FUENTE_MONO } from '../estilo';
import { FUENTES_DATOS, URL_WEB } from '../guion';

// Toma 6: cierre con el enlace de la web y las fuentes de datos (solo texto, sin logos de la NASA).
export const TarjetaCierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, 0.3 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: CUADRO.x,
          top: CUADRO.y,
          width: CUADRO.ancho,
          height: CUADRO.alto,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 60,
        }}
      >
        <div style={{ backgroundColor: COLOR.blanco, borderRadius: 32, padding: '28px 34px' }}>
          <Img name="Logo Radar BCS" src={staticFile('logo-radar-bcs.png')} style={{ width: 700, display: 'block' }} />
        </div>
        <Interactive.Div
          name="Enlace de la web"
          style={{
            fontFamily: FUENTE_MONO,
            fontSize: 38,
            whiteSpace: 'nowrap',
            color: COLOR.tinta,
            backgroundColor: COLOR.pildoraFondo,
            borderRadius: 20,
            padding: '20px 30px',
            textAlign: 'center',
          }}
        >
          {URL_WEB}
        </Interactive.Div>
        <Interactive.Div
          name="Fuentes de datos"
          style={{ fontFamily: FUENTE_CUERPO, fontWeight: 600, fontSize: 46, color: COLOR.grisClaro, textAlign: 'center' }}
        >
          {FUENTES_DATOS}
        </Interactive.Div>
        <Interactive.Div name="Equipo" style={{ fontFamily: FUENTE_MONO, fontSize: 36, lineHeight: 1.4, color: COLOR.cian, textAlign: 'center', whiteSpace: 'pre-line' }}>
          {'Team OptiPaz\nNASA Space Apps Challenge 2026'}
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
};
