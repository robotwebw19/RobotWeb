import type {
  Assign,
  Expression,
  For,
  FunctionDecl,
  If,
  Postfix,
  Program,
  Statement,
  Token,
  VarDecl,
  VarType,
  While,
} from '../../types/interpreter'
import { tokenize } from '../lexer/tokenizer'
import { ParseError } from '../runtime/errors'

const ASSIGN_OPERATORS = new Set(['=', '+=', '-=', '*=', '/='])

class Parser {
  private tokens: Token[]
  private pos = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)]
  }

  private advance(): Token {
    const token = this.tokens[this.pos]
    if (this.pos < this.tokens.length - 1) this.pos++
    return token
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'eof'
  }

  private check(type: Token['type'], value?: string): boolean {
    const token = this.peek()
    return token.type === type && (value === undefined || token.value === value)
  }

  private checkOneOf(type: Token['type'], values: string[]): boolean {
    const token = this.peek()
    return token.type === type && values.includes(token.value)
  }

  private expect(type: Token['type']): Token {
    if (!this.check(type)) {
      const token = this.peek()
      throw new ParseError(`Expected ${type} but found "${token.value || token.type}"`, token.line)
    }
    return this.advance()
  }

  private expectPunct(value: string): Token {
    if (!this.check('punctuation', value)) {
      const token = this.peek()
      throw new ParseError(`Expected "${value}" but found "${token.value || token.type}"`, token.line)
    }
    return this.advance()
  }

  parseProgram(): Program {
    const topLevelVarDecls: VarDecl[] = []
    const functions: FunctionDecl[] = []

    while (!this.isAtEnd()) {
      if (this.check('keyword', 'void')) {
        functions.push(this.parseFunctionDecl())
      } else if (this.checkOneOf('keyword', ['int', 'float', 'bool', 'string'])) {
        const decl = this.parseVarDecl()
        this.expectPunct(';')
        topLevelVarDecls.push(decl)
      } else {
        const token = this.peek()
        throw new ParseError(`Unexpected top-level token "${token.value}"`, token.line)
      }
    }

    if (!functions.some((fn) => fn.name === 'setup')) {
      throw new ParseError('Missing required function: void setup()', 1)
    }
    if (!functions.some((fn) => fn.name === 'loop')) {
      throw new ParseError('Missing required function: void loop()', 1)
    }

    return { topLevelVarDecls, functions }
  }

  private parseFunctionDecl(): FunctionDecl {
    const voidToken = this.advance() // 'void'
    const nameToken = this.expect('identifier')
    this.expectPunct('(')
    this.expectPunct(')')
    const body = this.parseBlock()
    return { kind: 'FunctionDecl', name: nameToken.value, body, line: voidToken.line }
  }

  private parseBlock(): Statement[] {
    this.expectPunct('{')
    const statements: Statement[] = []
    while (!this.check('punctuation', '}') && !this.isAtEnd()) {
      statements.push(this.parseStatement())
    }
    this.expectPunct('}')
    return statements
  }

  private parseStatement(): Statement {
    if (this.check('keyword', 'if')) return this.parseIf()
    if (this.check('keyword', 'while')) return this.parseWhile()
    if (this.check('keyword', 'for')) return this.parseFor()
    const stmt = this.parseSimpleStatement()
    this.expectPunct(';')
    return stmt
  }

  /** A statement with no trailing semicolon consumed — shared by regular statements and for-loop clauses. */
  private parseSimpleStatement(): Statement {
    const token = this.peek()

    if (
      token.type === 'keyword' &&
      (token.value === 'int' || token.value === 'float' || token.value === 'bool' || token.value === 'string')
    ) {
      return this.parseVarDecl()
    }

    if (token.type === 'keyword' && token.value === 'return') {
      throw new ParseError(
        'return is not supported in this Arduino subset — setup()/loop() run to the end of their body',
        token.line,
      )
    }

    if (token.type === 'identifier') {
      const next = this.peek(1)
      if (next.type === 'operator' && ASSIGN_OPERATORS.has(next.value)) {
        return this.parseAssign()
      }
      if (next.type === 'operator' && (next.value === '++' || next.value === '--')) {
        return this.parsePostfix()
      }
      const line = token.line
      const expr = this.parseExpression()
      return { kind: 'ExprStatement', expr, line }
    }

    throw new ParseError(`Unexpected token "${token.value}"`, token.line)
  }

  private parseVarDecl(): VarDecl {
    const typeToken = this.advance() // int | float | bool
    const nameToken = this.expect('identifier')
    let init: Expression | null = null
    if (this.check('operator', '=')) {
      this.advance()
      init = this.parseExpression()
    }
    return { kind: 'VarDecl', varType: typeToken.value as VarType, name: nameToken.value, init, line: typeToken.line }
  }

  private parseAssign(): Assign {
    const nameToken = this.expect('identifier')
    const opToken = this.advance()
    const value = this.parseExpression()
    return {
      kind: 'Assign',
      name: nameToken.value,
      operator: opToken.value as Assign['operator'],
      value,
      line: nameToken.line,
    }
  }

  private parsePostfix(): Postfix {
    const nameToken = this.expect('identifier')
    const opToken = this.advance()
    return { kind: 'Postfix', name: nameToken.value, operator: opToken.value as Postfix['operator'], line: nameToken.line }
  }

  private parseIf(): If {
    const ifToken = this.advance() // 'if'
    this.expectPunct('(')
    const condition = this.parseExpression()
    this.expectPunct(')')
    const thenBranch = this.parseBlock()
    let elseBranch: Statement[] | null = null
    if (this.check('keyword', 'else')) {
      this.advance()
      elseBranch = this.check('keyword', 'if') ? [this.parseIf()] : this.parseBlock()
    }
    return { kind: 'If', condition, thenBranch, elseBranch, line: ifToken.line }
  }

  private parseWhile(): While {
    const whileToken = this.advance()
    this.expectPunct('(')
    const condition = this.parseExpression()
    this.expectPunct(')')
    const body = this.parseBlock()
    return { kind: 'While', condition, body, line: whileToken.line }
  }

  private parseFor(): For {
    const forToken = this.advance()
    this.expectPunct('(')

    let init: Statement | null = null
    if (!this.check('punctuation', ';')) init = this.parseSimpleStatement()
    this.expectPunct(';')

    let condition: Expression | null = null
    if (!this.check('punctuation', ';')) condition = this.parseExpression()
    this.expectPunct(';')

    let update: Statement | null = null
    if (!this.check('punctuation', ')')) update = this.parseSimpleStatement()
    this.expectPunct(')')

    const body = this.parseBlock()
    return { kind: 'For', init, condition, update, body, line: forToken.line }
  }

  private parseExpression(): Expression {
    return this.parseLogicalOr()
  }

  private parseLogicalOr(): Expression {
    let left = this.parseLogicalAnd()
    while (this.check('operator', '||')) {
      const operator = this.advance().value
      const right = this.parseLogicalAnd()
      left = { kind: 'Binary', operator, left, right }
    }
    return left
  }

  private parseLogicalAnd(): Expression {
    let left = this.parseEquality()
    while (this.check('operator', '&&')) {
      const operator = this.advance().value
      const right = this.parseEquality()
      left = { kind: 'Binary', operator, left, right }
    }
    return left
  }

  private parseEquality(): Expression {
    let left = this.parseRelational()
    while (this.checkOneOf('operator', ['==', '!='])) {
      const operator = this.advance().value
      const right = this.parseRelational()
      left = { kind: 'Binary', operator, left, right }
    }
    return left
  }

  private parseRelational(): Expression {
    let left = this.parseAdditive()
    while (this.checkOneOf('operator', ['<', '<=', '>', '>='])) {
      const operator = this.advance().value
      const right = this.parseAdditive()
      left = { kind: 'Binary', operator, left, right }
    }
    return left
  }

  private parseAdditive(): Expression {
    let left = this.parseMultiplicative()
    while (this.checkOneOf('operator', ['+', '-'])) {
      const operator = this.advance().value
      const right = this.parseMultiplicative()
      left = { kind: 'Binary', operator, left, right }
    }
    return left
  }

  private parseMultiplicative(): Expression {
    let left = this.parseUnary()
    while (this.checkOneOf('operator', ['*', '/', '%'])) {
      const operator = this.advance().value
      const right = this.parseUnary()
      left = { kind: 'Binary', operator, left, right }
    }
    return left
  }

  private parseUnary(): Expression {
    if (this.checkOneOf('operator', ['-', '!'])) {
      const operator = this.advance().value as '-' | '!'
      const operand = this.parseUnary()
      return { kind: 'Unary', operator, operand }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): Expression {
    const token = this.peek()

    if (token.type === 'number') {
      this.advance()
      return { kind: 'NumberLiteral', value: parseFloat(token.value) }
    }
    if (token.type === 'string') {
      this.advance()
      return { kind: 'StringLiteral', value: token.value }
    }
    if (token.type === 'keyword' && token.value === 'true') {
      this.advance()
      return { kind: 'BoolLiteral', value: true }
    }
    if (token.type === 'keyword' && token.value === 'false') {
      this.advance()
      return { kind: 'BoolLiteral', value: false }
    }
    if (token.type === 'identifier') {
      this.advance()

      // Member-call syntax is only supported for known built-ins like Serial.print(...) —
      // it is parsed here as a single compound callee name, not general property access.
      let calleeName = token.value
      if (this.check('punctuation', '.')) {
        this.advance()
        const memberToken = this.expect('identifier')
        calleeName = `${token.value}.${memberToken.value}`
      }

      if (this.check('punctuation', '(')) {
        this.advance()
        const args: Expression[] = []
        if (!this.check('punctuation', ')')) {
          args.push(this.parseExpression())
          while (this.check('punctuation', ',')) {
            this.advance()
            args.push(this.parseExpression())
          }
        }
        this.expectPunct(')')
        return { kind: 'Call', callee: calleeName, args, line: token.line }
      }

      if (calleeName !== token.value) {
        throw new ParseError(`Unsupported member access "${calleeName}" (only known built-in calls are supported)`, token.line)
      }
      return { kind: 'Identifier', name: token.value }
    }
    if (token.type === 'punctuation' && token.value === '(') {
      this.advance()
      const expr = this.parseExpression()
      this.expectPunct(')')
      return expr
    }

    throw new ParseError(`Unexpected token "${token.value}" in expression`, token.line)
  }
}

export function parseProgram(source: string): Program {
  const tokens = tokenize(source)
  return new Parser(tokens).parseProgram()
}
