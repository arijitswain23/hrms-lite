/**
 * HRMS Lite – Top Bar
 * Displays page title and breadcrumb based on current route.
 */

import { useLocation } from 'react-router-dom'
import { formatDate } from '../../utils/helpers'

const ROUTE_META = {
  '/':           { title: 'Dashboard',  sub: 'Overview of your HR data' },
  '/employees':  { title: 'Employees',  sub: 'Manage employee records' },
  '/attendance': { title: 'Attendance', sub: 'Track daily attendance' },
}

export default function Topbar() {
  const { pathname } = useLocation()

  // Match base path (e.g., /employees/3 → /employees)
  const base = '/' + pathname.split('/')[1]
  const meta = ROUTE_META[base] || ROUTE_META['/']
  const today = formatDate(new Date().toISOString(), 'EEEE, MMMM d, yyyy')

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px 0 24px',
      position: 'sticky', top: 0, zIndex: 100,
    }}
    className="topbar"
    >
      <div className="topbar-title">
        <h1 style={{
          fontSize: 'var(--text-xl)', fontWeight: 700,
          color: 'var(--color-text)', lineHeight: 1.2,
        }}>
          {meta.title}
        </h1>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 1 }}>
          {meta.sub}
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* Date pill */}
        <div style={{
          padding: '5px 12px',
          background: 'var(--color-navy-faint)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-soft)',
          fontWeight: 500,
        }}
        className="topbar-date"
        >
          {today}
        </div>

        {/* Admin avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: 'default',
        }}
          title="Admin"
        >
          A
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .topbar { padding-left: 60px !important; }
          .topbar-date { display: none !important; }
          .topbar-title h1 { fontSize: var(--text-lg) !important; }
        }
      `}</style>
    </header>
  )
}
