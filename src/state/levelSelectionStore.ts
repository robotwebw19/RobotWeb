import { create } from 'zustand'
import { seedLevels } from '../data/seedLevels'

interface LevelSelectionState {
  selectedLevelId: string
  selectLevel: (id: string) => void
}

export const useLevelSelectionStore = create<LevelSelectionState>((set) => ({
  selectedLevelId: seedLevels[0].id,
  selectLevel: (id) => set({ selectedLevelId: id }),
}))
