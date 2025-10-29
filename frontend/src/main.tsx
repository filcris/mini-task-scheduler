import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// ErrorBoundary simples para evitar ecrã branco em runtime
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: any, info: any) {
    console.error('🧯 ErrorBoundary capturou:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ marginBottom: 8 }}>Ocorreu um erro na página</h1>
          <p>Tenta recarregar. Se persistir, faz logout/login novamente.</p>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  console.error('[main] #root não encontrado no index.html')
  throw new Error('Elemento #root não encontrado')
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

// Logs úteis para apanhar erros globais em dev
window.addEventListener('error', (e) => {
  console.error('[window.onerror]', e.error || e.message || e)
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('[unhandledrejection]', e.reason)
})



