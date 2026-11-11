// Dibujos isométricos de línea (estilo plano técnico) para cada tipo de nodo.
const C = 0.8660254
const S = 0.5
export const iso = (x, y, z = 0) => [(x - y) * C, (x + y) * S - z]
const P = (list) => list.map((p) => iso(...p).map((n) => n.toFixed(1)).join(',')).join(' ')

function boxFaces({ w, d, h, x0 = 0, y0 = 0, z0 = 0 }) {
  const a = x0 - w / 2, b = x0 + w / 2, c = y0 - d / 2, e = y0 + d / 2, z1 = z0 + h
  return {
    top: P([[a, c, z1], [b, c, z1], [b, e, z1], [a, e, z1]]),
    left: P([[a, e, z0], [b, e, z0], [b, e, z1], [a, e, z1]]),
    right: P([[b, e, z0], [b, c, z0], [b, c, z1], [b, e, z1]]),
  }
}

function Box(props) {
  const f = boxFaces(props)
  return (
    <g className="iso-box">
      <polygon className="f-left" points={f.left} />
      <polygon className="f-right" points={f.right} />
      <polygon className="f-top" points={f.top} />
    </g>
  )
}

// cuadrilátero sobre la cara izquierda (y = +d/2) de una caja
const onLeft = (bx, u0, v0, u1, v1) => {
  const { w, d, x0 = 0, y0 = 0, z0 = 0 } = bx
  const X = (u) => x0 - w / 2 + u
  const Y = y0 + d / 2
  return P([[X(u0), Y, z0 + v0], [X(u1), Y, z0 + v0], [X(u1), Y, z0 + v1], [X(u0), Y, z0 + v1]])
}
const ptLeft = (bx, u, v) => {
  const { w, d, x0 = 0, y0 = 0, z0 = 0 } = bx
  return iso(x0 - w / 2 + u, y0 + d / 2, z0 + v)
}
const onRight = (bx, u0, v0, u1, v1) => {
  const { w, d, x0 = 0, y0 = 0, z0 = 0 } = bx
  const X = x0 + w / 2
  const Y = (u) => y0 + d / 2 - u
  return P([[X, Y(u0), z0 + v0], [X, Y(u1), z0 + v0], [X, Y(u1), z0 + v1], [X, Y(u0), z0 + v1]])
}

const Shadow = ({ w, d }) => (
  <polygon className="iso-shadow" points={P([[-w / 2 + 8, -d / 2 + 8, 0], [w / 2 + 14, -d / 2 + 8, 0], [w / 2 + 14, d / 2 + 14, 0], [-w / 2 + 8, d / 2 + 14, 0]])} />
)

const Waves = ({ x, y, on, flip }) => (
  <g className={'waves' + (on ? ' on' : '')} transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`}>
    <path d="M8 -8 A11 11 0 0 1 8 8" />
    <path d="M14 -14 A19 19 0 0 1 14 14" />
    <path d="M20 -20 A28 28 0 0 1 20 20" />
  </g>
)

// ---------------- dispositivos ----------------
function Phone({ alert, busy }) {
  const bx = { w: 36, d: 7, h: 66 }
  return (
    <g>
      <Shadow w={36} d={10} />
      <Box {...bx} />
      <polygon className="f-screen" points={onLeft(bx, 3, 5, 33, 61)} />
      <polygon className="f-ink" points={onLeft(bx, 3, 55, 33, 61)} />
      {alert ? (
        <>
          {(() => {
            const [cx, cy] = ptLeft(bx, 18, 36)
            return (
              <g transform={`translate(${cx},${cy}) skewY(30)`}>
                <path className={'bell' + (busy ? ' ring' : '')} d="M-7 4 Q-7 -8 0 -9 Q7 -8 7 4 L9 6 L-9 6 Z" />
                <circle cx="0" cy="8.5" r="2" className="f-inkfill" />
                <circle cx="7" cy="-7" r="3" className="dot-alert" />
              </g>
            )
          })()}
          <polygon className="f-line" points={onLeft(bx, 7, 16, 29, 18)} />
          <polygon className="f-line" points={onLeft(bx, 7, 11, 22, 13)} />
        </>
      ) : (
        <>
          {[47, 41, 35, 29, 23].map((v) => (
            <polygon key={v} className="f-line" points={onLeft(bx, 7, v, v % 2 ? 27 : 23, v + 2.4)} />
          ))}
          <polygon className="f-accent" points={onLeft(bx, 9, 9, 27, 15)} />
        </>
      )}
      <polygon className="f-ink" points={onRight(bx, 1, 50, 6, 52)} />
      <Waves x={14} y={-80} on={busy} />
    </g>
  )
}

function Tower({ busy, down }) {
  return (
    <g>
      <polygon className="iso-shadow" points={P([[-20, -20, 0], [26, -20, 0], [26, 26, 0], [-20, 26, 0]])} />
      <polygon className="f-top" points={P([[-16, -16, 0], [16, -16, 0], [16, 16, 0], [-16, 16, 0]])} />
      <g className="lattice">
        <path d="M-24 4 L-5 -112 M24 4 L5 -112 M0 12 L0 -112" />
        <path d="M-22 -8 L18 -30 M20 -8 L-18 -30 M-18 -30 L15 -52 M16 -30 L-14 -52 M-14 -52 L11 -74 M12 -52 L-11 -74 M-11 -74 L8 -96 M9 -74 L-8 -96" />
      </g>
      <rect className="f-panel" x="-14" y="-118" width="7" height="22" rx="1.5" />
      <rect className="f-panel" x="7" y="-118" width="7" height="22" rx="1.5" />
      <rect className="f-panel" x="-3.5" y="-124" width="7" height="22" rx="1.5" />
      <Waves x={16} y={-110} on={busy && !down} />
      <Waves x={-16} y={-110} on={busy && !down} flip />
      {down && (
        <g transform="translate(24,-104)">
          <g className="nosignal">
            <circle r="11" />
            <path d="M-5 -5 L5 5 M5 -5 L-5 5" />
          </g>
        </g>
      )}
    </g>
  )
}

function Cloud({ busy }) {
  return (
    <g className={busy ? 'cloud busy' : 'cloud'}>
      <ellipse className="iso-shadow" cx="10" cy="22" rx="70" ry="16" />
      <path className="f-top" d="M-58 14 C-80 14 -82 -18 -58 -20 C-60 -48 -22 -56 -10 -38 C0 -66 48 -62 50 -30 C76 -34 84 2 62 12 C60 18 52 20 46 20 L-50 20 C-54 20 -57 17 -58 14 Z" />
      <g transform="translate(2,-12)" className="globe">
        <circle r="17" />
        <ellipse rx="7" ry="17" />
        <path d="M-17 0 H17 M-14 -9 H14 M-14 9 H14" />
      </g>
    </g>
  )
}

function Server({ busy }) {
  const bx = { w: 66, d: 58, h: 92 }
  return (
    <g>
      <Shadow w={66} d={58} />
      <Box {...bx} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <polygon className="f-slot" points={onLeft(bx, 6, 10 + i * 16, 60, 20 + i * 16)} />
          {(() => {
            const [cx, cy] = ptLeft(bx, 53, 15 + i * 16)
            return <circle cx={cx} cy={cy} r="2.2" className={'led' + (busy ? ' blink' : '')} style={{ animationDelay: `${i * 0.13}s` }} />
          })()}
          {(() => {
            const [cx, cy] = ptLeft(bx, 46, 15 + i * 16)
            return <circle cx={cx} cy={cy} r="2.2" className="led2" />
          })()}
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <polygon key={'v' + i} className="f-line" points={onRight(bx, 8, 14 + i * 9, 50, 15.5 + i * 9)} />
      ))}
    </g>
  )
}

function Monitor({ kind, busy }) {
  const stand = { w: 12, d: 12, h: 24 }
  const foot = { w: 40, d: 26, h: 3 }
  const scr = { w: 104, d: 7, h: 68, z0: 24 }
  return (
    <g>
      <Shadow w={104} d={30} />
      <Box {...foot} />
      <Box {...stand} />
      <Box {...scr} />
      <polygon className="f-screen" points={onLeft(scr, 4, 4, 100, 64)} />
      {kind === 'map' ? (
        <g>
          {[[36, 34, 15, 'h3'], [60, 26, 10, 'h2'], [24, 48, 9, 'h1'], [80, 46, 8, 'h1'], [52, 46, 7, 'h2']].map(([u, v, r, c], i) => {
            const [cx, cy] = ptLeft(scr, u, v)
            return <ellipse key={i} cx={cx} cy={cy} rx={r * 1.05} ry={r * 0.95} className={'heat ' + c + (busy && i === 0 ? ' pulse' : '')} />
          })}
          <polygon className="f-gridline" points={onLeft(scr, 34, 4, 35, 64)} />
          <polygon className="f-gridline" points={onLeft(scr, 68, 4, 69, 64)} />
          <polygon className="f-gridline" points={onLeft(scr, 4, 24, 100, 25)} />
          <polygon className="f-gridline" points={onLeft(scr, 4, 44, 100, 45)} />
        </g>
      ) : (
        <g>
          {[[52, 22], [62, 34], [72, 28], [82, 44], [92, 38]].map(([u, h], i) => (
            <polygon key={i} className={'f-bar' + (busy ? ' grow' : '')} points={onLeft(scr, u - 3, 10, u + 3, 10 + h * 0.9)} style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
          {(() => {
            const [cx, cy] = ptLeft(scr, 24, 40)
            return (
              <g transform={`translate(${cx},${cy}) skewY(30)`}>
                <circle r="13" className="pie-bg" />
                <path d="M0 0 L0 -13 A13 13 0 0 1 12.4 4 Z" className="pie" />
              </g>
            )
          })()}
          <polygon className="f-line" points={onLeft(scr, 10, 14, 38, 16)} />
          <polygon className="f-line" points={onLeft(scr, 10, 9, 30, 11)} />
        </g>
      )}
    </g>
  )
}

function Gateway({ busy }) {
  const bx = { w: 52, d: 38, h: 32 }
  const [ax, ay] = iso(10, -6, 32)
  return (
    <g>
      <Shadow w={52} d={38} />
      <Box {...bx} />
      {[0, 1, 2].map((i) => {
        const [cx, cy] = ptLeft(bx, 10 + i * 8, 22)
        return <circle key={i} cx={cx} cy={cy} r="2.3" className={i === 0 ? 'led' + (busy ? ' blink' : '') : 'led2'} />
      })}
      <polygon className="f-slot" points={onLeft(bx, 8, 7, 44, 13)} />
      {[0, 1, 2, 3].map((i) => (
        <polygon key={i} className="f-line" points={onRight(bx, 6 + i * 7, 8, 9 + i * 7, 24)} />
      ))}
      <line className="antenna" x1={ax} y1={ay} x2={ax} y2={ay - 46} />
      <circle className="f-inkfill" cx={ax} cy={ay - 48} r="4" />
      <Waves x={ax + 8} y={ay - 48} on={busy} />
      <Waves x={ax - 8} y={ay - 48} on={busy} flip />
    </g>
  )
}

function Siren({ on }) {
  return (
    <g className={on ? 'siren on' : 'siren'}>
      <Shadow w={28} d={28} />
      <Box w={28} d={28} h={8} />
      <rect className="pole" x="-3" y="-46" width="6" height="34" />
      {on && <circle className="glow" cx="0" cy="-58" r="26" />}
      <path className="dome" d="M-14 -46 L-14 -56 A14 14 0 0 1 14 -56 L14 -46 Z" />
      <line className="f-inkline" x1="-16" y1="-46" x2="16" y2="-46" />
      {on && (
        <g className="sound">
          <path d="M22 -66 A16 16 0 0 1 22 -46" />
          <path d="M30 -72 A26 26 0 0 1 30 -40" />
          <path d="M-22 -66 A16 16 0 0 0 -22 -46" />
          <path d="M-30 -72 A26 26 0 0 0 -30 -40" />
        </g>
      )}
    </g>
  )
}

function fleece(cx, cy, rx, ry, n = 16) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)])
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n]
    d += ` A6 6 0 0 1 ${p[0].toFixed(1)} ${p[1].toFixed(1)}`
  }
  return d + ' Z'
}
const FLEECE = fleece(0, -34, 30, 17)

function Sheep({ alarmed }) {
  return (
    <g className={alarmed ? 'sheep alarmed' : 'sheep'}>
      <ellipse className="iso-shadow" cx="6" cy="4" rx="40" ry="9" />
      <g className="legs">
        <path d="M-18 -22 L-20 0 M-8 -20 L-7 0 M10 -20 L12 0 M20 -22 L22 0" />
      </g>
      <path className="fleece" d={FLEECE} />
      <ellipse className="head" cx="35" cy="-42" rx="10" ry="7.5" transform="rotate(-18 35 -42)" />
      <ellipse className="head" cx="29" cy="-49" rx="5" ry="2.6" transform="rotate(-40 29 -49)" />
      <path className="collar" d="M24 -50 Q30 -38 24 -28" />
      <rect className="collar-box" x="20" y="-31" width="9" height="7" rx="1.5" />
      {alarmed && (
        <g className="excl">
          <path className="speed" d="M-44 -40 H-60 M-42 -30 H-64 M-44 -20 H-58" />
          <g transform="translate(36,-74)">
            <g className="excl-pop">
              <circle r="9" />
              <text y="4" textAnchor="middle">!</text>
            </g>
          </g>
        </g>
      )}
    </g>
  )
}

export function Device({ type, busy, state }) {
  switch (type) {
    case 'phone': return <Phone busy={busy} />
    case 'phoneAlert': return <Phone alert busy={busy} />
    case 'tower': return <Tower busy={busy} down={state?.down} />
    case 'cloud': return <Cloud busy={busy} />
    case 'server': return <Server busy={busy} />
    case 'map': return <Monitor kind="map" busy={busy} />
    case 'panel': return <Monitor kind="panel" busy={busy} />
    case 'gateway': return <Gateway busy={busy} />
    case 'siren': return <Siren on={state?.on} />
    case 'sheep': return <Sheep alarmed={state?.alarmed} />
    default: return null
  }
}

// Ícono del logotipo: collar isométrico dentro de una caja
export function LogoMark() {
  return (
    <svg viewBox="-40 -52 80 70" className="logo-mark" aria-hidden>
      <Box w={34} d={34} h={22} />
      <Waves x={6} y={-38} on />
    </svg>
  )
}
