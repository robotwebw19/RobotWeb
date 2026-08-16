import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { fakeSupabase, resetFakeSupabase } from './fakeSupabaseClient'

vi.mock('../data/supabaseClient', () => ({ supabase: fakeSupabase }))

afterEach(() => {
  resetFakeSupabase()
})
