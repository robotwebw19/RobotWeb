import type { Level } from '../../types/domain'

export class LevelImportError extends Error {
  code: 'invalid-json' | 'invalid-shape'

  constructor(code: 'invalid-json' | 'invalid-shape', message: string) {
    super(message)
    this.name = 'LevelImportError'
    this.code = code
  }
}

function isVector2(value: unknown): value is { x: number; y: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).x === 'number' &&
    typeof (value as Record<string, unknown>).y === 'number'
  )
}

/** Minimal structural check — enough to reject obviously malformed imports with a clear message. */
export function isValidLevelShape(data: unknown): data is Level {
  if (typeof data !== 'object' || data === null) return false
  const level = data as Record<string, unknown>

  if (typeof level.id !== 'string' || typeof level.name !== 'string') return false
  if (!Array.isArray(level.trackPath) || !level.trackPath.every((poly) => Array.isArray(poly) && poly.every(isVector2))) {
    return false
  }
  if (!Array.isArray(level.obstacles) || !Array.isArray(level.colorZones)) return false
  if (!isVector2(level.startPosition) || typeof (level.startPosition as { headingDeg?: unknown }).headingDeg !== 'number') {
    return false
  }
  if (!isVector2(level.finishZone) || typeof (level.finishZone as { radius?: unknown }).radius !== 'number') return false
  if (typeof level.timeLimitMs !== 'number') return false
  if (typeof level.parConditions !== 'object' || level.parConditions === null) return false

  return true
}

export function exportLevelToJson(level: Level): string {
  return JSON.stringify(level, null, 2)
}

export function importLevelFromJson(json: string): Level {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new LevelImportError('invalid-json', 'That file is not valid JSON.')
  }
  if (!isValidLevelShape(parsed)) {
    throw new LevelImportError('invalid-shape', 'That JSON does not look like a level file (missing or malformed fields).')
  }
  return parsed
}
