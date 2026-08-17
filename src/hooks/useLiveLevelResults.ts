import { useEffect } from 'react'
import { levelResultRepository } from '../data'

/**
 * Runs `load` once, then again every time any level result is saved anywhere, passing the
 * resolved value to `setResult` — the realtime-refetch wiring shared by the level board,
 * profile stats, and admin student list. Skips entirely while `enabled` is false.
 */
export function useLiveLevelResults<T>(
  load: () => Promise<T>,
  setResult: (value: T) => void,
  enabled: boolean,
  deps: unknown[],
): void {
  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    const refresh = () => {
      load()
        .then((value) => {
          if (!cancelled) setResult(value)
        })
        .catch((error) => console.error('Failed to load live level results', error))
    }
    refresh()

    const unsubscribe = levelResultRepository.subscribeToChanges(refresh)
    return () => {
      cancelled = true
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
