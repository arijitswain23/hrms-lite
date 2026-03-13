import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16, padding: '80px 24px', textAlign: 'center',
    }}>
      <p style={{ fontSize: 80, fontWeight: 800, color: 'var(--color-navy-faint)', lineHeight: 1 }}>404</p>
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: 300 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button variant="primary" icon={Home} onClick={() => navigate('/')}>
        Back to Dashboard
      </Button>
    </div>
  )
}
