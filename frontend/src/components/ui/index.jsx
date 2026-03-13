/**
 * HRMS Lite – Reusable UI Components
 * Button, Badge, Input, Select, Modal, Spinner, EmptyState, ErrorState, Avatar
 */

import { X, AlertTriangle, Inbox, WifiOff } from 'lucide-react'
import { initials, deptColor } from '../../utils/helpers'
import clsx from 'clsx'

/* ─────────────────────────────── Button ──────────────────────────────── */
export function Button({
  children, variant = 'primary', size = 'md',
  loading = false, icon: Icon, className = '', ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
  }

  const variants = {
    primary: {
      background: 'var(--color-accent)',
      color: '#fff',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      background: '#fff',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text)',
      boxShadow: 'var(--shadow-xs)',
    },
    danger: {
      background: 'var(--color-absent)',
      color: '#fff',
      boxShadow: 'var(--shadow-sm)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-soft)',
    },
    outline: {
      background: 'transparent',
      border: '1px solid var(--color-accent)',
      color: 'var(--color-accent)',
    },
  }

  const sizes = {
    sm: { px: '12px', py: '6px', fontSize: 'var(--text-xs)' },
    md: { px: '16px', py: '8px', fontSize: 'var(--text-sm)' },
    lg: { px: '24px', py: '10px', fontSize: 'var(--text-base)' },
  }

  const currentVariant = variants[variant] || variants.primary
  const currentSize = sizes[size] || sizes.md

  return (
    <button
      style={{
        ...baseStyle,
        ...currentVariant,
        padding: `${currentSize.py} ${currentSize.px}`,
        fontSize: currentSize.fontSize,
        opacity: (loading || props.disabled) ? 0.5 : 1,
        pointerEvents: (loading || props.disabled) ? 'none' : 'auto',
        ...props.style
      }}
      disabled={loading || props.disabled}
      onMouseEnter={e => {
        if (variant === 'primary') e.currentTarget.style.background = 'var(--color-accent-hover)'
        if (variant === 'secondary' || variant === 'ghost') e.currentTarget.style.background = 'var(--color-bg)'
        if (variant === 'danger') e.currentTarget.style.background = '#b91c1c' // red-700
        if (variant === 'outline') e.currentTarget.style.background = 'var(--color-accent-light)'
      }}
      onMouseLeave={e => {
        const v = variants[variant] || variants.primary
        e.currentTarget.style.background = v.background
      }}
      {...props}
    >
      {loading
        ? <Spinner size={14} color="currentColor" />
        : Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} />
      }
      {children}
    </button>
  )
}

/* ─────────────────────────────── Badge ───────────────────────────────── */
export function Badge({ children, variant = 'default', className = '', style = {} }) {
  const variants = {
    default: { background: 'var(--color-navy-faint)', color: 'var(--color-navy)' },
    present: { background: 'var(--color-present-bg)', color: 'var(--color-present)' },
    absent:  { background: 'var(--color-absent-bg)', color: 'var(--color-absent)' },
    accent:  { background: 'var(--color-accent-light)', color: 'var(--color-accent)' },
    warning: { background: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
  }

  const currentVariant = variants[variant] || variants.default

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      ...currentVariant,
      ...style
    }}>
      {children}
    </span>
  )
}

/* ──────────────────────────── Input ─────────────────────────────────── */
export function Input({ label, error, helper, className = '', style = {}, ...props }) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {label && (
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-soft)' }}>
          {label}
          {props.required && <span style={{ color: 'var(--color-absent)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 'var(--text-sm)',
          border: `1.5px solid ${error ? 'var(--color-absent)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          outline: 'none',
          transition: 'all var(--transition-fast)',
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = 'var(--color-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--color-accent-light)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--color-absent)' : 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
        {...props}
      />
      {error && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-absent)', marginTop: 2 }}>{error}</p>}
      {helper && !error && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{helper}</p>}
    </div>
  )
}

/* ──────────────────────────── Select ────────────────────────────────── */
export function Select({ label, error, helper, options = [], placeholder, className = '', style = {}, ...props }) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {label && (
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-soft)' }}>
          {label}
          {props.required && <span style={{ color: 'var(--color-absent)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: 'var(--text-sm)',
            border: `1.5px solid ${error ? 'var(--color-absent)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: props.value ? 'var(--color-text)' : 'var(--color-text-muted)',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            transition: 'all var(--transition-fast)',
            paddingRight: '40px',
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = 'var(--color-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--color-accent-light)' }}
          onBlur={e => { e.target.style.borderColor = error ? 'var(--color-absent)' : 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: 'var(--color-text-muted)', display: 'flex',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
      {error && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-absent)', marginTop: 2 }}>{error}</p>}
      {helper && !error && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{helper}</p>}
    </div>
  )
}

/* ──────────────────────────── Spinner ───────────────────────────────── */
export function Spinner({ size = 20, color = 'var(--color-accent)' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* ─────────────────────────── LoadingPage ────────────────────────────── */
export function LoadingPage({ message = 'Loading…' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16, padding: '80px 0', color: 'var(--color-text-muted)'
    }}>
      <Spinner size={32} />
      <p style={{ fontSize: 'var(--text-sm)' }}>{message}</p>
    </div>
  )
}

/* ─────────────────────────── EmptyState ─────────────────────────────── */
export function EmptyState({ title = 'Nothing here', description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, padding: '64px 24px', textAlign: 'center'
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--color-navy-faint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-muted)'
      }}>
        <Inbox size={24} />
      </div>
      <div>
        <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{title}</p>
        {description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 320 }}>{description}</p>}
      </div>
      {action}
    </div>
  )
}

/* ─────────────────────────── ErrorState ─────────────────────────────── */
export function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, padding: '64px 24px', textAlign: 'center'
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--color-absent-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-absent)'
      }}>
        <WifiOff size={24} />
      </div>
      <div>
        <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>Failed to load data</p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 320 }}>
          {message || 'Could not connect to the server. Please check your connection.'}
        </p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>Try again</Button>
      )}
    </div>
  )
}

/* ──────────────────────────── Avatar ────────────────────────────────── */
export function Avatar({ name = '', department = '', size = 36 }) {
  const bg = deptColor(department || name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, flexShrink: 0,
      letterSpacing: '0.02em',
    }}>
      {initials(name)}
    </div>
  )
}

/* ──────────────────────────── Modal ─────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(26,39,68,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 150ms ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 200ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <h3 style={{ fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--color-text)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────── ConfirmDialog ──────────────────────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'var(--color-absent-bg)', borderRadius: 'var(--radius-md)',
        }}>
          <AlertTriangle size={18} color="var(--color-absent)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-soft)', lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  )
}

/* ──────────────────────────── Card ──────────────────────────────────── */
export function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ──────────────────────────── StatCard ──────────────────────────────── */
export function StatCard({ label, value, icon: Icon, color = 'var(--color-accent)', sublabel }) {
  return (
    <Card style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius-md)',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        {Icon && <Icon size={20} strokeWidth={2} />}
      </div>
      <div>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2, marginTop: 2 }}>{value}</p>
        {sublabel && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{sublabel}</p>}
      </div>
    </Card>
  )
}

/* ──────────────────────────── Divider ───────────────────────────────── */
export function Divider({ label }) {
  if (!label) return <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
      <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
    </div>
  )
}
