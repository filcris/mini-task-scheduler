import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; message?: string }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(err: any): State {
    return { hasError: true, message: err?.message ?? 'Erro a renderizar' }
  }
  componentDidCatch(error: any, info: any) {
    // útil para debug
    console.error('ErrorBoundary:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, border: '1px solid #c00', borderRadius: 8, background: '#fee' }}>
          <h3 style={{ marginTop: 0 }}>Ocorreu um erro no UI</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
