import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary atrapó un error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0c',
          color: 'white',
          textAlign: 'center',
          padding: '2rem',
          fontFamily: 'Lato, sans-serif'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>¡Ups! Algo salió mal.</h1>
          <p style={{ color: '#9ca3af', maxWidth: '500px', marginBottom: '2rem' }}>
            La aplicación ha encontrado un error inesperado. Intenta recargar la página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              background: '#8b5cf6', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Recargar Aplicación
          </button>
          <pre style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'left', maxWidth: '90%', overflow: 'auto' }}>
              {this.state.error?.toString()}
              {"\n\nComponent Stack:\n"}
              {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
