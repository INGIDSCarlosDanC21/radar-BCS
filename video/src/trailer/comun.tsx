// Piezas compartidas del tráiler: utilidades de tiempo, grano, viñeta, destellos, fugas de luz.
// Todo con CSS/SVG (se ve igual en Studio y en el render headless; no requiere WebGL).
import { noise2D } from '@remotion/noise';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const CL = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);
export const ENTRA = Easing.bezier(0.7, 0, 0.84, 0);

// Segundo actual (relativo a la secuencia donde se use).
export const useSeg = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

// Deriva de cámara "a mano": ruido suave, nunca quieto.
export const useDeriva = (semilla: string, px = 6, velocidad = 0.35) => {
  const t = useSeg();
  return {
    x: noise2D(semilla + 'x', t * velocidad, 0) * px,
    y: noise2D(semilla + 'y', 0, t * velocidad) * px,
    r: noise2D(semilla + 'r', t * velocidad * 0.7, 3) * 0.4,
  };
};

// Grano de película: turbulencia SVG con semilla nueva cada fotograma.
export const Grano: React.FC<{ opacidad?: number }> = ({ opacidad = 0.09 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: opacidad }}>
      <svg width="100%" height="100%">
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grano)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vineta: React.FC<{ fuerza?: number }> = ({ fuerza = 0.75 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,4,12,${fuerza}) 100%)`,
    }}
  />
);

// Barras de cine (letterbox) que se abren al inicio.
export const Barras: React.FC<{ alto: number }> = ({ alto }) => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: alto, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: alto, background: '#000' }} />
  </>
);

// Destello en un golpe: sube rápido y cae en "dur" segundos.
export const Destello: React.FC<{ en: number; dur?: number; color?: string; max?: number }> = ({
  en,
  dur = 0.35,
  color = '#ffffff',
  max = 0.85,
}) => {
  const t = useSeg();
  const o = interpolate(t, [en - 0.04, en, en + dur], [0, max, 0], { ...CL, easing: Easing.out(Easing.quad) });
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: 'screen', pointerEvents: 'none' }} />;
};

// Fuga de luz: dos manchas cálidas/cian que cruzan el cuadro (mezcla "screen").
export const FugaLuz: React.FC<{ desde: number; hasta: number; max?: number; tono?: 'calido' | 'cian' }> = ({
  desde,
  hasta,
  max = 0.7,
  tono = 'calido',
}) => {
  const t = useSeg();
  const p = interpolate(t, [desde, hasta], [0, 1], CL);
  const o = interpolate(t, [desde, desde + (hasta - desde) * 0.35, hasta], [0, max, 0], CL);
  if (o <= 0.001) return null;
  const a = tono === 'calido' ? '255,140,60' : '81,216,232';
  const b = tono === 'calido' ? '255,60,90' : '120,140,255';
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: o, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: interpolate(p, [0, 1], [-40, 70]) + '%',
          top: '-30%',
          width: '70%',
          height: '160%',
          rotate: '18deg',
          background: `radial-gradient(ellipse at center, rgba(${a},0.95) 0%, rgba(${b},0.45) 35%, rgba(0,0,0,0) 70%)`,
          filter: 'blur(40px)',
        }}
      />
    </AbsoluteFill>
  );
};

// Gradación de color por escena: capa de tono en "soft-light" + capa de color en sombras.
export const Gradacion: React.FC<{ tono: string; fuerza?: number }> = ({ tono, fuerza = 0.35 }) => (
  <AbsoluteFill style={{ background: tono, mixBlendMode: 'soft-light', opacity: fuerza, pointerEvents: 'none' }} />
);

// Aberración cromática de texto/elementos: tres copias (rojo, cian y original).
export const Cromatica: React.FC<{ px: number; children: React.ReactNode }> = ({ px, children }) => {
  if (Math.abs(px) < 0.3) return <>{children}</>;
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, translate: `${-px}px 0px`, filter: 'drop-shadow(0 0 0 #ff2a55)', opacity: 0.7, mixBlendMode: 'screen' }}>
        <div style={{ filter: 'sepia(1) saturate(9) hue-rotate(-50deg)' }}>{children}</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, translate: `${px}px 0px`, opacity: 0.7, mixBlendMode: 'screen' }}>
        <div style={{ filter: 'sepia(1) saturate(9) hue-rotate(140deg)' }}>{children}</div>
      </div>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
};

// Etiqueta pequeña tipo "chyron" (mono, mayúsculas, con línea cian).
export const Chyron: React.FC<{ texto: string; mono: string; color?: string; style?: React.CSSProperties }> = ({
  texto,
  mono,
  color = '#51d8e8',
  style,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: mono, fontSize: 22, letterSpacing: 4, color, ...style }}>
    <div style={{ width: 36, height: 2, background: color }} />
    {texto}
  </div>
);
