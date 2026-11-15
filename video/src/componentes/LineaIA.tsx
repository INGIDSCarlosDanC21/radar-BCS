import { Interactive } from 'remotion';
import { COLOR, FUENTE_MONO } from '../estilo';
import { LINEA_IA } from '../guion';

// Línea fija, visible durante TODO el video (regla de la Guía de envío: marca visible en
// contenido generado). No lleva animación para que nunca desaparezca.
export const LineaIA: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 62,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Interactive.Div
        name="Línea de IA"
        style={{
          fontFamily: FUENTE_MONO,
          fontSize: 36,
          lineHeight: 1,
          color: COLOR.blanco,
          backgroundColor: 'rgba(0, 13, 33, 0.82)',
          border: '2px solid rgba(255, 255, 255, 0.35)',
          borderRadius: 999,
          padding: '14px 28px',
        }}
      >
        {LINEA_IA}
      </Interactive.Div>
    </div>
  );
};
