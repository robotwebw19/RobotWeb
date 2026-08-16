import { nanoid } from 'nanoid'
import { levelRepository } from '../../data'
import { useLevelSelectionStore } from '../../state/levelSelectionStore'
import { useTranslation } from '../../i18n/useTranslation'
import type { EditorLevelDraft } from './LevelEditorCanvas'
import styles from './LevelEditorToolbar.module.css'

interface TestNowButtonProps {
  draft: EditorLevelDraft
  studentId: string
}

export function TestNowButton({ draft, studentId }: TestNowButtonProps) {
  const selectLevel = useLevelSelectionStore((state) => state.selectLevel)
  const { t } = useTranslation()

  function handleClick() {
    const level = { ...draft, id: `user-${nanoid(8)}`, createdBy: studentId }
    levelRepository.saveUserLevel(level)
    selectLevel(level.id)
  }

  return (
    <button type="button" className={styles.actionButton} onClick={handleClick} disabled={draft.trackPath.length === 0}>
      {t('editor.saveAndTest')}
    </button>
  )
}
