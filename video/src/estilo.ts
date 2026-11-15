// Paleta y tipografías de la web (web/assets/tokens.css) y medidas del cuadro en el video.
import { loadFont as cargarTitulo } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as cargarCuerpo } from '@remotion/google-fonts/Manrope';
import { loadFont as cargarMono } from '@remotion/google-fonts/JetBrainsMono';

export const FUENTE_TITULO = cargarTitulo('normal', { weights: ['700'], subsets: ['latin'] }).fontFamily;
export const FUENTE_CUERPO = cargarCuerpo('normal', { weights: ['600', '800'], subsets: ['latin'] }).fontFamily;
export const FUENTE_MONO = cargarMono('normal', { weights: ['500'], subsets: ['latin'] }).fontFamily;

export const COLOR = {
  tinta: '#000d21',
  marino: '#0c2340',
  verde: '#006d3d',
  pildoraFondo: '#97f3b5',
  cian: '#51d8e8',
  fondoPagina: '#f7f9fc',
  blanco: '#ffffff',
  grisClaro: '#e6e8eb',
  azulGris: '#778bad',
} as const;

// Cuadro donde se ve la web (1080 x 1920). Zona segura: 48 px a los lados, línea de IA arriba,
// subtítulos abajo, todo a más de 100 px de los bordes superior e inferior.
export const CUADRO = { x: 48, y: 150, ancho: 984, alto: 1290, radio: 44 } as const;
export const SUBS = { y: 1480, alto: 300 } as const;
