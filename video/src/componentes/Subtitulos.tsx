import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR, FUENTE_CUERPO, SUBS } from '../estilo';
import { SUBTITULOS } from '../guion';

// Subtítulos quemados en inglés. El texto y los tiempos vienen de guion.ts
// (no se editan aquí; este componente solo los dibuja).
export const Subtitulos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const actual = SUBTITULOS.find((s) => t >= s.desde && t < s.hasta);
  if (!actual) return null;
  // Entrada breve (0.15 s) para que el cambio no sea brusco; nunca baja de opacidad al salir.
  const entrada = interpolate(t, [actual.desde, actual.desde + 0.15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: SUBS.y,
        height: SUBS.alto,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          opacity: entrada,
          fontFamily: FUENTE_CUERPO,
          fontWeight: 800,
          fontSize: 60,
          lineHeight: 1.22,
          color: COLOR.blanco,
          textAlign: 'center',
          backgroundColor: COLOR.tinta,
          borderRadius: 24,
          padding: '22px 34px',
          boxDecorationBreak: 'clone',
          maxWidth: 960,
          textWrap: 'balance',
        }}
      >
        {actual.texto}
      </div>
    </div>
  );
};
