import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR, CUADRO, FUENTE_CUERPO, FUENTE_MONO } from '../estilo';
import { DERIVA_PX_S, type Plano } from '../guion';
import type { TomaCapturada } from '../tipos';

// Una toma de la web: captura alta de 1080 px de ancho dentro de un cuadro con esquinas redondeadas,
// con scroll suave o fundido entre las marcas indicadas en guion.ts (PLANOS).
// Es una escena calculada por fotograma a partir de datos externos (tomas.json), así que el
// movimiento se edita en guion.ts y no desde los controles de Studio.

type Props = {
  readonly toma: TomaCapturada | undefined;
  readonly planos: Plano[];
  readonly nombre: string;
};

const ESCALA = CUADRO.ancho / 1080;

export const TomaPantalla: React.FC<Props> = ({ toma, planos, nombre }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const entrada = interpolate(frame, [0, 0.25 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  if (!toma) {
    return (
      <Cuadro opacity={entrada}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60, backgroundColor: COLOR.grisClaro }}>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 40, color: COLOR.marino, textAlign: 'center' }}>
            Falta la captura «{nombre}».{'\n'}Corre: node scripts/capturar-video.mjs
          </div>
        </AbsoluteFill>
      </Cuadro>
    );
  }

  const altoImg = toma.alto * ESCALA;
  const maxY = Math.max(0, altoImg - CUADRO.alto);
  const pos = planos.map((p) => Math.min(maxY, (toma.marcas[p.marca] ?? 0) * ESCALA));

  // Plano actual y, si toca, la transición desde el anterior.
  let i = 0;
  for (let k = 0; k < planos.length; k++) if (t >= planos[k].en) i = k;
  const p = planos[i];
  const dur = p.duracion ?? 0.6;
  const q = i > 0 ? interpolate(t, [p.en, p.en + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }) : 1;
  const deriva = (t - (i > 0 ? p.en + dur : 0)) * DERIVA_PX_S;
  const enTransicion = i > 0 && q < 1;

  const capa = (y: number, opacidad: number, clave: string) => (
    <Img
      key={clave}
      src={staticFile(toma.archivo)}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: CUADRO.ancho,
        height: altoImg,
        translate: `0px ${-Math.max(0, Math.min(maxY, y))}px`,
        opacity: opacidad,
      }}
    />
  );

  let capas: React.ReactNode;
  if (enTransicion && p.modo === 'fundido') {
    capas = (
      <>
        {capa(pos[i - 1], 1, 'a')}
        {capa(pos[i], q, 'b')}
      </>
    );
  } else if (enTransicion) {
    capas = capa(pos[i - 1] + (pos[i] - pos[i - 1]) * q, 1, 'a');
  } else {
    capas = capa(pos[i] + Math.max(0, deriva), 1, 'a');
  }

  return <Cuadro opacity={entrada}>{capas}</Cuadro>;
};

const Cuadro: React.FC<{ readonly children: React.ReactNode; readonly opacity: number }> = ({ children, opacity }) => (
  <div
    style={{
      position: 'absolute',
      left: CUADRO.x,
      top: CUADRO.y,
      width: CUADRO.ancho,
      height: CUADRO.alto,
      borderRadius: CUADRO.radio,
      overflow: 'hidden',
      backgroundColor: COLOR.fondoPagina,
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
      outline: '4px solid rgba(255, 255, 255, 0.18)',
      opacity,
      fontFamily: FUENTE_CUERPO,
      whiteSpace: 'pre-line',
    }}
  >
    {children}
  </div>
);
