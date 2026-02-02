import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true, error, info });
    // Also log to console to help local debugging
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    const { error } = this.state;

    return (
      <div style={{ 
        padding: '40px 20px', 
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <div style={{ 
          maxWidth: '500px', 
          width: '100%',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: '#fee2e2', 
            borderRadius: '50%', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Something went wrong
          </h1>
          
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            We encountered an unexpected error. This could be due to:
          </p>
          
          <ul style={{ 
            textAlign: 'left',
            color: '#4b5563',
            marginBottom: '24px',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '8px' }}>Network connection issues</li>
            <li style={{ marginBottom: '8px' }}>Supabase authentication problems</li>
            <li style={{ marginBottom: '8px' }}>Missing database tables or configurations</li>
            <li style={{ marginBottom: '8px' }}>Browser cache conflicts</li>
          </ul>

          {error && (
            <div style={{ 
              marginBottom: '24px',
              padding: '16px',
              background: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}>
              <p style={{ 
                fontSize: '13px', 
                color: '#991b1b',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                Error Message:
              </p>
              <p style={{ 
                fontSize: '13px', 
                color: '#dc2626',
                wordBreak: 'break-word'
              }}>
                {String(error?.message || error)}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                this.handleReload();
              }}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Clear Cache & Reload
            </button>
          </div>
          
          <p style={{ 
            marginTop: '24px', 
            fontSize: '12px', 
            color: '#9ca3af' 
          }}>
            If the problem persists, check the browser console for details.
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
