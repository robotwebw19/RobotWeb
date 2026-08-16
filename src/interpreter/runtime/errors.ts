export class ParseError extends Error {
  line: number

  constructor(message: string, line: number) {
    super(message)
    this.name = 'ParseError'
    this.line = line
  }
}

export class RuntimeError extends Error {
  line?: number

  constructor(message: string, line?: number) {
    super(message)
    this.name = 'RuntimeError'
    this.line = line
  }
}
