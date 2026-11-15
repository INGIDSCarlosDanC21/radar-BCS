// Manifiesto que escribe scripts/capturar-video.mjs en video/public/tomas/tomas.json.
export type TomaCapturada = {
  archivo: string; // ruta dentro de public/, p. ej. "tomas/toma2-calor.png"
  alto: number; // alto de la imagen en px (ancho = 1080)
  marcas: Record<string, number>; // px desde arriba de la imagen
  url: string;
};

export type Manifiesto = {
  generado: string;
  base: string;
  ancho: number;
  tomas: Record<string, TomaCapturada>;
};

export type PropsVideo = {
  hayNarracion: boolean;
  tomas: Manifiesto | null;
};
