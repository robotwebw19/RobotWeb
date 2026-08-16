import type {
  ColorZone,
  FinishZone,
  Level,
  LevelDifficulty,
  Obstacle,
  ParConditions,
  RequiredEquipmentItem,
  StartPosition,
  Vector2,
} from '../../types/domain'
import { supabase } from '../supabaseClient'
import type { ILevelRepository } from './ILevelRepository'

interface LevelRow {
  id: string
  name: string
  difficulty: LevelDifficulty
  track_path: Vector2[][]
  obstacles: Obstacle[]
  color_zones: ColorZone[]
  start_position: StartPosition
  finish_zone: FinishZone
  time_limit_ms: number
  par_conditions: ParConditions
  created_by: string | null
  solution_code: string | null
  required_equipment: RequiredEquipmentItem[] | null
}

function toDomain(row: LevelRow): Level {
  return {
    id: row.id,
    name: row.name,
    difficulty: row.difficulty,
    trackPath: row.track_path,
    obstacles: row.obstacles,
    colorZones: row.color_zones,
    startPosition: row.start_position,
    finishZone: row.finish_zone,
    timeLimitMs: row.time_limit_ms,
    parConditions: row.par_conditions,
    createdBy: row.created_by ?? undefined,
    solutionCode: row.solution_code ?? undefined,
    requiredEquipment: row.required_equipment ?? undefined,
  }
}

export class SupabaseLevelRepository implements ILevelRepository {
  private readonly seedLevels: Level[]

  constructor(seedLevels: Level[]) {
    this.seedLevels = seedLevels
  }

  async getAll(): Promise<Level[]> {
    const { data, error } = await supabase.from('levels').select('*').order('created_at', { ascending: true })
    if (error) throw error
    return [...this.seedLevels, ...(data ?? []).map(toDomain)]
  }

  async getById(id: string): Promise<Level | undefined> {
    const seed = this.seedLevels.find((level) => level.id === id)
    if (seed) return seed
    const { data, error } = await supabase.from('levels').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? toDomain(data) : undefined
  }

  async saveUserLevel(level: Level): Promise<void> {
    const { error } = await supabase.from('levels').upsert({
      id: level.id,
      name: level.name,
      difficulty: level.difficulty,
      track_path: level.trackPath,
      obstacles: level.obstacles,
      color_zones: level.colorZones,
      start_position: level.startPosition,
      finish_zone: level.finishZone,
      time_limit_ms: level.timeLimitMs,
      par_conditions: level.parConditions,
      created_by: level.createdBy ?? null,
      solution_code: level.solutionCode ?? null,
      required_equipment: level.requiredEquipment ?? null,
    })
    if (error) throw error
  }

  async deleteUserLevel(id: string): Promise<void> {
    const { error } = await supabase.from('levels').delete().eq('id', id)
    if (error) throw error
  }
}
