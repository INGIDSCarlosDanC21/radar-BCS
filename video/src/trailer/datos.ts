// Datos REALES del tráiler, leídos directamente de la web (no se copian ni se suavizan):
// - web/data/indicadores.json → serie_anual de "calor" (°C, NASA POWER T2M) y de "lluvia" (mm/año)
// - web/data/localidades_tendencias.json → lat/lon de los 38 lugares (coordenadas GeoNames)
import indicadores from '../../../web/data/indicadores.json';
import localidades from '../../../web/data/localidades_tendencias.json';

type Punto = { anio: number; valor: number | null };
type Indicador = { id: string; serie_anual?: Punto[]; significancia?: { p_valor: number } };
type Lugar = { id: string; nombre_en: string; lat: number; lon: number };

const lista = (indicadores as unknown as { indicadores: Indicador[] }).indicadores;
const serie = (id: string) =>
  (lista.find((i) => i.id === id)?.serie_anual ?? []).filter((p): p is { anio: number; valor: number } => p.valor != null);

export const SERIE_CALOR = serie('calor');
export const SERIE_LLUVIA = serie('lluvia');
export const LUGARES_38: Lugar[] = (localidades as unknown as { localidades: Lugar[] }).localidades;

// Caja geográfica de la foto MODIS de web/img/FUENTES.md (lat 22.8 a 28.1, lon −115.3 a −109.3; 1200x1060).
export const CAJA_FOTO = { latN: 28.1, latS: 22.8, lonO: -115.3, lonE: -109.3, ancho: 1200, alto: 1060 } as const;
export const aFoto = (lat: number, lon: number) => ({
  x: ((lon - CAJA_FOTO.lonO) / (CAJA_FOTO.lonE - CAJA_FOTO.lonO)) * CAJA_FOTO.ancho,
  y: ((CAJA_FOTO.latN - lat) / (CAJA_FOTO.latN - CAJA_FOTO.latS)) * CAJA_FOTO.alto,
});
