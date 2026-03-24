import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';
import { DEV_EMAILS } from '../utils/constants';

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

export default MaintenanceGuard;
