import { Navbar } from '../layout/Navbar'
import { AdminStudentsTab } from './AdminStudentsTab'
import styles from './AdminDashboard.module.css'

export function AdminStudentsPage() {
  return (
    <div>
      <Navbar />
      <div className={styles.page}>
        <AdminStudentsTab />
      </div>
    </div>
  )
}
