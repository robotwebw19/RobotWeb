import styles from './StarPips.module.css'

interface StarPipsProps {
  lit: number
  total?: number
  size?: number
  className?: string
}

/** The system's one star-rating idiom — lit/unlit LED pips, never the ★/☆ glyphs. */
export function StarPips({ lit, total = 3, size = 8, className }: StarPipsProps) {
  return (
    <span className={`${styles.pips} ${className ?? ''}`} role="img" aria-label={`${lit} / ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`${styles.pip} ${i < lit ? styles.pipLit : ''}`}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  )
}
