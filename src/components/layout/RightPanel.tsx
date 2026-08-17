import { CodeEditor } from '../code/CodeEditor'
import { ConsolePanel } from '../code/ConsolePanel'
import type { CodeError, ConsoleLine } from '../../hooks/useInterpreterConsole'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './RightPanel.module.css'

interface RightPanelProps {
  sourceCode: string
  onSourceCodeChange: (code: string) => void
  consoleLines: ConsoleLine[]
  codeError: CodeError | null
  onCheckCode: () => void
}

export function RightPanel({ sourceCode, onSourceCodeChange, consoleLines, codeError, onCheckCode }: RightPanelProps) {
  const { t } = useTranslation()
  return (
    <div className={styles.panel}>
      <CodeEditor value={sourceCode} onChange={onSourceCodeChange} error={codeError} />
      <div className={styles.toolbar}>
        <button type="button" className={styles.checkButton} onClick={onCheckCode}>
          {t('code.checkButton')}
        </button>
      </div>
      <ConsolePanel lines={consoleLines} />
    </div>
  )
}
