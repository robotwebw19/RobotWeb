import { useEffect } from 'react'
import { levelResultRepository } from '../data'

/**
 * Runs `load` once, then again every time any level result is saved anywhere, passing the
 * resolved value to `setResult` — the realtime-refetch wiring for views where another student's
 * change matters (the leaderboards, admin student list, admin race-track scores). Skips entirely
 * while `enabled` is false.
 *
 * A view of only the logged-in student's own data (profile stats, their own level list) doesn't
 * need this — nobody else's save affects what it shows — see `useOwnLevelResults` instead.
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

/**
 * Like `useLiveLevelResults`, but without the realtime subscription — for a view of only the
 * logged-in student's own data, where a same-tab signal already covers the one case that matters
 * (their own just-saved result; see state/levelResultsStore.ts's resultsVersion bump). Skipping
 * the subscription here means one fewer classroom-wide `level_results` realtime channel open per
 * student browser tab, for updates this view was never going to react to anyway.
 */
export function useOwnLevelResults<T>(
  load: () => Promise<T>,
  setResult: (value: T) => void,
  enabled: boolean,
  deps: unknown[],
): void {
  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    load()
      .then((value) => {
        if (!cancelled) setResult(value)
      })
      .catch((error) => console.error('Failed to load level results', error))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
