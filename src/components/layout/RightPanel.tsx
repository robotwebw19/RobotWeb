import { CodeEditor } from '../code/CodeEditor'
import { ConsolePanel } from '../code/ConsolePanel'
import type { CodeError, ConsoleLine } from '../../hooks/useInterpreterConsole'
import styles from './RightPanel.module.css'

interface RightPanelProps {
  sourceCode: string
  onSourceCodeChange: (code: string) => void
  consoleLines: ConsoleLine[]
  codeError: CodeError | null
}

export function RightPanel({ sourceCode, onSourceCodeChange, consoleLines, codeError }: RightPanelProps) {
  return (
    <div className={styles.panel}>
      <CodeEditor value={sourceCode} onChange={onSourceCodeChange} error={codeError} />
      <ConsolePanel lines={consoleLines} />
    </div>
  )
}
