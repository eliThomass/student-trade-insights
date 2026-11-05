import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { ChevronDown, NotebookPen, Video } from 'lucide-react'
import { HeroChart } from '@/components/landing/HeroChart'
import { ResultsMarquee } from '@/components/landing/ResultsMarquee'
import { ButtonLink } from '@/components/ui/Button'
import { Disclaimer, PlaceholderTag } from '@/components/ui/misc'
import { libraryTiers } from '@/config/library'
import { site } from '@/config/site'
import { caseStudies, faqs } from '@/mocks/landing'

function Section({ id, children, className = '' }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">{children}</div>
    </section>
  )
}

function ApplyCta({ className = '' }: { className?: string }) {
  return (
    <ButtonLink to="/apply" size="lg" className={className}>
      Apply for mentorship
    </ButtonLink>
  )
}

export default function Landing() {
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <>
      {/* Hero */}
      <Section className="pt-12 pb-14 sm:pt-20 sm:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div>
            {site.applicationsOpen && (
              <p className="inline-flex items-center gap-2.5 rounded-full border border-up/25 bg-up-soft py-1 pr-3.5 pl-3 text-sm font-semibold text-up">
                <span className="open-dot size-2 rounded-full bg-up" aria-hidden />
                Applications open
              </p>
            )}
            <h1 className="mt-6 max-w-[17ch] text-[2.5rem] leading-[1.05] font-bold tracking-[-0.025em] text-ink sm:text-[3.25rem] xl:text-hero">
              Learn to trade {site.markets} with a mentor who reviews your trades.
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg text-slate">
              One-on-one mentorship for a small group of students: a structured library, a written plan, and calls where your
              own trades are the lesson. By application only.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ApplyCta />
              <a href="#how-it-works" className="text-sm font-semibold text-accent hover:text-accent-strong">
                How applying works
              </a>
            </div>
            <p className="mt-4 text-sm text-slate">We reply to every application within {site.responseTime}.</p>
          </div>
          <HeroChart />
        </div>
      </Section>

      {/* Proof, right after the hero */}
      <ResultsMarquee />

      {/* What's included: the mentorship is the product, the rest supports it */}
      <Section id="included" className="py-20 sm:py-28">
        <h2 className="max-w-[24ch] text-2xl font-bold sm:text-3xl">What you get when you’re accepted</h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <article className="flex flex-col rounded-xl bg-ink p-7 text-white sm:p-9">
            <Video className="size-6 text-white/70" aria-hidden />
            <h3 className="mt-5 text-xl font-bold">One-on-one mentorship</h3>
            <p className="mt-3 max-w-[48ch] text-white/75">
              Regular calls with {site.mentorName} where you bring your best and worst trades and leave with a short list of
              what to fix. He reads your journal, so nothing gets glossed over.
            </p>
            <ul className="mt-8 grid gap-x-8 gap-y-4 border-t border-white/15 pt-7 text-sm sm:grid-cols-3">
              <li>
                <p className="font-semibold">Trade reviews</p>
                <p className="mt-1 text-white/65">Your journal, read before every call.</p>
              </li>
              <li>
                <p className="font-semibold">A written plan</p>
                <p className="mt-1 text-white/65">Rules, risk and one model, built with you.</p>
              </li>
              <li>
                <p className="font-semibold">
                  Call cadence <PlaceholderTag>TBC</PlaceholderTag>
                </p>
                <p className="mt-1 text-white/65">Set by the mentor once pricing is final.</p>
              </li>
            </ul>
          </article>

          <div className="grid gap-5">
            <article className="rounded-xl border border-line p-7">
              <h3 className="text-lg font-bold">An education library, in order</h3>
              <p className="mt-2 text-sm text-slate">Every concept from the calls, organized so you always know what to study next.</p>
              <ol className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold">
                {libraryTiers.map((t, i) => (
                  <li key={t.name} className="flex items-center gap-2">
                    <span className="rounded-md bg-mist px-2.5 py-1 text-ink">{t.name}</span>
                    {i < libraryTiers.length - 1 && <span className="text-slate" aria-hidden>›</span>}
                  </li>
                ))}
              </ol>
            </article>
            <article className="rounded-xl border border-line p-7">
              <NotebookPen className="size-5 text-accent" aria-hidden />
              <h3 className="mt-4 text-lg font-bold">Notes after every session</h3>
              <p className="mt-2 text-sm text-slate">
                What you covered, what to work on, and the recording, saved in your portal so you never have to scroll back
                through a chat to find them.
              </p>
            </article>
          </div>
        </div>
        <div className="mt-10">
          <ApplyCta />
        </div>
      </Section>

      {/* The mentor and the approach */}
      <Section id="approach" className="bg-mist py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <div className="grid aspect-[4/3] max-w-sm place-items-center lg:aspect-[4/5] rounded-xl border border-dashed border-line bg-paper">
              <PlaceholderTag>Mentor photo</PlaceholderTag>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">About {site.mentorName}</h2>
            <div className="mt-5 max-w-[62ch] space-y-4 text-slate">
              <p>
                <PlaceholderTag>Bio</PlaceholderTag> A short bio goes here: how long he has traded {site.markets}, how he came
                to teach, and what his students have in common. Two or three plain sentences, written by the mentor.
              </p>
            </div>
            <h3 className="mt-12 text-lg font-bold">How he teaches</h3>
            <dl className="mt-5 grid gap-6 sm:grid-cols-3">
              {[
                ['Risk before setups', 'You decide what a loss costs before you learn a single entry.'],
                ['One model, traded well', 'Depth over a toolbox of half-learned strategies.'],
                ['Journal everything', 'Your trades are the curriculum. Calls start from your journal.'],
              ].map(([title, text]) => (
                <div key={title} className="border-t-2 border-accent pt-4">
                  <dt className="font-semibold text-ink">{title}</dt>
                  <dd className="mt-1.5 text-sm text-slate">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* Student case studies */}
      <Section className="py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Students, before and after</h2>
          <PlaceholderTag>Sample case studies</PlaceholderTag>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {caseStudies.map((c) => (
            <figure key={c.name} className="flex flex-col rounded-xl border border-line p-6">
              <blockquote className="text-ink">“{c.quote}”</blockquote>
              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                <div>
                  <dt className="font-semibold text-slate">Before</dt>
                  <dd className="mt-0.5 text-ink">{c.before}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-up">After</dt>
                  <dd className="mt-0.5 text-ink">{c.after}</dd>
                </div>
              </dl>
              <figcaption className="mt-auto pt-6 text-sm">
                <span className="font-semibold text-ink">{c.name}</span>
                <span className="text-slate">, {c.period}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <Disclaimer className="mt-5" />
      </Section>

      {/* How applying works: a real sequence, so it's numbered */}
      <Section id="how-it-works" className="border-t border-line py-20 sm:py-28">
        <h2 className="text-2xl font-bold sm:text-3xl">How applying works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {[
            ['Apply', 'Create an account and answer a few questions about your trading, your time and your goals. It takes about 10 minutes.'],
            ['Get a decision', `${site.mentorName} reads every application himself. You’ll hear back within ${site.responseTime}: accepted, waitlisted or not this time.`],
            ['Start', 'If you’re accepted, pay by Venmo or PayPal. Your portal unlocks once payment is confirmed, and you book your first call.'],
          ].map(([title, text], i) => (
            <li key={title} className="relative md:pr-6">
              <span className="tabular grid size-9 place-items-center rounded-full border-2 border-accent text-sm font-bold text-accent">
                {i + 1}
              </span>
              {i < 2 && <span className="absolute top-[18px] left-12 hidden h-px w-[calc(100%-3.5rem)] border-t border-dashed border-accent/40 md:block" aria-hidden />}
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 max-w-[40ch] text-slate">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* FAQ before the last CTA */}
      <Section id="faq" className="bg-mist py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <h2 className="text-2xl font-bold sm:text-3xl">Questions</h2>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 text-slate transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="max-w-[62ch] pb-5 text-slate">
                  {f.a.startsWith('PLACEHOLDER: ') ? (
                    <>
                      <PlaceholderTag>Pricing</PlaceholderTag> {f.a.replace('PLACEHOLDER: ', '')}
                    </>
                  ) : (
                    f.a
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA, the only centered block */}
      <Section className="py-24 text-center sm:py-32">
        <h2 className="mx-auto max-w-[22ch] text-3xl font-bold">Applications are open.</h2>
        <p className="mx-auto mt-4 max-w-[48ch] text-slate">Ten minutes to apply, and a reply within {site.responseTime}.</p>
        <ApplyCta className="mt-9" />
      </Section>
    </>
  )
}
