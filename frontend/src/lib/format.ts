const opts = { long: { month: 'short', day: 'numeric', year: 'numeric' }, short: { month: 'short', day: 'numeric' } } as const

/**
 * Calendar dates ("2026-11-03") are formatted in UTC so they never shift a day;
 * timestamps are formatted in the viewer's time zone.
 */
function fmt(value: string, style: keyof typeof opts) {
  const dateOnly = value.length === 10
  return new Intl.DateTimeFormat('en-US', { ...opts[style], ...(dateOnly ? { timeZone: 'UTC' } : {}) }).format(
    new Date(dateOnly ? `${value}T00:00:00Z` : value),
  )
}

/** "Nov 3, 2026" */
export const formatDate = (value: string) => fmt(value, 'long')
/** "Nov 3" */
export const formatShortDate = (value: string) => fmt(value, 'short')

/** Today as "YYYY-MM-DD" in the viewer's time zone. */
export function todayISO() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function initials(name: string) {
  return name
    .replace(/[[\]]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
