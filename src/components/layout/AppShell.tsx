import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Navbar } from './Navbar'
import styles from './AppShell.module.css'

interface AppShellProps {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

const RIGHT_WIDTH_KEY = 'appShell.rightPanelWidth'
const MIN_RIGHT_WIDTH = 280
const MAX_RIGHT_WIDTH = 800
const DEFAULT_RIGHT_WIDTH = 420

function readStoredWidth() {
  const raw = localStorage.getItem(RIGHT_WIDTH_KEY)
  const parsed = raw ? Number(raw) : NaN
  if (Number.isFinite(parsed)) {
    return Math.min(MAX_RIGHT_WIDTH, Math.max(MIN_RIGHT_WIDTH, parsed))
  }
  return DEFAULT_RIGHT_WIDTH
}

export function AppShell({ left, center, right }: AppShellProps) {
  const [rightWidth, setRightWidth] = useState(readStoredWidth)
  const columnsRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!draggingRef.current || !columnsRef.current) return
    const bounds = columnsRef.current.getBoundingClientRect()
    const width = bounds.right - event.clientX
    setRightWidth(Math.min(MAX_RIGHT_WIDTH, Math.max(MIN_RIGHT_WIDTH, width)))
  }, [])

  const stopDragging = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    setRightWidth((current) => {
      localStorage.setItem(RIGHT_WIDTH_KEY, String(current))
      return current
    })
  }, [])

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
    }
  }, [handlePointerMove, stopDragging])

  const startDragging = useCallback((event: React.PointerEvent) => {
    event.preventDefault()
    draggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  return (
    <div className={styles.shell}>
      <Navbar />
      <div
        className={styles.columns}
        ref={columnsRef}
        style={{ gridTemplateColumns: `280px minmax(0, 1fr) 6px ${rightWidth}px` }}
      >
        <aside className={styles.left}>{left}</aside>
        <main className={styles.center}>{center}</main>
        <div
          className={styles.resizeHandle}
          onPointerDown={startDragging}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize code panel"
        />
        <aside className={styles.right}>{right}</aside>
      </div>
    </div>
  )
}
