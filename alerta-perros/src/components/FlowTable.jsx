import { memo, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Play, Pause, RotateCcw, RefreshCw } from 'lucide-react'
import { KINDS } from '../data/scenarios.js'
import { NODES } from '../data/nodes.js'

function FlowTable({ scenario, count, currentN, selected, onOpen, playing, done, started, speed, setSpeed, onPlay, onNext, onPrev, onReset }) {
  const rows = scenario.allPackets.slice(0, count)
  const body = useRef(null)
  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight, behavior: 'smooth' }) }, [count])

  return (
    <div className="flow-inner">
      <div className="flow-top">
        <h2 className="panel-title">FLUJO DE PAQUETES</h2>
        <div className="legend">
          {Object.entries(KINDS).map(([k, v]) => <span key={k}><i style={{ background: v.color }} />{v.name}</span>)}
        </div>
        <div className="spacer" />
        <div className="controls">
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Velocidad">
            <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option>
          </select>
          <button className="btn sq" onClick={onPrev} title="Paso anterior"><ChevronLeft size={15} /></button>
          <button className="btn primary" onClick={onPlay}>
            {done ? <><RefreshCw size={14} /> REPETIR</> : playing ? <><Pause size={14} /> PAUSA</> : <><Play size={14} /> REPRODUCIR</>}
          </button>
          <button className="btn" onClick={onNext} disabled={done}>PASO</button>
          <button className="btn" onClick={onReset}><RotateCcw size={14} /> REINICIAR</button>
        </div>
      </div>
      <div className="table">
        <div className="tr th">
          <span>N.º</span><span>HORA</span><span>ORIGEN</span><span>DESTINO</span><span>PROTOCOLO</span><span>INFO</span><span className="r">TAMAÑO</span>
        </div>
        <div className="tbody" ref={body}>
          {rows.length === 0 && <div className="empty">{started ? 'Todavía no hay paquetes en la red.' : 'Pulsa REPRODUCIR para ver cómo viajan los datos.'}</div>}
          <AnimatePresence initial={false}>
            {rows.map((p) => (
              <motion.div key={scenario.id + p.n} className={'tr' + (p.n === currentN ? ' cur' : '') + (p.n === selected ? ' sel' : '') + (p.fail != null ? ' fail' : '')}
                onClick={() => onOpen(p.n)} initial={{ opacity: 0, x: -14, backgroundColor: 'var(--flash)' }} animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }} transition={{ duration: 0.5 }}>
                <span><b className="n" style={{ background: KINDS[p.kind].color }}>{p.n}</b></span>
                <span>{p.time}</span>
                <span>{NODES[p.src].name}</span>
                <span>{p.fail != null ? '✕ ' + NODES[p.path[p.fail + 1]].name : NODES[p.dst].name}</span>
                <span>{p.proto}</span>
                <span className="info-cell">{p.label} · {p.info}</span>
                <span className="r">{p.size}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default memo(FlowTable)
