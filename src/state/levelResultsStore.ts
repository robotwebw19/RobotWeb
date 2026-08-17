import { create } from 'zustand'

interface LevelResultsState {
  /** Bumped whenever a level result is saved locally, so the level board's best-score
   * panel can refresh immediately without waiting on the realtime DB subscription. */
  resultsVersion: number
  bumpResultsVersion: () => void
}

export const useLevelResultsStore = create<LevelResultsState>((set) => ({
  resultsVersion: 0,
  bumpResultsVersion: () => set((state) => ({ resultsVersion: state.resultsVersion + 1 })),
}))
