import { translations, type TranslationKey } from './translations'

const LANGUAGE = 'th' as const

export type TFunction = (key: TranslationKey, vars?: Record<string, string | number>) => string

/** The site is Thai-only — no language toggle. `language` stays here so callers reading it don't need to change. */
export function useTranslation() {
  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    let text: string = translations[key][LANGUAGE]
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replace(`{${name}}`, String(value))
      }
    }
    return text
  }

  /** Looks up a seed level's translated name by id; falls back to `fallbackName` for user-created levels. */
  function tLevelName(levelId: string, fallbackName: string): string {
    const entry = (translations as Record<string, Record<string, string> | undefined>)[`level.${levelId}.name`]
    return entry ? entry[LANGUAGE] : fallbackName
  }

  return { t, tLevelName, language: LANGUAGE }
}
