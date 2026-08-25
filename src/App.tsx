import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { DesktopOnlyGate } from './components/layout/DesktopOnlyGate'

function App() {
  return (
    <DesktopOnlyGate>
      <RouterProvider router={router} />
    </DesktopOnlyGate>
  )
}

export default App
