import { lazy, Suspense } from 'react'
import { ConsolePanel } from '../code/ConsolePanel'
import type { CodeError, ConsoleLine } from '../../hooks/useInterpreterConsole'
import styles from './RightPanel.module.css'

// Monaco is the single largest chunk in the app (~2.6MB) — deferring it behind React.lazy lets
// the rest of MainAppPage (canvas, level list, controls) render and become interactive first,
// instead of blocking the whole page on Monaco's download/parse.
const CodeEditor = lazy(() => import('../code/CodeEditor').then((m) => ({ default: m.CodeEditor })))

interface RightPanelProps {
  sourceCode: string
  onSourceCodeChange: (code: string) => void
  consoleLines: ConsoleLine[]
  codeError: CodeError | null
}

export function RightPanel({ sourceCode, onSourceCodeChange, consoleLines, codeError }: RightPanelProps) {
  return (
    <div className={styles.panel}>
      <Suspense fallback={<div className={styles.editorFallback} />}>
        <CodeEditor value={sourceCode} onChange={onSourceCodeChange} error={codeError} />
      </Suspense>
      <ConsolePanel lines={consoleLines} />
    </div>
  )
}
