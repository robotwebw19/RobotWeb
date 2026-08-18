import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore, type OnboardingProfile } from '../../state/authStore'
import type { RobotConfig, StudentPrefix } from '../../types/domain'
import { PREFIX_OPTIONS, GRADE_OPTIONS } from '../../types/studentOptions'
import { defaultRobotConfig } from '../../robot/defaultRobot'
import { SensorConfigurator } from '../sensors/SensorConfigurator'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './NewUserOnboarding.module.css'

type Step = 'name' | 'robot'

const EMPTY_PROFILE: OnboardingProfile = {
  prefix: 'เด็กชาย',
  firstName: '',
  lastName: '',
  grade: GRADE_OPTIONS[0],
  classroom: '',
  studentNumber: '',
}

export function NewUserOnboarding() {
  const pendingStudentId = useAuthStore((state) => state.pendingStudentId)
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding)
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('name')
  const [profile, setProfile] = useState<OnboardingProfile>(EMPTY_PROFILE)
  const { t } = useTranslation()

  if (!pendingStudentId) {
    return <Navigate to="/login" replace />
  }

  const isProfileValid =
    profile.firstName.trim().length > 0 &&
    profile.lastName.trim().length > 0 &&
    profile.classroom.trim().length > 0 &&
    profile.studentNumber.trim().length > 0

  function updateProfile<K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  function handleNameSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isProfileValid) return
    setStep('robot')
  }

  async function handleFinish(robotConfig: RobotConfig) {
    await completeOnboarding(profile, robotConfig)
    navigate('/')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {step === 'name' && (
          <form className={styles.step} onSubmit={handleNameSubmit}>
            <h1 className={styles.title}>{t('onboarding.welcome')}</h1>
            <p className={styles.subtitle}>{t('onboarding.newIdSubtitle', { id: pendingStudentId })}</p>

            <div className={styles.row}>
              <div className={styles.fieldGroup} style={{ flex: '0 0 120px' }}>
                <label className={styles.label}>{t('onboarding.prefixLabel')}</label>
                <select
                  className={styles.select}
                  value={profile.prefix}
                  onChange={(event) => updateProfile('prefix', event.target.value as StudentPrefix)}
                >
                  {PREFIX_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('onboarding.firstNameLabel')}</label>
                <input
                  className={styles.field}
                  type="text"
                  autoFocus
                  maxLength={40}
                  value={profile.firstName}
                  onChange={(event) => updateProfile('firstName', event.target.value)}
                  placeholder={t('onboarding.firstNamePlaceholder')}
                  aria-label={t('onboarding.firstNameLabel')}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('onboarding.lastNameLabel')}</label>
                <input
                  className={styles.field}
                  type="text"
                  maxLength={40}
                  value={profile.lastName}
                  onChange={(event) => updateProfile('lastName', event.target.value)}
                  placeholder={t('onboarding.lastNamePlaceholder')}
                  aria-label={t('onboarding.lastNameLabel')}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('onboarding.gradeLabel')}</label>
                <select
                  className={styles.select}
                  value={profile.grade}
                  onChange={(event) => updateProfile('grade', event.target.value)}
                >
                  {GRADE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('onboarding.classroomLabel')}</label>
                <input
                  className={styles.field}
                  type="text"
                  maxLength={10}
                  value={profile.classroom}
                  onChange={(event) => updateProfile('classroom', event.target.value)}
                  placeholder={t('onboarding.classroomPlaceholder')}
                  aria-label={t('onboarding.classroomLabel')}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('onboarding.numberLabel')}</label>
                <input
                  className={styles.field}
                  type="text"
                  maxLength={4}
                  value={profile.studentNumber}
                  onChange={(event) => updateProfile('studentNumber', event.target.value)}
                  placeholder={t('onboarding.numberPlaceholder')}
                  aria-label={t('onboarding.numberLabel')}
                />
              </div>
            </div>

            <button className={styles.submit} type="submit" disabled={!isProfileValid}>
              {t('onboarding.nextButton')}
            </button>
          </form>
        )}
        {step === 'robot' && (
          <div className={styles.step}>
            <h1 className={styles.title}>{t('onboarding.buildRobotTitle')}</h1>
            <p className={styles.subtitle}>{t('onboarding.buildRobotSubtitle')}</p>
            <SensorConfigurator
              initialConfig={defaultRobotConfig}
              onSave={handleFinish}
              saveLabel={t('onboarding.startPlaying')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
