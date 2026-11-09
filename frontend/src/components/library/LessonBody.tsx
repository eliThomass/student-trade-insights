import { CircleAlert, Info, PlayCircle } from 'lucide-react'
import { toEmbedUrl } from '@/lib/lesson'
import type { LessonBlock } from '@/types/db'

function Video({ url, title }: { url: string; title: string }) {
  const embed = url ? toEmbedUrl(url) : null
  if (embed) {
    return (
      <div className="aspect-video overflow-hidden rounded-lg bg-black">
        <iframe
          src={embed}
          title={title}
          className="size-full"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          loading="lazy"
        />
      </div>
    )
  }
  return (
    <div className="grid aspect-video place-items-center rounded-lg border border-dashed border-line bg-mist text-center">
      <div>
        <PlayCircle className="mx-auto size-10 text-slate/60" aria-hidden />
        <p className="mt-2 font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-slate">{url ? 'This video link can’t be embedded. Use a YouTube or Vimeo link.' : 'Video coming soon'}</p>
      </div>
    </div>
  )
}

/** Renders a lesson body. Never renders raw HTML. */
export function LessonBody({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="max-w-[68ch] space-y-5 text-[17px] leading-[1.7] text-ink">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading':
            return (
              <h2 key={i} className="pt-4 text-xl font-bold leading-snug">
                {b.text}
              </h2>
            )
          case 'paragraph':
            return <p key={i}>{b.text}</p>
          case 'list':
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-accent">
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          case 'image':
            return (
              <figure key={i} className="py-2">
                <img src={b.src} alt={b.alt} className="w-full rounded-lg border border-line" loading="lazy" />
                {b.caption && <figcaption className="mt-2 text-sm text-slate">{b.caption}</figcaption>}
              </figure>
            )
          case 'video':
            return (
              <div key={i} className="py-2">
                <Video url={b.url} title={b.title} />
              </div>
            )
          case 'callout': {
            const warning = b.tone === 'warning'
            const Icon = warning ? CircleAlert : Info
            return (
              <div key={i} className={`flex gap-3 rounded-lg px-4 py-3 text-[15px] ${warning ? 'bg-hold-soft' : 'bg-accent-soft'}`}>
                <Icon className={`mt-1 size-4 shrink-0 ${warning ? 'text-hold' : 'text-accent'}`} aria-hidden />
                <p>{b.text}</p>
              </div>
            )
          }
        }
      })}
    </div>
  )
}
