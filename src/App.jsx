import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Songs from './pages/Songs';
import Rehearsals from './pages/Rehearsals';
import Gigs from './pages/Gigs';
import Inventory from './pages/Inventory';
import Finances from './pages/Finances';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
      Cargando...
    </div>
  );

  if (!currentUser) return <Navigate to="/login" />;

  if (requireProfile && !userProfile) return <Navigate to="/onboarding" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div style={{ paddingBottom: '8rem' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<ProtectedRoute requireProfile={false}><Onboarding /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/miembros" element={<ProtectedRoute><Members /></ProtectedRoute>} />
              <Route path="/biblioteca" element={<ProtectedRoute><Songs /></ProtectedRoute>} />
              <Route path="/ensayos" element={<ProtectedRoute><Rehearsals /></ProtectedRoute>} />
              <Route path="/conciertos" element={<ProtectedRoute><Gigs /></ProtectedRoute>} />
              <Route path="/inventario" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/finanzas" element={<ProtectedRoute><Finances /></ProtectedRoute>} />
              <Route path="/configuracion" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Navbar />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;


