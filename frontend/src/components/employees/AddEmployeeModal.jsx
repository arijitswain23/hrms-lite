/**
 * HRMS Lite – Add Employee Modal
 * Form with field-level validation to create a new employee.
 */

import { useState } from 'react'
import { Modal, Input, Select, Button } from '../ui'

const EMPTY = { employee_id: '', full_name: '', email: '', department: '' }

export default function AddEmployeeModal({ open, onClose, onSubmit, departments = [] }) {
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required.'
    if (!form.full_name.trim())   errs.full_name   = 'Full name is required.'
    if (!form.email.trim())       errs.email       = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.'
    if (!form.department)         errs.department  = 'Please select a department.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const result = await onSubmit({ ...form, email: form.email.toLowerCase() })
    setLoading(false)

    if (result.success) {
      setForm(EMPTY)
      setErrors({})
      onClose()
    } else if (result.errors) {
      // Map backend field errors back to form
      const mapped = {}
      Object.entries(result.errors).forEach(([k, v]) => {
        mapped[k] = Array.isArray(v) ? v[0] : v
      })
      setErrors(mapped)
    }
  }

  function handleClose() {
    setForm(EMPTY)
    setErrors({})
    onClose()
  }

  const deptOptions = departments.map(d => ({ value: d.value, label: d.label }))

  return (
    <Modal open={open} onClose={handleClose} title="Add New Employee">
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Employee ID"
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              placeholder="e.g. EMP001"
              error={errors.employee_id}
              required
            />
            <Input
              label="Full Name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              error={errors.full_name}
              required
            />
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@company.com"
            error={errors.email}
            required
          />

          <Select
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            options={deptOptions}
            placeholder="Select department…"
            error={errors.department}
            required
          />

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Add Employee
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
