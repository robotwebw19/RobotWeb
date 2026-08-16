export type TokenType =
  | 'number'
  | 'string'
  | 'identifier'
  | 'keyword'
  | 'punctuation'
  | 'operator'
  | 'eof'

export interface Token {
  type: TokenType
  value: string
  line: number
  col: number
}

// --- AST ---

export type VarType = 'int' | 'float' | 'bool' | 'string'

export interface NumberLiteral {
  kind: 'NumberLiteral'
  value: number
}

export interface BoolLiteral {
  kind: 'BoolLiteral'
  value: boolean
}

export interface StringLiteral {
  kind: 'StringLiteral'
  value: string
}

export interface Identifier {
  kind: 'Identifier'
  name: string
}

export interface Unary {
  kind: 'Unary'
  operator: '-' | '!'
  operand: Expression
}

export interface Binary {
  kind: 'Binary'
  operator: string
  left: Expression
  right: Expression
}

export interface Call {
  kind: 'Call'
  callee: string
  args: Expression[]
  line: number
}

export type Expression = NumberLiteral | BoolLiteral | StringLiteral | Identifier | Unary | Binary | Call

export interface VarDecl {
  kind: 'VarDecl'
  varType: VarType
  name: string
  init: Expression | null
  line: number
}

export interface Assign {
  kind: 'Assign'
  name: string
  operator: '=' | '+=' | '-=' | '*=' | '/='
  value: Expression
  line: number
}

export interface Postfix {
  kind: 'Postfix'
  name: string
  operator: '++' | '--'
  line: number
}

export interface ExprStatement {
  kind: 'ExprStatement'
  expr: Expression
  line: number
}

export interface If {
  kind: 'If'
  condition: Expression
  thenBranch: Statement[]
  elseBranch: Statement[] | null
  line: number
}

export interface While {
  kind: 'While'
  condition: Expression
  body: Statement[]
  line: number
}

export interface For {
  kind: 'For'
  init: Statement | null
  condition: Expression | null
  update: Statement | null
  body: Statement[]
  line: number
}

export type Statement = VarDecl | Assign | Postfix | ExprStatement | If | While | For

export interface FunctionDecl {
  kind: 'FunctionDecl'
  name: string
  body: Statement[]
  line: number
}

export interface Program {
  topLevelVarDecls: VarDecl[]
  functions: FunctionDecl[]
}
