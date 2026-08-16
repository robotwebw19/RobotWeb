import { describe, expect, it } from 'vitest'
import { parseProgram } from './parser'
import { ParseError } from '../runtime/errors'

describe('parseProgram', () => {
  it('parses top-level var decls and required setup/loop functions', () => {
    const program = parseProgram(`
      int counter = 0;
      void setup() {
        pinMode(A0, INPUT);
      }
      void loop() {
        counter = counter + 1;
      }
    `)

    expect(program.topLevelVarDecls).toEqual([
      { kind: 'VarDecl', varType: 'int', name: 'counter', init: { kind: 'NumberLiteral', value: 0 }, line: 2 },
    ])
    expect(program.functions.map((f) => f.name)).toEqual(['setup', 'loop'])
    expect(program.functions[0].body).toEqual([
      {
        kind: 'ExprStatement',
        expr: { kind: 'Call', callee: 'pinMode', args: [{ kind: 'Identifier', name: 'A0' }, { kind: 'Identifier', name: 'INPUT' }], line: 4 },
        line: 4,
      },
    ])
  })

  it('requires both setup() and loop()', () => {
    expect(() => parseProgram('void setup() {}')).toThrow(/loop/)
    expect(() => parseProgram('void loop() {}')).toThrow(/setup/)
  })

  it('parses if/else-if/else chains', () => {
    const program = parseProgram(`
      void setup() {}
      void loop() {
        if (x > 0) {
          y = 1;
        } else if (x < 0) {
          y = -1;
        } else {
          y = 0;
        }
      }
    `)
    const ifStmt = program.functions[1].body[0]
    expect(ifStmt.kind).toBe('If')
    if (ifStmt.kind !== 'If') throw new Error('expected If')
    expect(ifStmt.elseBranch?.[0].kind).toBe('If')
  })

  it('parses for-loop clauses including an empty body', () => {
    const program = parseProgram(`
      void setup() {}
      void loop() {
        for (int i = 0; i < 5; i = i + 1) {
          total = total + i;
        }
      }
    `)
    const forStmt = program.functions[1].body[0]
    expect(forStmt.kind).toBe('For')
    if (forStmt.kind !== 'For') throw new Error('expected For')
    expect(forStmt.init?.kind).toBe('VarDecl')
    expect(forStmt.condition).toMatchObject({ kind: 'Binary', operator: '<' })
    expect(forStmt.body).toHaveLength(1)
  })

  it('parses Serial.println member-call syntax', () => {
    const program = parseProgram(`
      void setup() {}
      void loop() {
        Serial.println("hi");
      }
    `)
    const stmt = program.functions[1].body[0]
    expect(stmt).toMatchObject({ kind: 'ExprStatement', expr: { kind: 'Call', callee: 'Serial.println' } })
  })

  it('parses string variable declarations', () => {
    const program = parseProgram(`
      void setup() {}
      void loop() {
        string color = readColorSensor(D8);
      }
    `)
    expect(program.functions[1].body[0]).toMatchObject({ kind: 'VarDecl', varType: 'string', name: 'color' })
  })

  it('respects operator precedence (multiplicative over additive)', () => {
    const program = parseProgram(`
      void setup() {}
      void loop() {
        x = 2 + 3 * 4;
      }
    `)
    const stmt = program.functions[1].body[0]
    expect(stmt).toMatchObject({
      kind: 'Assign',
      value: {
        kind: 'Binary',
        operator: '+',
        left: { kind: 'NumberLiteral', value: 2 },
        right: { kind: 'Binary', operator: '*' },
      },
    })
  })

  it('rejects return statements with a clear message', () => {
    expect(() =>
      parseProgram(`
        void setup() {}
        void loop() { return; }
      `),
    ).toThrow(/return is not supported/)
  })

  it('throws ParseError with line numbers on malformed syntax', () => {
    try {
      parseProgram('void setup() {}\nvoid loop() { x = ; }')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError)
      expect((error as ParseError).line).toBe(2)
    }
  })
})
