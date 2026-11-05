import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getVersion, subscribe } from '@/data/store'

interface QueryState<T> {
  key: string
  data?: T
  error?: Error
}

/**
 * Runs an async data function and re-runs it whenever `key` changes or the
 * mock store changes. Stale data stays visible while a refetch is in flight.
 * Maps onto TanStack Query (or similar) once the data comes from Supabase.
 */
export function useQuery<T>(key: string, fn: () => Promise<T>) {
  const version = useSyncExternalStore(subscribe, getVersion)
  const [state, setState] = useState<QueryState<T> | null>(null)
  const fnRef = useRef(fn)

  useEffect(() => {
    fnRef.current = fn
  })

  useEffect(() => {
    let cancelled = false
    fnRef.current().then(
      (data) => !cancelled && setState({ key, data }),
      (error: unknown) =>
        !cancelled && setState({ key, error: error instanceof Error ? error : new Error(String(error)) }),
    )
    return () => {
      cancelled = true
    }
  }, [key, version])

  const fresh = state?.key === key
  return {
    data: fresh ? state.data : undefined,
    error: fresh ? state.error : undefined,
    loading: !fresh,
  }
}
