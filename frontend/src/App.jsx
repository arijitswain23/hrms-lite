/**
 * HRMS Lite – App Shell + Router
 */

import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar  from './components/layout/Topbar'
import DashboardPage  from './pages/DashboardPage'
import EmployeesPage  from './pages/EmployeesPage'
import EmployeeDetail from './pages/EmployeeDetailPage'
import AttendancePage from './pages/AttendancePage'
import NotFoundPage   from './pages/NotFoundPage'

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Fixed sidebar ── */}
      <Sidebar />

      {/* ── Main content area ── */}
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
      }}
      className="main-content"
      >
        <Topbar />

        <main style={{ flex: 1, padding: '28px', minWidth: 0 }}>
          <Routes>
            <Route path="/"                  element={<DashboardPage />} />
            <Route path="/employees"         element={<EmployeesPage />} />
            <Route path="/employees/:id"     element={<EmployeeDetail />} />
            <Route path="/attendance"        element={<AttendancePage />} />
            <Route path="*"                  element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
