/**
 * HRMS Lite – Utility Helpers
 */

import { format, parseISO } from 'date-fns'

/** Format an ISO date string to a human-readable date. */
export function formatDate(iso, fmt = 'MMM d, yyyy') {
  if (!iso) return '—'
  try { return format(parseISO(iso), fmt) }
  catch { return iso }
}

/** Format an ISO datetime string. */
export function formatDateTime(iso) {
  return formatDate(iso, 'MMM d, yyyy · h:mm a')
}

/** Today as YYYY-MM-DD (local time). */
export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Truncate a string to n characters with ellipsis. */
export function truncate(str, n = 30) {
  if (!str) return ''
  return str.length <= n ? str : str.slice(0, n) + '…'
}

/** Generate initials from a full name (max 2 chars). */
export function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Map department name to a deterministic accent color. */
const DEPT_COLORS = [
  '#3d5af1', '#059669', '#d97706', '#7c3aed',
  '#db2777', '#0891b2', '#16a34a', '#9333ea',
  '#ea580c', '#0284c7',
]
export function deptColor(dept = '') {
  let hash = 0
  for (let i = 0; i < dept.length; i++) hash += dept.charCodeAt(i)
  return DEPT_COLORS[hash % DEPT_COLORS.length]
}

/** Simple email validator (client-side, mirrors backend). */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Debounce a function by `delay` ms. */
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
