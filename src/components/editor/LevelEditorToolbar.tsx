import type { ColorZoneColor } from '../../types/domain'
import type { EditorTool } from './LevelEditorCanvas'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import styles from './LevelEditorToolbar.module.css'

interface LevelEditorToolbarProps {
  tool: EditorTool
  onToolChange: (tool: EditorTool) => void
  activeColor: ColorZoneColor
  onColorChange: (color: ColorZoneColor) => void
  name: string
  onNameChange: (name: string) => void
  onClear: () => void
  onExport: () => void
  onImport: (file: File) => void
}

const TOOLS: { id: EditorTool; labelKey: TranslationKey }[] = [
  { id: 'brush', labelKey: 'editor.tool.brush' },
  { id: 'eraser', labelKey: 'editor.tool.eraser' },
  { id: 'line', labelKey: 'editor.tool.line' },
  { id: 'curve', labelKey: 'editor.tool.curve' },
  { id: 'obstacle', labelKey: 'editor.tool.obstacle' },
  { id: 'color-zone', labelKey: 'editor.tool.colorZone' },
  { id: 'start', labelKey: 'editor.tool.start' },
  { id: 'finish', labelKey: 'editor.tool.finish' },
]

const COLORS: ColorZoneColor[] = ['red', 'green', 'blue', 'black', 'white']
const SWATCH_HEX: Record<ColorZoneColor, string> = {
  red: '#fa5252',
  green: '#40c057',
  blue: '#339af0',
  black: '#212529',
  white: '#f8f9fa',
}

export function LevelEditorToolbar({
  tool,
  onToolChange,
  activeColor,
  onColorChange,
  name,
  onNameChange,
  onClear,
  onExport,
  onImport,
}: LevelEditorToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.toolbar}>
      <input
        className={styles.nameField}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder={t('editor.levelNamePlaceholder')}
        aria-label={t('editor.levelNamePlaceholder')}
      />

      <div className={styles.row}>
        {TOOLS.map((toolDef) => (
          <button
            key={toolDef.id}
            type="button"
            className={`${styles.toolButton} ${tool === toolDef.id ? styles.toolButtonActive : ''}`}
            onClick={() => onToolChange(toolDef.id)}
          >
            {t(toolDef.labelKey)}
          </button>
        ))}
      </div>

      {tool === 'color-zone' && (
        <div className={styles.row}>
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={t('editor.useColor', { color })}
              className={`${styles.colorSwatch} ${activeColor === color ? styles.colorSwatchActive : ''}`}
              style={{ background: SWATCH_HEX[color] }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
      )}

      <div className={styles.row}>
        <button type="button" className={styles.actionButton} onClick={onClear}>
          {t('editor.clearTrack')}
        </button>
        <button type="button" className={styles.actionButton} onClick={onExport}>
          {t('editor.exportJson')}
        </button>
        <label className={styles.actionButton}>
          {t('editor.importJson')}
          <input
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onImport(file)
              event.target.value = ''
            }}
          />
        </label>
      </div>
    </div>
  )
}
