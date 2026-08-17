import type { CSSProperties } from 'react'
import styles from './SegmentDisplay.module.css'

type SegmentId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G1' | 'G2' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'

/**
 * Which of the 14 segments are lit for each glyph. Digits are conventional (matching the old
 * 7-segment shapes almost exactly, now with a split middle bar) with one deliberate exception:
 * '1' uses the upper-right diagonal (J) instead of a plain vertical stroke, so it reads as an
 * unmistakable angled "1" instead of a bare right-side bar that a glance can mistake for "7".
 */
const GLYPHS: Record<string, SegmentId[]> = {
  '0': ['A', 'B', 'C', 'D', 'E', 'F'],
  '1': ['J', 'C'],
  '2': ['A', 'B', 'G1', 'G2', 'E', 'D'],
  '3': ['A', 'B', 'G1', 'G2', 'C', 'D'],
  '4': ['F', 'G1', 'G2', 'B', 'C'],
  '5': ['A', 'F', 'G1', 'G2', 'C', 'D'],
  '6': ['A', 'F', 'G1', 'G2', 'E', 'C', 'D'],
  '7': ['A', 'B', 'C'],
  '8': ['A', 'B', 'C', 'D', 'E', 'F', 'G1', 'G2'],
  '9': ['A', 'B', 'C', 'D', 'F', 'G1', 'G2'],
  '-': ['G1', 'G2'],
}

// Digit-cell geometry: three columns x three rows, the classic 14-segment "starburst" layout —
// the outer ring (A/B/C/D/E/F), a split middle bar (G1/G2), and four diagonals (H/I/J/K/L/M)
// radiating from the center point.
const X1 = 8
const X2 = 28
const X3 = 48
const Y1 = 6
const Y2 = 50
const Y3 = 94
const THICKNESS = 8

/** One elongated-hexagon LED bar between two points, pointed at both tips — generalizes the old
 * 7-segment chevron shape to any angle, so the same shape draws verticals, horizontals, and the
 * new diagonals alike. */
function bar(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const half = THICKNESS / 2
  const point = Math.min(half, len / 2 - 0.5)
  const ax = x1 + ux * point
  const ay = y1 + uy * point
  const bx = x2 - ux * point
  const by = y2 - uy * point
  const points: Array<[number, number]> = [
    [x1, y1],
    [ax + px * half, ay + py * half],
    [bx + px * half, by + py * half],
    [x2, y2],
    [bx - px * half, by - py * half],
    [ax - px * half, ay - py * half],
  ]
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

const SEGMENT_POINTS: Record<SegmentId, string> = {
  A: bar(X1, Y1, X3, Y1),
  F: bar(X1, Y1, X1, Y2),
  B: bar(X3, Y1, X3, Y2),
  G1: bar(X1, Y2, X2, Y2),
  G2: bar(X2, Y2, X3, Y2),
  E: bar(X1, Y2, X1, Y3),
  C: bar(X3, Y2, X3, Y3),
  D: bar(X1, Y3, X3, Y3),
  H: bar(X1, Y1, X2, Y2),
  I: bar(X2, Y1, X2, Y2),
  J: bar(X3, Y1, X2, Y2),
  K: bar(X2, Y2, X1, Y3),
  L: bar(X2, Y2, X2, Y3),
  M: bar(X2, Y2, X3, Y3),
}

const SEGMENT_IDS = Object.keys(SEGMENT_POINTS) as SegmentId[]

interface SegmentDisplayProps {
  /** Digits plus '.', ':', '-', ' ' — anything else renders as a blank (all-ghost) cell. */
  value: string
  /** Digit height in px. Segment thickness and spacing scale from this. */
  size?: number
  className?: string
  /** Lit segments strike in (a VFD tube igniting) instead of snapping to full brightness.
   * Reserve for a single reveal moment — this component remounts fresh each time its parent
   * conditionally renders it, so the strike plays once per reveal, not on every tick. Leave off
   * for a readout that updates continuously (a running clock), or the flicker becomes noise. */
  animateChanges?: boolean
}

/**
 * A 14-segment alphanumeric tube — the board's precision timer/counter module, replacing the
 * plain 7-segment digit. Every cell still always shows its unlit ("ghost") ring, and a value
 * change still never counts up or morphs between digit shapes — the one difference from before
 * is that, when `animateChanges` is set, newly-lit segments strike in like a real tube igniting
 * rather than switching on flat.
 */
export function SegmentDisplay({ value, size = 20, className, animateChanges = false }: SegmentDisplayProps) {
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
        const lit = GLYPHS[char] ?? []
        return (
          <svg key={index} className={styles.digit} viewBox="0 0 56 100" preserveAspectRatio="none">
            {SEGMENT_IDS.map((seg) => {
              const isLit = lit.includes(seg)
              return (
                <polygon
                  key={seg}
                  points={SEGMENT_POINTS[seg]}
                  className={`${styles.seg} ${isLit ? styles.on : ''} ${isLit && animateChanges ? styles.ignite : ''}`}
                />
              )
            })}
          </svg>
        )
      })}
    </span>
  )
}
