import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useApp } from '../AppContext';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { Settings as SettingsIcon, UserPlus, Shield, Trash2, Save, Printer, ListOrdered } from 'lucide-react';
import { updateBandMetadata } from '../services/firestoreService';

const Settings = () => {
    const { currentUser, userProfile } = useAuth();
    const { activeBand, updateBandName } = useApp();
    const [tempBandName, setTempBandName] = useState(activeBand?.nombre || '');
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Rider Data State
    const [riderData, setRiderData] = useState(activeBand?.metadata?.rider || {
        channels: [
            { ch: '1', item: 'Kick', mic: 'Beta 52', notes: '' },
            { ch: '2', item: 'Snare', mic: 'SM57', notes: '' }
        ],
        notes: ''
    });

    useEffect(() => {
        if (activeBand) {
            setTempBandName(activeBand.nombre);
            if (activeBand.metadata?.rider) {
                setRiderData(activeBand.metadata.rider);
            }
        }
    }, [activeBand]);

    const handleUpdateBand = async () => {
        setLoading(true);
        try {
            await updateBandName(tempBandName);
            await updateBandMetadata(activeBand.id, { ...activeBand.metadata, rider: riderData });
            alert("Configuración de banda actualizada correctamente.");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addChannel = () => {
        setRiderData({
            ...riderData,
            channels: [...riderData.channels, { ch: (riderData.channels.length + 1).toString(), item: '', mic: '', notes: '' }]
        });
    };

    const updateChannel = (index, field, value) => {
        const newChannels = [...riderData.channels];
        newChannels[index][field] = value;
        setRiderData({ ...riderData, channels: newChannels });
    };

    const removeChannel = (index) => {
        setRiderData({
            ...riderData,
            channels: riderData.channels.filter((_, i) => i !== index)
        });
    };

    const handlePrintRider = () => {
        window.print();
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        // In a real app, this would send an invite. 
        // For this demo, we'll simulate adding a placeholder member to the band doc if they exist.
        alert("Funcionalidad de invitación (backend) en desarrollo. El sistema enviará un correo a: " + inviteEmail);
        setInviteEmail('');
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <SettingsIcon size={32} color="var(--accent-primary)" />
                    <h1 style={{ margin: 0 }}>Configuración de la Banda</h1>
                </div>
                <button
                    onClick={handlePrintRider}
                    style={{ background: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    className="no-print"
                >
                    <Printer size={18} /> Exportar Rider Pro
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }} className="no-print">

                {/* Band Info Section */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    <button
                        onClick={handleUpdateBand}
                        disabled={loading}
                        style={{ width: '100%', background: 'var(--accent-primary)', color: 'white' }}
                    >
                        <Save size={18} /> Guardar Configuración
                    </button>
                </div>

                {/* User Info Section */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} color="var(--accent-secondary)" /> Mi Perfil
                    </h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <p><strong>Nombre:</strong> {userProfile?.fullName}</p>
                        <p><strong>Edad:</strong> {userProfile?.age} años</p>
                        <p><strong>Rol:</strong> {userProfile?.roleInBand?.toUpperCase()}</p>
                        <p><strong>Email:</strong> {currentUser?.email}</p>
                    </div>
                </div>

                {/* Rider Técnico Form */}
                <div className="glass" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ListOrdered size={20} color="var(--accent-secondary)" /> Rider Técnico (Input List)
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Define los canales y micrófonos que tu banda necesita para sonar perfecto.</p>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '0.5rem' }}>CH</th>
                                    <th style={{ padding: '0.5rem' }}>Instrumento/Voz</th>
                                    <th style={{ padding: '0.5rem' }}>Mic/Line</th>
                                    <th style={{ padding: '0.5rem' }}>Notas</th>
                                    <th style={{ padding: '0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {riderData.channels.map((ch, index) => (
                                    <tr key={index}>
                                        <td style={{ padding: '0.5rem', width: '60px' }}>
                                            <input type="text" value={ch.ch} onChange={(e) => updateChannel(index, 'ch', e.target.value)} style={{ padding: '0.4rem' }} />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input type="text" value={ch.item} placeholder="Ej. Guitarra L" onChange={(e) => updateChannel(index, 'item', e.target.value)} style={{ padding: '0.4rem' }} />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input type="text" value={ch.mic} placeholder="Ej. SM57" onChange={(e) => updateChannel(index, 'mic', e.target.value)} style={{ padding: '0.4rem' }} />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input type="text" value={ch.notes} placeholder="Phantom, DI, etc." onChange={(e) => updateChannel(index, 'notes', e.target.value)} style={{ padding: '0.4rem' }} />
                                        </td>
                                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                            <button onClick={() => removeChannel(index)} style={{ background: 'none', color: '#ef4444', padding: '0.2rem' }}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={addChannel} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem' }}>+ Agregar Canal</button>
                        <button onClick={handleUpdateBand} style={{ background: 'var(--accent-secondary)', color: 'white', fontSize: '0.9rem' }}>Guardar Cambios Rider</button>
                    </div>
                </div>

                {/* Team Management - Placeholder for logic */}
                <div className="glass" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Gestión de Equipo (Roles y Permisos)</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Invita a otros músicos o managers a colaborar en la nube.</p>

                    <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', maxWidth: '600px' }}>
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                        />
                        <button type="submit" style={{ background: 'var(--accent-secondary)', color: 'white', whiteSpace: 'nowrap' }}>
                            <UserPlus size={18} /> Invitar Miembro
                        </button>
                    </form>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '1rem' }}>Usuario</th>
                                    <th style={{ padding: '1rem' }}>Rol</th>
                                    <th style={{ padding: '1rem' }}>Estado</th>
                                    <th style={{ padding: '1rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>{userProfile?.fullName} (Tú)</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
                                            ADMIN / {userProfile?.roleInBand?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#10b981' }}>Activo</td>
                                    <td style={{ padding: '1rem' }}>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Hidden Print Template for Rider */}
            <div className="print-only" style={{ padding: '40px', color: 'black', background: 'white' }}>
                <div style={{ borderBottom: '3px solid black', marginBottom: '30px', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28pt', color: 'black' }}>Rider Técnico: {activeBand?.nombre}</h1>
                        <p style={{ margin: 0, fontSize: '12pt', color: '#444' }}>Input List Oficial - Sincronizado vía Cloud</p>
                    </div>
                </div>

                <h2 style={{ fontSize: '18pt', marginBottom: '15px' }}>1. Input List</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid black' }}>CH</th>
                            <th style={{ padding: '10px', border: '1px solid black' }}>Instrumento / Voz</th>
                            <th style={{ padding: '10px', border: '1px solid black' }}>Micrófono / DI</th>
                            <th style={{ padding: '10px', border: '1px solid black' }}>Notas Técnicas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riderData.channels.map((ch, index) => (
                            <tr key={index}>
                                <td style={{ padding: '10px', border: '1px solid black' }}>{ch.ch}</td>
                                <td style={{ padding: '10px', border: '1px solid black', fontWeight: 'bold' }}>{ch.item}</td>
                                <td style={{ padding: '10px', border: '1px solid black' }}>{ch.mic}</td>
                                <td style={{ padding: '10px', border: '1px solid black' }}>{ch.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2 style={{ fontSize: '18pt', marginTop: '30px', marginBottom: '10px' }}>2. Notas de Monitoreo y Escenario</h2>
                <div style={{ border: '1px solid #ddd', padding: '15px', minHeight: '100px', fontSize: '11pt' }}>
                    {riderData.notes || 'No hay notas adicionales especificadas.'}
                </div>

                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', fontSize: '10pt', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <span>Fecha de Emisión: {new Date().toLocaleDateString()}</span>
                    <span>Generado por Band Manager Pro v1.0</span>
                </div>
            </div>
        </div>
    );
};

export default Settings;
