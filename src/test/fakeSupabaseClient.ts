/**
 * Minimal in-memory stand-in for the supabase-js query builder, covering only the chain shapes
 * the Supabase*Repository classes actually use (select/eq/order/limit/maybeSingle, plus
 * upsert/insert/update/delete). Registered globally in test/setup.ts via vi.mock so repository
 * (and anything built on top of them) tests run against isolated in-memory tables instead of a
 * real network — the same role jsdom's localStorage played before the Supabase migration.
 */

type Row = Record<string, unknown>

const PRIMARY_KEYS: Record<string, string[]> = {
  users: ['student_id'],
  levels: ['id'],
  user_code: ['student_id', 'level_id'],
  level_results: ['id'],
}

const tables: Record<string, Row[]> = {}
let nextId = 1

export function resetFakeSupabase(): void {
  for (const key of Object.keys(tables)) delete tables[key]
  nextId = 1
}

function getTable(name: string): Row[] {
  if (!tables[name]) tables[name] = []
  return tables[name]
}

interface Filter {
  column: string
  value: unknown
}

type Op = 'select' | 'upsert' | 'insert' | 'update' | 'delete'

class FakeQuery implements PromiseLike<{ data: unknown; error: null }> {
  private filters: Filter[] = []
  private orderBy: { column: string; ascending: boolean } | null = null
  private limitCount: number | null = null
  private wantSingle = false

  private table: string
  private op: Op
  private payload?: Row | Row[]

  constructor(table: string, op: Op, payload?: Row | Row[]) {
    this.table = table
    this.op = op
    this.payload = payload
  }

  select(): this {
    return this
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ column, value })
    return this
  }

  order(column: string, opts?: { ascending?: boolean }): this {
    this.orderBy = { column, ascending: opts?.ascending ?? true }
    return this
  }

  limit(n: number): this {
    this.limitCount = n
    return this
  }

  maybeSingle(): this {
    this.wantSingle = true
    return this
  }

  private matches(row: Row): boolean {
    return this.filters.every((f) => row[f.column] === f.value)
  }

  private execute(): { data: unknown; error: null } {
    const table = getTable(this.table)
    const pk = PRIMARY_KEYS[this.table] ?? []

    if (this.op === 'select') {
      let rows = table.filter((r) => this.matches(r))
      if (this.orderBy) {
        const { column, ascending } = this.orderBy
        rows = [...rows].sort((a, b) => {
          const av = a[column] as string | number
          const bv = b[column] as string | number
          const cmp = av > bv ? 1 : av < bv ? -1 : 0
          return ascending ? cmp : -cmp
        })
      }
      if (this.limitCount != null) rows = rows.slice(0, this.limitCount)
      return this.wantSingle ? { data: rows[0] ?? null, error: null } : { data: rows, error: null }
    }

    if (this.op === 'upsert') {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row]
      for (const p of payloads) {
        const idx = table.findIndex((r) => pk.every((k) => r[k] === p[k]))
        if (idx >= 0) table[idx] = { ...table[idx], ...p }
        else table.push({ ...p })
      }
      return { data: null, error: null }
    }

    if (this.op === 'insert') {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row]
      for (const p of payloads) table.push({ id: nextId++, ...p })
      return { data: null, error: null }
    }

    if (this.op === 'update') {
      for (const row of table) {
        if (this.matches(row)) Object.assign(row, this.payload)
      }
      return { data: null, error: null }
    }

    // delete
    const remaining = table.filter((r) => !this.matches(r))
    table.length = 0
    table.push(...remaining)
    return { data: null, error: null }
  }

  then<TResult1 = { data: unknown; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected)
  }
}

export const fakeSupabase = {
  from(table: string) {
    return {
      select: () => new FakeQuery(table, 'select'),
      upsert: (payload: Row | Row[]) => new FakeQuery(table, 'upsert', payload),
      insert: (payload: Row | Row[]) => new FakeQuery(table, 'insert', payload),
      update: (payload: Row) => new FakeQuery(table, 'update', payload),
      delete: () => new FakeQuery(table, 'delete'),
    }
  },
}
