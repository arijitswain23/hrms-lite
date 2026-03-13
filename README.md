# HRMS Lite — Lightweight Human Resource Management System

A full-stack HRMS application built with **Django REST Framework** (backend) and **React + Vite** (frontend), backed by **PostgreSQL**.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Local Development Setup](#local-development-setup)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
4. [Environment Variables](#environment-variables)
5. [API Reference](#api-reference)
6. [Deployment](#deployment)
   - [Backend → Railway](#backend--railway)
   - [Frontend → Vercel](#frontend--vercel)
7. [Features](#features)
8. [Design Decisions](#design-decisions)

---

## Project Structure

```
hrms-lite/
├── backend/                        # Django REST API
│   ├── apps/
│   │   ├── employees/              # Employee management app
│   │   │   ├── models.py           # Employee model + Department choices
│   │   │   ├── serializers.py      # Validation + serialization
│   │   │   ├── views.py            # List/Create/Detail/Delete endpoints
│   │   │   ├── urls.py             # URL routing
│   │   │   └── admin.py            # Django admin registration
│   │   └── attendance/             # Attendance tracking app
│   │       ├── models.py           # Attendance model
│   │       ├── serializers.py      # Validation + serialization
│   │       ├── views.py            # All attendance endpoints
│   │       ├── urls.py             # URL routing
│   │       └── admin.py
│   ├── hrms_project/
│   │   ├── settings/
│   │   │   ├── base.py             # Shared settings
│   │   │   └── production.py       # Production overrides
│   │   ├── urls.py                 # Root URL config
│   │   ├── exceptions.py           # Custom error envelope
│   │   └── wsgi.py                 # WSGI entry point
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile                    # Railway / Gunicorn startup
│   ├── railway.json                # Railway deployment config
│   └── .env.example
│
└── frontend/                       # React + Vite SPA
    ├── src/
    │   ├── components/
    │   │   ├── ui/                 # Reusable components (Button, Modal, Badge…)
    │   │   ├── layout/             # Sidebar, Topbar
    │   │   ├── employees/          # AddEmployeeModal
    │   │   └── attendance/         # MarkAttendanceModal
    │   ├── pages/
    │   │   ├── DashboardPage.jsx
    │   │   ├── EmployeesPage.jsx
    │   │   ├── EmployeeDetailPage.jsx
    │   │   ├── AttendancePage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── hooks/
    │   │   ├── useEmployees.js     # Employee state + mutations
    │   │   └── useAttendance.js    # Attendance state + mutations
    │   ├── services/
    │   │   └── api.js              # Axios instance + all API calls
    │   ├── utils/
    │   │   └── helpers.js          # Date formatting, initials, etc.
    │   ├── App.jsx                 # Routes + layout shell
    │   ├── main.jsx                # React entry point
    │   └── index.css               # Global styles + design tokens
    ├── index.html
    ├── vite.config.js
    ├── vercel.json                 # Vercel SPA rewrite rule
    └── .env.example
```

---

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | React 18, Vite, React Router v6    |
| Styling    | Vanilla CSS + CSS Custom Properties |
| HTTP       | Axios                              |
| Backend    | Python 3.11+, Django 4.2, DRF      |
| Database   | PostgreSQL                         |
| Deployment | Vercel (frontend), Railway (backend)|

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### Backend Setup

```bash
# 1. Navigate to backend directory
cd hrms-lite/backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE hrms_lite;"

# 5. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 6. Run migrations
python manage.py migrate

# 7. (Optional) Create superuser for Django Admin
python manage.py createsuperuser

# 8. Start development server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`
Django Admin: `http://localhost:8000/admin/`
Health check: `http://localhost:8000/health/`

---

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd hrms-lite/frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL=http://localhost:8000/api/v1

# 4. Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Environment Variables

### Backend `.env`

```env
SECRET_KEY=your-long-random-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost 127.0.0.1

DB_NAME=hrms_lite
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## API Reference

### Base URL
`/api/`

All responses follow this envelope:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Errors:
```json
{
  "success": false,
  "message": "Human-readable message",
  "errors": { "field": ["Detail"] }
}
```

### Employees

| Method | Endpoint              | Description                      |
|--------|-----------------------|----------------------------------|
| GET    | `/employees/`         | List employees (search, filter)  |
| POST   | `/employees/`         | Create employee                  |
| GET    | `/employees/<id>/`    | Get single employee              |
| DELETE | `/employees/<id>/`    | Delete employee + records        |
| GET    | `/departments/`       | List valid department choices    |

**Query params for GET /employees/:**
- `search` — searches employee_id, full_name, email
- `department` — filter by department name
- `ordering` — e.g. `full_name`, `-created_at`

### Attendance

| Method | Endpoint                        | Description                      |
|--------|---------------------------------|----------------------------------|
| GET    | `/attendance/`                  | List records (filterable)        |
| POST   | `/attendance/`                  | Mark attendance                  |
| GET    | `/attendance/<id>/`             | Get single record                |
| PUT    | `/attendance/<id>/`             | Update record                    |
| DELETE | `/attendance/<id>/`             | Delete record                    |
| GET    | `/attendance/employee/<id>/`    | All records for one employee     |
| GET    | `/attendance/summary/`          | Per-employee summary stats       |

**Query params for GET /attendance/:**
- `employee` — filter by employee DB id
- `status` — `Present` or `Absent`
- `date_from` / `date_to` — ISO date strings (YYYY-MM-DD)

---


## Features

### Employee Management
- Add employees with unique ID, name, email, department
- Search by name, ID, or email
- Filter by department
- View detailed employee profile with attendance history
- Delete employee (cascades attendance records)

### Attendance Management
- Mark attendance (Present/Absent) for any employee on any date
- Add optional note per record
- Filter by employee, status, date range
- Quick "Today" filter
- Delete individual records
- Per-employee stats: total, present, absent, percentage

### UI/UX
- Clean editorial design with navy + accent blue palette
- Loading, empty, and error states on every view
- Toast notifications for all actions
- Responsive layout (mobile sidebar)
- Accessible focus states

---

## Design Decisions

- **Unique constraint** on `(employee, date)` prevents duplicate attendance marks
- **Cascade delete** — removing an employee also removes all their attendance records
- **Custom exception handler** — all errors return a consistent JSON envelope
- **Versioned API** — `/api/` prefix allows non-breaking API evolution
- **CSS Custom Properties** — design tokens in `index.css` ensure consistency without a CSS framework
- **Custom hooks** — `useEmployees` and `useAttendance` keep page components lean
