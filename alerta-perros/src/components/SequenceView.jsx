import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { KINDS } from '../data/scenarios.js'
import { NODES } from '../data/nodes.js'

export default function SequenceView({ scenario, revealed, current, onOpen }) {
  const actors = useMemo(() => {
    const set = new Set()
    for (const p of scenario.allPackets) {
      set.add(p.src)
      set.add(p.fail != null ? p.path[p.fail + 1] : p.dst)
    }
    return [...set].sort((a, b) => NODES[a].x - NODES[b].x || NODES[a].y - NODES[b].y)
  }, [scenario])

  const W = 1000, left = 150, colW = (W - left - 90) / Math.max(1, actors.length - 1)
  const X = (id) => left + actors.indexOf(id) * colW
  const rowH = 54, top = 80
  const H = Math.max(360, top + (scenario.packetCount + 1) * rowH)
  const scroller = useRef(null)
  useEffect(() => { scroller.current?.scrollTo({ top: 1e5, behavior: 'smooth' }) }, [revealed.length])

  let lastStep = -1
  return (
    <div className="seq" ref={scroller}>
      <svg viewBox={`0 0 ${W} ${H}`} className="seq-svg">
        {actors.map((a) => (
          <g key={a}>
            <text x={X(a)} y="30" textAnchor="middle" className="seq-actor">{NODES[a].name}</text>
            <text x={X(a)} y="46" textAnchor="middle" className="seq-actor-sub">{NODES[a].sub}</text>
            <line x1={X(a)} x2={X(a)} y1="58" y2={H - 10} className="seq-life" />
          </g>
        ))}
        {revealed.map((p, i) => {
          const y = top + i * rowH + 20
          const x1 = X(p.src)
          const end = p.fail != null ? p.path[p.fail + 1] : p.dst
          let x2 = X(end)
          if (p.fail != null) x2 = x1 + (x2 - x1) * 0.55
          const color = KINDS[p.kind].color
          const dir = x2 >= x1 ? 1 : -1
          const newStep = p.step !== lastStep
          lastStep = p.step
          return (
            <g key={p.n} className={'seq-msg' + (current?.n === p.n ? ' cur' : '')} onClick={() => onOpen(p.n)}>
              {newStep && <text x="12" y={y - 26} className="seq-steplabel">PASO {p.step + 1} · {scenario.steps[p.step].title.toUpperCase()}</text>}
              <text x="12" y={y + 4} className="seq-time">{p.time.slice(0, 8)}</text>
              <motion.line x1={x1} y1={y} x2={x2} y2={y + 8} stroke={color} className="seq-arrow"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }} />
              <motion.path d={`M${x2} ${y + 8} l${-10 * dir} -6 M${x2} ${y + 8} l${-10 * dir} 4`} stroke={color} className="seq-head"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
              {p.fail != null && <text x={x2 + 6} y={y + 14} className="seq-x">✕</text>}
              <motion.text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" className="seq-label" fill={color}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
                {p.label} · {p.info}
              </motion.text>
            </g>
          )
        })}
        {revealed.length === 0 && <text x={W / 2} y={top + 40} textAnchor="middle" className="seq-empty">Pulsa REPRODUCIR: los mensajes aparecerán aquí en orden.</text>}
      </svg>
    </div>
  )
}
