import type { Assign, Program, Statement, Expression, VarType } from '../../types/interpreter'
import { ExecutionContext, type RuntimeValue } from './ExecutionContext'
import type { ArduinoRuntimeAPI } from './ArduinoRuntimeAPI'
import { RuntimeError } from './errors'
import { asBoolean, asNumber, asString } from './values'

export type StepResult = 'ok' | 'waiting' | 'iteration-complete'

function defaultValueForType(varType: VarType): RuntimeValue {
  if (varType === 'bool') return false
  if (varType === 'string') return ''
  return 0
}

/**
 * Generator-based tree-walking executor. One `yield` = one executed top-level Arduino statement
 * (or one loop-control iteration boundary, see the While/For cases — that extra yield point is
 * what keeps an empty-body `while(true){}` from hanging step()/the browser tab forever, since it
 * would otherwise never reach a leaf-statement yield).
 *
 * setup() runs once; loop() re-runs indefinitely — see `step()`. The driver (SimulationLoop, via
 * hooks/useInterpreterConsole.ts) calls `step()` up to a bounded number of times per animation
 * frame, so control always returns to the browser regardless of program content.
 */
export class Interpreter {
  private readonly program: Program
  private readonly api: ArduinoRuntimeAPI
  private readonly context: ExecutionContext
  private setupCompleted = false
  private currentGenerator: Generator<void, void, void> | null = null
  private currentLine = 0

  constructor(program: Program, api: ArduinoRuntimeAPI) {
    this.program = program
    this.api = api
    this.context = new ExecutionContext()
    for (const decl of program.topLevelVarDecls) {
      const value = decl.init ? this.evalExpr(decl.init) : defaultValueForType(decl.varType)
      this.context.declare(decl.name, value)
    }
  }

  getCurrentLine(): number {
    return this.currentLine
  }

  isWaitingOnDelay(): boolean {
    return this.context.waitUntilSimMs !== null
  }

  getDelayRemainingMs(elapsedMs: number): number {
    return this.context.waitUntilSimMs === null ? 0 : Math.max(0, this.context.waitUntilSimMs - elapsedMs)
  }

  /** Called whenever the sim clock advances, so a pending delay() can clear once its time has passed. */
  notifyElapsed(elapsedMs: number): void {
    if (this.context.waitUntilSimMs !== null && elapsedMs >= this.context.waitUntilSimMs) {
      this.context.waitUntilSimMs = null
    }
  }

  /** Executes exactly one leaf statement (see class doc), or reports a pending delay()/finished iteration. */
  step(): StepResult {
    if (this.context.waitUntilSimMs !== null) return 'waiting'

    if (!this.currentGenerator) {
      const fnName = this.setupCompleted ? 'loop' : 'setup'
      if (fnName === 'loop') this.context.resetStatementCounter()
      this.currentGenerator = this.runFunction(fnName)
    }

    const result = this.currentGenerator.next()
    if (result.done) {
      this.currentGenerator = null
      this.setupCompleted = true
      return 'iteration-complete'
    }
    return 'ok'
  }

  private *runFunction(name: string): Generator<void, void, void> {
    const fn = this.program.functions.find((candidate) => candidate.name === name)
    if (!fn) throw new RuntimeError(`Missing function ${name}()`)
    yield* this.execBlock(fn.body)
  }

  private *execBlock(statements: Statement[]): Generator<void, void, void> {
    this.context.pushScope()
    try {
      for (const stmt of statements) {
        yield* this.execStatement(stmt)
      }
    } finally {
      this.context.popScope()
    }
  }

  private *execStatement(stmt: Statement): Generator<void, void, void> {
    this.currentLine = stmt.line

    switch (stmt.kind) {
      case 'VarDecl': {
        const value = stmt.init ? this.evalExpr(stmt.init) : defaultValueForType(stmt.varType)
        this.context.declare(stmt.name, value)
        this.context.countStatement(stmt.line)
        yield
        return
      }
      case 'Assign': {
        const value = this.computeAssignValue(stmt)
        this.context.assign(stmt.name, value, stmt.line)
        this.context.countStatement(stmt.line)
        yield
        return
      }
      case 'Postfix': {
        const current = asNumber(this.context.get(stmt.name, stmt.line), stmt.name, stmt.line)
        this.context.assign(stmt.name, current + (stmt.operator === '++' ? 1 : -1), stmt.line)
        this.context.countStatement(stmt.line)
        yield
        return
      }
      case 'ExprStatement': {
        this.evalExpr(stmt.expr)
        this.context.countStatement(stmt.line)
        yield
        return
      }
      case 'If': {
        const branch = asBoolean(this.evalExpr(stmt.condition)) ? stmt.thenBranch : stmt.elseBranch
        if (branch) yield* this.execBlock(branch)
        return
      }
      case 'While': {
        while (asBoolean(this.evalExpr(stmt.condition))) {
          yield* this.execBlock(stmt.body)
          this.context.countStatement(stmt.line)
          yield
        }
        return
      }
      case 'For': {
        this.context.pushScope()
        try {
          if (stmt.init) yield* this.execStatement(stmt.init)
          while (stmt.condition ? asBoolean(this.evalExpr(stmt.condition)) : true) {
            yield* this.execBlock(stmt.body)
            if (stmt.update) yield* this.execStatement(stmt.update)
            this.context.countStatement(stmt.line)
            yield
          }
        } finally {
          this.context.popScope()
        }
        return
      }
    }
  }

  private computeAssignValue(stmt: Assign): RuntimeValue {
    const rhs = this.evalExpr(stmt.value)
    if (stmt.operator === '=') return rhs

    const current = this.context.get(stmt.name, stmt.line)
    switch (stmt.operator) {
      case '+=':
        return typeof current === 'string' || typeof rhs === 'string'
          ? asString(current) + asString(rhs)
          : asNumber(current, '+=', stmt.line) + asNumber(rhs, '+=', stmt.line)
      case '-=':
        return asNumber(current, '-=', stmt.line) - asNumber(rhs, '-=', stmt.line)
      case '*=':
        return asNumber(current, '*=', stmt.line) * asNumber(rhs, '*=', stmt.line)
      case '/=': {
        const divisor = asNumber(rhs, '/=', stmt.line)
        if (divisor === 0) throw new RuntimeError('Division by zero', stmt.line)
        return asNumber(current, '/=', stmt.line) / divisor
      }
    }
  }

  private evalExpr(expr: Expression): RuntimeValue {
    switch (expr.kind) {
      case 'NumberLiteral':
        return expr.value
      case 'BoolLiteral':
        return expr.value
      case 'StringLiteral':
        return expr.value
      case 'Identifier':
        return this.context.get(expr.name)
      case 'Unary': {
        const operand = this.evalExpr(expr.operand)
        return expr.operator === '-' ? -asNumber(operand, 'unary -') : !asBoolean(operand)
      }
      case 'Binary':
        return this.evalBinary(expr.operator, expr.left, expr.right)
      case 'Call':
        return this.api.call(expr.callee, expr.args.map((arg) => this.evalExpr(arg)), this.context, expr.line)
    }
  }

  private evalBinary(operator: string, leftExpr: Expression, rightExpr: Expression): RuntimeValue {
    if (operator === '&&') return asBoolean(this.evalExpr(leftExpr)) && asBoolean(this.evalExpr(rightExpr))
    if (operator === '||') return asBoolean(this.evalExpr(leftExpr)) || asBoolean(this.evalExpr(rightExpr))

    const left = this.evalExpr(leftExpr)
    const right = this.evalExpr(rightExpr)

    switch (operator) {
      case '+':
        return typeof left === 'string' || typeof right === 'string'
          ? asString(left) + asString(right)
          : asNumber(left, '+') + asNumber(right, '+')
      case '-':
        return asNumber(left, '-') - asNumber(right, '-')
      case '*':
        return asNumber(left, '*') * asNumber(right, '*')
      case '/': {
        const divisor = asNumber(right, '/')
        if (divisor === 0) throw new RuntimeError('Division by zero')
        return asNumber(left, '/') / divisor
      }
      case '%': {
        const divisor = asNumber(right, '%')
        if (divisor === 0) throw new RuntimeError('Division by zero')
        return asNumber(left, '%') % divisor
      }
      case '<':
        return asNumber(left, '<') < asNumber(right, '<')
      case '<=':
        return asNumber(left, '<=') <= asNumber(right, '<=')
      case '>':
        return asNumber(left, '>') > asNumber(right, '>')
      case '>=':
        return asNumber(left, '>=') >= asNumber(right, '>=')
      case '==':
        return this.valuesEqual(left, right)
      case '!=':
        return !this.valuesEqual(left, right)
      default:
        throw new RuntimeError(`Unsupported operator "${operator}"`)
    }
  }

  private valuesEqual(left: RuntimeValue, right: RuntimeValue): boolean {
    if (typeof left === typeof right) return left === right
    if (typeof left !== 'string' && typeof right !== 'string') {
      return asNumber(left, '==') === asNumber(right, '==')
    }
    return false
  }
}
