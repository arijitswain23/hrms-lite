/**
 * HRMS Lite – Dashboard Page
 * Shows key stats, recent employees, and today's attendance snapshot.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CalendarCheck, UserCheck, UserX, TrendingUp } from 'lucide-react'
import { employeeApi, attendanceApi } from '../services/api'
import { StatCard, Card, LoadingPage, ErrorState, Badge, Avatar, Button } from '../components/ui'
import { formatDate, todayISO } from '../utils/helpers'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [stats, setStats]       = useState(null)
  const [recentEmployees, setRecentEmployees] = useState([])
  const [todayAttendance, setTodayAttendance] = useState([])

  async function load() {
    setLoading(true)
    setError(null)

    const [empRes, summaryRes, todayRes] = await Promise.all([
      employeeApi.list({ ordering: '-created_at' }),
      attendanceApi.summary(),
      attendanceApi.list({ date_from: todayISO(), date_to: todayISO() }),
    ])

    setLoading(false)

    if (empRes.error || summaryRes.error) {
      setError(empRes.error?.message || summaryRes.error?.message)
      return
    }

    const employees = empRes.data?.results?.data || empRes.data?.data || []
    const summaryData = summaryRes.data?.results?.data || summaryRes.data?.data || []
    const todayData = todayRes.data?.results?.data || todayRes.data?.data || []

    const totalEmp  = employees.length
    const presentToday = todayData.filter(r => r.status === 'Present').length
    const absentToday  = todayData.filter(r => r.status === 'Absent').length
    const avgPct = summaryData.length
      ? Math.round(summaryData.reduce((s, r) => s + r.attendance_pct, 0) / summaryData.length)
      : 0

    setStats({ totalEmp, presentToday, absentToday, avgPct })
    setRecentEmployees(employees.slice(0, 5))
    setTodayAttendance(todayData.slice(0, 6))
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingPage message="Loading dashboard…" />
  if (error)   return <ErrorState message={error} onRetry={load} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, animation: 'fadeIn 0.3s ease' }}>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard
          label="Total Employees"
          value={stats.totalEmp}
          icon={Users}
          color="var(--color-accent)"
          sublabel="Active records"
        />
        <StatCard
          label="Present Today"
          value={stats.presentToday}
          icon={UserCheck}
          color="var(--color-present)"
          sublabel={`of ${stats.presentToday + stats.absentToday} marked`}
        />
        <StatCard
          label="Absent Today"
          value={stats.absentToday}
          icon={UserX}
          color="var(--color-absent)"
          sublabel="Marked absent"
        />
        <StatCard
          label="Avg. Attendance"
          value={`${stats.avgPct}%`}
          icon={TrendingUp}
          color="var(--color-warning)"
          sublabel="All-time average"
        />
      </div>

      {/* ── Bottom grid ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Recent Employees */}
        <Card>
          <div style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <p style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>Recent Employees</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>View all</Button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentEmployees.length === 0 ? (
              <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                No employees yet
              </p>
            ) : (
              recentEmployees.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 20px', cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Avatar name={emp.full_name} department={emp.department} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.full_name}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {emp.employee_id} · {emp.department}
                    </p>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {formatDate(emp.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Today's Attendance */}
        <Card>
          <div style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <p style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>Today's Attendance</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/attendance')}>View all</Button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {todayAttendance.length === 0 ? (
              <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                No attendance marked today
              </p>
            ) : (
              todayAttendance.map(rec => (
                <div key={rec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 20px',
                }}>
                  <Avatar name={rec.employee_detail?.full_name} department={rec.employee_detail?.department} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.employee_detail?.full_name}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {rec.employee_detail?.department}
                    </p>
                  </div>
                  <Badge variant={rec.status === 'Present' ? 'present' : 'absent'}>
                    {rec.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
