import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, animate } from 'framer-motion'
import { X, AlertTriangle, Smartphone, Map as MapIcon, BarChart3, Radio, ShieldAlert, Globe2, CalendarRange, Handshake, HelpCircle, ArrowRight } from 'lucide-react'
import { PROPOSAL as D } from '../data/proposal.js'

function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.4, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, to])
  return <span ref={ref}>{v}{suffix}</span>
}

const Reveal = ({ children, delay = 0, className }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>
)

const Sec = ({ icon: Icon, n, title, children }) => (
  <section className="pd-sec">
    <Reveal><h3><span className="pd-n">{n}</span><Icon size={18} /> {title}</h3></Reveal>
    {children}
  </section>
)

export default function ProposalDrawer({ open, onClose, onScenario }) {
  const maxW = Math.max(...D.piloto.map((p) => p.weeks[1]))
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="pd-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="pd" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
            <div className="pd-head">
              <div>
                <div className="kicker">{D.partner.toUpperCase()}</div>
                <h2>{D.title}</h2>
              </div>
              <button className="btn sq" onClick={onClose}><X size={16} /></button>
            </div>
            <div className="pd-scroll">
              <Sec icon={AlertTriangle} n="01" title="El problema">
                <Reveal><p className="pd-lead">{D.problema.lead}</p></Reveal>
                <div className="pd-stats">
                  {D.problema.stats.map((s, i) => (
                    <Reveal key={s.label} delay={i * 0.08} className="pd-stat">
                      <b><Counter to={s.n} /></b><span>{s.label}</span><small>{s.place}</small>
                    </Reveal>
                  ))}
                </div>
                {D.problema.items.map((it, i) => (
                  <Reveal key={it.k} delay={i * 0.06} className="pd-item"><b>{it.k}.</b> {it.v}</Reveal>
                ))}
              </Sec>

              <Sec icon={Smartphone} n="02" title="La propuesta">
                <Reveal><p className="pd-lead">Construir junto a INIA Remehue una plataforma donde productores y veterinarios registren ataques y avistamientos desde el celular, y que convierta esos registros en mapas de riesgo para la provincia.</p></Reveal>
                <div className="pd-cards">
                  {D.componentes.map((c, i) => {
                    const Icon = [Smartphone, MapIcon, BarChart3][i]
                    const target = ['registro', 'mapa', 'panel'][i]
                    return (
                      <Reveal key={c.name} delay={i * 0.08} className="pd-card">
                        <Icon size={20} />
                        <b>{c.name}</b>
                        <p>{c.what}</p>
                        <small>Para: {c.who}</small>
                        <button className="link-btn" onClick={() => onScenario(target)}>Ver escenario <ArrowRight size={13} /></button>
                      </Reveal>
                    )
                  })}
                </div>
              </Sec>

              <Sec icon={Radio} n="03" title="Línea 2: collar de alerta temprana">
                <Reveal><p className="pd-lead">En paralelo a la app, investigar un collar de bajo costo que detecte el ataque en sus primeros minutos y avise al productor. Es una línea de I+D: hoy no existe un producto comercial maduro, y eso es tanto la oportunidad como el riesgo.</p></Reveal>
                <div className="pd-grid2">
                  {D.collar.map((it, i) => (
                    <Reveal key={it.k} delay={i * 0.06} className="pd-box"><b>{it.k}</b><p>{it.v}</p></Reveal>
                  ))}
                </div>
                <Reveal><button className="link-btn" onClick={() => onScenario('collar-ataque')}>Ver el collar en acción <ArrowRight size={13} /></button></Reveal>
              </Sec>

              <Sec icon={ShieldAlert} n="04" title="Riesgos y cómo se abordan">
                <div className="pd-risks">
                  {D.riesgos.map((r, i) => (
                    <Reveal key={r.r} delay={i * 0.07} className="pd-risk"><span>{r.r}</span><ArrowRight size={14} /><span>{r.a}</span></Reveal>
                  ))}
                </div>
              </Sec>

              <Sec icon={Globe2} n="05" title="Qué enseña la experiencia de otros países">
                <Reveal><p className="pd-lead">Australia usa este modelo a escala nacional con FeralScan, y sus resultados dejan tres lecciones de diseño.</p></Reveal>
                <Reveal className="pd-decay">
                  <div className="dc-bar"><motion.i initial={{ height: 0 }} whileInView={{ height: '76%' }} viewport={{ once: true }} transition={{ duration: 0.9 }} /><b>38 %</b><small>año 1</small></div>
                  <div className="dc-bar"><motion.i initial={{ height: 0 }} whileInView={{ height: '22%' }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3 }} /><b>11 %</b><small>año 2</small></div>
                  <p>Predios que reportaban en Australia Meridional.</p>
                </Reveal>
                {D.lecciones.map((l, i) => (
                  <Reveal key={l.k} delay={i * 0.06} className="pd-item"><b>{l.k}.</b> {l.v}</Reveal>
                ))}
              </Sec>

              <Sec icon={CalendarRange} n="06" title="Piloto propuesto (≈ 4 meses)">
                <div className="pd-timeline">
                  {D.piloto.map((p, i) => (
                    <Reveal key={p.n} delay={i * 0.1} className="pd-phase">
                      <span className="ph-n">{p.n}</span>
                      <div className="ph-body">
                        <b>{p.name}</b> <small>{p.dur}</small>
                        <div className="ph-bar"><motion.i initial={{ width: 0 }} whileInView={{ width: `${(p.weeks[1] / maxW) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }} /></div>
                        <p>{p.v}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <Reveal><p className="pd-note">Los plazos son tentativos y se ajustan con INIA.</p></Reveal>
              </Sec>

              <Sec icon={Handshake} n="07" title="Qué aporta cada parte">
                <div className="pd-grid2">
                  <Reveal className="pd-box"><b>INIA Remehue</b><ul>{D.aportes.inia.map((x) => <li key={x}>{x}</li>)}</ul></Reveal>
                  <Reveal delay={0.08} className="pd-box"><b>Equipo de desarrollo</b><ul>{D.aportes.equipo.map((x) => <li key={x}>{x}</li>)}</ul></Reveal>
                </div>
              </Sec>

              <Sec icon={HelpCircle} n="08" title="Preguntas para definir juntos">
                <ol className="pd-q">
                  {D.preguntas.map((q, i) => (
                    <motion.li key={q} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>{q}</motion.li>
                  ))}
                </ol>
              </Sec>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
