import { memo, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, PanelLeft, PanelBottom, Maximize, Keyboard, Sun, Moon, FileText } from 'lucide-react'
import { ETAPAS, SCENARIOS } from '../data/scenarios.js'
import { LogoMark } from './Devices.jsx'

function Header({ theme, setTheme, etapa, showSide, setShowSide, showFlow, setShowFlow, onFullscreen, onProposal, onSelect }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [keys, setKeys] = useState(false)
  const input = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.current?.focus(); setOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = SCENARIOS.filter((s) => (s.title + ' ' + s.subtitle + ' ' + s.overview.desc).toLowerCase().includes(q.toLowerCase()))

  return (
    <header className="top">
      <div className="brand">
        <span className="brackets"><LogoMark /></span>
        <div>
          <div className="brand-title">ALERTA <em>RURAL</em> EXPLORER</div>
          <div className="brand-sub">REGISTRO, MAPEO Y ALERTA TEMPRANA</div>
        </div>
      </div>

      <div className="etapas">
        <div className="et-label"><span>ETAPA</span><b>{etapa != null ? ETAPAS[etapa].toUpperCase() : '—'}</b></div>
        <div className="et-boxes">
          {ETAPAS.map((e, i) => (
            <span key={e} title={e} className={etapa === i ? 'on' : ''}>
              {i + 1}
              {etapa === i && <motion.i layoutId="etapa-hl" className="et-hl" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            </span>
          ))}
        </div>
      </div>

      <div className="spacer" />

      <div className="search">
        <Search size={15} />
        <input ref={input} value={q} placeholder="Buscar escenarios" onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} />
        <kbd>Ctrl K</kbd>
        <AnimatePresence>
          {open && (
            <motion.ul className="search-pop" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              {results.length === 0 && <li className="none">Sin resultados</li>}
              {results.map((s) => (
                <li key={s.id} onMouseDown={() => { onSelect(s.id); setQ(''); setOpen(false) }}>
                  <b>{s.title}</b><span>{s.subtitle}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="tools">
        <button className={'ico' + (showSide ? ' on' : '')} title="Mostrar escenarios" onClick={() => setShowSide(!showSide)}><PanelLeft size={16} /></button>
        <button className={'ico' + (showFlow ? ' on' : '')} title="Mostrar flujo de paquetes" onClick={() => setShowFlow(!showFlow)}><PanelBottom size={16} /></button>
        <button className="ico" title="Pantalla completa" onClick={onFullscreen}><Maximize size={16} /></button>
        <div className="keys-wrap">
          <button className="ico" title="Atajos de teclado" onClick={() => setKeys(!keys)}><Keyboard size={16} /></button>
          <AnimatePresence>
            {keys && (
              <motion.div className="keys-pop" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} onMouseLeave={() => setKeys(false)}>
                <div><kbd>Espacio</kbd> reproducir / pausa</div>
                <div><kbd>→</kbd> paso siguiente</div>
                <div><kbd>←</kbd> paso anterior</div>
                <div><kbd>R</kbd> reiniciar</div>
                <div><kbd>S</kbd> red / secuencia</div>
                <div><kbd>Ctrl K</kbd> buscar</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button className="doc-btn" onClick={onProposal}><FileText size={15} /> PROPUESTA</button>

      <div className="theme">
        <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')} title="Modo claro"><Sun size={15} /></button>
        <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')} title="Modo oscuro"><Moon size={15} /></button>
      </div>
    </header>
  )
}

export default memo(Header)
