import { useState } from 'react'
import type { ColorZoneColor } from '../../types/domain'
import { useAuthStore } from '../../state/authStore'
import { EDITOR_FINISH_RADIUS_PX } from '../../utils/constants'
import { LevelEditorCanvas, type EditorLevelDraft, type EditorTool } from './LevelEditorCanvas'
import { LevelEditorToolbar } from './LevelEditorToolbar'
import { TestNowButton } from './TestNowButton'
import { exportLevelToJson, importLevelFromJson, LevelImportError } from './levelSerialization'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './LevelEditor.module.css'

const EMPTY_DRAFT: EditorLevelDraft = {
  name: 'My Level',
  difficulty: 'medium',
  trackPath: [],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 60, y: 60, headingDeg: 0 },
  finishZone: { x: 740, y: 440, radius: EDITOR_FINISH_RADIUS_PX },
  timeLimitMs: 30_000,
  parConditions: { threeStarTimeMs: 10_000, twoStarTimeMs: 18_000, maxOffTrackEventsForThreeStars: 1 },
}

export function LevelEditor() {
  const studentId = useAuthStore((state) => state.user?.studentId ?? '')
  const [draft, setDraft] = useState<EditorLevelDraft>(EMPTY_DRAFT)
  const [tool, setTool] = useState<EditorTool>('brush')
  const [activeColor, setActiveColor] = useState<ColorZoneColor>('red')
  const { t } = useTranslation()

  function handleExport() {
    const json = exportLevelToJson({ ...draft, id: `user-${Date.now()}` })
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${draft.name.replace(/\s+/g, '-').toLowerCase() || 'level'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = importLevelFromJson(String(reader.result))
        const { id: _id, createdBy: _createdBy, ...rest } = imported
        setDraft(rest)
      } catch (error) {
        if (error instanceof LevelImportError) {
          window.alert(t(error.code === 'invalid-json' ? 'editor.importInvalidJson' : 'editor.importNotALevel'))
        } else {
          window.alert(t('editor.importGenericError'))
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className={styles.editor}>
      <LevelEditorToolbar
        tool={tool}
        onToolChange={setTool}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        name={draft.name}
        onNameChange={(name) => setDraft((prev) => ({ ...prev, name }))}
        onClear={() => setDraft((prev) => ({ ...prev, trackPath: [], obstacles: [], colorZones: [] }))}
        onExport={handleExport}
        onImport={handleImport}
      />
      <div className={styles.canvasWrap}>
        <LevelEditorCanvas draft={draft} onChange={setDraft} tool={tool} activeColor={activeColor} />
      </div>
      <TestNowButton draft={draft} studentId={studentId} />
    </div>
  )
}
