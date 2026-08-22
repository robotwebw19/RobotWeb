import { Navbar } from '../layout/Navbar'
import { AdminRaceTrackTab } from './AdminRaceTrackTab'
import styles from './AdminRaceTrackTab.module.css'

// Full-bleed layout, unlike the other admin tabs' centered 900px column (AdminDashboard.module.css
// .page) — the level list and score card need to sit flush against the viewport edges.
export function AdminRaceTrackPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <AdminRaceTrackTab />
    </div>
  )
}
