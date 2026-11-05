/**
 * The landing page's one orchestrated motion moment: a chart marked up the
 * way the mentor would mark it. Candles reveal left to right, then the
 * annotations appear one by one. Under reduced motion everything is static.
 *
 * Illustrative only (labelled as such below the chart), not a real trade.
 */

// open, high, low, close
const candles: [number, number, number, number][] = [
  [112, 113.5, 110.8, 111.2], [111.2, 112, 109.6, 110], [110, 111.4, 109.2, 110.8], [110.8, 111, 108.4, 108.9],
  [108.9, 109.5, 107, 107.4], [107.4, 108.6, 106.8, 108.2], [108.2, 108.4, 105.6, 106], [106, 106.8, 104.2, 104.6],
  [104.6, 105.8, 103.9, 105.4], [105.4, 105.6, 102.6, 103], [103, 103.6, 101.2, 101.6], [101.6, 102.8, 100.8, 102.4],
  [102.4, 102.6, 100.6, 101], [101, 101.4, 97.6, 100.8], [100.8, 103.6, 100.4, 103.2], [103.2, 104, 102.4, 102.8],
  [102.8, 105.8, 102.6, 105.4], [105.4, 107.2, 104.8, 106.8], [106.8, 107.4, 105.6, 106], [106, 109, 105.8, 108.6],
  [108.6, 110.6, 108.2, 110.2], [110.2, 111, 109.2, 109.6], [109.6, 112.8, 109.4, 112.4], [112.4, 114.6, 111.8, 114],
  [114, 115, 113, 113.4], [113.4, 116.8, 113.2, 116.4], [116.4, 118.4, 115.8, 118], [118, 118.6, 116.6, 117],
]

const W = 560
const H = 380
const PAD_L = 24
const STEP = 18
const BODY = 10
const LEVEL = 100
const TARGET = 118
const STOP = 97
const SWEEP = 13
const ENTRY = 14

const y = (price: number) => 30 + ((120 - price) / (120 - 95)) * (H - 60)
const x = (i: number) => PAD_L + i * STEP + STEP / 2

function Label({ x: lx, y: ly, children, anchor = 'start', tone = 'accent' }: { x: number; y: number; children: string; anchor?: 'start' | 'end'; tone?: 'accent' | 'down' | 'up' }) {
  const width = children.length * 6.9 + 16
  const left = anchor === 'end' ? lx - width : lx
  const fill = tone === 'down' ? 'var(--color-down)' : tone === 'up' ? 'var(--color-up)' : 'var(--color-accent)'
  return (
    <g>
      <rect x={left} y={ly - 12} width={width} height={22} rx={5} fill="var(--color-paper)" stroke={fill} strokeOpacity={0.35} />
      <text x={left + 8} y={ly + 3.5} fontSize={12.5} fontWeight={600} fill={fill}>
        {children}
      </text>
    </g>
  )
}

export function HeroChart() {
  return (
    <figure className="hero-chart">
      <div className="overflow-hidden rounded-xl border border-line bg-mist">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-labelledby="hero-chart-title">
          <title id="hero-chart-title">
            A price chart marked up by a mentor: price sweeps below the prior day low, closes back above it, and an entry on the reclaim runs to the target.
          </title>
          <defs>
            <clipPath id="hero-reveal">
              <rect className="hero-reveal" x="0" y="0" width={W} height={H} />
            </clipPath>
          </defs>

          {/* Quiet grid */}
          {[100, 105, 110, 115].map((p) => (
            <line key={p} x1={0} x2={W} y1={y(p)} y2={y(p)} stroke="var(--color-line)" strokeWidth={1} />
          ))}

          {/* Candles */}
          <g clipPath="url(#hero-reveal)">
            {candles.map(([o, h, l, c], i) => {
              const up = c >= o
              const color = up ? 'var(--color-ink)' : 'var(--color-slate)'
              return (
                <g key={i}>
                  <line x1={x(i)} x2={x(i)} y1={y(h)} y2={y(l)} stroke={color} strokeWidth={1.5} />
                  <rect
                    x={x(i) - BODY / 2}
                    y={y(Math.max(o, c))}
                    width={BODY}
                    height={Math.max(2, Math.abs(y(o) - y(c)))}
                    rx={1.5}
                    fill={up ? 'var(--color-paper)' : color}
                    stroke={color}
                    strokeWidth={1.5}
                  />
                </g>
              )
            })}
          </g>

          {/* Annotations, in the order the mentor would draw them */}
          <g className="hero-note" style={{ animationDelay: '1.7s' }}>
            <line x1={0} x2={W} y1={y(LEVEL)} y2={y(LEVEL)} stroke="var(--color-accent)" strokeWidth={1.5} strokeDasharray="6 5" />
            <Label x={12} y={y(LEVEL) - 16}>prior day low</Label>
          </g>
          <g className="hero-note" style={{ animationDelay: '2.1s' }}>
            <ellipse cx={x(SWEEP)} cy={y(98.6)} rx={13} ry={24} fill="none" stroke="var(--color-down)" strokeWidth={1.75} />
            <Label x={x(SWEEP) - 22} y={y(96.4) + 6} anchor="end" tone="down">liquidity taken</Label>
          </g>
          <g className="hero-note" style={{ animationDelay: '2.5s' }}>
            <path
              d={`M ${x(ENTRY) + 40} ${y(LEVEL) + 16} Q ${x(ENTRY) + 14} ${y(LEVEL) + 14} ${x(ENTRY) + 7} ${y(103.2) + 4}`}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={1.75}
              markerEnd="url(#hero-arrow)"
            />
            <Label x={x(ENTRY) + 44} y={y(LEVEL) + 17}>entry on the reclaim</Label>
          </g>
          <g className="hero-note" style={{ animationDelay: '2.8s' }}>
            <line x1={x(ENTRY) - 8} x2={x(ENTRY) + 190} y1={y(STOP)} y2={y(STOP)} stroke="var(--color-down)" strokeWidth={1.25} strokeDasharray="3 4" />
            <Label x={x(ENTRY) + 44} y={y(STOP) + 18} tone="down">stop below the sweep</Label>
          </g>
          <g className="hero-note" style={{ animationDelay: '3.1s' }}>
            <line x1={x(ENTRY) - 8} x2={W} y1={y(TARGET)} y2={y(TARGET)} stroke="var(--color-up)" strokeWidth={1.5} strokeDasharray="6 5" />
            <Label x={x(ENTRY) + 2} y={y(TARGET) + 1} tone="up">target: overnight high</Label>
          </g>
          <defs>
            <marker id="hero-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-accent)" />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption className="mt-3 text-xs text-slate">
        Illustration of a setup taught in the program, not a real trade or a promise of results.
      </figcaption>
    </figure>
  )
}
