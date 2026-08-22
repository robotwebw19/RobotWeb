import { createPortal } from 'react-dom'
import { useTranslation, type TFunction } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import styles from './SensorModulePanel.module.css'

export interface SensorModulePart {
  x: number
  y: number
  labelKey: TranslationKey
  roleKey: TranslationKey
}

// One hue per part, spaced by the golden angle so any number of parts stays maximally distinct
// from its neighbors — same scheme RobotPinoutPanel.tsx uses for per-device pin colors.
function partColor(index: number): string {
  const hue = (index * 137.508) % 360
  return `hsl(${hue.toFixed(1)}, 70%, 60%)`
}

interface SensorModulePanelProps {
  titleKey: TranslationKey
  image: string
  imageAlt: string
  imageWidth: number
  imageHeight: number
  /** SVG-viewBox-unit radius for each hotspot dot. Pick per photo so neighboring parts (e.g. a
   * tight pin header) never touch — there's no single radius that fits every image's scale and
   * part spacing. */
  dotRadius: number
  parts: SensorModulePart[]
}

function buildLegend(parts: SensorModulePart[], t: TFunction) {
  return parts.map((part, i) => ({ label: t(part.labelKey), role: t(part.roleKey), color: partColor(i) }))
}

/** Shown on hover over a sensor catalog card: the real module photo with every part marked,
 * mirroring RobotPinoutPanel's hotspot-on-photo pattern for the robot itself. Shared by every
 * sensor module panel (IR, ultrasonic, ...) — only the photo and part list differ.
 *
 * Ported to `document.body`: the catalog card lives inside AppShell's `.left` column, which sets
 * its own `position: relative` + `z-index` and so establishes a stacking context — no z-index on
 * this panel, however high, can then paint above sibling columns (`.center`/`.right`) stacked in
 * front of `.left`. A portal escapes that ancestor's stacking context entirely, the same fix a
 * modal or toast library uses for exactly this "always on top of everything" requirement. */
export function SensorModulePanel({ titleKey, image, imageAlt, imageWidth, imageHeight, dotRadius, parts }: SensorModulePanelProps) {
  const { t } = useTranslation()
  const legend = buildLegend(parts, t)

  return createPortal(
    <div className={styles.panel}>
      <p className={styles.title}>{t(titleKey)}</p>
      <div className={styles.boardWrap}>
        <img src={image} alt={imageAlt} className={styles.boardImage} />
        <svg viewBox={`0 0 ${imageWidth} ${imageHeight}`} className={styles.pinOverlay}>
          {parts.map((part, i) => (
            <circle key={i} cx={part.x} cy={part.y} r={dotRadius} fill={partColor(i)} stroke="#ffffff" strokeWidth={dotRadius * 0.3}>
              <title>{`${t(part.labelKey)} — ${t(part.roleKey)}`}</title>
            </circle>
          ))}
        </svg>
      </div>
      <ul className={styles.legend}>
        {legend.map((item) => (
          <li key={item.label}>
            <span className={styles.swatch} style={{ background: item.color }} />
            <span className={styles.partName}>{item.label}</span>
            <span className={styles.partRole}>{item.role}</span>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  )
}
