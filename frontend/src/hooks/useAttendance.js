/**
 * HRMS Lite – useAttendance Hook
 *
 * Manages attendance records state, fetching and mutations.
 */

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { attendanceApi } from '../services/api'

export function useAttendance(initialParams = {}) {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [params, setParams]     = useState(initialParams)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await attendanceApi.list(params)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      // Ensure records is always an array
      // Handle various response shapes: { results: { data: [] } }, { results: [] }, { data: [] }, or simply []
      const resData = data.results?.data ?? data.results ?? data.data ?? data
      setRecords(Array.isArray(resData) ? resData : [])
    }
  }, [params])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  // -----------------------------------------------------------------------
  // Mutations
  // -----------------------------------------------------------------------

  const markAttendance = async (payload) => {
    const { data, error: err } = await attendanceApi.create(payload)
    if (err) {
      toast.error(err.message)
      return { success: false, errors: err.errors }
    }
    toast.success(data.message || 'Attendance marked.')
    await fetchRecords()
    return { success: true }
  }

  const updateAttendance = async (id, payload) => {
    const { data, error: err } = await attendanceApi.update(id, payload)
    if (err) {
      toast.error(err.message)
      return false
    }
    toast.success(data.message || 'Attendance updated.')
    await fetchRecords()
    return true
  }

  const deleteAttendance = async (id) => {
    const { data, error: err } = await attendanceApi.delete(id)
    if (err) {
      toast.error(err.message)
      return false
    }
    toast.success(data.message || 'Record deleted.')
    await fetchRecords()
    return true
  }

  return {
    records,
    loading,
    error,
    params,
    setParams,
    refetch: fetchRecords,
    markAttendance,
    updateAttendance,
    deleteAttendance,
  }
}

// -----------------------------------------------------------------------
// Hook for per-employee attendance
// -----------------------------------------------------------------------
export function useEmployeeAttendance(employeeId) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fetch = useCallback(async () => {
    if (!employeeId) return
    setLoading(true)
    setError(null)
    const { data: res, error: err } = await attendanceApi.byEmployee(employeeId)
    setLoading(false)
    if (err) setError(err.message)
    else     setData(res)
  }, [employeeId])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
