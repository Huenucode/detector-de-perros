import { motion } from 'framer-motion'
import { ArrowRight, FileText } from 'lucide-react'
import { Device } from './Devices.jsx'

const chain = [
  { type: 'sheep', label: 'Collar', state: { alarmed: true } },
  { type: 'gateway', label: 'Gateway LoRa' },
  { type: 'cloud', label: 'Plataforma' },
  { type: 'map', label: 'Mapa de riesgo' },
]

export default function Intro({ onStart, onProposal }) {
  return (
    <motion.div className="intro" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}>
      <div className="intro-grid" />
      <div className="intro-card">
        <motion.div className="kicker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>PROPUESTA PARA INIA REMEHUE · LOS LAGOS</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          ALERTA <em>RURAL</em> EXPLORER
        </motion.h1>
        <motion.p className="intro-sub" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          Registro, mapeo y alerta temprana de ataques de perros asilvestrados. Mira cómo viaja cada registro y cada alerta, paso a paso y byte a byte.
        </motion.p>

        <div className="intro-chain">
          {chain.map((c, i) => (
            <motion.div key={c.label} className="ic-node" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.18 }}>
              <svg viewBox="-80 -130 160 170"><Device type={c.type} busy state={c.state} /></svg>
              <span>{c.label}</span>
              {i < chain.length - 1 && (
                <svg className="ic-link" viewBox="0 0 60 10">
                  <line x1="0" y1="5" x2="60" y2="5" />
                  <motion.circle r="4" cy="5" initial={{ cx: 0 }} animate={{ cx: 60 }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.45, ease: 'easeInOut', repeatDelay: 0.4 }} />
                </svg>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div className="intro-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          <button className="btn primary lg" onClick={onStart}>EXPLORAR LA RED <ArrowRight size={16} /></button>
          <button className="btn lg" onClick={onProposal}><FileText size={16} /> LEER LA PROPUESTA</button>
        </motion.div>
        <motion.p className="intro-foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          7 escenarios · app de registro · collar LoRa · mapa y panel de análisis
        </motion.p>
      </div>
    </motion.div>
  )
}
