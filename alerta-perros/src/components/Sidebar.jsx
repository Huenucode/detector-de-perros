import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { CATEGORIES, SCENARIOS } from '../data/scenarios.js'

export default function Sidebar({ scenarioId, stepIndex, done, t, duration, onSelect, onStep }) {
  const [cat, setCat] = useState('todos')
  const list = SCENARIOS.filter((s) => cat === 'todos' || s.cat === cat)
  const count = (c) => (c === 'todos' ? SCENARIOS.length : SCENARIOS.filter((s) => s.cat === c).length)

  return (
    <div className="side-inner">
      <h2 className="panel-title">ESCENARIOS</h2>
      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>
            {c.name.toUpperCase()} <span>{count(c.id)}</span>
            {cat === c.id && <motion.i layoutId="tab-ul" className="tab-ul" />}
          </button>
        ))}
      </div>
      <div className="scn-list">
        {list.map((s) => {
          const active = s.id === scenarioId
          const status = active ? (done ? 'done' : stepIndex >= 0 ? 'run' : 'idle') : 'idle'
          return (
            <motion.div key={s.id} layout className={'scn' + (active ? ' active' : '')}>
              <button className="scn-head" onClick={() => onSelect(s.id)}>
                <span className={'scn-dot ' + status} />
                <span className="scn-txt"><b>{s.title}</b><small>{s.subtitle}</small></span>
                {active ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <AnimatePresence initial={false}>
                {active && (
                  <motion.ol className="steps" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    {s.steps.map((st, i) => {
                      const state = done || i < stepIndex ? 'done' : i === stepIndex ? 'now' : 'todo'
                      return (
                        <li key={i} className={state} onClick={() => onStep(i)}>
                          <span className="num">
                            {state === 'done' ? <Check size={12} strokeWidth={3} /> : i + 1}
                            {state === 'now' && (
                              <svg className="ring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" pathLength="1" style={{ strokeDashoffset: 1 - Math.min(1, t / duration) }} /></svg>
                            )}
                          </span>
                          <span className="st-txt"><b>{st.title}</b><small>{st.subtitle}</small></span>
                        </li>
                      )
                    })}
                  </motion.ol>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
