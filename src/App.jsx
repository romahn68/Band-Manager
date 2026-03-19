import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { AuthProvider } from './AuthContext';
import { useAuth } from './hooks/useAuth';
import { useApp } from './hooks/useApp';
import { usePermissions } from './hooks/usePermissions';

import Dashboard from './pages/Dashboard';
import Musicians from './pages/Musicians';
import Songs from './pages/Songs';
import Rehearsals from './pages/Rehearsals';
import Gigs from './pages/Gigs';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Finances from './pages/Finances';
import JoinBand from './pages/JoinBand';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import { subscribeToSettings } from './services/adminService';
import LoadingScreen from './components/LoadingScreen';

// --- Error Boundary Component ---
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { loading: appLoading, activeBand } = useApp();

  if (authLoading || appLoading) return <LoadingScreen message="Verificando acceso y cargando datos..." />;

  if (!currentUser) return <Navigate to="/login" />;

  return children;
};

import { DEV_EMAILS } from './utils/constants';

const ProtectedDevRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <LoadingScreen message="Accediendo al Cuarto de Máquinas..." />;

  const isSysAdmin = currentUser && (
    DEV_EMAILS.includes(currentUser.email) || 
    userProfile?.sysAdmin === true
  );

  if (!isSysAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

import { Zap } from 'lucide-react';

// Layout component with Sidebar
const MainLayout = ({ children }) => {
  const { error, ghostMode, exitGhostMode, activeBand } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="main-content" style={{ position: 'relative', width: '100%' }}>
        {/* Ghost Mode Banner */}
        {ghostMode && (
          <div style={{ 
            background: 'rgba(139, 92, 246, 0.95)', 
            color: 'white', 
            padding: '0.6rem 2rem', 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <Zap size={18} className="spin" />
              <span>MODO GHOST ACTIVO: Simulando a <strong>{activeBand?.nombre || activeBand?.name_band}</strong></span>
            </div>
            <button 
              onClick={exitGhostMode}
              style={{ background: 'white', color: 'var(--accent-primary)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Salir
            </button>
          </div>
        )}
        {/* Mobile Header with Hamburger */}
        {isMobile && (
          <div className="mobile-only-header glass">
            <button
              onClick={() => setIsSidebarOpen(true)}
              style={{ background: 'transparent', padding: '0.5rem', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              <div style={{ width: '24px', height: '2px', background: 'var(--accent-primary)', marginBottom: '5px', borderRadius: '2px' }}></div>
              <div style={{ width: '18px', height: '2px', background: 'var(--accent-primary)', marginBottom: '5px', borderRadius: '2px' }}></div>
              <div style={{ width: '24px', height: '2px', background: 'var(--accent-primary)', borderRadius: '2px' }}></div>
            </button>
            <span style={{ marginLeft: '1rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              Band Manager <span style={{ color: 'var(--accent-primary)' }}>Pro</span>
            </span>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{
              padding: '1rem',
              margin: '1rem 2rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '4px solid #ef4444',
              color: '#fca5a5'
            }}
          >
            <strong>⚠️ Error de Conexión:</strong> {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.main
            key={window.location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
};

const SettingsRoute = () => {
  const permissions = usePermissions();
  if (!permissions.canAccessSettings) return <Navigate to="/dashboard" replace />;
  return <Settings />;
};

function App() {
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = React.useState(true);

  useEffect(() => {
    // Basic timeout as a safety measure for initialization
    const safetyTimer = setTimeout(() => {
      if (checkingMaintenance) {
        setCheckingMaintenance(false);
      }
    }, 4000); // 4s fallback

    const unsubscribe = subscribeToSettings((settings) => {
      setMaintenanceMode(settings?.maintenanceMode || false);
      setCheckingMaintenance(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (checkingMaintenance) {
    return <LoadingScreen message="Iniciando sistema..." />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <MaintenanceGuard isMaintenance={maintenanceMode}>
          <AppProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

                {/* Main App Routes with Sidebar */}
                <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/musicos" element={<ProtectedRoute><MainLayout><Musicians /></MainLayout></ProtectedRoute>} />
                <Route path="/biblioteca" element={<ProtectedRoute><MainLayout><Songs /></MainLayout></ProtectedRoute>} />
                <Route path="/ensayos" element={<ProtectedRoute><MainLayout><Rehearsals /></MainLayout></ProtectedRoute>} />
                <Route path="/conciertos" element={<ProtectedRoute><MainLayout><Gigs /></MainLayout></ProtectedRoute>} />
                <Route path="/inventario" element={<ProtectedRoute><MainLayout><Inventory /></MainLayout></ProtectedRoute>} />
                <Route path="/finanzas" element={<ProtectedRoute><MainLayout><Finances /></MainLayout></ProtectedRoute>} />
                <Route path="/unirse/:code" element={<JoinBand />} />
                <Route path="/configuracion" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SettingsRoute />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dev" element={<ProtectedDevRoute><MainLayout><AdminDashboard /></MainLayout></ProtectedDevRoute>} />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </AppProvider>
        </MaintenanceGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const MaintenanceGuard = ({ isMaintenance, children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <LoadingScreen message="Sincronizando..." />;

  // If in maintenance and user is NOT a dev (or not logged in)
  if (isMaintenance) {
    const isSysAdmin = currentUser && (
      DEV_EMAILS.includes(currentUser.email) || 
      userProfile?.sysAdmin === true
    );
    if (!isSysAdmin) {
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
          padding: '2rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fbbf24' }}>Sistema en Mantenimiento</h1>
          <p style={{ color: '#9ca3af', maxWidth: '500px' }}>
            Estamos realizando mejoras importantes en la plataforma.
            Volveremos a estar operativos en unos minutos.
          </p>
          {currentUser && (
            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#4b5563' }}>
              Sesión activa: {currentUser.email}
            </div>
          )}
        </div>
      );
    }
  }

  return children;
};

export default App;
