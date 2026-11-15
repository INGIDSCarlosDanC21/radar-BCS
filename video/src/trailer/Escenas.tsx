// Escenas del tráiler. Cada una recibe el tiempo LOCAL (segundos desde su inicio) vía useSeg()
// porque se monta dentro de su <Sequence>. Los tiempos absolutos de la voz están en guion.ts.
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from 'remotion';
import { COLOR, FUENTE_CUERPO, FUENTE_MONO, FUENTE_TITULO } from '../estilo';
import { CIFRA_CALOR, CLIPS, LUGARES, MOMENTOS as M, MONTAJE_FUNCIONES, P_CALOR, P_LLUVIA, PALABRAS_APERTURA, TRAILER_ESCENAS as E } from '../guion';

// Convierte un momento ABSOLUTO de guion.ts a segundos locales de una escena.
const local = (abs: number, escena: { desde: number }) => abs - escena.desde;
import { Barras, Chyron, CL, Cromatica, ENTRA, FondoVivo, SUAVE, useDeriva, useSeg } from './comun';
import { aFoto, CAJA_FOTO, LUGARES_38, SERIE_CALOR, SERIE_LLUVIA } from './datos';
import { Telefono } from './Telefono';

const NARANJA = '#ff8a3d';

// Texto que sube desde una máscara (revelado editorial).
const Sube: React.FC<{ t: number; en: number; children: React.ReactNode; dur?: number; style?: React.CSSProperties }> = ({
  t,
  en,
  children,
  dur = 0.45,
  style,
}) => {
  const p = interpolate(t, [en, en + dur], [0, 1], { ...CL, easing: SUAVE });
  return (
    <div style={{ overflow: 'hidden', paddingBottom: 8, ...style }}>
      <div style={{ translate: `0px ${(1 - p) * 110}%`, opacity: p > 0 ? 1 : 0 }}>{children}</div>
    </div>
  );
};


// Logo oficial (fondo blanco opaco) sobre una tarjeta blanca con brillo cian y barrido de luz.
const TarjetaLogo: React.FC<{ ancho: number; barrido: number }> = ({ ancho, barrido }) => {
  const pad = ancho * 0.045;
  const alto = (ancho - pad * 2) * (132 / 470) + pad * 2;
  return (
    <div style={{ position: "relative", width: ancho, height: alto, padding: pad, background: "#fff", borderRadius: ancho * 0.05, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 70px rgba(81,216,232,0.45)" }}>
      <Img src={staticFile("logo-radar-bcs.png")} style={{ width: ancho - pad * 2, display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, transparent ${barrido - 10}%, rgba(81,216,232,0.55) ${barrido}%, transparent ${barrido + 10}%)`, mixBlendMode: "multiply" }} />
    </div>
  );
};

// Salida/entrada en "látigo" (whip pan): desplazamiento horizontal con desenfoque de movimiento.
const latigo = (t: number, durEscena: number, entra: boolean, sale: boolean) => {
  let x = 0;
  let b = 0;
  if (entra) {
    const p = interpolate(t, [0, 0.22], [1, 0], { ...CL, easing: Easing.out(Easing.cubic) });
    x += p * 1400;
    b += p * 40;
  }
  if (sale) {
    const p = interpolate(t, [durEscena - 0.2, durEscena], [0, 1], { ...CL, easing: ENTRA });
    x -= p * 1400;
    b += p * 40;
  }
  return { translate: `${x}px 0px`, filter: b > 0.5 ? `blur(${b}px)` : undefined };
};

// ─── 1. APERTURA (0–3 s): satélite + calima + HEAT · WATER · SEA ─────────────────────────────
export const Apertura: React.FC = () => {
  const t = useSeg();
  const d = useDeriva('apertura', 5);
  const escalaFoto = 1920 / CAJA_FOTO.ancho; // la foto cubre el ancho del cuadro
  const lp = aFoto(24.14, -110.31); // La Paz (web/data/localidades_tendencias.json)
  const durA = E.apertura.hasta - E.apertura.desde;
  const zoom = interpolate(t, [0, durA], [1.0, 1.32], { ...CL, easing: Easing.inOut(Easing.sin) });
  // la cámara empuja hacia La Paz
  const cx = interpolate(t, [0, durA], [960, lp.x * escalaFoto], CL);
  const cy = interpolate(t, [0, durA], [560, lp.y * escalaFoto], CL);
  const abre = interpolate(t, [0, 0.9], [540, 0], { ...CL, easing: SUAVE });
  const salida = interpolate(t, [durA - 0.45, durA], [1, 2.6], { ...CL, easing: ENTRA });
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="calima">
          <feTurbulence type="fractalNoise" baseFrequency={`0.006 ${0.02 + t * 0.002}`} numOctaves={2} seed={Math.floor(t * 6)} />
          <feDisplacementMap in="SourceGraphic" scale={9} />
        </filter>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 960 - cx * zoom + d.x,
          top: 540 - cy * zoom + d.y,
          width: 1920 * zoom,
          height: CAJA_FOTO.alto * escalaFoto * zoom,
          filter: 'url(#calima) saturate(1.25) contrast(1.12) brightness(0.92)',
          opacity: interpolate(t, [0.1, 1.1], [0, 1], CL),
        }}
      >
        <Img src={staticFile('bcs-modis.jpg')} style={{ width: '100%', height: '100%' }} />
      </div>
      {/* capa de bruma más cercana: se mueve más rápido (parallax) */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 40% 30% at 30% 40%, rgba(255,200,150,0.18), transparent 70%), radial-gradient(ellipse 35% 25% at 75% 70%, rgba(150,220,255,0.14), transparent 70%)',
          translate: `${interpolate(t, [0, durA], [-60, 90])}px 0px`,
          scale: `${zoom * 1.1}`,
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,20,0.55) 0%, rgba(0,0,0,0) 40%, rgba(0,8,20,0.65) 100%)' }} />
      <Chyron
        texto={'LA PAZ · BAJA CALIFORNIA SUR · 24.14°N 110.31°W'.slice(0, Math.floor(interpolate(t, [0.4, 1.3], [0, 48], CL)))}
        mono={FUENTE_MONO}
        style={{ position: 'absolute', left: 96, top: 120, opacity: interpolate(t, [0.3, 0.5], [0, 1], CL) }}
      />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', scale: `${salida}`, opacity: interpolate(t, [durA - 0.3, durA], [1, 0], CL) }}>
        <div style={{ display: 'flex', gap: 56, alignItems: 'baseline' }}>
          {PALABRAS_APERTURA.map((p, i) => {
            const q = interpolate(t, [local(p.en, E.apertura) - 0.05, local(p.en, E.apertura) + 0.3], [0, 1], { ...CL, easing: SUAVE });
            const colores = [NARANJA, COLOR.cian, '#7fb2ff'];
            return (
              <div key={p.texto} style={{ display: 'flex', alignItems: 'baseline', gap: 56 }}>
                <div
                  style={{
                    fontFamily: FUENTE_TITULO,
                    fontSize: 168,
                    letterSpacing: interpolate(q, [0, 1], [40, 6]),
                    color: '#fff',
                    opacity: q,
                    scale: `${interpolate(q, [0, 1], [1.5, 1])}`,
                    filter: `blur(${(1 - q) * 18}px)`,
                    textShadow: `0 0 40px ${colores[i]}, 0 6px 30px rgba(0,0,0,0.6)`,
                  }}
                >
                  {p.texto}
                </div>
                {i < 2 ? <div style={{ width: 18, height: 18, borderRadius: 9, background: colores[i], opacity: q }} /> : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Barras alto={abre} />
    </AbsoluteFill>
  );
};

// ─── 2. TÍTULO (3–6 s): logo con glitch + barrido de luz, teléfono que sube ───────────────────
export const Titulo: React.FC = () => {
  const t = useSeg();
  const d = useDeriva('titulo', 6);
  const glitch = t < 0.4 ? Math.round(Math.sin(t * 140) * 22 * (1 - t / 0.4)) : 0;
  const cortes = t < 0.35 ? [((t * 977) % 1) * 100, ((t * 541) % 1) * 100] : null;
  const sube = interpolate(t, [1.0, 2.0], [0, 1], { ...CL, easing: SUAVE });
  const logoEscala = interpolate(t, [0, 0.3, 1.0, 1.8], [1.35, 1.0, 1.0, 0.55], { ...CL, easing: SUAVE });
  const logoX = interpolate(t, [1.0, 1.8], [960, 520], { ...CL, easing: SUAVE });
  const logoY = interpolate(t, [1.0, 1.8], [520, 470], { ...CL, easing: SUAVE });
  const barrido = interpolate(t, [0.45, 1.1], [-40, 140], CL);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <FondoVivo tono="marca" />
      {/* segundo teléfono al fondo, desenfocado (profundidad) */}
      <Telefono clip={CLIPS.cielo} ancho={330} x={1590 + d.x} y={interpolate(sube, [0, 1], [1500, 600])} rotY={-30} rotX={10} rotZ={6} desenfoque={7} sombra={false} />
      <Telefono
        clip={CLIPS.barra}
        ancho={400}
        x={1230 + d.x}
        y={interpolate(sube, [0, 1], [1700, 560]) + d.y}
        rotY={interpolate(t, [1, 3], [-34, -14], CL)}
        rotX={interpolate(t, [1, 3], [22, 6], CL)}
        rotZ={interpolate(t, [1, 3], [-6, -2], CL)}
      />
      <div style={{ position: "absolute", left: logoX - 450, top: logoY - 126, width: 900, scale: `${logoEscala}`, translate: `${glitch}px 0px` }}>
        <div style={{ clipPath: cortes ? `inset(${cortes[0] * 0.5}% 0 ${cortes[1] * 0.4}% 0)` : undefined }}>
          <Cromatica px={glitch * 0.6}>
            <TarjetaLogo ancho={900} barrido={barrido} />
          </Cromatica>
        </div>
      </div>
      <div style={{ position: "absolute", left: 96, top: 640, width: 840, opacity: interpolate(t, [1.4, 1.8], [0, 1], CL) }}>
        <Sube t={t} en={1.5}>
          <div style={{ fontFamily: FUENTE_TITULO, fontSize: 64, color: '#fff', lineHeight: 1.05 }}>
            NASA data <span style={{ color: COLOR.cian }}>→</span> answers
          </div>
        </Sube>
        <Sube t={t} en={1.8}>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 24, color: COLOR.azulGris, letterSpacing: 3, marginTop: 14 }}>FREE · ON YOUR PHONE · DATA SINCE 2001</div>
        </Sube>
      </div>
    </AbsoluteFill>
  );
};

// ─── 3. CALOR (6–12 s): +1.47 °C, gráfica anual real, sello p < 0.001 ───────────────────────
export const Calor: React.FC = () => {
  const t = useSeg();
  const d = useDeriva('calor', 7);
  const dur = E.calor.hasta - E.calor.desde;
  const k = (abs: number) => local(abs, E.calor);
  const cuenta = interpolate(t, [k(M.contadorDesde), k(M.contadorHasta)], [0, 1.47], { ...CL, easing: Easing.out(Easing.cubic) });
  const dibujo = interpolate(t, [k(M.graficaDesde), k(M.graficaHasta)], [0, 1], { ...CL, easing: Easing.inOut(Easing.quad) });
  const sello = interpolate(t, [k(M.sello), k(M.sello) + 0.25], [0, 1], { ...CL, easing: Easing.out(Easing.back(2)) });
  const marcador = interpolate(t, [k(M.sello) + 0.2, k(M.sello) + 0.7], [0, 100], { ...CL, easing: SUAVE });
  // gráfica: valores reales de SERIE_CALOR (web/data/indicadores.json)
  const W = 860;
  const H = 250;
  const vals = SERIE_CALOR.map((p) => p.valor);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const px = (i: number) => (i / (vals.length - 1)) * W;
  const py = (v: number) => H - ((v - min) / (max - min)) * H;
  const camino = vals.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const visibles = Math.floor(dibujo * (vals.length - 1) + 0.001);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...latigo(t, dur, false, true) }}>
      <FondoVivo tono="calor" particulas="brasas" />
      <AbsoluteFill style={{ scale: `${interpolate(t, [0, dur], [1.0, 1.07])}`, translate: `${d.x}px ${d.y}px` }}>
        {/* rejilla tenue */}
        <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(255,140,60,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,60,0.06) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <Telefono
          clip={CLIPS.calorSim}
          ancho={360}
          x={interpolate(t, [0, dur], [480, 510])}
          y={515}
          rotY={interpolate(t, [0, dur], [32, 12], { ...CL, easing: Easing.out(Easing.quad) })}
          rotX={interpolate(t, [0, dur], [10, 3])}
          rotZ={interpolate(t, [0, dur], [3, 0])}
          escala={interpolate(t, [0, 0.4], [0.85, 1], { ...CL, easing: SUAVE })}
        />
        <div style={{ position: 'absolute', left: 880, top: 110, width: 940 }}>
          <Chyron texto="AIR TEMPERATURE · LA PAZ · 2001–2025" mono={FUENTE_MONO} color={NARANJA} style={{ opacity: interpolate(t, [0.1, 0.4], [0, 1], CL) }} />
          <div
            style={{
              fontFamily: FUENTE_TITULO,
              fontSize: 190,
              lineHeight: 1,
              color: '#fff',
              marginTop: 18,
              textShadow: `0 0 50px rgba(255,138,61,${interpolate(t, [k(M.contadorHasta) - 0.4, k(M.contadorHasta) + 0.1], [0.2, 0.9], CL)})`,
              fontVariantNumeric: 'tabular-nums',
              opacity: interpolate(t, [k(M.contadorDesde) - 0.1, k(M.contadorDesde) + 0.1], [0, 1], CL),
            }}
          >
            {t < k(M.contadorHasta) ? `+${cuenta.toFixed(2)} °C` : CIFRA_CALOR}
          </div>
          <svg width={W + 120} height={H + 70} style={{ marginTop: 26, overflow: 'visible' }}>
            <defs>
              <linearGradient id="relleno" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={NARANJA} stopOpacity="0.35" />
                <stop offset="1" stopColor={NARANJA} stopOpacity="0" />
              </linearGradient>
              <clipPath id="recorte">
                <rect x={-10} y={-20} width={dibujo * (W + 20)} height={H + 40} />
              </clipPath>
            </defs>
            <g transform="translate(70,10)">
              <text x={-14} y={8} fill="rgba(255,255,255,0.6)" fontFamily={FUENTE_MONO} fontSize={18} textAnchor="end">{max.toFixed(1)}</text>
              <text x={-14} y={H} fill="rgba(255,255,255,0.6)" fontFamily={FUENTE_MONO} fontSize={18} textAnchor="end">{min.toFixed(1)}</text>
              <line x1={0} x2={W} y1={H + 12} y2={H + 12} stroke="rgba(255,255,255,0.25)" />
              <text x={0} y={H + 42} fill="rgba(255,255,255,0.7)" fontFamily={FUENTE_MONO} fontSize={20}>{SERIE_CALOR[0].anio}</text>
              <text x={W} y={H + 42} fill="rgba(255,255,255,0.7)" fontFamily={FUENTE_MONO} fontSize={20} textAnchor="end">{SERIE_CALOR[SERIE_CALOR.length - 1].anio}</text>
              <g clipPath="url(#recorte)">
                <path d={`${camino} L${W},${H} L0,${H} Z`} fill="url(#relleno)" />
                <path d={camino} fill="none" stroke={NARANJA} strokeWidth={5} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px rgba(255,138,61,0.9))' }} />
              </g>
              {vals.map((v, i) => (i <= visibles ? <circle key={i} cx={px(i)} cy={py(v)} r={i === visibles ? 9 : 4} fill={i === visibles ? '#fff' : NARANJA} /> : null))}
            </g>
          </svg>
          <div style={{ position: 'relative', marginTop: 14, height: 90, display: 'flex', alignItems: 'center', gap: 26, opacity: sello }}>
            <div
              style={{
                fontFamily: FUENTE_MONO,
                fontSize: 46,
                color: '#fff',
                padding: '8px 22px',
                border: `3px solid ${NARANJA}`,
                borderRadius: 10,
                rotate: '-3deg',
                scale: `${interpolate(sello, [0, 1], [1.8, 1])}`,
              }}
            >
              {P_CALOR}
            </div>
            <div style={{ position: 'relative', fontFamily: FUENTE_CUERPO, fontWeight: 800, fontSize: 40, color: '#1a0b02' }}>
              <div style={{ position: 'absolute', left: -10, top: 4, bottom: 0, width: `calc(${marcador}% + 20px)`, background: NARANJA, borderRadius: 6, rotate: '-1deg' }} />
              <span style={{ position: 'relative', color: marcador > 60 ? '#1a0b02' : '#fff' }}>statistically significant</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── 4. LLUVIA (12–15.5 s): barras reales, "No clear change", p = 0.129 ─────────────────────
export const Lluvia: React.FC = () => {
  const t = useSeg();
  const d = useDeriva('lluvia', 5);
  const dur = E.lluvia.hasta - E.lluvia.desde;
  const k = (abs: number) => local(abs, E.lluvia);
  const vals = SERIE_LLUVIA.map((p) => p.valor);
  const max = Math.max(...vals);
  const W = 1000;
  const H = 300;
  const bw = W / vals.length;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...latigo(t, dur, true, true) }}>
      <FondoVivo tono="lluvia" particulas="lluvia" />
      <AbsoluteFill style={{ scale: `${interpolate(t, [0, dur], [1.08, 1.0])}`, translate: `${d.x}px ${d.y}px` }}>
        <Telefono
          clip={CLIPS.lluvia}
          ancho={350}
          x={1540}
          y={515}
          rotY={interpolate(t, [0, dur], [-30, -16])}
          rotX={6}
          rotZ={-2}
          desenfoque={interpolate(t, [k(M.noClearChange) - 0.2, k(M.noClearChange) + 0.2], [0, 5], CL)}
        />
        <div style={{ position: 'absolute', left: 110, top: 120 }}>
          <Chyron texto="RAINFALL · LA PAZ · 2001–2025 · MM PER YEAR" mono={FUENTE_MONO} color="#8fc8ff" />
          <svg width={W} height={H + 50} style={{ marginTop: 40, overflow: 'visible' }}>
            {vals.map((v, i) => {
              const q = interpolate(t, [0.2 + i * 0.035, 0.6 + i * 0.035], [0, 1], { ...CL, easing: SUAVE });
              const h = (v / max) * H * q;
              return <rect key={i} x={i * bw + 3} y={H - h} width={bw - 6} height={h} rx={3} fill="#5aa9ff" opacity={0.85} />;
            })}
            <line x1={0} x2={W} y1={H + 6} y2={H + 6} stroke="rgba(255,255,255,0.3)" />
            <text x={0} y={H + 40} fill="rgba(255,255,255,0.7)" fontFamily={FUENTE_MONO} fontSize={20}>{SERIE_LLUVIA[0].anio}</text>
            <text x={W} y={H + 40} fill="rgba(255,255,255,0.7)" fontFamily={FUENTE_MONO} fontSize={20} textAnchor="end">{SERIE_LLUVIA[SERIE_LLUVIA.length - 1].anio}</text>
          </svg>
          <Sube t={t} en={k(M.noClearChange)} dur={0.5} style={{ marginTop: 30 }}>
            <div style={{ fontFamily: FUENTE_TITULO, fontSize: 120, color: '#fff', lineHeight: 1 }}>No clear change</div>
          </Sube>
          <Sube t={t} en={k(M.pLluvia)}>
            <div style={{ fontFamily: FUENTE_MONO, fontSize: 30, color: '#8fc8ff', marginTop: 14, letterSpacing: 2 }}>{P_LLUVIA} · NOT STATISTICALLY SIGNIFICANT</div>
          </Sube>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── 5. MAPA (15.5–18.5 s): satélite inclinado + 38 pines en cascada ────────────────────────
export const Mapa: React.FC = () => {
  const t = useSeg();
  const dur = E.mapa.hasta - E.mapa.desde;
  const k = (abs: number) => local(abs, E.mapa);
  const ordenados = [...LUGARES_38].sort((a, b) => b.lat - a.lat); // de norte a sur
  const apareceEn = (i: number) => k(M.pinesDesde) + Math.floor(i / 10) * M.pinesPaso + (i % 10) * 0.04; // 4 oleadas
  const visibles = ordenados.filter((_, i) => t >= apareceEn(i)).length;
  const lp = aFoto(24.14, -110.31);
  const escala = 1.15;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <FondoVivo tono="mapa" />
      <div
        style={{
          position: 'absolute',
          left: 930 - (CAJA_FOTO.ancho * escala) / 2,
          top: 560 - (CAJA_FOTO.alto * escala) / 2,
          width: CAJA_FOTO.ancho * escala,
          height: CAJA_FOTO.alto * escala,
          transform: `perspective(1800px) rotateX(${interpolate(t, [0, dur], [12, 44], { ...CL, easing: Easing.inOut(Easing.sin) })}deg) rotateZ(${interpolate(t, [0, dur], [-4, -16])}deg) scale(${interpolate(t, [0, dur], [1.3, 0.98], { ...CL, easing: SUAVE })})`,
        }}
      >
        <Img src={staticFile('bcs-modis.jpg')} style={{ width: '100%', height: '100%', filter: 'saturate(0.5) brightness(0.75) contrast(1.15)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,40,70,0.35), rgba(0,10,30,0.25))', mixBlendMode: 'multiply' }} />
        {ordenados.map((l, i) => {
          const q = interpolate(t, [apareceEn(i), apareceEn(i) + 0.25], [0, 1], { ...CL, easing: Easing.out(Easing.back(3)) });
          const onda = interpolate(t, [apareceEn(i), apareceEn(i) + 0.6], [0, 1], CL);
          if (q <= 0) return null;
          const p = aFoto(l.lat, l.lon);
          return (
            <div key={l.id} style={{ position: 'absolute', left: p.x * escala, top: p.y * escala }}>
              <div style={{ position: 'absolute', left: -30, top: -30, width: 60, height: 60, borderRadius: 30, border: `3px solid ${NARANJA}`, opacity: 1 - onda, scale: `${0.3 + onda * 1.4}` }} />
              <div style={{ position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: 13, background: NARANJA, border: '3px solid #fff', scale: `${q}`, boxShadow: `0 0 18px ${NARANJA}` }} />
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: lp.x * escala + 22,
            top: lp.y * escala - 20,
            fontFamily: FUENTE_CUERPO,
            fontWeight: 800,
            fontSize: 30,
            color: '#fff',
            textShadow: '0 2px 10px #000',
            opacity: interpolate(t, [k(M.laPaz), k(M.laPaz) + 0.3], [0, 1], CL),
          }}
        >
          La Paz
        </div>
      </div>
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(1,14,10,0.92) 0%, rgba(1,14,10,0.55) 30%, rgba(1,14,10,0) 55%)' }} />
      <Telefono clip={CLIPS.lugares} ancho={330} x={1640} y={interpolate(t, [0, dur], [560, 520])} rotY={interpolate(t, [0, dur], [-26, -16])} rotX={6} rotZ={2} escala={interpolate(t, [0, 0.4], [0.8, 1], { ...CL, easing: SUAVE })} />
      <div style={{ position: 'absolute', left: 110, top: 200 }}>
        <Chyron texto="WHERE · BAJA CALIFORNIA SUR" mono={FUENTE_MONO} />
        <div style={{ fontFamily: FUENTE_TITULO, fontSize: 260, color: '#fff', lineHeight: 1, marginTop: 20, fontVariantNumeric: 'tabular-nums', textShadow: '0 0 40px rgba(81,216,232,0.5)' }}>
          {String(Math.max(visibles, 0)).padStart(2, '0')}
        </div>
        <Sube t={t} en={0.4}>
          <div style={{ fontFamily: FUENTE_TITULO, fontSize: 64, color: COLOR.cian, letterSpacing: 8 }}>PLACES</div>
        </Sube>
        <Sube t={t} en={k(M.laPaz)}>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 22, color: COLOR.azulGris, marginTop: 20, letterSpacing: 2 }}>
            AIR HEAT AND RAIN TRENDS · {LUGARES} PLACES
          </div>
        </Sube>
      </div>
    </AbsoluteFill>
  );
};

// ─── 6. FUNCIONES (frase 6): montaje rápido de la app real + "Not official warnings." ───────
// Un corte cada 0.5 s (MONTAJE_FUNCIONES en guion.ts); cada plano con otro ángulo de cámara.
const ANGULOS = [
  { x: 1180, y: 560, ancho: 470, rotY: -22, rotX: 10, rotZ: -4 },
  { x: 760, y: 540, ancho: 520, rotY: 20, rotX: 6, rotZ: 3 },
  { x: 1240, y: 600, ancho: 600, rotY: -12, rotX: 18, rotZ: -7 },
  { x: 860, y: 520, ancho: 450, rotY: 28, rotX: -4, rotZ: 4 },
  { x: 1160, y: 560, ancho: 520, rotY: -30, rotX: 8, rotZ: 0 },
];
export const Funciones: React.FC = () => {
  const t = useSeg();
  const d = useDeriva('funciones', 10, 0.8);
  const k = (abs: number) => local(abs, E.funciones);
  const finMontaje = k(M.notOfficial) - 0.05;
  const no = k(M.notOfficial);
  const me = k(M.modelEstimates);
  const idx = MONTAJE_FUNCIONES.findIndex((p, i) => {
    const sig = MONTAJE_FUNCIONES[i + 1];
    return t >= k(p.desde) && t < (sig ? k(sig.desde) : finMontaje);
  });
  const plano = idx >= 0 ? MONTAJE_FUNCIONES[idx] : null;
  const a = ANGULOS[Math.max(idx, 0) % ANGULOS.length];
  const tp = plano ? t - k(plano.desde) : 0; // tiempo dentro del plano
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <FondoVivo tono="mar" />
      {plano ? (
        <>
          <Telefono
            key={plano.clip + idx}
            clip={{ ...CLIPS[plano.clip], desde: CLIPS[plano.clip].desde }}
            ancho={a.ancho}
            x={a.x + d.x + tp * (idx % 2 ? -60 : 60)}
            y={a.y + d.y}
            rotY={a.rotY + tp * (idx % 2 ? -8 : 8)}
            rotX={a.rotX}
            rotZ={a.rotZ}
            escala={interpolate(tp, [0, 0.12, 0.5], [1.12, 1.0, 1.04], CL)}
          />
          <Chyron texto={plano.etiqueta} mono={FUENTE_MONO} color="#7ff5e0" style={{ position: 'absolute', left: idx % 2 ? 1180 : 110, top: 140, fontSize: 30 }} />
        </>
      ) : (
        <>
          <Telefono clip={CLIPS.avisos} ancho={1050} x={1300 + d.x} y={interpolate(t, [finMontaje, 4], [640, 560]) + d.y} rotY={interpolate(t, [finMontaje, 4], [-14, -6])} rotX={8} rotZ={2} desenfoque={interpolate(t, [finMontaje, finMontaje + 0.3, no + 0.5, no + 0.9], [12, 0, 0, 7], CL)} />
          <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(1,18,20,0.95) 0%, rgba(1,18,20,0.7) 45%, rgba(1,18,20,0) 75%)' }} />
        </>
      )}
      <div style={{ position: 'absolute', left: 110, top: plano ? 820 : 300 }}>
        <Sube t={t} en={me}>
          <div style={{ fontFamily: FUENTE_TITULO, fontSize: plano ? 64 : 92, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>Model estimates.</div>
        </Sube>
        {!plano ? (
          <div style={{ position: 'relative', marginTop: 16, display: 'inline-block' }}>
            <div
              style={{
                position: 'absolute',
                left: -14,
                top: 10,
                bottom: 4,
                width: `calc(${interpolate(t, [no + 0.15, no + 0.65], [0, 100], { ...CL, easing: SUAVE })}% + ${interpolate(t, [no + 0.15, no + 0.25], [0, 28], CL)}px)`,
                background: '#ff6b6b',
                borderRadius: 8,
                rotate: '-1deg',
              }}
            />
            <Sube t={t} en={no}>
              <div style={{ position: 'relative', fontFamily: FUENTE_TITULO, fontSize: 92, color: '#fff' }}>Not official warnings.</div>
            </Sube>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ─── 7. CIERRE (22–28 s): "What changed, not why." + logo con destellos + URL ───────────────
export const Cierre: React.FC<{ url: string; fuentes: string }> = ({ url, fuentes }) => {
  const t = useSeg();
  const k = (abs: number) => local(abs, E.cierre);
  const lg = k(M.logo);
  const fin = E.cierre.hasta - E.cierre.desde;
  const sube = interpolate(t, [lg - 0.1, lg + 0.4], [0, 1], { ...CL, easing: SUAVE });
  const logo = interpolate(t, [lg, lg + 0.5], [0, 1], { ...CL, easing: Easing.out(Easing.back(1.6)) });
  const barrido = interpolate(t, [lg + 0.4, lg + 1.1], [-40, 140], CL);
  const rayos = interpolate(t, [lg, lg + 0.2, lg + 1.5], [0, 1, 0], CL);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', scale: `${interpolate(t, [0, fin], [1, 1.06])}` }}>
      <FondoVivo tono="cierre" />
      <AbsoluteFill style={{ alignItems: 'center', transformOrigin: 'top center', top: interpolate(sube, [0, 1], [330, 150]), scale: `${interpolate(sube, [0, 1], [1, 0.62])}` }}>
        <div style={{ display: 'flex', gap: 34 }}>
          <Sube t={t} en={k(M.cierreFrase1)} dur={0.4}>
            <div style={{ fontFamily: FUENTE_TITULO, fontSize: 150, color: '#fff' }}>What changed,</div>
          </Sube>
          <Sube t={t} en={k(M.cierreFrase2)} dur={0.4}>
            <div style={{ fontFamily: FUENTE_TITULO, fontSize: 150, color: COLOR.cian }}>not why.</div>
          </Sube>
        </div>
      </AbsoluteFill>
      {/* destello radial (starburst) detrás del logo */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: rayos, top: 70, mixBlendMode: 'screen' }}>
        <svg width={1400} height={1400} viewBox="-700 -700 1400 1400" style={{ rotate: `${t * 12}deg` }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <polygon key={i} points="0,-14 680,0 0,14" fill="rgba(81,216,232,0.35)" transform={`rotate(${i * 15})`} />
          ))}
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 960 - 430, top: 400, width: 860, opacity: logo, scale: `${interpolate(logo, [0, 1], [0.7, 1]) + t * 0.006}` }}>
        <TarjetaLogo ancho={860} barrido={barrido} />
      </div>
      {/* chispas */}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + i;
        const r = interpolate(t, [lg, lg + 1.1], [80, 420 + (i % 3) * 90], { ...CL, easing: Easing.out(Easing.cubic) });
        const o = interpolate(t, [lg, lg + 0.2, lg + 1.1], [0, 1, 0], CL);
        return <div key={i} style={{ position: 'absolute', left: 960 + Math.cos(a) * r * 1.4, top: 576 + Math.sin(a) * r * 0.6, width: 8, height: 8, borderRadius: 4, background: '#fff', boxShadow: `0 0 16px ${COLOR.cian}`, opacity: o }} />;
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center' }}>
        <Sube t={t} en={k(M.url)}>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 40, color: '#fff', letterSpacing: 1 }}>{url}</div>
        </Sube>
        <Sube t={t} en={k(M.fuentes)}>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 26, color: COLOR.cian, marginTop: 12, letterSpacing: 2 }}>{fuentes}</div>
        </Sube>
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: interpolate(t, [fin - 0.6, fin - 0.1], [0, 1], CL) }} />
    </AbsoluteFill>
  );
};
