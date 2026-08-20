import { useEffect } from 'react'
import styles from './Toast.module.css'

interface ToastProps {
  message: string
  onDismiss: () => void
  durationMs?: number
}

/** Self-dismissing status toast, fixed to the viewport corner. Re-arms its timer whenever
 * `message` changes, so a fresh event pushes the dismiss deadline back out. */
export function Toast({ message, onDismiss, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [message, onDismiss, durationMs])

  return (
    <div className={styles.toast} role="status">
      {message}
    </div>
  )
}
