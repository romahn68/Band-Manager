import React from 'react';
import { useApp } from '../hooks/useApp';

const BandProfile = () => {
    const { activeBand, updateBandName, loading } = useApp();

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="container">
            <h1 style={{ color: 'var(--accent-primary)' }}>Perfil de la Banda</h1>
            <div className="glass" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Nombre de la Banda *
                    </label>
                    <input
                        type="text"
                        value={activeBand?.nombre || ''}
                        onChange={(e) => updateBandName(e.target.value)}
                        placeholder="Ej. Los Rockeros Galácticos"
                        required
                    />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Este nombre se utilizará en todas las secciones de la aplicación.
                </p>
            </div>
        </div>
    );
};

export default BandProfile;
