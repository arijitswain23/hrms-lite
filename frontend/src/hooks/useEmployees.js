/**
 * HRMS Lite – useEmployees Hook
 *
 * Encapsulates all employee state + data-fetching logic so that page
 * components stay thin and focused on rendering.
 */

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { employeeApi } from '../services/api'

export function useEmployees(initialParams = {}) {
  const [employees, setEmployees]   = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [params, setParams]         = useState(initialParams)

  // Fetch employee list whenever params change
  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await employeeApi.list(params)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      // Ensure employees is always an array
      // Handle various response shapes: { results: { data: [] } }, { results: [] }, { data: [] }, or simply []
      const resData = data.results?.data ?? data.results ?? data.data ?? data
      setEmployees(Array.isArray(resData) ? resData : [])
    }
  }, [params])

  // Fetch department choices once on mount
  const fetchDepartments = useCallback(async () => {
    const { data } = await employeeApi.departments()
    if (data) {
      // Handle various response shapes: { results: { data: [] } }, { results: [] }, { data: [] }, or simply []
      const deptData = data.results?.data ?? data.results ?? data.data ?? data
      setDepartments(Array.isArray(deptData) ? deptData : [])
    }
  }, [])

  useEffect(() => { fetchEmployees() },  [fetchEmployees])
  useEffect(() => { fetchDepartments() }, [fetchDepartments])

  // -----------------------------------------------------------------------
  // Mutations
  // -----------------------------------------------------------------------

  const createEmployee = async (payload) => {
    const { data, error: err } = await employeeApi.create(payload)
    if (err) {
      toast.error(err.message)
      return { success: false, errors: err.errors }
    }
    toast.success(data.message || 'Employee created.')
    await fetchEmployees()
    return { success: true }
  }

  const deleteEmployee = async (id, name) => {
    const { data, error: err } = await employeeApi.delete(id)
    if (err) {
      toast.error(err.message)
      return false
    }
    toast.success(data.message || `${name} deleted.`)
    await fetchEmployees()
    return true
  }

  return {
    employees,
    departments,
    loading,
    error,
    params,
    setParams,
    refetch: fetchEmployees,
    createEmployee,
    deleteEmployee,
  }
}
