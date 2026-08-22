import { useCallback, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import type { MotorConfig, SensorConfig } from '../types/domain'
import { ArduinoRuntimeAPI, Interpreter, ParseError, RuntimeError, parseProgram } from '../interpreter'
import { useSimulationStore } from '../state/simulationStore'
import { MAX_STATEMENTS_PER_FRAME } from '../utils/constants'
import { useTranslation } from '../i18n/useTranslation'

export interface ConsoleLine {
  id: string
  text: string
  level: 'log' | 'error'
}

export interface CodeError {
  line: number
  message: string
}

/**
 * Owns the interpreter instance and console output for the current run. `stepInterpreterBudgeted`
 * is designed to be passed as useSimulation's `onBeforePhysicsTick` — it pumps up to
 * MAX_STATEMENTS_PER_FRAME interpreter statements per tick (bounded, delay-aware) before physics
 * reads motor speeds for that same tick.
 */
export function useInterpreterConsole() {
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([])
  const [codeError, setCodeError] = useState<CodeError | null>(null)
  const interpreterRef = useRef<Interpreter | null>(null)
  const { t } = useTranslation()

  const appendLine = useCallback((text: string, level: ConsoleLine['level']) => {
    setConsoleLines((prev) => [...prev, { id: nanoid(), text, level }])
  }, [])

  const loadProgram = useCallback(
    (sourceCode: string, sensors: SensorConfig[], motors: MotorConfig[]): boolean => {
      setConsoleLines([])
      setCodeError(null)
      try {
        const program = parseProgram(sourceCode)
        const api = new ArduinoRuntimeAPI({
          sensors,
          motors,
          getSensorReadings: () => useSimulationStore.getState().simState.sensorReadings,
          getElapsedMs: () => useSimulationStore.getState().simState.elapsedMs,
          onSerialOutput: (text) => appendLine(text.replace(/\n$/, ''), 'log'),
        })
        interpreterRef.current = new Interpreter(program, api)
        return true
      } catch (error) {
        interpreterRef.current = null
        if (error instanceof ParseError) {
          setCodeError({ line: error.line, message: error.message })
          appendLine(`${t('console.syntaxError', { line: error.line })}: ${error.message}`, 'error')
        } else {
          const message = error instanceof Error ? error.message : String(error)
          appendLine(`${t('console.error')}: ${message}`, 'error')
        }
        return false
      }
    },
    [appendLine, t],
  )

  const clearProgram = useCallback(() => {
    interpreterRef.current = null
    setCodeError(null)
  }, [])

  const stepInterpreterBudgeted = useCallback(
    (currentElapsedMs: number) => {
      const interpreter = interpreterRef.current
      if (!interpreter) return

      interpreter.notifyElapsed(currentElapsedMs)
      try {
        for (let i = 0; i < MAX_STATEMENTS_PER_FRAME; i++) {
          if (interpreter.step() === 'waiting') break
        }
        const { left, right } = interpreter.getMotorSpeeds()
        useSimulationStore.getState().setMotorSpeeds(left, right)
      } catch (error) {
        interpreterRef.current = null
        useSimulationStore.getState().setStatus('paused')
        if (error instanceof RuntimeError) {
          const line = error.line ?? interpreter.getCurrentLine()
          setCodeError({ line, message: error.message })
          appendLine(`${t('console.runtimeError', { line })}: ${error.message}`, 'error')
        } else {
          const message = error instanceof Error ? error.message : String(error)
          appendLine(`${t('console.runtimeError', { line: interpreter.getCurrentLine() })}: ${message}`, 'error')
        }
      }
    },
    [appendLine, t],
  )

  return {
    consoleLines,
    codeError,
    loadProgram,
    clearProgram,
    stepInterpreterBudgeted,
    hasProgram: () => interpreterRef.current !== null,
  }
}
