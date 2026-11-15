import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR, CUADRO, FUENTE_MONO, FUENTE_TITULO } from '../estilo';

// Toma 1 (inicio): tarjeta de título "Radar BCS · OptiPaz" con la paleta de la web.
// Sin logos de la NASA. El logo de Radar BCS va SOLO en su versión con la marca "AI-generated".
export const TarjetaTitulo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
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
          gap: 56,
        }}
      >
        <div
          style={{
            backgroundColor: COLOR.blanco,
            borderRadius: 36,
            padding: '36px 40px',
            opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            scale: interpolate(frame, [0, 0.6 * fps], [0.92, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          <Img name="Logo Radar BCS (AI-generated)" src={staticFile('logo-radar-bcs-ai-generated.png')} style={{ width: 820, display: 'block' }} />
        </div>
        <Interactive.Div
          name="Título"
          style={{
            fontFamily: FUENTE_TITULO,
            fontWeight: 700,
            fontSize: 104,
            lineHeight: 1.05,
            color: COLOR.blanco,
            textAlign: 'center',
            opacity: interpolate(frame, [0.2 * fps, 0.6 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            translate: interpolate(frame, [0.2 * fps, 0.8 * fps], ['0px 40px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Radar BCS · OptiPaz
        </Interactive.Div>
        <Interactive.Div
          name="Lugar"
          style={{
            fontFamily: FUENTE_MONO,
            fontSize: 44,
            color: COLOR.cian,
            textAlign: 'center',
            opacity: interpolate(frame, [0.4 * fps, 0.8 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          La Paz, Baja California Sur
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
};
