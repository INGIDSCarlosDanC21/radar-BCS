// Laptop en 3D hecho con transformaciones CSS (sin modelos de terceros): tapa con bisel fino y
// cámara, pantalla con un clip REAL de la web en versión escritorio (clips/esc-*.mp4, 1440x900),
// bisagra, base de aluminio con teclado insinuado y trackpad, reflejo y sombra de contacto.
// "apertura" va de 0 (tapa cerrada) a 1 (abierta): sirve para revelar la app.
import { Video } from '@remotion/media';
import { staticFile, useVideoConfig } from 'remotion';
import type { Clip } from '../guion';

export type PropsLaptop = {
  clip: Clip;
  ancho: number; // ancho de la pantalla en px del video
  x: number; // centro de la bisagra en px
  y: number;
  rotX?: number; // inclinación de la cámara (positivo = picado, negativo = contrapicado)
  rotY?: number;
  rotZ?: number;
  escala?: number;
  apertura?: number;
  desenfoque?: number;
  opacidad?: number;
};

export const Laptop: React.FC<PropsLaptop> = ({ clip, ancho, x, y, rotX = 14, rotY = 0, rotZ = 0, escala = 1, apertura = 1, desenfoque = 0, opacidad = 1 }) => {
  const { fps } = useVideoConfig();
  const bisel = ancho * 0.022;
  const anchoTapa = ancho + bisel * 2;
  const altoTapa = (ancho * 900) / 1440 + bisel * 2.6;
  const anchoBase = anchoTapa * 1.08;
  const fondoBase = anchoTapa * 0.68;
  const grosor = Math.max(6, ancho * 0.018);
  // tapa: 92° cerrada (sobre el teclado), -12° abierta (un poco hacia atrás). En Chrome, rotateX
  // positivo acerca a la cámara el borde superior del elemento.
  const angulo = 92 - apertura * 104;
  const brillo = 40 + rotY * 1.5 + apertura * 20;
  return (
    <div style={{ position: 'absolute', left: x - anchoTapa / 2, top: y - altoTapa, width: anchoTapa, height: altoTapa, opacity: opacidad, filter: desenfoque > 0.2 ? `blur(${desenfoque}px)` : undefined }}>
      {/* sombra de contacto bajo la base */}
      <div
        style={{
          position: 'absolute',
          left: -anchoTapa * 0.08 + rotY * 4,
          width: anchoTapa * 1.16,
          top: altoTapa + fondoBase * 0.18,
          height: fondoBase * 0.45,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(18px)',
          scale: `${escala}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 100%',
          transform: `perspective(2600px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${escala})`,
        }}
      >
        {/* BASE: plano horizontal que sale de la bisagra hacia la cámara */}
        <div
          style={{
            position: 'absolute',
            left: (anchoTapa - anchoBase) / 2,
            top: altoTapa,
            width: anchoBase,
            height: fondoBase,
            transformOrigin: '50% 0%',
            transform: 'rotateX(-90deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: `${bisel}px ${bisel}px ${bisel * 2}px ${bisel * 2}px`,
              background: 'linear-gradient(180deg, #c9d0da 0%, #aab3bf 60%, #8e98a6 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)',
            }}
          >
            {/* teclado insinuado */}
            <div
              style={{
                position: 'absolute',
                left: '9%',
                right: '9%',
                top: '9%',
                height: '46%',
                borderRadius: bisel * 0.6,
                background: '#20262f',
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.0) 0px, rgba(255,255,255,0.0) 2px, rgba(120,130,145,0.55) 2px, rgba(120,130,145,0.55) 3px), repeating-linear-gradient(0deg, rgba(255,255,255,0.0) 0px, rgba(255,255,255,0.0) 2px, rgba(120,130,145,0.55) 2px, rgba(120,130,145,0.55) 3px)',
                backgroundSize: `${anchoBase * 0.055}px ${fondoBase * 0.085}px`,
              }}
            />
            {/* trackpad */}
            <div style={{ position: 'absolute', left: '34%', right: '34%', top: '62%', bottom: '8%', borderRadius: bisel * 0.6, background: 'linear-gradient(180deg, #b7bfca, #a3acb8)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }} />
          </div>
          {/* canto frontal de la base (grosor) */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: fondoBase,
              height: grosor,
              transformOrigin: '50% 0%',
              transform: 'rotateX(90deg)',
              background: 'linear-gradient(90deg, #6f7886, #9aa3af 50%, #6f7886)',
              borderRadius: `0 0 ${grosor}px ${grosor}px`,
            }}
          />
        </div>
        {/* bisagra */}
        <div style={{ position: 'absolute', left: anchoTapa * 0.04, right: anchoTapa * 0.04, top: altoTapa - grosor * 0.5, height: grosor, borderRadius: grosor, background: 'linear-gradient(180deg, #4a525e, #1c2129)' }} />
        {/* TAPA: gira sobre su borde inferior */}
        <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 100%', transform: `rotateX(${angulo}deg)`, transformStyle: 'preserve-3d' }}>
          {/* cara de la pantalla */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: bisel * 1.6,
              background: '#0a0d12',
              boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.16)',
              padding: `${bisel * 1.3}px ${bisel}px ${bisel * 1.3}px`,
              backfaceVisibility: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', left: '50%', top: bisel * 0.45, width: bisel * 0.45, height: bisel * 0.45, marginLeft: -bisel * 0.22, borderRadius: '50%', background: '#1f2a36', boxShadow: 'inset 0 0 0 1px #33475a' }} />
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: bisel * 0.3, background: '#f7f9fc' }}>
              <Video src={staticFile(clip.archivo)} muted trimBefore={Math.round(clip.desde * fps)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(118deg, rgba(255,255,255,0) ${brillo - 18}%, rgba(255,255,255,0.16) ${brillo - 4}%, rgba(255,255,255,0.03) ${brillo + 6}%, rgba(255,255,255,0) ${brillo + 20}%)`,
                  mixBlendMode: 'screen',
                }}
              />
              {/* pantalla apagada mientras la tapa se abre */}
              <div style={{ position: 'absolute', inset: 0, background: '#05080d', opacity: Math.max(0, 1 - apertura * 1.6) }} />
            </div>
          </div>
          {/* dorso de aluminio (se ve con la tapa cerrada) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: bisel * 1.6,
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(160deg, #d5dbe3 0%, #aeb6c1 55%, #939cab 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.45)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
