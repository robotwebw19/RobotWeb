import Editor, { type OnMount } from '@monaco-editor/react'
import { useEffect, useRef } from 'react'
import type { editor as MonacoEditorNamespace } from 'monaco-editor'
import type { CodeError } from '../../hooks/useInterpreterConsole'
import styles from './CodeEditor.module.css'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  error: CodeError | null
}

type EditorInstance = Parameters<OnMount>[0]
type MonacoInstance = Parameters<OnMount>[1]

const MARKER_OWNER = 'arduino-subset'

export function CodeEditor({ value, onChange, error }: CodeEditorProps) {
  const editorRef = useRef<EditorInstance | null>(null)
  const monacoRef = useRef<MonacoInstance | null>(null)

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
  }

  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    const model = editor?.getModel()
    if (!monaco || !model) return

    const markers: MonacoEditorNamespace.IMarkerData[] = error
      ? [
          {
            startLineNumber: error.line,
            endLineNumber: error.line,
            startColumn: 1,
            endColumn: model.getLineMaxColumn(error.line),
            message: error.message,
            severity: monaco.MarkerSeverity.Error,
          },
        ]
      : []
    monaco.editor.setModelMarkers(model, MARKER_OWNER, markers)
  }, [error])

  return (
    <div className={styles.editor}>
      <Editor
        height="100%"
        language="cpp"
        theme="vs-dark"
        value={value}
        onChange={(newValue) => onChange(newValue ?? '')}
        onMount={handleMount}
        options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
      />
    </div>
  )
}
