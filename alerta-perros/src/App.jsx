import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SCENARIOS, stepDuration } from './data/scenarios.js'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Canvas from './components/Canvas.jsx'
import SequenceView from './components/SequenceView.jsx'
import StepPanel from './components/StepPanel.jsx'
import FlowTable from './components/FlowTable.jsx'
import PacketDetail from './components/PacketDetail.jsx'
import ProposalDrawer from './components/ProposalDrawer.jsx'
import Intro from './components/Intro.jsx'

const initialTheme = () => {
  try {
    const saved = localStorage.getItem('tema')
    if (saved) return saved
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)
  const [stepIndex, setStepIndex] = useState(-1) // -1 = vista general, steps.length = resumen
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [view, setView] = useState('red')
  const [selected, setSelected] = useState(null) // número de paquete abierto en el inspector
  const [showSide, setShowSide] = useState(true)
  const [showFlow, setShowFlow] = useState(true)
  const [proposal, setProposal] = useState(false)
  const [intro, setIntro] = useState(true)
  const stageRef = useRef(null)

  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === scenarioId), [scenarioId])
  const step = scenario.steps[stepIndex]
  const done = stepIndex >= scenario.steps.length
  const duration = step ? stepDuration(step) : 0

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('tema', theme) } catch {}
  }, [theme])

  // ---------- motor de tiempo ----------
  const state = useRef({ stepIndex, t, playing, speed, scenario })
  state.current = { stepIndex, t, playing, speed, scenario }

  useEffect(() => {
    if (!playing) return
    let raf, last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const s = state.current
      const st = s.scenario.steps[s.stepIndex]
      if (!st) { setPlaying(false); return }
      const nt = s.t + dt * s.speed
      if (nt >= stepDuration(st)) {
        if (s.stepIndex < s.scenario.steps.length - 1) {
          setStepIndex(s.stepIndex + 1)
          setT(0)
        } else {
          setStepIndex(s.scenario.steps.length)
          setT(0)
          setPlaying(false)
          return
        }
      } else {
        setT(nt)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  // ---------- acciones ----------
  const selectScenario = useCallback((id) => {
    setScenarioId(id); setStepIndex(-1); setT(0); setPlaying(false); setSelected(null)
  }, [])
  const goStep = useCallback((i) => { setStepIndex(i); setT(0); setSelected(null) }, [])
  const play = useCallback(() => {
    setSelected(null)
    if (done || stepIndex < 0) { setStepIndex(0); setT(0) }
    setPlaying((p) => (done || stepIndex < 0 ? true : !p))
  }, [done, stepIndex])
  const next = useCallback(() => {
    setSelected(null)
    if (stepIndex < scenario.steps.length) { setStepIndex(stepIndex + 1); setT(0) }
    if (stepIndex + 1 >= scenario.steps.length) setPlaying(false)
  }, [stepIndex, scenario])
  const prev = useCallback(() => {
    setSelected(null)
    if (stepIndex > 0) { setStepIndex(Math.min(stepIndex, scenario.steps.length) - 1); setT(0) }
    else { setStepIndex(-1); setT(0); setPlaying(false) }
  }, [stepIndex, scenario])
  const reset = useCallback(() => { setStepIndex(-1); setT(0); setPlaying(false); setSelected(null) }, [])
  const fullscreen = useCallback(() => {
    const el = stageRef.current
    if (!document.fullscreenElement) el?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }, [])

  // atajos de teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return
      if (e.code === 'Space') { e.preventDefault(); play() }
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'r' || e.key === 'R') reset()
      else if (e.key === 'Escape') { setSelected(null); setProposal(false) }
      else if (e.key === 's' || e.key === 'S') setView((v) => (v === 'red' ? 'secuencia' : 'red'))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [play, next, prev, reset])

  // paquetes ya emitidos
  const revealed = useMemo(() => {
    return scenario.allPackets.filter((p) => p.step < stepIndex || (p.step === stepIndex && t >= p.at))
  }, [scenario, stepIndex, step ? Math.floor(t * 20) : 0])
  const revealedCount = revealed.length
  const current = step ? [...(step.packets ?? [])].reverse().find((p) => t >= p.at) : null
  const selectedPacket = selected ? scenario.allPackets.find((p) => p.n === selected) : null

  return (
    <div className={'app' + (showSide ? '' : ' no-side') + (showFlow ? '' : ' no-flow')}>
      <Header
        theme={theme} setTheme={setTheme} etapa={step?.etapa}
        showSide={showSide} setShowSide={setShowSide} showFlow={showFlow} setShowFlow={setShowFlow}
        onFullscreen={fullscreen} onProposal={() => setProposal(true)} onSelect={selectScenario}
      />

      <AnimatePresence initial={false}>
        {showSide && (
          <motion.aside className="side" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <Sidebar scenarioId={scenarioId} stepIndex={stepIndex} done={done} t={t} duration={duration} onSelect={selectScenario} onStep={goStep} />
          </motion.aside>
        )}
      </AnimatePresence>

      <section className="stage panel" ref={stageRef}>
        <div className="view-toggle">
          <button className={view === 'red' ? 'on' : ''} onClick={() => setView('red')}><IconLayers /> RED</button>
          <button className={view === 'secuencia' ? 'on' : ''} onClick={() => setView('secuencia')}><IconSeq /> SECUENCIA</button>
        </div>
        <AnimatePresence mode="wait">
          {selectedPacket ? (
            <motion.div key="detail" className="stage-inner" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              <PacketDetail packet={selectedPacket} total={scenario.packetCount} onClose={() => setSelected(null)}
                onPrev={() => setSelected(Math.max(1, selected - 1))} onNext={() => setSelected(Math.min(revealedCount || scenario.packetCount, selected + 1))} />
            </motion.div>
          ) : view === 'red' ? (
            <motion.div key="red" className="stage-inner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <Canvas scenario={scenario} stepIndex={stepIndex} t={t} overlayStep={step} />
            </motion.div>
          ) : (
            <motion.div key="seq" className="stage-inner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <SequenceView scenario={scenario} revealed={revealed} current={current} onOpen={setSelected} />
            </motion.div>
          )}
        </AnimatePresence>
        {stepIndex < 0 && !selectedPacket && view === 'red' && (
          <motion.button className="cta" onClick={play} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            ▶ REPRODUCIR ESCENARIO
          </motion.button>
        )}
      </section>

      <aside className="info panel">
        <StepPanel scenario={scenario} stepIndex={stepIndex} done={done} current={current} onHome={reset} onOpen={setSelected} />
      </aside>

      <AnimatePresence initial={false}>
        {showFlow && (
          <motion.section className="flow panel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.3 }}>
            <FlowTable
              scenario={scenario} count={revealedCount} currentN={current?.n} selected={selected} onOpen={setSelected}
              playing={playing} done={done} started={stepIndex >= 0} speed={speed} setSpeed={setSpeed}
              onPlay={play} onNext={next} onPrev={prev} onReset={reset}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <ProposalDrawer open={proposal} onClose={() => setProposal(false)} onScenario={(id) => { setProposal(false); selectScenario(id) }} />
      <AnimatePresence>{intro && <Intro onStart={() => { setIntro(false) }} onProposal={() => { setIntro(false); setProposal(true) }} />}</AnimatePresence>
    </div>
  )
}

const IconLayers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
)
const IconSeq = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 3v18M20 3v18M4 8h16l-3-3M20 16H4l3 3" /></svg>
)
