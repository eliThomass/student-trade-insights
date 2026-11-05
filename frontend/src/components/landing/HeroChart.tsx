/**
 * The landing page's marked-up chart, the page's one orchestrated motion
 * moment. It replays the setup the program teaches in four steps (levels,
 * sweep, entry, target), then the last candle ticks quietly as if live.
 * Hover, drag or use the arrow keys to read each candle.
 *
 * Drawn at the container's real pixel size (not a scaled viewBox) so text
 * stays readable on phones. Under reduced motion it shows the finished
 * setup with no autoplay and no ticking.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import {
  ENTRY,
  ENTRY_INDEX,
  OVERNIGHT_HIGH,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_TICK,
  PRIOR_DAY_LOW,
  R_MULTIPLE,
  REWARD,
  RISK,
  STOP,
  SWEEP_INDEX,
  SYMBOL,
  TARGET,
  TARGET_HIT_INDEX,
  MINUTES_PER_CANDLE,
  candles,
  formatPrice,
  steps,
  timeAt,
  type Candle,
} from '@/components/landing/heroChartData'
import { cn } from '@/lib/cn'
import { useElementWidth, useIsVisible, usePrefersReducedMotion } from '@/lib/hooks'

const LAST = steps.length - 1
const STEP_MS = 2600
const TICK_MS = 1100
const AXIS_W = 62
const TOP = 12
const BOTTOM = 26
const TAG_H = 20

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

type Tone = 'accent' | 'up' | 'down' | 'ink' | 'slate'
const toneVar: Record<Tone, string> = {
  accent: 'var(--color-accent)',
  up: 'var(--color-up)',
  down: 'var(--color-down)',
  ink: 'var(--color-ink)',
  slate: 'var(--color-slate)',
}

/** Approximate rendered width of 11.5px Schibsted Grotesk text. */
const textWidth = (s: string) => s.length * 5.7

/** Outlined label inside the plot. */
function Note({ x, y, text, tone, anchor = 'start' }: { x: number; y: number; text: string; tone: Tone; anchor?: 'start' | 'end' }) {
  const w = textWidth(text) + 14
  const left = anchor === 'end' ? x - w : x
  return (
    <g>
      <rect x={left} y={y - TAG_H / 2} width={w} height={TAG_H} rx={4} fill="var(--color-paper)" stroke={toneVar[tone]} strokeOpacity={0.4} />
      <text x={left + 7} y={y + 4} fontSize={11.5} fontWeight={600} fill={toneVar[tone]}>
        {text}
      </text>
    </g>
  )
}

/** Solid price tag on the right-hand axis. */
function AxisTag({ x, y, text, tone }: { x: number; y: number; text: string; tone: Tone }) {
  return (
    <g>
      <rect x={x + 2} y={y - TAG_H / 2} width={AXIS_W - 4} height={TAG_H} rx={3} fill={toneVar[tone]} />
      <text x={x + AXIS_W / 2} y={y + 4} fontSize={11} fontWeight={600} fill="#fff" textAnchor="middle" className="tabular">
        {text}
      </text>
    </g>
  )
}

/** Moves the last candle's close a little, within its original range plus a few ticks. */
function nextTick(prev: Candle, base: Candle): Candle {
  const delta = (Math.round(Math.random() * 8) - 4) * 0.25
  const c = clamp(prev.c + delta, base.l + 0.5, base.h + 0.75)
  return { o: base.o, c, h: Math.max(base.h, c), l: Math.min(base.l, c) }
}

export function HeroChart() {
  const reduced = usePrefersReducedMotion()
  const figure = useRef<HTMLElement>(null)
  const [plotBox, width] = useElementWidth<HTMLDivElement>(520)
  const inView = useIsVisible(figure)

  // -1 = waiting to scroll into view; 0..LAST = walkthrough step.
  const [step, setStep] = useState(reduced ? LAST : -1)
  const [autoplay, setAutoplay] = useState(!reduced)
  const [live, setLive] = useState<Candle>(candles[candles.length - 1]!)
  const [hover, setHover] = useState<{ i: number; y: number | null; keyboard: boolean } | null>(null)

  // Autoplay: start when the chart is on screen, then advance one step at a time.
  useEffect(() => {
    if (!autoplay || !inView) return
    const t = setTimeout(
      () => {
        setStep((s) => Math.min(s + 1, LAST))
        if (step + 1 >= LAST) setAutoplay(false)
      },
      step < 0 ? 250 : STEP_MS,
    )
    return () => clearTimeout(t)
  }, [autoplay, inView, step])

  // Live ticking once the walkthrough has finished.
  const ticking = step === LAST && !autoplay && inView && !reduced
  useEffect(() => {
    if (!ticking) return
    const base = candles[candles.length - 1]!
    const id = setInterval(() => setLive((prev) => nextTick(prev, base)), TICK_MS)
    return () => clearInterval(id)
  }, [ticking])

  const current = Math.max(step, 0)
  const visibleCount = step < 0 ? 0 : steps[step]!.visible
  const shown = candles.slice(0, visibleCount).map((k, i) => (i === candles.length - 1 ? live : k))

  // Remember where the last reveal started, so only new candles animate in.
  const [reveal, setReveal] = useState({ count: visibleCount, from: 0 })
  if (reveal.count !== visibleCount) setReveal({ count: visibleCount, from: Math.min(reveal.count, visibleCount) })

  // Geometry, in real pixels.
  const height = clamp(Math.round(width * 0.62), 250, 360)
  const plotW = Math.max(120, width - AXIS_W)
  const plotH = height - TOP - BOTTOM
  const stepW = plotW / (candles.length + 1.25)
  const bodyW = clamp(stepW * 0.62, 3, 12)
  const x = (i: number) => (i + 0.75) * stepW
  const y = (p: number) => TOP + ((PRICE_MAX - p) / (PRICE_MAX - PRICE_MIN)) * plotH
  const priceAt = (py: number) => PRICE_MAX - ((py - TOP) / plotH) * (PRICE_MAX - PRICE_MIN)

  const priceTicks: number[] = []
  for (let p = Math.ceil(PRICE_MIN / PRICE_TICK) * PRICE_TICK; p <= PRICE_MAX; p += PRICE_TICK) priceTicks.push(p)
  const timeTicks: number[] = []
  for (let m = 0; m <= (candles.length - 1) * MINUTES_PER_CANDLE; m += 15) timeTicks.push(m / MINUTES_PER_CANDLE)

  const hoverIndex = hover && visibleCount > 0 ? clamp(hover.i, 0, visibleCount - 1) : null
  const readout = hoverIndex !== null ? shown[hoverIndex] : shown[shown.length - 1]
  const readoutIndex = hoverIndex ?? shown.length - 1

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (visibleCount === 0) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    setHover({ i: Math.round(px / stepW - 0.75), y: clamp(py, TOP, TOP + plotH), keyboard: false })
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (visibleCount === 0) return
    const from = hoverIndex ?? visibleCount
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      setHover({ i: clamp(from + (e.key === 'ArrowLeft' ? -1 : 1), 0, visibleCount - 1), y: null, keyboard: true })
    } else if (e.key === 'Escape') setHover(null)
  }

  const goTo = (s: number) => {
    setAutoplay(false)
    setStep(s)
  }

  const replay = () => {
    setStep(-1)
    setAutoplay(true)
  }

  // Axis tags currently shown; tick labels underneath them are hidden.
  const tagYs = [
    ...(step >= 2 ? [y(ENTRY), y(STOP)] : []),
    ...(step === LAST ? [y(live.c)] : []),
    ...(hover?.y != null ? [hover.y] : []),
  ]

  const boxLeft = x(ENTRY_INDEX) - stepW / 2
  const boxRight = step === LAST ? x(TARGET_HIT_INDEX) + stepW / 2 : plotW - 4
  const sweepLow = candles[SWEEP_INDEX]!.l
  const sweepRy = (y(sweepLow) - y(candles[SWEEP_INDEX]!.o)) / 2 + 9
  const sweepCy = (y(sweepLow) + y(candles[SWEEP_INDEX]!.o)) / 2
  const sweepRx = Math.max(stepW * 0.85, 10)

  return (
    <figure ref={figure} className="hero-chart min-w-0">
      <div className="overflow-hidden rounded-xl border border-line bg-paper">
        {/* Symbol and OHLC readout */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-xs">
          <p>
            <span className="font-bold text-ink">{SYMBOL}</span>
            <span className="ml-1.5 text-slate">2 min, New York open</span>
          </p>
          {readout && (
            <p className="tabular flex flex-wrap gap-x-3 gap-y-0.5 text-slate" aria-live={hover?.keyboard ? 'polite' : 'off'}>
              <span className="font-semibold text-ink">{timeAt(readoutIndex)}</span>
              {(['o', 'h', 'l', 'c'] as const).map((k) => (
                <span key={k} className="whitespace-nowrap">
                  {k.toUpperCase()}{' '}
                  <span className={k === 'c' ? (readout.c >= readout.o ? 'font-semibold text-up' : 'font-semibold text-down') : 'text-ink'}>{formatPrice(readout[k])}</span>
                </span>
              ))}
            </p>
          )}
        </div>

        {/* The chart */}
        <div ref={plotBox} className="min-w-0 overflow-hidden bg-mist/60">
          <svg
            width={width}
            height={height}
            className="block cursor-crosshair touch-pan-y select-none focus-visible:outline-offset-[-2px]"
            role="img"
            aria-label={`Price chart, ${steps[current]!.label.toLowerCase()} step. Use the left and right arrow keys to read each candle.`}
            tabIndex={0}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHover(null)}
            onKeyDown={onKeyDown}
            onBlur={() => setHover(null)}
          >
            {/* Grid and axes */}
            {priceTicks.map((p) => (
              <g key={p}>
                <line x1={0} x2={plotW} y1={y(p)} y2={y(p)} stroke="var(--color-line)" />
                {!tagYs.some((ty) => Math.abs(ty - y(p)) < TAG_H) && (
                  <text x={plotW + 8} y={y(p) + 4} fontSize={11} fill="var(--color-slate)" className="tabular">
                    {p.toFixed(2)}
                  </text>
                )}
              </g>
            ))}
            <line x1={plotW} x2={plotW} y1={0} y2={height} stroke="var(--color-line)" />
            <line x1={0} x2={width} y1={TOP + plotH} y2={TOP + plotH} stroke="var(--color-line)" />
            {timeTicks.map((i) => (
              <text key={i} x={i === 0 ? 4 : x(i)} y={height - 9} fontSize={11} fill="var(--color-slate)" textAnchor={i === 0 ? 'start' : 'middle'} className="tabular">
                {timeAt(i)}
              </text>
            ))}

            {/* Step 1: levels */}
            {step >= 0 && (
              <g className="chart-note">
                <line x1={0} x2={plotW} y1={y(OVERNIGHT_HIGH)} y2={y(OVERNIGHT_HIGH)} stroke="var(--color-accent)" strokeWidth={1.25} strokeDasharray="5 4" />
                <line x1={0} x2={plotW} y1={y(PRIOR_DAY_LOW)} y2={y(PRIOR_DAY_LOW)} stroke="var(--color-accent)" strokeWidth={1.25} strokeDasharray="5 4" />
                <Note x={8} y={y(OVERNIGHT_HIGH) + TAG_H / 2 + 4} text="Overnight high" tone="accent" />
                <Note x={8} y={y(PRIOR_DAY_LOW) - TAG_H / 2 - 4} text="Prior day low" tone="accent" />
              </g>
            )}

            {/* Step 3: the trade box (drawn under the candles) */}
            {step >= 2 && (
              <g className="chart-note">
                <rect x={boxLeft} y={y(TARGET)} width={boxRight - boxLeft} height={y(ENTRY) - y(TARGET)} fill="var(--color-up)" fillOpacity={0.09} />
                <rect x={boxLeft} y={y(ENTRY)} width={boxRight - boxLeft} height={y(STOP) - y(ENTRY)} fill="var(--color-down)" fillOpacity={0.09} />
                <line x1={boxLeft} x2={boxRight} y1={y(ENTRY)} y2={y(ENTRY)} stroke="var(--color-accent)" strokeWidth={1.5} />
                <line x1={boxLeft} x2={boxRight} y1={y(STOP)} y2={y(STOP)} stroke="var(--color-down)" strokeWidth={1} strokeOpacity={0.6} />
                <text x={boxLeft + 6} y={y(TARGET) + 15} fontSize={11.5} fontWeight={600} fill="var(--color-up)" className="tabular">
                  +{REWARD.toFixed(2)} ({R_MULTIPLE.toFixed(1)}R)
                </text>
                <text x={boxRight - 6} y={y(STOP) - 6} fontSize={11.5} fontWeight={600} fill="var(--color-down)" textAnchor="end" className="tabular">
                  −{RISK.toFixed(2)} (1R)
                </text>
              </g>
            )}

            {/* Candles */}
            <g>
              {shown.map((k, i) => {
                const up = k.c >= k.o
                const color = up ? 'var(--color-ink)' : 'var(--color-slate)'
                const isNew = i >= reveal.from
                return (
                  <g
                    key={i}
                    data-candle={i}
                    className={isNew ? 'candle-in' : undefined}
                    style={isNew ? { animationDelay: `${(i - reveal.from) * 45}ms` } : undefined}
                    opacity={hoverIndex !== null && hoverIndex !== i ? 0.55 : 1}
                  >
                    <line x1={x(i)} x2={x(i)} y1={y(k.h)} y2={y(k.l)} stroke={color} strokeWidth={1.25} />
                    <rect
                      x={x(i) - bodyW / 2}
                      y={y(Math.max(k.o, k.c))}
                      width={bodyW}
                      height={Math.max(1.5, Math.abs(y(k.o) - y(k.c)))}
                      rx={1}
                      fill={up ? 'var(--color-paper)' : color}
                      stroke={color}
                      strokeWidth={1.25}
                    />
                  </g>
                )
              })}
            </g>

            {/* Step 2: the sweep */}
            {step >= 1 && (
              <g className="chart-note">
                <ellipse cx={x(SWEEP_INDEX)} cy={sweepCy} rx={sweepRx} ry={sweepRy} fill="none" stroke="var(--color-down)" strokeWidth={1.5} />
                <Note x={x(SWEEP_INDEX) - sweepRx - 6} y={y(sweepLow) - 2} text="Liquidity taken" tone="down" anchor="end" />
              </g>
            )}

            {/* Step 3: entry marker */}
            {step >= 2 && (
              <path
                className="chart-note"
                d={`M ${x(ENTRY_INDEX)} ${y(candles[ENTRY_INDEX]!.l) + 5} l 5 8 h -10 z`}
                fill="var(--color-accent)"
              />
            )}

            {/* Step 4: target reached */}
            {step >= LAST && (
              <circle className="chart-note" cx={x(TARGET_HIT_INDEX)} cy={y(TARGET)} r={3.5} fill="var(--color-paper)" stroke="var(--color-up)" strokeWidth={2} />
            )}

            {/* Live price line */}
            {step === LAST && (
              <line x1={x(candles.length - 1)} x2={plotW} y1={y(live.c)} y2={y(live.c)} stroke="var(--color-ink)" strokeDasharray="2 3" strokeOpacity={0.6} />
            )}

            {/* Crosshair */}
            {hoverIndex !== null && (
              <g pointerEvents="none">
                <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={TOP} y2={TOP + plotH} stroke="var(--color-slate)" strokeDasharray="3 3" />
                {hover?.y != null && <line x1={0} x2={plotW} y1={hover.y} y2={hover.y} stroke="var(--color-slate)" strokeDasharray="3 3" />}
              </g>
            )}

            {/* Axis tags, drawn last so they sit on top */}
            {step >= 2 && <AxisTag x={plotW} y={y(ENTRY)} text={formatPrice(ENTRY)} tone="accent" />}
            {step >= 2 && <AxisTag x={plotW} y={y(STOP)} text={formatPrice(STOP)} tone="down" />}
            {step === LAST && <AxisTag x={plotW} y={y(live.c)} text={formatPrice(live.c)} tone="ink" />}
            {hover?.y != null && <AxisTag x={plotW} y={hover.y} text={formatPrice(Math.round(priceAt(hover.y) * 4) / 4)} tone="slate" />}
            {hoverIndex !== null && (
              <g pointerEvents="none">
                <rect x={clamp(x(hoverIndex) - 22, 0, plotW - 44)} y={TOP + plotH + 3} width={44} height={TAG_H} rx={3} fill="var(--color-slate)" />
                <text x={clamp(x(hoverIndex), 22, plotW - 22)} y={TOP + plotH + 17} fontSize={11} fontWeight={600} fill="#fff" textAnchor="middle" className="tabular">
                  {timeAt(hoverIndex)}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Walkthrough */}
        <div className="border-t border-line px-4 pt-3 pb-4">
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Walk through the setup">
            {steps.map((s, i) => {
              const done = i < current || (i === current && !autoplay)
              const playing = i === current && autoplay && step >= 0
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-pressed={i === current}
                  className={cn('group text-left text-xs font-semibold', i === current ? 'text-ink' : 'text-slate hover:text-ink')}
                >
                  <span className="relative block h-[3px] overflow-hidden rounded-full bg-line">
                    {(done || playing) && (
                      <span
                        key={`${i}-${step}-${autoplay}`}
                        className={cn('absolute inset-y-0 left-0 rounded-full bg-accent', playing ? 'step-progress' : 'w-full')}
                        style={playing ? { animationDuration: `${STEP_MS}ms` } : undefined}
                      />
                    )}
                  </span>
                  <span className="mt-2 block">
                    <span className="tabular mr-1 text-slate">{i + 1}</span>
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="min-h-[2.8em] text-sm leading-snug text-ink">{steps[current]!.text}</p>
            <button
              type="button"
              onClick={replay}
              className="-mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-slate hover:bg-mist hover:text-ink"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Replay
            </button>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-slate">
        Illustration of a setup taught in the program, not a real trade or a promise of results.
      </figcaption>
    </figure>
  )
}
