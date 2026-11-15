// Piezas compartidas del tráiler: utilidades de tiempo, grano, viñeta, destellos, fugas de luz.
// Todo con CSS/SVG (se ve igual en Studio y en el render headless; no requiere WebGL).
import { noise2D } from '@remotion/noise';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

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

// ─── Fondo con vida por escena ───────────────────────────────────────────────────────────────
// Capas: foto satelital real (GIBS/MODIS) desenfocada con parallax, manchas de color que se
// mueven con ruido, rayos de luz volumétrica que giran, y partículas (polvo, brasas o lluvia).
export type Tono = 'marca' | 'calor' | 'lluvia' | 'mapa' | 'mar' | 'cierre';
const TONOS: Record<Tono, { base: string; a: string; b: string; c: string; rayo: string; part: string; foto: number; filtro: string }> = {
  marca: { base: '#03101f', a: '#0e4a7a', b: '#0a7d8c', c: '#2a2a6e', rayo: '120,220,255', part: '#9fe8ff', foto: 0.28, filtro: 'saturate(0.7) hue-rotate(-10deg)' },
  calor: { base: '#140504', a: '#b2380c', b: '#e07a12', c: '#5a0d1a', rayo: '255,170,90', part: '#ffb070', foto: 0.25, filtro: 'sepia(0.7) saturate(2.2) hue-rotate(-15deg)' },
  lluvia: { base: '#020d18', a: '#0a5d86', b: '#0fa3b8', c: '#13306b', rayo: '140,230,255', part: '#bff3ff', foto: 0.25, filtro: 'grayscale(0.5) hue-rotate(160deg) saturate(1.6)' },
  mapa: { base: '#02110b', a: '#0b6b47', b: '#1fae6d', c: '#0b3d55', rayo: '120,255,190', part: '#a8ffd6', foto: 0.3, filtro: 'saturate(0.8) hue-rotate(60deg)' },
  mar: { base: '#011214', a: '#05596a', b: '#0b8f86', c: '#0b2d5c', rayo: '110,240,220', part: '#a8fff0', foto: 0.28, filtro: 'saturate(1.2) hue-rotate(120deg)' },
  cierre: { base: '#0b0710', a: '#c4561c', b: '#1a8fa6', c: '#4b1d4f', rayo: '255,190,120', part: '#ffd9a8', foto: 0.2, filtro: 'sepia(0.4) saturate(1.4)' },
};
const azar = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const FondoVivo: React.FC<{ tono: Tono; particulas?: 'polvo' | 'brasas' | 'lluvia' }> = ({ tono, particulas = 'polvo' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const P = TONOS[tono];
  const mancha = (k: string, color: string, tam: number) => ({
    left: `${50 + noise2D(tono + k + 'x', t * 0.12, 0) * 45}%`,
    top: `${50 + noise2D(tono + k + 'y', 0, t * 0.12) * 40}%`,
    width: tam,
    height: tam,
    marginLeft: -tam / 2,
    marginTop: -tam / 2,
    background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
  });
  return (
    <AbsoluteFill style={{ background: P.base, overflow: 'hidden' }}>
      <Img
        src={staticFile('bcs-modis.jpg')}
        style={{ position: 'absolute', left: -240 + t * 18, top: -320 + t * 6, width: 2500, opacity: P.foto, filter: `blur(6px) ${P.filtro}`, scale: `${1.05 + t * 0.012}` }}
      />
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.85 }}>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(30px)', ...mancha('a', P.a, 1300) }} />
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(30px)', ...mancha('b', P.b, 900) }} />
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(30px)', ...mancha('c', P.c, 1100) }} />
      </AbsoluteFill>
      {/* luz volumétrica: abanico de rayos desde arriba que gira despacio */}
      <AbsoluteFill
        style={{
          mixBlendMode: 'screen',
          opacity: 0.35,
          background: `repeating-conic-gradient(from ${t * 4}deg at 30% -10%, rgba(${P.rayo},0.0) 0deg, rgba(${P.rayo},0.22) 3deg, rgba(${P.rayo},0.0) 7deg, rgba(${P.rayo},0.0) 13deg)`,
          filter: 'blur(14px)',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 85%)',
        }}
      />
      {Array.from({ length: particulas === 'lluvia' ? 70 : 46 }).map((_, i) => {
        const x0 = azar(i, 1) * 1920;
        const v = 0.4 + azar(i, 2);
        const z = azar(i, 3); // profundidad: más cerca = más grande y desenfocado
        if (particulas === 'lluvia') {
          const y = ((azar(i, 4) * 1300 + t * 900 * v) % 1300) - 120;
          return <div key={i} style={{ position: 'absolute', left: x0 - y * 0.12, top: y, width: 2, height: 40 + z * 60, background: `linear-gradient(180deg, transparent, ${P.part})`, opacity: 0.25 + z * 0.35, rotate: '7deg', filter: z > 0.7 ? 'blur(2px)' : undefined }} />;
        }
        const sube = particulas === 'brasas' ? 70 : 22;
        const y = 1100 - ((azar(i, 4) * 1200 + t * sube * v * (0.5 + z)) % 1200);
        const x = x0 + Math.sin(t * 0.8 + i) * 18;
        const r = 2 + z * (particulas === 'brasas' ? 7 : 5);
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: P.part, opacity: 0.18 + z * 0.45, boxShadow: `0 0 ${r * 3}px ${P.part}`, filter: z > 0.75 ? 'blur(2px)' : undefined }} />;
      })}
    </AbsoluteFill>
  );
};
