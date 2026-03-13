/**
 * HRMS Lite – Sidebar Navigation
 * Fixed left sidebar with logo, nav links and a subtle footer.
 */

import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarCheck, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { path: '/',            label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/employees',   label: 'Employees',  icon: Users },
  { path: '/attendance',  label: 'Attendance', icon: CalendarCheck },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* ── Mobile toggle ─────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 900,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderRadius: 8,
          padding: 8, cursor: 'pointer', color: 'var(--color-text)',
          boxShadow: 'var(--shadow-sm)',
        }}
        className="mobile-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* ── Overlay for mobile ────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 800,
            background: 'rgba(26,39,68,0.4)', backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar panel ─────────────────── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-width)',
        background: 'var(--color-navy)',
        display: 'flex', flexDirection: 'column',
        zIndex: 850,
        transition: 'transform var(--transition-base)',
      }}
      className={mobileOpen ? 'sidebar-open' : 'sidebar'}
      >
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--color-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '0.02em' }}>HR</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 'var(--text-base)', lineHeight: 1.1 }}>HRMS Lite</p>
            </div>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', padding: 4,
              display: 'none',
            }}
            className="sidebar-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{
            color: 'rgba(255,255,255,0.3)', fontSize: 10,
            fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '8px 8px 4px',
          }}>
            Menu
          </p>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                textDecoration: 'none',
                fontSize: 'var(--text-sm)', fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                transition: 'all var(--transition-fast)',
                position: 'relative',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.background.includes('0.12')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.style.background.includes('0.12')) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                }
              }}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
            HRMS Lite
          </p>
        </div>
      </aside>

      {/* Responsive styles injected inline */}
      <style>{`
        .sidebar { transform: translateX(0); }
        .mobile-menu-btn { display: none; }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0); }
          .mobile-menu-btn { display: flex; }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
