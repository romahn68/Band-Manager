import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { Check, ChevronDown, Plus, Users, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BandSwitcher = () => {
    const { activeBand, userBands, switchBand, createNewBand } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitch = (bandId) => {
        switchBand(bandId);
        setIsOpen(false);
        navigate('/dashboard'); // Reset view to dashboard usually makes sense
    };

    const handleCreate = () => {
        // Quick create or navigate to full page? 
        // For now, let's use a prompt for simplicity as "New Band" creation is simple in this app
        const name = prompt("Nombre de la nueva banda:");
        if (name) {
            createNewBand(name);
            setIsOpen(false);
            navigate('/dashboard');
        }
    };

    const handleJoin = () => {
        setIsOpen(false);
        const code = prompt("Ingresa el código de invitación (6 caracteres):");
        if (code) {
            navigate(`/unirse/${code}`);
        }
    };

    if (!activeBand) return null;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', marginBottom: '1rem' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="glass"
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    color: 'white',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Music size={16} color="white" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                            {activeBand.name_band || activeBand.nombre}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Workspace</span>
                    </div>
                </div>
                <ChevronDown size={16} color="#9ca3af" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>

            {isOpen && (
                <div className="glass" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: '#18181b', // Solid dark logical background
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    zIndex: 50,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Mis Bandas
                    </div>

                    {userBands.map(band => (
                        <button
                            key={band.id}
                            onClick={() => handleSwitch(band.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.6rem 0.75rem',
                                background: band.id === activeBand.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                color: band.id === activeBand.id ? '#c4b5fd' : '#d1d5db',
                                cursor: 'pointer',
                                marginBottom: '0.2rem',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.target.style.background = band.id === activeBand.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent'}
                        >
                            <span style={{ truncate: true }}>{band.name_band || band.nombre}</span>
                            {band.id === activeBand.id && <Check size={14} />}
                        </button>
                    ))}

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

                    <button
                        onClick={handleCreate}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 0.75rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#10b981',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}
                    >
                        <Plus size={16} /> Crear Nueva Banda
                    </button>

                    <button
                        onClick={handleJoin}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 0.75rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}
                    >
                        <Users size={16} /> Unirse a una Banda
                    </button>
                </div>
            )}
        </div>
    );
};

export default BandSwitcher;
