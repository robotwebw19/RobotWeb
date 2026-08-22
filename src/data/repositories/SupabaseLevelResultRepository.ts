import type { LevelResult } from '../../types/domain'
import { supabase } from '../supabaseClient'
import type { ILevelResultRepository } from './ILevelResultRepository'

interface LevelResultRow {
  student_id: string
  level_id: string
  completion_time_ms: number
  stars: 0 | 1 | 2 | 3
  passed: boolean
  submitted_at: string
}

function toDomain(row: LevelResultRow): LevelResult {
  return {
    studentId: row.student_id,
    levelId: row.level_id,
    completionTimeMs: row.completion_time_ms,
    stars: row.stars,
    passed: row.passed,
    submittedAt: row.submitted_at,
  }
}

/**
 * Only `LevelRuntime`'s internal LevelCompleteEvent handler (see sim/engine/LevelRuntime.ts,
 * built in M8) is meant to call `save()`. That's the anti-cheat boundary: a result can only be
 * produced by an actual completed simulation run, not by an arbitrary caller.
 */
export class SupabaseLevelResultRepository implements ILevelResultRepository {
  async getForLevel(levelId: string): Promise<LevelResult[]> {
    const { data, error } = await supabase.from('level_results').select('*').eq('level_id', levelId)
    if (error) throw error
    return (data ?? []).map(toDomain)
  }

  async getForUser(studentId: string): Promise<LevelResult[]> {
    const { data, error } = await supabase.from('level_results').select('*').eq('student_id', studentId)
    if (error) throw error
    return (data ?? []).map(toDomain)
  }

  async getBestForUserLevel(studentId: string, levelId: string): Promise<LevelResult | undefined> {
    const { data, error } = await supabase
      .from('level_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('level_id', levelId)
      .eq('passed', true)
      .order('completion_time_ms', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data ? toDomain(data) : undefined
  }

  async save(result: LevelResult): Promise<void> {
    const { error } = await supabase.from('level_results').insert({
      student_id: result.studentId,
      level_id: result.levelId,
      completion_time_ms: Math.round(result.completionTimeMs),
      stars: result.stars,
      passed: result.passed,
      submitted_at: result.submittedAt,
    })
    if (error) throw error
  }

  async resetForLevel(levelId: string): Promise<void> {
    const { error } = await supabase.from('level_results').delete().eq('level_id', levelId)
    if (error) throw error
  }

  subscribeToChanges(onChange: () => void): () => void {
    // Debounced: a burst of near-simultaneous writes (e.g. a class finishing a level at once)
    // should trigger one refetch per subscriber, not one per row inserted.
    let debounceTimer: ReturnType<typeof setTimeout> | undefined
    const debouncedOnChange = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(onChange, 300)
    }

    const channel = supabase
      .channel('level_results_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'level_results' }, debouncedOnChange)
      .subscribe()
    return () => {
      clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }
}
