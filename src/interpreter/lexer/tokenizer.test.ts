import { describe, expect, it } from 'vitest'
import { tokenize } from './tokenizer'
import { ParseError } from '../runtime/errors'

describe('tokenize', () => {
  it('tokenizes keywords, identifiers, numbers, and punctuation', () => {
    const tokens = tokenize('void setup() { int x = 12.5; }')
    expect(tokens.map((t) => [t.type, t.value])).toEqual([
      ['keyword', 'void'],
      ['identifier', 'setup'],
      ['punctuation', '('],
      ['punctuation', ')'],
      ['punctuation', '{'],
      ['keyword', 'int'],
      ['identifier', 'x'],
      ['operator', '='],
      ['number', '12.5'],
      ['punctuation', ';'],
      ['punctuation', '}'],
      ['eof', ''],
    ])
  })

  it('tracks line numbers across newlines', () => {
    const tokens = tokenize('int a;\nint b;')
    const bToken = tokens.find((t) => t.value === 'b')
    expect(bToken?.line).toBe(2)
  })

  it('strips line and block comments', () => {
    const tokens = tokenize('int a; // comment\n/* block\ncomment */ int b;')
    expect(tokens.map((t) => t.value)).toEqual(['int', 'a', ';', 'int', 'b', ';', ''])
  })

  it('parses multi-character operators greedily', () => {
    const tokens = tokenize('a == b && c != d')
    expect(tokens.map((t) => t.value)).toEqual(['a', '==', 'b', '&&', 'c', '!=', 'd', ''])
  })

  it('parses string literals with escapes', () => {
    const tokens = tokenize('"hello \\"world\\""')
    expect(tokens[0]).toMatchObject({ type: 'string', value: 'hello "world"' })
  })

  it('throws a ParseError with a line number for an unterminated string', () => {
    expect(() => tokenize('"unterminated')).toThrow(ParseError)
  })

  it('throws a ParseError for an unrecognized character', () => {
    expect(() => tokenize('int a = 1 @ 2;')).toThrow(ParseError)
  })

  it('tokenizes member-access dot for Serial.println', () => {
    const tokens = tokenize('Serial.println(1);')
    expect(tokens.map((t) => t.value)).toEqual(['Serial', '.', 'println', '(', '1', ')', ';', ''])
  })
})
