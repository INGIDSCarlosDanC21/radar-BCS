// Teléfono en 3D hecho con transformaciones CSS (perspectiva real, grosor por capas, bisel,
// reflejo que se mueve con el giro y sombra de contacto). La pantalla es una captura REAL de la web
// (video/public/tomas/*.png, 1080 px de ancho, de scripts/capturar-video.mjs).
import { Video } from '@remotion/media';
import { Img, staticFile, useVideoConfig } from 'remotion';
import type { Clip } from '../guion';

export type PropsTelefono = {
  captura?: string; // captura fija (tomas/*.png); se usa si no hay clip
  desdePx?: number; // px de la captura (escala 1080) que quedan arriba de la pantalla
  clip?: Clip; // clip REAL grabado de la web (clips/*.mp4, 390x844 a DPR 2)
  ancho: number; // ancho del teléfono en px del video
  x: number; // centro en px
  y: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  escala?: number;
  desenfoque?: number; // profundidad de campo simulada
  sombra?: boolean;
};

const PROPORCION = 844 / 390; // pantalla de celular usada en las capturas
const CAPAS = 9; // capas para el grosor del cuerpo

export const Telefono: React.FC<PropsTelefono> = ({
  captura,
  desdePx = 0,
  clip,
  ancho,
  x,
  y,
  rotX = 0,
  rotY = 0,
  rotZ = 0,
  escala = 1,
  desenfoque = 0,
  sombra = true,
}) => {
  const { fps } = useVideoConfig();
  const bisel = ancho * 0.035;
  const alto = ancho * PROPORCION + bisel * 2;
  const radio = ancho * 0.14;
  const anchoPantalla = ancho - bisel * 2;
  const k = anchoPantalla / 1080;
  // El reflejo se desliza según el giro en Y: da sensación de vidrio.
  const brillo = 50 + rotY * 2.2;
  return (
    <div style={{ position: 'absolute', left: x - ancho / 2, top: y - alto / 2, width: ancho, height: alto, filter: desenfoque > 0.2 ? `blur(${desenfoque}px)` : undefined }}>
      {sombra ? (
        <div
          style={{
            position: 'absolute',
            left: ancho * 0.08 + rotY * 3,
            right: ancho * 0.08 - rotY * 3,
            bottom: -alto * 0.07,
            height: alto * 0.08,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(14px)',
            scale: `${escala}`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `perspective(2400px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${escala})`,
        }}
      >
        {Array.from({ length: CAPAS }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: radio,
              background: i === CAPAS - 1 ? '#0b1220' : `rgb(${38 - i * 2},${48 - i * 2},${66 - i * 3})`,
              transform: `translateZ(${-(i + 1) * 2.2}px)`,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radio,
            background: 'linear-gradient(145deg, #3a4a62 0%, #0d1524 40%, #1c2a40 100%)',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.18), inset 0 0 0 5px #05080f',
            padding: bisel,
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: radio - bisel, overflow: 'hidden', background: '#f7f9fc' }}>
            {clip ? (
              <Video src={staticFile(clip.archivo)} muted trimBefore={Math.round(clip.desde * fps)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            ) : captura ? (
              <Img src={staticFile(captura)} style={{ position: 'absolute', left: 0, top: -desdePx * k, width: anchoPantalla }} />
            ) : null}
            {/* isla de la cámara */}
            <div style={{ position: 'absolute', left: '50%', top: bisel * 0.9, width: ancho * 0.26, height: ancho * 0.07, marginLeft: -ancho * 0.13, borderRadius: 999, background: '#03060c' }} />
            {/* reflejo del vidrio */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(115deg, rgba(255,255,255,0) ${brillo - 22}%, rgba(255,255,255,0.22) ${brillo - 6}%, rgba(255,255,255,0.05) ${brillo + 4}%, rgba(255,255,255,0) ${brillo + 18}%)`,
                mixBlendMode: 'screen',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
