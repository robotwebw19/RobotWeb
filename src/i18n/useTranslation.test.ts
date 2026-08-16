import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTranslation } from './useTranslation'

describe('useTranslation', () => {
  it('always returns the Thai string — the site is Thai-only, no language toggle', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.t('run.run')).toBe('รัน')
    expect(result.current.language).toBe('th')
  })

  it('interpolates variables into the template', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.t('result.time', { time: '4.2' })).toBe('เวลา: 4.2 วินาที')
  })

  it('tLevelName translates a known seed level and falls back for unknown/user-created ids', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.tLevelName('level-01-straight', 'ignored')).toBe('1. เส้นตรง')
    expect(result.current.tLevelName('user-xyz', 'My Custom Level')).toBe('My Custom Level')
  })
})
