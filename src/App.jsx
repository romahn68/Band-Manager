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

// Layout component with Sidebar
const MainLayout = ({ children }) => {
  const { error } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="main-content">
        {/* Mobile Header with Hamburger */}
        <div className="mobile-only-header">
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{ background: 'transparent', padding: '0.5rem', color: 'white', border: 'none' }}
          >
            <div style={{ width: '24px', height: '2px', background: 'white', marginBottom: '5px' }}></div>
            <div style={{ width: '24px', height: '2px', background: 'white', marginBottom: '5px' }}></div>
            <div style={{ width: '24px', height: '2px', background: 'white' }}></div>
          </button>
          <span style={{ marginLeft: '1rem', fontWeight: 'bold' }}>Band Manager</span>
        </div>

        {error && (
          <div className="glass" style={{
            padding: '1rem',
            marginBottom: '2rem',
            background: 'rgba(239, 68, 68, 0.2)',
            borderLeft: '4px solid #ef4444',
            color: '#fca5a5'
          }}>
            <strong>⚠️ Error de Conexión:</strong> {error}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
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

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;


