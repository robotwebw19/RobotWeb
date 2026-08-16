import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'
import type { RobotConfig } from '../../types/domain'
import { defaultRobotConfig } from '../../robot/defaultRobot'
import { SensorConfigurator } from '../sensors/SensorConfigurator'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './NewUserOnboarding.module.css'

type Step = 'name' | 'robot'

export function NewUserOnboarding() {
  const pendingStudentId = useAuthStore((state) => state.pendingStudentId)
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding)
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('name')
  const [displayName, setDisplayName] = useState('')
  const { t } = useTranslation()

  if (!pendingStudentId) {
    return <Navigate to="/login" replace />
  }

  function handleNameSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (displayName.trim().length === 0) return
    setStep('robot')
  }

  async function handleFinish(robotConfig: RobotConfig) {
    await completeOnboarding(displayName.trim(), robotConfig)
    navigate('/')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {step === 'name' && (
          <form className={styles.step} onSubmit={handleNameSubmit}>
            <h1 className={styles.title}>{t('onboarding.welcome')}</h1>
            <p className={styles.subtitle}>{t('onboarding.newIdSubtitle', { id: pendingStudentId })}</p>
            <input
              className={styles.field}
              type="text"
              autoFocus
              maxLength={24}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={t('onboarding.displayNamePlaceholder')}
              aria-label={t('onboarding.displayNamePlaceholder')}
            />
            <button className={styles.submit} type="submit" disabled={displayName.trim().length === 0}>
              {t('onboarding.nextButton')}
            </button>
          </form>
        )}
        {step === 'robot' && (
          <div className={styles.step}>
            <h1 className={styles.title}>{t('onboarding.buildRobotTitle')}</h1>
            <p className={styles.subtitle}>{t('onboarding.buildRobotSubtitle')}</p>
            <SensorConfigurator
              initialConfig={{ ...defaultRobotConfig, name: `${displayName}'s Robot` }}
              onSave={handleFinish}
              saveLabel={t('onboarding.startPlaying')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
