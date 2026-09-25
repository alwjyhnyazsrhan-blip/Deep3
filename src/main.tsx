import React, { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRITICAL RUNTIME ERROR in React Tree]:', error, errorInfo);
  }

  handleReload = () => {
    if (typeof (window as any).clearCacheAndReload === 'function') {
      (window as any).clearCacheAndReload();
    } else {
      window.location.reload();
    }
  };

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    this.handleReload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0b1329',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          direction: 'rtl',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            padding: '28px 24px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚓</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f87171', margin: '0 0 10px' }}>
              تعذر استئناف رحلة اللعبة
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '16px' }}>
              حدث تعذر غير متوقع أثناء تشغيل واجهة اللعبة. اضغط على زر التحديث لتفريغ الذاكرة المؤقتة واستئناف التشغيل.
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '11px',
              color: '#fca5a5',
              fontFamily: 'monospace',
              marginBottom: '20px',
              wordBreak: 'break-all'
            }}>
              {this.state.error?.message || 'Unexpected application error'}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                  color: '#0f172a',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                تحديث اللعبة 🔄
              </button>
              <button
                onClick={this.handleResetStorage}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  border: '1px solid #ef4444',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                إعادة ضبط الذاكرة ⚙️
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Global Unhandled Rejection Prevented]:', event.reason);
    event.preventDefault();
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
  (window as any).__appLoaded = true;
}

