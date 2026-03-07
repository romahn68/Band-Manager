import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { AuthProvider } from './AuthContext';
import { useAuth } from './hooks/useAuth';
import { useApp } from './hooks/useApp';

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
import DevDashboard from './pages/DevDashboard';
import Sidebar from './components/Sidebar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
      Cargando...
    </div>
  );

  if (!currentUser) return <Navigate to="/login" />;

  return children;
};

import { DEV_EMAILS } from './utils/constants';

const ProtectedDevRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!currentUser || !DEV_EMAILS.includes(currentUser.email)) {
    return <Navigate to="/" />;
  }

  return children;
};

// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Layout component with Sidebar
const MainLayout = ({ children }) => {
  const { error } = useApp();
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

function App() {
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = React.useState(true);

  React.useEffect(() => {
    let unsubscribe;

    // Lazy load the subscription to avoid circular dependency issues during init if any
    import('./services/adminService').then(({ subscribeToSettings }) => {
      unsubscribe = subscribeToSettings((settings) => {
        setMaintenanceMode(settings?.maintenanceMode || false);
        setCheckingMaintenance(false);
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (checkingMaintenance) {
    return <div style={{ height: '100vh', background: '#09090b' }} />;
  }

  return (
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
              <Route path="/configuracion" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
              <Route path="/dev" element={<ProtectedDevRoute><MainLayout><DevDashboard /></MainLayout></ProtectedDevRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </AppProvider>
      </MaintenanceGuard>
    </AuthProvider>
  );
}

// Special Guard that checks for Maintenance Mode
const MaintenanceGuard = ({ isMaintenance, children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  // If in maintenance and user is NOT a dev (or not logged in)
  if (isMaintenance) {
    const isDev = currentUser && DEV_EMAILS.includes(currentUser.email);
    if (!isDev) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
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
              Logged in as: {currentUser.email}
            </div>
          )}
        </div>
      );
    }
  }

  return children;
};

export default App;


