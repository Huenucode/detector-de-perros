import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { KINDS } from '../data/scenarios.js'
import { NODES } from '../data/nodes.js'
import { LAYER_COLORS } from '../lib/payload.js'

const hex = (n) => n.toString(16).padStart(2, '0')
const ascii = (n) => (n >= 32 && n < 127 ? String.fromCharCode(n) : '.')

function Bytes({ bytes, fields, hover, setHover }) {
  const rows = []
  for (let i = 0; i < bytes.length; i += 8) rows.push(i)
  const fieldAt = (i) => fields.findIndex((f) => i >= f.range[0] && i <= f.range[1])
  return (
    <div className="hexdump">
      {rows.map((r) => (
        <div key={r} className="hx-row">
          <span className="hx-off">{hex(r).padStart(4, '0')}</span>
          <span className="hx-bytes">
            {bytes.slice(r, r + 8).map((b, j) => {
              const i = r + j
              const fi = fieldAt(i)
              const f = fields[fi]
              return (
                <motion.span key={i} className={'hx-b' + (hover === fi ? ' hl' : '')} style={{ '--lc': LAYER_COLORS[f.layer] }}
                  onMouseEnter={() => setHover(fi)} onMouseLeave={() => setHover(null)}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
                  {hex(b)}
                </motion.span>
              )
            })}
          </span>
          <span className="hx-ascii">{bytes.slice(r, r + 8).map(ascii).join('')}</span>
        </div>
      ))}
    </div>
  )
}

function Json({ json, fields, hover, setHover }) {
  const lines = JSON.stringify(json, null, 2).split('\n')
  const keyOf = (line) => (line.match(/^\s{2}"([^"]+)":/) || [])[1]
  let currentTop = null
  return (
    <pre className="jsonview">
      {lines.map((ln, i) => {
        const k = keyOf(ln)
        if (k) currentTop = k
        else if (/^[{}]/.test(ln)) currentTop = null
        const fi = fields.findIndex((f) => f.key && f.key === currentTop)
        return (
          <motion.div key={i} className={'js-line' + (fi >= 0 && hover === fi ? ' hl' : '')}
            onMouseEnter={() => fi >= 0 && setHover(fi)} onMouseLeave={() => setHover(null)}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            {ln}
          </motion.div>
        )
      })}
    </pre>
  )
}

export default function PacketDetail({ packet: p, total, onClose, onPrev, onNext }) {
  const [hover, setHover] = useState(null)
  const d = p.detail
  const color = KINDS[p.kind].color
  const totalSize = d.layers.reduce((a, l) => a + l.size, 0)
  const sizeLabel = (l) => (!d.bytes && l.id === 'app' ? p.size : l.size + ' B')
  const byLayer = d.layers.map((l) => ({ ...l, fields: d.fields.map((f, i) => ({ ...f, i })).filter((f) => f.layer === l.id) }))

  return (
    <div className="detail">
      <div className="dt-head">
        <b className="n big" style={{ background: color }}>{p.n}</b>
        <div>
          <div className="dt-title">{p.label}</div>
          <div className="dt-sub">{p.time} · {NODES[p.src].name} → {NODES[p.dst].name} · {p.proto} · {p.size}</div>
        </div>
        <div className="spacer" />
        <button className="btn sq" onClick={onPrev} disabled={p.n <= 1}><ChevronLeft size={15} /></button>
        <button className="btn sq" onClick={onNext} disabled={p.n >= total}><ChevronRight size={15} /></button>
        <button className="btn sq" onClick={onClose} title="Cerrar"><X size={15} /></button>
      </div>
      <div className="dt-seen">{p.seen}</div>
      <div className="layerbar">
        {d.layers.map((l, i) => (
          <motion.div key={l.id} className="lb" style={{ flexGrow: Math.max(l.size / totalSize, 0.08), '--lc': LAYER_COLORS[l.id] }}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.08, duration: 0.5 }}>
            <i />
            <span>{l.name}</span>
            <small>{sizeLabel(l)}</small>
          </motion.div>
        ))}
      </div>
      <div className="dt-body">
        <div className="dt-fields">
          {byLayer.filter((l) => l.fields.length).map((l) => (
            <div key={l.id} className="dt-layer">
              <div className="dt-lname" style={{ '--lc': LAYER_COLORS[l.id] }}>{l.name} · {sizeLabel(l)}</div>
              {l.fields.map((f) => (
                <div key={f.i} className={'dt-field' + (hover === f.i ? ' hl' : '')} onMouseEnter={() => setHover(f.i)} onMouseLeave={() => setHover(null)}>
                  <span className="fk">{f.name}</span>
                  <span className="fv">{f.value} {f.ex && <span className="ex">EJ.</span>}<small>{f.note}</small></span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="dt-raw">
          <div className="raw-title">{d.bytes ? <>BYTES <small>{d.bytes.length} en esta trama</small></> : <>CONTENIDO <small>antes de cifrar</small></>}</div>
          {d.bytes ? <Bytes bytes={d.bytes} fields={d.fields} hover={hover} setHover={setHover} /> : <Json json={d.json} fields={d.fields} hover={hover} setHover={setHover} />}
        </div>
      </div>
      <div className="dt-foot"><span className="ex">EJ.</span> valor de ejemplo · {d.note}</div>
    </div>
  )
}
