import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/** True when the viewer has asked the OS for reduced motion. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
}

/** Width of an element, kept up to date with a ResizeObserver. Measured before first paint. */
export function useElementWidth<T extends HTMLElement>(fallback: number): [RefObject<T | null>, number] {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.getBoundingClientRect().width)
    const ro = new ResizeObserver(([entry]) => setWidth(entry!.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

/** Whether an element is on screen (at least `threshold` visible) and the tab is visible. */
export function useIsVisible(ref: RefObject<Element | null>, threshold = 0.4) {
  const [onScreen, setOnScreen] = useState(false)
  const pageVisible = useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange)
      return () => document.removeEventListener('visibilitychange', onChange)
    },
    () => document.visibilityState === 'visible',
    () => true,
  )
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry!.isIntersecting), { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  return onScreen && pageVisible
}
