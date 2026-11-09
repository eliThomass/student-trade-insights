import { Link } from 'react-router'
import { site } from '@/config/site'

/** PLACEHOLDER mark and wordmark until the mentor's logo arrives. */
export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 rounded-md font-bold text-ink">
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <rect width="32" height="32" rx="7" className="fill-accent" />
        <path d="M11 7v18M21 7v18" stroke="var(--color-on-fill)" strokeWidth="2" strokeLinecap="round" />
        <rect x="8" y="11" width="6" height="9" rx="1.5" fill="var(--color-on-fill)" />
        <rect x="18" y="13" width="6" height="6" rx="1.5" fill="var(--color-on-fill)" />
      </svg>
      <span className="text-[17px] tracking-tight">{site.brandName}</span>
    </Link>
  )
}
