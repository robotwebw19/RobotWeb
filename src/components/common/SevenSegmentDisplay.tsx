import type { CSSProperties } from 'react'
import styles from './SevenSegmentDisplay.module.css'

/** Which of the 7 segments (a b c d e f g, clockwise from top) are lit for each glyph. */
const GLYPHS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abgcd',
  '4': 'fgbc',
  '5': 'afgcd',
  '6': 'afgecd',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
  '-': 'g',
}

const SEGMENT_IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const

interface SevenSegmentDisplayProps {
  /** Digits plus '.', ':', '-', ' ' — anything else renders as a blank (all-ghost) cell. */
  value: string
  /** Digit height in px. Segment thickness and spacing scale from this. */
  size?: number
  className?: string
}

/**
 * Real LED segment digits, not a themed numeral font: every cell always shows its unlit ("ghost")
 * ring, and a value change swaps segments instantly — no count-up tween, no smooth morph. That's
 * the point of this world (see index.html's direction contract) — a scoreboard doesn't ease.
 */
export function SevenSegmentDisplay({ value, size = 20, className }: SevenSegmentDisplayProps) {
  const style = { '--seg-size': `${size}px` } as CSSProperties

  return (
    <span className={`${styles.display} ${className ?? ''}`} style={style} aria-hidden="true">
      {[...value].map((char, index) => {
        if (char === ':' || char === '.') {
          return (
            <span key={index} className={styles.punct}>
              <span className={`${styles.dot} ${styles.on}`} />
              {char === ':' && <span className={`${styles.dot} ${styles.on}`} />}
            </span>
          )
        }
        const lit = GLYPHS[char] ?? ''
        return (
          <span key={index} className={styles.digit}>
            {SEGMENT_IDS.map((seg) => (
              <span key={seg} className={`${styles.seg} ${styles[`seg-${seg}`]} ${lit.includes(seg) ? styles.on : ''}`} />
            ))}
          </span>
        )
      })}
    </span>
  )
}
