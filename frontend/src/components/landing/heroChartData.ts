/**
 * Data for the landing page's illustrative chart: a 2-minute ES session
 * from the open, with the setup the program teaches (sweep of the prior day
 * low, entry on the reclaim, target at the overnight high).
 * Not a real trade; the figure's caption says so.
 */

export interface Candle {
  o: number
  h: number
  l: number
  c: number
}

const rows: [number, number, number, number][] = [
  [5830.0, 5833.75, 5827.0, 5828.0], [5828.0, 5830.0, 5824.0, 5825.0], [5825.0, 5828.5, 5823.0, 5827.0], [5827.0, 5827.5, 5821.0, 5822.25],
  [5822.25, 5823.75, 5817.5, 5818.5], [5818.5, 5821.5, 5817.0, 5820.5], [5820.5, 5821.0, 5814.0, 5815.0], [5815.0, 5817.0, 5810.5, 5811.5],
  [5811.5, 5814.5, 5809.75, 5813.5], [5813.5, 5814.0, 5806.5, 5807.5], [5807.5, 5809.0, 5803.0, 5804.0], [5804.0, 5807.0, 5802.0, 5806.0],
  [5806.0, 5806.5, 5801.5, 5802.5], [5802.5, 5803.5, 5794.0, 5802.0], [5802.0, 5809.0, 5801.0, 5808.0], [5808.0, 5810.0, 5806.0, 5807.0],
  [5807.0, 5814.5, 5806.5, 5813.5], [5813.5, 5818.0, 5812.0, 5817.0], [5817.0, 5818.5, 5814.0, 5815.0], [5815.0, 5822.5, 5814.5, 5821.5],
  [5821.5, 5826.5, 5820.5, 5825.5], [5825.5, 5827.5, 5823.0, 5824.0], [5824.0, 5832.0, 5823.5, 5831.0], [5831.0, 5836.5, 5829.5, 5835.0],
  [5835.0, 5837.5, 5832.5, 5833.5], [5833.5, 5842.0, 5833.0, 5841.0], [5841.0, 5846.0, 5839.5, 5845.0], [5845.0, 5846.5, 5841.5, 5842.5],
]

export const candles: Candle[] = rows.map(([o, h, l, c]) => ({ o, h, l, c }))

export const SYMBOL = 'ES'
export const MINUTES_PER_CANDLE = 2
export const SESSION_START_MINUTES = 9 * 60 + 30

/** Key levels, marked before the open. */
export const PRIOR_DAY_LOW = 5800
export const OVERNIGHT_HIGH = 5845

/** The trade. */
export const SWEEP_INDEX = 13
export const ENTRY_INDEX = 14
export const ENTRY = candles[ENTRY_INDEX]!.c
export const STOP = 5793.5
export const TARGET = OVERNIGHT_HIGH
export const TARGET_HIT_INDEX = candles.findIndex((k, i) => i > ENTRY_INDEX && k.h >= TARGET)
export const RISK = ENTRY - STOP
export const REWARD = TARGET - ENTRY
export const R_MULTIPLE = REWARD / RISK

/** Price range drawn on the chart, and the axis tick spacing. */
export const PRICE_MIN = 5786
export const PRICE_MAX = 5852
export const PRICE_TICK = 10

export interface Step {
  label: string
  /** How many candles are visible at this step. */
  visible: number
  text: string
}

export const steps: Step[] = [
  {
    label: 'Levels',
    visible: SWEEP_INDEX,
    text: 'Before the open, mark the prior day low and the overnight high. Stops collect just beyond them.',
  },
  {
    label: 'Sweep',
    visible: SWEEP_INDEX + 1,
    text: 'Price runs through the prior day low, takes those stops, and closes back above it.',
  },
  {
    label: 'Entry',
    visible: ENTRY_INDEX + 1,
    text: 'Enter on the reclaim, with the stop below the sweep. The risk is set before the trade, not after.',
  },
  {
    label: 'Target',
    visible: candles.length,
    text: `Price reaches the overnight high: ${R_MULTIPLE.toFixed(1)} times the risk taken.`,
  },
]

export function timeAt(index: number) {
  const m = SESSION_START_MINUTES + index * MINUTES_PER_CANDLE
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
}

export const formatPrice = (p: number) => p.toFixed(2)
