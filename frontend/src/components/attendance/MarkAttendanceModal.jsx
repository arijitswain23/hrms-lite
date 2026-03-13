/**
 * HRMS Lite – Mark Attendance Modal
 */

import { useState, useEffect } from 'react'
import { Modal, Select, Input, Button } from '../ui'
import { todayISO } from '../../utils/helpers'

const EMPTY = { employee: '', date: todayISO(), status: 'Present', note: '' }

const STATUS_OPTIONS = [
  { value: 'Present', label: '✓  Present' },
  { value: 'Absent',  label: '✗  Absent'  },
]

export default function MarkAttendanceModal({ open, onClose, onSubmit, employees = [] }) {
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Reset form when opened
  useEffect(() => {
    if (open) { setForm(EMPTY); setErrors({}) }
  }, [open])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.employee) errs.employee = 'Please select an employee.'
    if (!form.date)     errs.date     = 'Please select a date.'
    if (!form.status)   errs.status   = 'Please select a status.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const result = await onSubmit({
      employee: parseInt(form.employee, 10),
      date: form.date,
      status: form.status,
      note: form.note.trim(),
    })
    setLoading(false)

    if (result.success) {
      onClose()
    } else if (result.errors) {
      const mapped = {}
      Object.entries(result.errors).forEach(([k, v]) => {
        mapped[k] = Array.isArray(v) ? v[0] : v
      })
      setErrors(mapped)
    }
  }

  const empOptions = employees.map(e => ({
    value: String(e.id),
    label: `${e.full_name} (${e.employee_id})`,
  }))

  return (
    <Modal open={open} onClose={onClose} title="Mark Attendance">
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <Select
            label="Employee"
            name="employee"
            value={form.employee}
            onChange={handleChange}
            options={empOptions}
            placeholder="Select employee…"
            error={errors.employee}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              error={errors.date}
              required
            />
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
              error={errors.status}
              required
            />
          </div>

          <Input
            label="Note (optional)"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="e.g. Sick leave, WFH…"
          />

          {/* Non-field error */}
          {errors.non_field_errors && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-absent)', padding: '8px 12px', background: 'var(--color-absent-bg)', borderRadius: 'var(--radius-sm)' }}>
              {errors.non_field_errors}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" loading={loading}>Mark Attendance</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
