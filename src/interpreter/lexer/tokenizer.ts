import type { Token } from '../../types/interpreter'
import { ParseError } from '../runtime/errors'

const KEYWORDS = new Set([
  'void',
  'if',
  'else',
  'for',
  'while',
  'int',
  'float',
  'bool',
  'string',
  'true',
  'false',
  'return',
])

const MULTI_CHAR_OPERATORS = ['==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/=', '++', '--']
const SINGLE_CHAR_OPERATORS = new Set(['+', '-', '*', '/', '%', '=', '<', '>', '!'])
const PUNCTUATION = new Set(['{', '}', '(', ')', ';', ',', '.'])

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}

function isIdentifierStart(ch: string): boolean {
  return /[A-Za-z_]/.test(ch)
}

function isIdentifierPart(ch: string): boolean {
  return /[A-Za-z0-9_]/.test(ch)
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let pos = 0
  let line = 1
  let col = 1

  function peek(offset = 0): string {
    return source[pos + offset] ?? ''
  }

  function advance(): string {
    const ch = source[pos]
    pos++
    if (ch === '\n') {
      line++
      col = 1
    } else {
      col++
    }
    return ch
  }

  while (pos < source.length) {
    const ch = peek()

    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      advance()
      continue
    }

    if (ch === '/' && peek(1) === '/') {
      while (pos < source.length && peek() !== '\n') advance()
      continue
    }

    if (ch === '/' && peek(1) === '*') {
      advance()
      advance()
      while (pos < source.length && !(peek() === '*' && peek(1) === '/')) advance()
      if (pos >= source.length) {
        throw new ParseError('Unterminated block comment', line)
      }
      advance()
      advance()
      continue
    }

    const startLine = line
    const startCol = col

    if (isDigit(ch) || (ch === '.' && isDigit(peek(1)))) {
      let text = ''
      while (isDigit(peek())) text += advance()
      if (peek() === '.') {
        text += advance()
        while (isDigit(peek())) text += advance()
      }
      if (peek() === 'f' || peek() === 'F') advance()
      tokens.push({ type: 'number', value: text, line: startLine, col: startCol })
      continue
    }

    if (isIdentifierStart(ch)) {
      let text = ''
      while (isIdentifierPart(peek())) text += advance()
      tokens.push({
        type: KEYWORDS.has(text) ? 'keyword' : 'identifier',
        value: text,
        line: startLine,
        col: startCol,
      })
      continue
    }

    if (ch === '"') {
      advance()
      let text = ''
      while (pos < source.length && peek() !== '"') {
        if (peek() === '\\') {
          advance()
          const escaped = advance()
          text += escaped === 'n' ? '\n' : escaped
        } else {
          text += advance()
        }
      }
      if (pos >= source.length) {
        throw new ParseError('Unterminated string literal', startLine)
      }
      advance()
      tokens.push({ type: 'string', value: text, line: startLine, col: startCol })
      continue
    }

    const twoChar = ch + peek(1)
    if (MULTI_CHAR_OPERATORS.includes(twoChar)) {
      advance()
      advance()
      tokens.push({ type: 'operator', value: twoChar, line: startLine, col: startCol })
      continue
    }

    if (SINGLE_CHAR_OPERATORS.has(ch)) {
      advance()
      tokens.push({ type: 'operator', value: ch, line: startLine, col: startCol })
      continue
    }

    if (PUNCTUATION.has(ch)) {
      advance()
      tokens.push({ type: 'punctuation', value: ch, line: startLine, col: startCol })
      continue
    }

    throw new ParseError(`Unexpected character "${ch}"`, startLine)
  }

  tokens.push({ type: 'eof', value: '', line, col })
  return tokens
}
