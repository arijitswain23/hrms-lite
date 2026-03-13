/**
 * HRMS Lite – Attendance Page
 * View, filter, mark and delete attendance records.
 */

import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Eye, CalendarDays } from 'lucide-react'
import { useAttendance } from '../hooks/useAttendance'
import { employeeApi } from '../services/api'
import MarkAttendanceModal from '../components/attendance/MarkAttendanceModal'
import {
  Button, Badge, Card, Avatar, Select, Input,
  LoadingPage, ErrorState, EmptyState, ConfirmDialog
} from '../components/ui'
import { formatDate, formatDateTime, todayISO } from '../utils/helpers'

const STATUS_OPTIONS = [
  { value: '',        label: 'All statuses' },
  { value: 'Present', label: 'Present' },
  { value: 'Absent',  label: 'Absent'  },
]

export default function AttendancePage() {
  const navigate = useNavigate()
  const { records, loading, error, params, setParams, refetch, markAttendance, deleteAttendance } = useAttendance()

  const [employees, setEmployees] = useState([])
  const [showMark, setShowMark]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Load employee list for the modal dropdown
  useEffect(() => {
    employeeApi.list({ ordering: 'full_name' }).then(({ data }) => {
      if (data) {
        // Handle various response shapes: { results: { data: [] } }, { results: [] }, { data: [] }, or simply []
        const empData = data.results?.data ?? data.results ?? data.data ?? data
        setEmployees(Array.isArray(empData) ? empData : [])
      }
    })
  }, [])

  const empFilterOptions = [
    { value: '', label: 'All employees' },
    ...(Array.isArray(employees) ? employees : []).map(e => ({ value: String(e.id), label: `${e.full_name} (${e.employee_id})` })),
  ]

  function handleFilter(e) {
    const { name, value } = e.target
    setParams(p => ({ ...p, [name]: value || undefined }))
  }

  async function confirmDelete() {
    setDeleteLoading(true)
    await deleteAttendance(deleteTarget)
    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease' }}>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>

        {/* Employee filter */}
        <Select
          label="Employee"
          name="employee"
          value={params.employee || ''}
          onChange={handleFilter}
          options={empFilterOptions}
          style={{ minWidth: 220 }}
        />

        {/* Status filter */}
        <Select
          label="Status"
          name="status"
          value={params.status || ''}
          onChange={handleFilter}
          options={STATUS_OPTIONS}
          style={{ minWidth: 140 }}
        />

        {/* Date range */}
        <Input
          label="From"
          name="date_from"
          type="date"
          value={params.date_from || ''}
          onChange={handleFilter}
          style={{ minWidth: 140 }}
        />
        <Input
          label="To"
          name="date_to"
          type="date"
          value={params.date_to || ''}
          onChange={handleFilter}
          style={{ minWidth: 140 }}
        />

        {/* Quick: today */}
        <div style={{ marginTop: 'auto' }}>
          <Button
            variant="outline" size="md" icon={CalendarDays}
            onClick={() => setParams(p => ({ ...p, date_from: todayISO(), date_to: todayISO() }))}
          >
            Today
          </Button>
        </div>

        {/* Reset */}
        {(params.employee || params.status || params.date_from || params.date_to) && (
          <div style={{ marginTop: 'auto' }}>
            <Button variant="ghost" size="md" onClick={() => setParams({})}>
              Clear filters
            </Button>
          </div>
        )}

        <div style={{ marginLeft: 'auto', marginTop: 'auto' }}>
          <Button variant="primary" icon={Plus} onClick={() => setShowMark(true)}>
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* ── Count ───────────────────────────────────────────────── */}
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        {loading ? 'Loading…' : `${(records || []).length} record${(records || []).length !== 1 ? 's' : ''}`}
      </p>

      {/* ── Table ───────────────────────────────────────────────── */}
      <Card>
        {loading ? (
          <LoadingPage message="Fetching attendance records…" />
        ) : (records || []).length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Mark attendance for employees to see records here."
            action={
              <Button variant="primary" icon={Plus} onClick={() => setShowMark(true)}>
                Mark Attendance
              </Button>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Employee', 'Date', 'Status', 'Note', 'Recorded', 'Actions'].map(h => (
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
                {(records || []).map((rec, i) => (
                  <tr
                    key={rec.id}
                    style={{
                      borderBottom: i < (records || []).length - 1 ? '1px solid var(--color-border)' : 'none',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Employee */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar
                          name={rec.employee_detail?.full_name}
                          department={rec.employee_detail?.department}
                          size={32}
                        />
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)', lineHeight: 1.3 }}>
                            {rec.employee_detail?.full_name}
                          </p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {rec.employee_detail?.employee_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '13px 16px', fontSize: 'var(--text-sm)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {formatDate(rec.date)}
                    </td>

                    <td style={{ padding: '13px 16px' }}>
                      <Badge variant={rec.status === 'Present' ? 'present' : 'absent'}>
                        {rec.status === 'Present' ? '✓' : '✗'} {rec.status}
                      </Badge>
                    </td>

                    <td style={{ padding: '13px 16px', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      {rec.note || '—'}
                    </td>

                    <td style={{ padding: '13px 16px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(rec.created_at)}
                    </td>

                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button
                          variant="ghost" size="sm" icon={Eye}
                          onClick={() => navigate(`/employees/${rec.employee_detail?.id}`)}
                          title="View employee"
                        />
                        <Button
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(rec.id)}
                          title="Delete record"
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

      {/* ── Modals ──────────────────────────────────────────────── */}
      <MarkAttendanceModal
        open={showMark}
        onClose={() => setShowMark(false)}
        onSubmit={markAttendance}
        employees={employees}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance record? This action cannot be undone."
        confirmLabel="Delete Record"
      />
    </div>
  )
}
