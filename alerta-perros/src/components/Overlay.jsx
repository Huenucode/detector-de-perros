import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, PawPrint, Skull, Dog, Check, CloudOff, RefreshCw, HeartPulse, Activity, Smartphone, Radio } from 'lucide-react'

const Ex = () => <span className="ex">EJ.</span>

function Form({ t }) {
  const rows = [
    { icon: Camera, k: 'Foto', v: 'evento_0193.jpg' },
    { icon: MapPin, k: 'Ubicación', v: '-40.5211, -73.0622' },
    { icon: PawPrint, k: 'Especie afectada', v: 'Ovino' },
    { icon: Skull, k: 'N.º animales', v: '2 muertos · 3 heridos' },
    { icon: Activity, k: 'Daño / aborto', v: 'Sin abortos' },
    { icon: Dog, k: '¿Perros con dueño?', v: 'No se sabe' },
  ]
  const shown = Math.floor((t - 0.4) / 0.7)
  return (
    <div className="ov-card">
      <div className="ov-head"><Smartphone size={14} /> NUEVO EVENTO <Ex /></div>
      {rows.map((r, i) => {
        const done = i < shown
        const typing = i === shown
        const chars = typing ? Math.floor(((t - 0.4) % 0.7) / 0.7 * r.v.length) : r.v.length
        return (
          <div key={r.k} className={'ov-row' + (done ? ' done' : '') + (typing ? ' typing' : '')}>
            <r.icon size={14} />
            <span className="ov-k">{r.k}</span>
            <span className="ov-v">{done ? r.v : typing ? r.v.slice(0, chars) : ''}{typing && <i className="caret" />}</span>
            {done && <Check size={13} className="ok" />}
          </div>
        )
      })}
      <motion.div className="ov-send" animate={shown >= rows.length ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2 }}>
        {shown >= rows.length ? 'ENVIAR ✓' : 'ENVIAR'}
      </motion.div>
    </div>
  )
}

function Queue({ o, t }) {
  const all = [
    { k: 'Ataque', h: '07:48', d: '2 muertos · 3 heridos' },
    { k: 'Avistamiento', h: '11:20', d: '4 perros sin dueño' },
    { k: 'Avistamiento', h: '16:05', d: '2 perros con collar' },
  ]
  let items = all.slice(0, o.items)
  if (o.syncing) items = all.map((x, i) => ({ ...x, sent: t > 0.3 + i * 0.6 + 3 * 1.15 }))
  return (
    <div className="ov-card">
      <div className="ov-head">{o.syncing ? <RefreshCw size={14} className="spin" /> : <CloudOff size={14} />} COLA LOCAL DEL CELULAR <Ex /></div>
      <AnimatePresence>
        {items.length === 0 && (
          <motion.div className="ov-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Check size={16} /> Cola vacía · todo sincronizado</motion.div>
        )}
        {items.map((it, i) => (
          <motion.div key={it.h} className={'ov-qrow' + (it.sent ? ' sent' : '')} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.12 }}>
            <span className="q-dot" />
            <span className="q-k">{it.k}</span>
            <span className="q-h">{it.h}</span>
            <span className="q-d">{it.d}</span>
            <span className="q-s">{it.sent ? 'enviado' : 'pendiente'}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function Sensor({ t }) {
  const N = 60
  const prog = Math.min(1, t / 4.5)
  const pulse = (i) => {
    const x = i / N
    const base = x < 0.45 ? 74 + Math.sin(i * 1.3) * 3 : 74 + (225 - 74) * Math.min(1, (x - 0.45) / 0.15) + Math.sin(i * 2.1) * 4
    return base
  }
  const acc = (i) => {
    const x = i / N
    return x < 0.45 ? 0.3 + Math.abs(Math.sin(i * 1.7)) * 0.4 : x < 0.62 ? 1 + ((x - 0.45) / 0.17) * 3.6 + Math.sin(i * 3) * 0.4 : 3.2 + Math.sin(i * 2.4) * 1.2
  }
  const pts = (fn, max, h) =>
    Array.from({ length: Math.floor(N * prog) + 1 }, (_, i) => `${(i / N) * 260},${h - (fn(i) / max) * (h - 6)}`).join(' ')
  const cur = Math.round(pulse(Math.floor(N * prog)))
  return (
    <div className="ov-card">
      <div className="ov-head"><HeartPulse size={14} /> SENSORES DEL COLLAR #042 <Ex /></div>
      <div className="ov-metric"><span>Pulso</span><b className={cur > 150 ? 'hot' : ''}>{cur} lpm</b></div>
      <svg viewBox="0 0 260 70" className="ov-chart">
        <line x1="0" y1={70 - (225 / 240) * 64} x2="260" y2={70 - (225 / 240) * 64} className="ref" />
        <polyline points={pts(pulse, 240, 70)} className="line-pulse" />
      </svg>
      <div className="ov-metric"><span>Aceleración</span><b>{acc(Math.floor(N * prog)).toFixed(1)} g</b></div>
      <svg viewBox="0 0 260 50" className="ov-chart">
        <polyline points={pts(acc, 5, 50)} className="line-acc" />
      </svg>
      <p className="ov-note">Referencia: en Suiza el pulso saltó de 60–80 a 225 lpm en un ataque simulado.</p>
    </div>
  )
}

function Herd({ o, t }) {
  const win = Math.min(1, t / 3.5)
  return (
    <div className="ov-card">
      <div className="ov-head"><Radio size={14} /> DECISIÓN DE REBAÑO · GATEWAY <Ex /></div>
      <div className="herd">
        {Array.from({ length: o.total }, (_, i) => {
          const r = i < o.reacting
          return (
            <motion.div key={i} className={'herd-s' + (r ? ' r' : '')} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.12 }}>
              <span>#{42 + i}</span>
              <i>{r ? 'huida' : 'calma'}</i>
            </motion.div>
          )
        })}
      </div>
      <div className="win">
        <div className="win-bar"><motion.div className="win-fill" style={{ width: `${win * 100}%` }} /></div>
        <span>ventana 60 s</span>
      </div>
      <div className={'verdict ' + (o.reacting >= 3 ? 'bad' : 'ok')}>
        {win < 1 ? 'Esperando…' : o.reacting >= 3 ? `${o.reacting} de ${o.total} → ALARMA` : `${o.reacting} de ${o.total} → sin alarma`}
      </div>
    </div>
  )
}

// cuadrícula 6 × 4 de sectores con conteos de ejemplo
const GRID = [0, 1, 0, 0, 2, 0, 1, 0, 3, 1, 0, 0, 0, 2, 4, 1, 0, 1, 0, 0, 1, 0, 0, 0]
const POINTS = [[54, 40], [62, 47], [70, 38], [61, 55], [72, 52], [41, 30], [118, 24], [124, 31], [137, 64], [12, 47], [90, 82], [148, 88], [33, 80], [104, 60], [92, 18], [80, 66]]

function MapCard({ o }) {
  const grid = o.mode === 'grid'
  const lvl = (n) => (n >= 4 ? 'l4' : n >= 2 ? 'l3' : n === 1 ? 'l2' : 'l1')
  return (
    <div className="ov-card">
      <div className="ov-head"><MapPin size={14} /> {grid ? 'MAPA DE RIESGO · POR SECTOR' : 'BASE GEOESPACIAL · PUNTOS EXACTOS'} <Ex /></div>
      <div className="mapbox">
        <div className="mapgrid">
          {GRID.map((n, i) => (
            <motion.div key={i} className={'cell ' + (grid ? lvl(n) : '') + (o.highlight === i ? ' hl' : '')}
              initial={false} animate={{ opacity: 1 }}>
              {grid && n > 0 && <span>{n}</span>}
              {grid && o.highlight === i && <motion.em initial={{ y: 6, opacity: 0 }} animate={{ y: -2, opacity: 1 }} transition={{ delay: 1.6 }}>+1</motion.em>}
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {!grid && POINTS.map(([x, y], i) => (
            <motion.i key={i} className="pt" style={{ left: `${(x / 160) * 100}%`, top: `${(y / 100) * 100}%` }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ delay: i * 0.05 }} />
          ))}
        </AnimatePresence>
      </div>
      <p className="ov-note">{grid ? 'Los vecinos ven sectores agregados, nunca el predio exacto de otro.' : 'Solo el productor y el equipo autorizado ven este nivel de detalle.'}</p>
    </div>
  )
}

function Panel({ t }) {
  const rows = [['Purranque', 34], ['Osorno', 29], ['Río Negro', 24], ['San Pablo', 22], ['Puyehue', 19]]
  const kpis = [['Eventos', 128], ['Predios', 41], ['Muertos', 63], ['Abortos', 12]]
  const k = Math.min(1, Math.max(0, (t - 1) / 1.6))
  return (
    <div className="ov-card">
      <div className="ov-head"><Activity size={14} /> PANEL · TEMPORADA 2026 <Ex /></div>
      <div className="kpis">
        {kpis.map(([n, v]) => <div key={n}><b>{Math.round(v * k)}</b><span>{n}</span></div>)}
      </div>
      {rows.map(([c, v], i) => (
        <div key={c} className="prow">
          <span>{c}</span>
          <div className="pbar"><motion.div initial={{ width: 0 }} animate={{ width: `${(v / 34) * 100}%` }} transition={{ delay: 1 + i * 0.12, duration: 0.8 }} /></div>
          <b>{v}</b>
        </div>
      ))}
      <p className="ov-note">Datos ficticios. Las cifras reales salen del piloto.</p>
    </div>
  )
}

function Merge({ t }) {
  const done = t > 2.2
  return (
    <div className="ov-card">
      <div className="ov-head"><RefreshCw size={14} /> CRUCE DE FUENTES <Ex /></div>
      <div className="merge">
        <motion.div className="src collar" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <b>Collar</b><span>03:41 · S-14</span><span>3/5 centinelas</span>
        </motion.div>
        <motion.div className="join" animate={{ scale: done ? 1.1 : 1 }}>{done ? <Check size={18} /> : '='}</motion.div>
        <motion.div className="src app" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <b>App</b><span>04:05 · S-14</span><span>1 muerta · 2 heridas</span>
        </motion.div>
      </div>
      <div className={'verdict ' + (done ? 'ok' : '')}>{done ? 'Alerta confirmada · se usa para entrenar el modelo' : 'Comparando hora y sector…'}</div>
    </div>
  )
}

export default function Overlay({ o, t }) {
  switch (o.type) {
    case 'form': return <Form t={t} />
    case 'queue': return <Queue o={o} t={t} />
    case 'sensor': return <Sensor t={t} />
    case 'herd': return <Herd o={o} t={t} />
    case 'map': return <MapCard o={o} />
    case 'panel': return <Panel t={t} />
    case 'merge': return <Merge t={t} />
    default: return null
  }
}
