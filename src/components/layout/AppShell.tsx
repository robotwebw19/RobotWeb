import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import styles from './AppShell.module.css'

interface AppShellProps {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

export function AppShell({ left, center, right }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Navbar />
      <div className={styles.columns}>
        <aside className={styles.left}>{left}</aside>
        <main className={styles.center}>{center}</main>
        <aside className={styles.right}>{right}</aside>
      </div>
    </div>
  )
}
