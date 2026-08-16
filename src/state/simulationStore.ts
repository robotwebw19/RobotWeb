import { create } from 'zustand'
import type { SimState, SimStatus } from '../sim/engine/SimState'
import { createInitialSimState } from '../sim/engine/SimState'
import type { Pose } from '../sim/engine/RobotPhysics'
import type { SimSpeed } from '../sim/engine/SimulationClock'

interface SimulationStoreState {
  simState: SimState
  speed: SimSpeed
  applyPatch: (patch: Partial<SimState>) => void
  setStatus: (status: SimStatus) => void
  setMotorSpeeds: (left: number, right: number) => void
  setSpeed: (speed: SimSpeed) => void
  resetToPose: (startPose: Pose) => void
}

export const useSimulationStore = create<SimulationStoreState>((set) => ({
  simState: createInitialSimState({ x: 0, y: 0, headingDeg: 0 }),
  speed: 1,

  applyPatch: (patch) => set((state) => ({ simState: { ...state.simState, ...patch } })),

  setStatus: (status) => set((state) => ({ simState: { ...state.simState, status } })),

  setMotorSpeeds: (left, right) =>
    set((state) => ({
      simState: { ...state.simState, leftMotorSpeed: left, rightMotorSpeed: right },
    })),

  setSpeed: (speed) => set({ speed }),

  resetToPose: (startPose) => set({ simState: createInitialSimState(startPose) }),
}))
