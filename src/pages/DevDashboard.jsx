import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { MessageSquare, Database, Server, ChevronRight, ChevronDown, Users, Activity, Settings as SettingsIcon, Shield } from 'lucide-react';
import { getAllUsers, subscribeToSettings, toggleFeatureFlag } from '../services/adminService';

const DevDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Data States
    const [bands, setBands] = useState([]);
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState({});

    // UI States
    const [loading, setLoading] = useState(true);
    const [selectedBand, setSelectedBand] = useState(null);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Bands (Raw)
                const bandsSnapshot = await getDocs(collection(db, "bands"));
                const bandsData = bandsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBands(bandsData);

                // Fetch Users
                const usersData = await getAllUsers();
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching dev data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Realtime Settings
        const unsubscribe = subscribeToSettings((data) => {
            setSettings(data);
        });

        return () => unsubscribe();
    }, []);

    const toggleFlag = async (flag) => {
        try {
            const currentVal = settings[flag] || false;
            await toggleFeatureFlag(flag, !currentVal);
        } catch (error) {
            alert("Error updating flag: " + error.message);
        }
    };

    const renderOverview = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <Activity size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
                <h3>System Status</h3>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginTop: '0.5rem' }}>OPERATIONAL</div>
            </div>
            <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <Users size={32} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                <h3>Total Users</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{users.length}</div>
            </div>
            <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <Database size={32} color="#8b5cf6" style={{ marginBottom: '1rem' }} />
                <h3>Total Bands</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{bands.length}</div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="glass" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <tr>
                        <th style={{ padding: '1rem' }}>Usuario</th>
                        <th style={{ padding: '1rem' }}>Email</th>
                        <th style={{ padding: '1rem' }}>ID</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {user.fullName ? user.fullName[0] : '?'}
                                </div>
                                {user.fullName || 'Sin Nombre'}
                            </td>
                            <td style={{ padding: '1rem', color: '#9ca3af' }}>{user.email}</td>
                            <td style={{ padding: '1rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>{user.id}</td>
                            <td style={{ padding: '1rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '20px',
                                    background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.8rem'
                                }}>
                                    Active
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderFlags = () => (
        <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} /> Feature Flags & Config
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Disables app access for non-admins.' },
                    { key: 'enableBetaFeatures', label: 'Enable Beta Features', desc: 'Shows unfinished features to users.' },
                    { key: 'enableAiAssistant', label: 'AI Module (GPT)', desc: 'Activates the AI helper in chat.' }
                ].map(flag => (
                    <div key={flag.key} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{flag.label}</div>
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{flag.desc}</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={!!settings[flag.key]}
                                onChange={() => toggleFlag(flag.key)}
                                style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderInspector = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
            {/* Left: Collections List */}
            <div className="glass" style={{ padding: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#8b5cf6' }}><Database size={16} style={{ display: 'inline' }} /> Colección: Bands</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {bands.map(band => (
                        <div
                            key={band.id}
                            onClick={() => setSelectedBand(band)}
                            style={{
                                padding: '0.75rem',
                                background: selectedBand?.id === band.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', color: '#e5e7eb' }}>
                                {band.name_band || band.nombre}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                ID: {band.id}
                            </div>
                            {band.band_id ? (
                                <div style={{ fontSize: '0.7rem', color: '#10b981' }}>✓ Standardized</div>
                            ) : (
                                <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>⚠️ Legacy Format</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Inspector */}
            <div className="glass" style={{ padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#3b82f6' }}>Inspector de Objetos</h3>
                {selectedBand ? (
                    <pre style={{
                        background: '#0f0f12',
                        padding: '1rem',
                        borderRadius: '8px',
                        overflow: 'auto',
                        maxHeight: '70vh',
                        color: '#a5b4fc'
                    }}>
                        {JSON.stringify(selectedBand, null, 2)}
                    </pre>
                ) : (
                    <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                        Selecciona un documento de la izquierda para ver sus propiedades internas raw.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem', color: 'white' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Server color="#10b981" /> Machine Room
                </h1>
                <p style={{ color: '#9ca3af' }}>
                    Panel de Control Maestro - v2.0
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {['overview', 'users', 'flags', 'data'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === tab ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div>Cargando sistema...</div>
            ) : (
                <>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'flags' && renderFlags()}
                    {activeTab === 'data' && renderInspector()}
                </>
            )}
        </div>
    );
};

export default DevDashboard;
