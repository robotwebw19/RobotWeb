import type { RuntimeValue } from './ExecutionContext'
import { RuntimeError } from './errors'

export function asNumber(value: RuntimeValue, context: string, line?: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  throw new RuntimeError(`Expected a number for ${context}, got "${value}"`, line)
}

export function asBoolean(value: RuntimeValue): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return value.length > 0
}

export function asString(value: RuntimeValue): string {
  return typeof value === 'string' ? value : String(value)
}
