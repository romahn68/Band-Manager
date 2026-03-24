import React from 'react';
import { Shield, Key, Save, Plus } from 'lucide-react';

const SettingsBandAdmin = ({ activeBand, tempBandName, setTempBandName, handleUpdateBand, loading, createNewBand }) => {
    return (
        <>
            <div className="glass" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} color="var(--accent-secondary)" /> Información General
                </h2>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre de la Banda</label>
                    <input
                        type="text"
                        value={tempBandName}
                        onChange={(e) => setTempBandName(e.target.value)}
                    />
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        <Key size={14} /> ID Administrativo (Band)
                    </div>
                    <code style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                        {activeBand?.customId || 'SIN ASIGNAR'}
                    </code>
                </div>
                <button
                    onClick={handleUpdateBand}
                    disabled={loading}
                    style={{ width: '100%', background: 'var(--accent-primary)', color: 'white' }}
                >
                    <Save size={18} /> Guardar Configuración
                </button>
            </div>

            <div className="glass" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} color="var(--accent-secondary)" /> Crear Nueva Banda
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    ¿Tienes otro proyecto musical? Crea un espacio separado para él.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input placeholder="Nombre de la nueva banda" id="newBandNameInput" />
                    <button
                        onClick={async () => {
                            const input = document.getElementById('newBandNameInput');
                            if (!input.value) return;
                            if (window.confirm(`¿Crear banda "${input.value}"?`)) {
                                await createNewBand(input.value);
                                setTempBandName(input.value);
                                input.value = '';
                                alert('¡Banda creada y seleccionada!');
                            }
                        }}
                        style={{ background: 'var(--accent-secondary)', color: 'white', whiteSpace: 'nowrap' }}
                    >
                        Crear
                    </button>
                </div>
            </div>
        </>
    );
};

export default SettingsBandAdmin;
