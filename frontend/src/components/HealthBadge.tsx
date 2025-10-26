import React from 'react'
import { API_URL } from '../api'

export default function HealthBadge() {
  const [ok, setOk] = React.useState<boolean | null>(null)
  React.useEffect(() => {
    fetch(`${API_URL}/health`).then(r => setOk(r.ok)).catch(() => setOk(false))
  }, [])
  if (ok === null) return <span>⏳ A verificar...</span>
  if (ok === false) return <span style={{ color: '#c00' }}>✖ Backend indisponível</span>
  return <span style={{ color: '#007a1f' }}>✔ Backend disponível</span>
}

