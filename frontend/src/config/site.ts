/**
 * Brand and mentor details. Everything marked PLACEHOLDER is waiting on the
 * mentor (see "Inputs Needed From the Mentor" in phase1-build-blueprint.md).
 */
export const site = {
  /** PLACEHOLDER: brand name. */
  brandName: 'Placeholder Brand',
  /** PLACEHOLDER: mentor's name. */
  mentorName: '[Mentor Name]',
  mentorFirstName: '[Mentor]',
  /** PLACEHOLDER: what he trades. Confirmed by Brayden: options and futures. */
  markets: 'options and futures',
  /** How long applicants wait for a decision. PLACEHOLDER until the mentor confirms. */
  responseTime: '72 hours',
  applicationsOpen: true,
  /** PLACEHOLDER: real payment handles. Payments stay off-platform in Phase 1. */
  payment: {
    venmo: '@placeholder-venmo',
    paypal: 'payments@placeholder.example',
  },
  /** PLACEHOLDER: social links. */
  social: {
    youtube: 'https://youtube.com',
    x: 'https://x.com',
    discord: 'https://discord.com',
  },
  contactEmail: 'hello@placeholder.example',
  disclaimer: {
    short: 'Results vary. Past performance does not guarantee future results.',
    full: [
      'Trading options and futures involves substantial risk of loss and is not suitable for every investor. Only trade with money you can afford to lose.',
      'Past performance, whether actual or indicated by historical tests, is not indicative of future results. Results shown are from individual students and are not typical.',
      'This is an educational program. Nothing on this site is investment advice or a recommendation to buy or sell any security or contract.',
    ],
  },
} as const
