/**
 * Education library tiers (the RC Visionaries-style concept index).
 * A module belongs to a tier when its `tags` include the tier's name.
 */
export const libraryTiers = [
  { name: 'Principles', description: 'How the program works, risk, and the habits everything else rests on.' },
  { name: 'Foundation', description: 'The instruments: futures contracts, options, and reading price.' },
  { name: 'Structure', description: 'Trend, range, key levels and where liquidity sits.' },
  { name: 'Models', description: 'Complete setups with entry, stop, target and when to skip.' },
] as const

export type TierName = (typeof libraryTiers)[number]['name']

export const tierNames: TierName[] = libraryTiers.map((t) => t.name)

export function tierOf(tags: string[]): TierName | undefined {
  return tierNames.find((t) => tags.includes(t))
}
