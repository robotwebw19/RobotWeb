import { useEffect } from 'react'
import { supabase } from '../data/supabaseClient'
import { useSimulationStore } from '../state/simulationStore'
import type { User } from '../types/domain'
import {
  RACE_TRACK_BROADCAST_EVENT,
  RACE_TRACK_BROADCAST_INTERVAL_MS,
  raceTrackChannelName,
  type RaceTrackRobotPayload,
} from '../sim/engine/raceTrackChannel'

/**
 * Streams this student's live pose to the admin "สนามแข่ง" (race track) view — see
 * AdminRaceTrackTab.tsx — while they're actually running a level. Broadcast-only (no DB writes):
 * this is ephemeral position data nobody needs after the run ends.
 */
export function useRaceTrackBroadcast(levelId: string, user: User | null): void {
  const status = useSimulationStore((state) => state.simState.status)

  useEffect(() => {
    if (!user || status !== 'running') return
    const { studentId, displayName, firstName, studentNumber } = user

    const channel = supabase.channel(raceTrackChannelName(levelId))

    function broadcast() {
      const simState = useSimulationStore.getState().simState
      const payload: RaceTrackRobotPayload = {
        studentId,
        displayName,
        firstName,
        studentNumber,
        pose: simState.pose,
        status: simState.status,
        elapsedMs: simState.elapsedMs,
      }
      channel.send({ type: 'broadcast', event: RACE_TRACK_BROADCAST_EVENT, payload })
    }

    // Sends before the channel reaches SUBSCRIBED are silently dropped — wait for it.
    let interval: ReturnType<typeof setInterval> | null = null
    channel.subscribe((subscribeStatus) => {
      if (subscribeStatus !== 'SUBSCRIBED') return
      broadcast()
      interval = setInterval(broadcast, RACE_TRACK_BROADCAST_INTERVAL_MS)
    })

    return () => {
      if (interval) clearInterval(interval)
      // One last message with whatever status this run just transitioned to (paused/passed/
      // failed) so the admin view reacts immediately instead of waiting out the stale timeout.
      broadcast()
      supabase.removeChannel(channel)
    }
  }, [levelId, user, status])
}
