import { useRef } from 'react'
import styles from './DigitCodeInput.module.css'

interface DigitCodeInputProps {
  length: number
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  label: string
}

/**
 * A row of single-digit boxes — a numeric code entry, not a themed text input. Typing a digit
 * auto-advances focus to the next box; Backspace on a filled box clears it, on an empty box
 * steps back and clears the previous one; pasting a full code distributes it across every box
 * at once. `value` stays a plain digit string (no padding/placeholder characters ever leak into
 * it), so callers can keep treating it exactly like a normal controlled text input's value.
 */
export function DigitCodeInput({ length, value, onChange, autoFocus, label }: DigitCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function setDigitAt(index: number, digit: string) {
    const clampedIndex = Math.min(index, value.length)
    if (digit === '') {
      onChange(value.slice(0, clampedIndex))
    } else if (clampedIndex < value.length) {
      onChange(value.slice(0, clampedIndex) + digit + value.slice(clampedIndex + 1))
    } else {
      onChange(value + digit)
    }
  }

  function handleChange(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/\D/g, '')
    if (digitsOnly.length === 0) return
    setDigitAt(index, digitsOnly.slice(-1))
    if (index < length - 1) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (value[index]) {
        setDigitAt(index, '')
      } else if (index > 0) {
        setDigitAt(index - 1, '')
        inputRefs.current[index - 1]?.focus()
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted.length === 0) return
    event.preventDefault()
    onChange(pasted)
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className={styles.row} role="group" aria-label={label}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          className={`${styles.cell} ${value[index] ? styles.filled : ''}`}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          value={value[index] ?? ''}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
          onPaste={handlePaste}
          aria-label={`${label} ${index + 1}/${length}`}
        />
      ))}
    </div>
  )
}
