/**
 * HRMS Lite – API Service Layer
 *
 * Centralises all HTTP communication with the Django backend.
 * All functions return { data, error } so callers never need try/catch.
 *
 * Base URL is read from VITE_API_BASE_URL environment variable.
 */

import axios from 'axios'

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://hrms-lite-olo9.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 s timeout
})

/**
 * Unwrap Axios responses into a simple { data, error } tuple.
 * - On success: { data: <response body>, error: null }
 * - On failure: { data: null, error: { message, errors, status } }
 */
async function request(promise) {
  try {
    const res = await promise
    return { data: res.data, error: null }
  } catch (err) {
    const status  = err.response?.status
    const body    = err.response?.data
    const message = body?.message || body?.detail || err.message || 'Something went wrong.'
    const errors  = body?.errors || {}
    return { data: null, error: { message, errors, status } }
  }
}

// ---------------------------------------------------------------------------
// Employee API
// ---------------------------------------------------------------------------
export const employeeApi = {
  /** Fetch paginated + filterable employee list */
  list: (params = {}) =>
    request(api.get('/employees/', { params })),

  /** Fetch a single employee by DB id */
  get: (id) =>
    request(api.get(`/employees/${id}/`)),

  /** Create a new employee */
  create: (payload) =>
    request(api.post('/employees/', payload)),

  /** Delete an employee (cascades attendance) */
  delete: (id) =>
    request(api.delete(`/employees/${id}/`)),

  /** Fetch department choices from backend */
  departments: () =>
    request(api.get('/departments/')),
}

// ---------------------------------------------------------------------------
// Attendance API
// ---------------------------------------------------------------------------
export const attendanceApi = {
  /** Fetch attendance list with optional filters */
  list: (params = {}) =>
    request(api.get('/attendance/', { params })),

  /** Fetch all attendance for one employee */
  byEmployee: (employeeId, params = {}) =>
    request(api.get(`/attendance/employee/${employeeId}/`, { params })),

  /** Mark attendance */
  create: (payload) =>
    request(api.post('/attendance/', payload)),

  /** Update existing attendance record */
  update: (id, payload) =>
    request(api.put(`/attendance/${id}/`, payload)),

  /** Delete attendance record */
  delete: (id) =>
    request(api.delete(`/attendance/${id}/`)),

  /** Per-employee summary stats */
  summary: () =>
    request(api.get('/attendance/summary/')),
}

export default api
