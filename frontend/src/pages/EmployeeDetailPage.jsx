/**
 * HRMS Lite – Employee Detail Page
 * Shows full employee profile + their attendance history.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Building2, Hash, CalendarDays, Trash2 } from 'lucide-react'
import { employeeApi } from '../services/api'
import { useEmployeeAttendance } from '../hooks/useAttendance'
import {
  Button, Badge, Card, Avatar, StatCard,
  LoadingPage, ErrorState, EmptyState, ConfirmDialog
} from '../components/ui'
import { formatDate, formatDateTime } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState(null)
  const [empLoading, setEmpLoading] = useState(true)
  const [empError, setEmpError]     = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data: attData, loading: attLoading, error: attError } = useEmployeeAttendance(id)

  useEffect(() => {
    async function load() {
      setEmpLoading(true)
      const { data, error } = await employeeApi.get(id)
      setEmpLoading(false)
      if (error) setEmpError(error.message)
      else setEmployee(data.data)
    }
    load()
  }, [id])

  async function handleDelete() {
    setDeleteLoading(true)
    const { data, error } = await employeeApi.delete(id)
    setDeleteLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(data.message)
    navigate('/employees')
  }

  if (empLoading) return <LoadingPage message="Loading employee profile…" />
  if (empError)   return <ErrorState message={empError} />
  if (!employee)  return null

  const stats = attData?.stats || {}
  const records = attData?.data || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>

      {/* ── Back + actions ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/employees')}>
          Back to Employees
        </Button>
        <Button
          variant="danger" size="sm" icon={Trash2}
          onClick={() => setShowDelete(true)}
        >
          Delete Employee
        </Button>
      </div>

      {/* ── Profile card ────────────────────────────────────────── */}
      <Card style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <Avatar name={employee.full_name} department={employee.department} size={64} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
              {employee.full_name}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
              Employee Profile
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 16 }}>
              {[
                { icon: Hash,         label: 'Employee ID',  value: employee.employee_id },
                { icon: Mail,         label: 'Email',        value: employee.email },
                { icon: Building2,    label: 'Department',   value: employee.department },
                { icon: CalendarDays, label: 'Joined',       value: formatDate(employee.created_at) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={15} color="var(--color-text-muted)" />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{label}:</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Attendance stats ────────────────────────────────────── */}
      {!attLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          <StatCard label="Total Days"    value={stats.total_days    ?? 0} icon={CalendarDays} color="var(--color-accent)" />
          <StatCard label="Present Days"  value={stats.present_days  ?? 0} icon={CalendarDays} color="var(--color-present)" />
          <StatCard label="Absent Days"   value={stats.absent_days   ?? 0} icon={CalendarDays} color="var(--color-absent)" />
          <StatCard label="Attendance %"  value={`${stats.attendance_pct ?? 0}%`} icon={CalendarDays} color="var(--color-warning)" />
        </div>
      )}

      {/* ── Attendance history ──────────────────────────────────── */}
      <Card>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--color-border)' }}>
          <p style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>Attendance History</p>
        </div>

        {attLoading ? (
          <LoadingPage message="Loading attendance…" />
        ) : attError ? (
          <ErrorState message={attError} />
        ) : records.length === 0 ? (
          <EmptyState title="No attendance records" description="Attendance will appear here once marked." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Date', 'Status', 'Note', 'Recorded At'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      color: 'var(--color-text-muted)', textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr
                    key={rec.id}
                    style={{
                      borderBottom: i < records.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                      {formatDate(rec.date)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={rec.status === 'Present' ? 'present' : 'absent'}>
                        {rec.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      {rec.note || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {formatDateTime(rec.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Delete confirm ──────────────────────────────────────── */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Employee"
        message={`This will permanently delete "${employee.full_name}" and all ${stats.total_days ?? 0} attendance records. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
      />
    </div>
  )
}
