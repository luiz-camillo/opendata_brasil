import { Component } from 'react'

/**
 * ErrorBoundary catches rendering errors thrown by its child component tree
 * and displays a fallback UI instead of crashing the whole application.
 *
 * Props:
 * - children: React nodes to render and guard.
 * - fallback: optional custom fallback renderer, called as fallback(error, reset).
 * - onReset: optional callback invoked when the user requests a retry.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.handleReset = this.handleReset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info)
  }

  handleReset() {
    this.setState({ hasError: false, error: null })
    if (typeof this.props.onReset === 'function') {
      this.props.onReset()
    }
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (typeof fallback === 'function') {
        return fallback(error, this.handleReset)
      }

      return (
        <div role="alert" style={{ padding: 24, textAlign: 'center' }}>
          <h2>Algo deu errado</h2>
          <p style={{ color: 'var(--color-text-muted, #5c6370)' }}>
            {error?.message || 'Ocorreu um erro inesperado.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              borderRadius: 8,
              background: 'var(--color-primary, #0d6b4f)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
