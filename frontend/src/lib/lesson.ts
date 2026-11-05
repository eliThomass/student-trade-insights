import type { LessonBlock, Module } from '@/types/db'

export function blockWords(b: LessonBlock): number {
  const text = b.type === 'list' ? b.items.join(' ') : 'text' in b ? b.text : ''
  return text.split(/\s+/).filter(Boolean).length
}

/** Rough reading time in minutes; videos count as 5 minutes each. */
export function readingMinutes(m: Module): number {
  const words = m.body.reduce((n, b) => n + blockWords(b), 0)
  const videos = m.body.filter((b) => b.type === 'video').length
  return Math.max(1, Math.round(words / 200) + videos * 5)
}

/** Turns a YouTube or Vimeo link into an embeddable URL, or null if unsupported. */
export function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v') ?? u.pathname.split('/').pop()
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (u.hostname === 'youtu.be') return `https://www.youtube-nocookie.com/embed${u.pathname}`
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}
