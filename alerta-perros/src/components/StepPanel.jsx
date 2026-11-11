import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { KINDS } from '../data/scenarios.js'
import { NODES } from '../data/nodes.js'

const Facts = ({ facts }) => (
  <dl className="facts">
    {facts.map(([k, v], i) => (
      <motion.div key={k} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
        <dt>{k}</dt><dd>{v}</dd>
      </motion.div>
    ))}
  </dl>
)

export default function StepPanel({ scenario, stepIndex, done, current, onHome, onOpen }) {
  const step = scenario.steps[stepIndex]
  let mode = 'overview', key = scenario.id + '-ov'
  if (done) { mode = 'summary'; key = scenario.id + '-sum' }
  else if (step) { mode = 'step'; key = scenario.id + '-' + stepIndex }

  return (
    <div className="info-inner">
      <div className="info-top">
        <h2 className="panel-title">{mode === 'overview' ? 'VISTA GENERAL' : mode === 'summary' ? 'RESUMEN' : 'PASO ACTUAL'}</h2>
        {mode !== 'overview' && <button className="mini" onClick={onHome}><ChevronLeft size={13} /> INICIO</button>}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={key} className="info-body" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          {mode === 'overview' && (
            <>
              <div className="ov-title"><h3>{scenario.title}</h3><span className="pill-ok">● LISTO</span></div>
              <p className="lead">{scenario.subtitle}</p>
              <p className="desc">{scenario.overview.desc}</p>
              <Facts facts={scenario.overview.facts} />
            </>
          )}
          {mode === 'step' && (
            <>
              <div className="kicker">PASO {stepIndex + 1} DE {scenario.steps.length}</div>
              <h3>{step.title}</h3>
              <p className="lead">{step.subtitle}</p>
              <p className="desc">{step.desc}</p>
              <AnimatePresence mode="wait">
                {current && (
                  <motion.button key={current.n} className="pkt-card" style={{ '--k': KINDS[current.kind].color }} onClick={() => onOpen(current.n)}
                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <div className="pc-row"><span className="pc-badge">{current.label}</span><span className="pc-route">{NODES[current.src].name.toUpperCase()} → {NODES[current.dst].name.toUpperCase()}</span></div>
                    <div className="pc-info">{current.info}</div>
                    <div className="pc-meta">PAQUETE {current.n} DE {scenario.packetCount} · {current.proto} · {current.size} <i>ver bytes ›</i></div>
                  </motion.button>
                )}
              </AnimatePresence>
              {step.facts && <Facts facts={step.facts} />}
            </>
          )}
          {mode === 'summary' && (
            <>
              <div className="kicker ok">ESCENARIO COMPLETADO</div>
              <h3>{scenario.summary.title}</h3>
              <p className="lead">{scenario.summary.subtitle}</p>
              <p className="desc">{scenario.summary.desc}</p>
              <Facts facts={scenario.summary.facts} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
