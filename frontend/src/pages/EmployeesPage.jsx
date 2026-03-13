/**
 * HRMS Lite – Employees Page
 * List, search, filter, add, and delete employees.
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Trash2, Eye, UserPlus } from 'lucide-react'
import { useEmployees } from '../hooks/useEmployees'
import AddEmployeeModal from '../components/employees/AddEmployeeModal'
import {
  Button, Badge, Card, Avatar, LoadingPage, ErrorState, EmptyState, ConfirmDialog
} from '../components/ui'
import { formatDate, debounce } from '../utils/helpers'

export default function EmployeesPage() {
  const navigate = useNavigate()
  const {
    employees, departments, loading, error,
    params, setParams, refetch,
    createEmployee, deleteEmployee,
  } = useEmployees()

  const [showAdd, setShowAdd]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, name }
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Debounced search
  const handleSearch = useCallback(
    debounce(val => setParams(p => ({ ...p, search: val || undefined })), 350),
    []
  )

  // Department filter
  const handleDeptFilter = (dept) =>
    setParams(p => ({ ...p, department: dept || undefined }))

  // Confirm delete
  async function confirmDelete() {
    setDeleteLoading(true)
    await deleteEmployee(deleteTarget.id, deleteTarget.name)
    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease' }}>

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 340 }}>
          <Search
            size={15}
            style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)', pointerEvents: 'none',
            }}
          />
          <input
            placeholder="Search by name, ID, or email…"
            onChange={e => handleSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12,
              paddingTop: 8, paddingBottom: 8,
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* Dept filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleDeptFilter('')}
            style={{
              padding: '5px 12px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-xs)', fontWeight: 500,
              background: !params.department ? 'var(--color-accent)' : 'var(--color-navy-faint)',
              color: !params.department ? '#fff' : 'var(--color-text-soft)',
              transition: 'all var(--transition-fast)',
            }}
          >
            All
          </button>
          {(departments || []).slice(0, 5).map(d => (
            <button
              key={d.value}
              onClick={() => handleDeptFilter(d.value)}
              style={{
                padding: '5px 12px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                fontSize: 'var(--text-xs)', fontWeight: 500,
                background: params.department === d.value ? 'var(--color-accent)' : 'var(--color-navy-faint)',
                color: params.department === d.value ? '#fff' : 'var(--color-text-soft)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <Button variant="primary" icon={UserPlus} onClick={() => setShowAdd(true)}>
            Add Employee
          </Button>
        </div>
      </div>

      {/* ── Count ──────────────────────────────────────────────── */}
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        {loading ? 'Loading…' : `${(employees || []).length} employee${(employees || []).length !== 1 ? 's' : ''} found`}
      </p>

      {/* ── Table ──────────────────────────────────────────────── */}
      <Card>
        {loading ? (
          <LoadingPage message="Fetching employees…" />
        ) : (employees || []).length === 0 ? (
          <EmptyState
            title="No employees found"
            description="Add your first employee to get started, or adjust your search filters."
            action={
              <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>
                Add First Employee
              </Button>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Employee', 'ID', 'Email', 'Department', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      color: 'var(--color-text-muted)', textTransform: 'uppercase',
                      letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(employees || []).map((emp, i) => (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: i < (employees || []).length - 1 ? '1px solid var(--color-border)' : 'none',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Employee name + avatar */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={emp.full_name} department={emp.department} size={34} />
                        <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{emp.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant="accent">{emp.employee_id}</Badge>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--color-text-soft)' }}>
                      {emp.email}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant="default">{emp.department}</Badge>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(emp.created_at)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button
                          variant="ghost" size="sm" icon={Eye}
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          title="View details"
                        />
                        <Button
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget({ id: emp.id, name: emp.full_name })}
                          title="Delete employee"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <AddEmployeeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={createEmployee}
        departments={departments}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove the employee and all their attendance records.`}
        confirmLabel="Delete Employee"
      />
    </div>
  )
}
