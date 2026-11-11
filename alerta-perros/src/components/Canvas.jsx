import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NODES, anchor } from '../data/nodes.js'
import { KINDS, HOP } from '../data/scenarios.js'
import { Device } from './Devices.jsx'
import Overlay from './Overlay.jsx'

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function linksOf(scenario) {
  const map = new Map()
  for (const p of scenario.allPackets) {
    for (let i = 0; i < p.path.length - 1; i++) {
      const a = p.path[i], b = p.path[i + 1]
      const key = [a, b].sort().join('|')
      if (!map.has(key)) map.set(key, [a, b])
    }
  }
  return [...map.values()]
}

/** Estado de cada paquete en vuelo en el tiempo t del paso actual */
export function flights(step, t) {
  const out = []
  for (const p of step?.packets ?? []) {
    const local = t - p.at
    if (local < 0) continue
    const hops = p.path.length - 1
    const travel = p.fail != null ? (p.fail + 0.55) * HOP : hops * HOP
    const linger = p.fail != null ? 1.8 : 0.7
    if (local > travel + linger) continue
    let pos, hop, frac
    if (local >= travel) {
      hop = p.fail != null ? p.fail : hops - 1
      frac = p.fail != null ? 0.55 : 1
    } else {
      hop = Math.min(Math.floor(local / HOP), hops - 1)
      frac = ease((local - hop * HOP) / HOP)
      if (p.fail != null && hop === p.fail) frac = Math.min(frac, 0.55)
    }
    const A = anchor(p.path[hop]), B = anchor(p.path[hop + 1])
    pos = { x: A.x + (B.x - A.x) * frac, y: A.y + (B.y - A.y) * frac }
    const fading = local > travel ? 1 - (local - travel) / linger : 1
    const arriving = local < travel
    out.push({ p, pos, hop, from: p.path[hop], to: p.path[hop + 1], fading, arriving, failed: p.fail != null && local >= travel - 0.05 })
  }
  return out
}

function Packet({ f }) {
  const { p, pos, fading, failed } = f
  const color = KINDS[p.kind].color
  const lw = Math.max(70, p.label.length * 8.4 + 18)
  const iw = Math.max(lw, p.info.length * 6.6 + 14)
  return (
    <g transform={`translate(${pos.x},${pos.y})`} style={{ opacity: fading }} className="packet">
      <circle r="13" fill={color} className="packet-halo" />
      <circle r="6.5" fill={color} className="packet-dot" />
      {failed && (
        <g className="packet-fail">
          <circle r="12" />
          <path d="M-5 -5 L5 5 M5 -5 L-5 5" />
        </g>
      )}
      <g transform="translate(-30,-62)">
        <line x1="30" y1="62" x2="30" y2="40" className="packet-stem" stroke={color} />
        <rect width={lw} height="20" rx="2" fill={color} />
        <text x="9" y="14" className="packet-label">{p.label}</text>
        <rect y="20" width={iw} height="20" rx="2" className="packet-info-bg" stroke={color} />
        <text x="8" y="34" className="packet-info">{p.info}</text>
      </g>
    </g>
  )
}

const TONES = { ok: '#16a34a', warn: '#d97706', bad: '#dc2626' }

function Badge({ x, y, text, tone }) {
  const w = text.length * 7.6 + 18
  return (
    <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <g transform={`translate(${x - w / 2},${y})`}>
        <rect width={w} height="22" rx="11" fill={TONES[tone]} className="badge-rect" />
        <text x={w / 2} y="15" textAnchor="middle" className="badge-text">{text}</text>
      </g>
    </motion.g>
  )
}

function Canvas({ scenario, stepIndex, t, overlayStep }) {
  const step = scenario.steps[stepIndex]
  const inStep = !!step
  const visible = inStep ? step.show : scenario.nodes
  const links = useMemo(() => linksOf(scenario), [scenario])
  const fl = inStep ? flights(step, t) : []

  const busy = new Set()
  const activeLinks = []
  for (const f of fl) {
    if (f.arriving) {
      busy.add(f.from); busy.add(f.to)
      activeLinks.push({ a: f.from, b: f.to, color: KINDS[f.p.kind].color, key: f.p.n + '-' + f.hop })
    }
  }

  // tamaño del contenedor (en pantallas angostas la tarjeta va abajo)
  const wrap = useRef(null)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 700))
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [])

  // cámara
  const cam = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const id of visible) {
      const n = NODES[id]
      minX = Math.min(minX, n.x - 110); maxX = Math.max(maxX, n.x + 110)
      minY = Math.min(minY, n.y + n.ay - 140); maxY = Math.max(maxY, n.y + 70)
    }
    if (overlayStep?.overlay) {
      if (narrow) maxY += Math.max(maxY - minY, 380) * 1.15
      else maxX += Math.min((maxX - minX) * 0.55 + 120, 400)
    }
    let w = maxX - minX, h = maxY - minY
    const minW = 620, minH = 380
    if (w < minW) { minX -= (minW - w) / 2; w = minW }
    if (h < minH) { minY -= (minH - h) / 2; h = minH }
    return `${minX.toFixed(0)} ${minY.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}`
  }, [visible.join(','), !!overlayStep?.overlay, narrow])

  const nodeState = (id) => {
    const n = NODES[id]
    if (n.type === 'sheep') return { alarmed: inStep && step.alarmed?.includes(id) }
    if (n.type === 'siren') return { on: inStep && step.sirenOn != null && t >= step.sirenOn }
    if (n.type === 'tower') return { down: inStep && step.badges?.torre?.tone === 'bad' }
    return {}
  }

  return (
    <div className="canvas-wrap" ref={wrap}>
      <motion.svg className="canvas" initial={false} animate={{ viewBox: cam }} transition={{ duration: 1.15, ease: [0.65, 0, 0.35, 1] }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="isogrid" width="69.282" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 0 L69.282 40 M0 40 L69.282 0" className="grid-line" />
          </pattern>
          <radialGradient id="heat3"><stop offset="0" stopColor="#ef4444" /><stop offset=".55" stopColor="#f59e0b" stopOpacity=".8" /><stop offset="1" stopColor="#f59e0b" stopOpacity="0" /></radialGradient>
          <radialGradient id="heat2"><stop offset="0" stopColor="#f59e0b" /><stop offset="1" stopColor="#facc15" stopOpacity="0" /></radialGradient>
          <radialGradient id="heat1"><stop offset="0" stopColor="#22c55e" /><stop offset="1" stopColor="#22c55e" stopOpacity="0" /></radialGradient>
        </defs>
        <rect x="-3000" y="-3000" width="8000" height="8000" fill="url(#isogrid)" />

        {/* enlaces */}
        <g>
          {links.filter(([a, b]) => visible.includes(a) && visible.includes(b)).map(([a, b]) => {
            const A = anchor(a), B = anchor(b)
            return (
              <motion.line key={a + b} x1={A.x} y1={A.y} x2={B.x} y2={B.y} className="link"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} />
            )
          })}
          {activeLinks.map((l) => {
            const A = anchor(l.a), B = anchor(l.b)
            return <line key={l.key} x1={A.x} y1={A.y} x2={B.x} y2={B.y} className="link-active" stroke={l.color} />
          })}
        </g>

        {/* nodos (ordenados por profundidad) */}
        <AnimatePresence>
          {[...visible].sort((a, b) => NODES[a].y - NODES[b].y).map((id) => {
            const n = NODES[id]
            const badge = inStep ? step.badges?.[id] : null
            const showBadge = badge && (badge.after == null || t >= badge.after)
            return (
              <g key={id} transform={`translate(${n.x},${n.y})`}>
                <motion.g initial={{ opacity: 0, y: -26, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}>
                  <Device type={n.type} busy={busy.has(id)} state={nodeState(id)} />
                  <g className="node-label" transform={`translate(0, ${n.type === 'sheep' ? 26 : 44})`}>
                    <text className="nl-name" textAnchor="middle">{n.name}</text>
                    {n.sub && <text className="nl-sub" y="16" textAnchor="middle">{n.sub}</text>}
                  </g>
                  <AnimatePresence>{showBadge && <Badge key={badge.text} x={0} y={n.ay - 108} text={badge.text} tone={badge.tone} />}</AnimatePresence>
                </motion.g>
              </g>
            )
          })}
        </AnimatePresence>

        {/* paquetes */}
        {fl.map((f) => <Packet key={f.p.n} f={f} />)}
      </motion.svg>

      <AnimatePresence mode="wait">
        {overlayStep?.overlay && (
          <motion.div key={stepIndex + '-' + overlayStep.overlay.type} className="overlay-slot"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <Overlay o={overlayStep.overlay} t={t} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(Canvas)
