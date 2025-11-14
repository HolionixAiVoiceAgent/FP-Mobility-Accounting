import React from 'react';

type State = {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
};

export class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true, error, info });
    // Also log to console to help local debugging
    // eslint-disable-next-line no-console
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    const { error, info } = this.state;

    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
        <h1 style={{ color: '#c0392b' }}>Application Error</h1>
        <p style={{ color: '#333' }}>A runtime error occurred while rendering the application.</p>

        {error && (
          <section style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: 14, marginBottom: 6 }}>Error</h2>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, borderRadius: 6 }}>{String(error?.message || error)}</pre>
          </section>
        )}

        {info && (
          <section style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: 14, marginBottom: 6 }}>Component Stack</h2>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, borderRadius: 6 }}>{info.componentStack}</pre>
          </section>
        )}

        <p style={{ marginTop: 12 }}>Open the browser console for a full stack trace.</p>
      </div>
    );
  }
}

export default ErrorBoundary;
