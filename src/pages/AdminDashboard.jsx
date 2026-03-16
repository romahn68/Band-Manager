import React, { useState, useEffect, useCallback } from 'react';
import { 
    Server, Users, Database, Shield, Zap, Search, Trash2, 
    RefreshCcw, AlertTriangle, CheckCircle2, XCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getAllUsers, getAllBands, subscribeToSettings, 
    toggleFeatureFlag, deleteUserAdmin, deleteBandCascade,
    updateUserSysAdmin
} from '../services/adminService';
import { useApp } from '../hooks/useApp';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { ghostMode, enterGhostMode, exitGhostMode } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [bands, setBands] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [uData, bData] = await Promise.all([
                getAllUsers(),
                getAllBands()
            ]);
            setUsers(uData);
            setBands(bData);
        } catch (error) {
            console.error("Error loading admin data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const unsubscribe = subscribeToSettings(setSettings);
        return () => unsubscribe();
    }, [loadData]);

    const handleToggleSysAdmin = async (userId, currentStatus) => {
        if (window.confirm(`¿Seguro que quieres cambiar el rol de este usuario?`)) {
            setActionLoading(true);
            try {
                await updateUserSysAdmin(userId, !currentStatus);
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, sysAdmin: !currentStatus } : u));
            } catch (e) {
                alert("Error: " + e.message);
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleGhostMode = (band) => {
        if (window.confirm(`¿Quieres entrar en Modo Ghost para la banda "${band.nombre || band.name_band}"?`)) {
            enterGhostMode(band);
            navigate('/dashboard');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`¿Estás SEGURO de eliminar al usuario ${userName}? Esta acción no se puede deshacer.`)) {
            setActionLoading(true);
            try {
                await deleteUserAdmin(userId);
                setUsers(prev => prev.filter(u => u.id !== userId));
            } catch (e) {
                alert("Error: " + e.message);
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleDeleteBand = async (bandId, bandName) => {
        if (window.confirm(`⚠️ ADVERTENCIA CRÍTICA: Vas a eliminar la banda "${bandName}" y TODOS sus datos asociados (Canciones, Finanzas, Miembros, etc.).\n\n¿Proceder con el borrado en cascada?`)) {
            setActionLoading(true);
            try {
                await deleteBandCascade(bandId);
                setBands(prev => prev.filter(b => b.id !== bandId));
            } catch (e) {
                alert("Error: " + e.message);
            } finally {
                setActionLoading(false);
            }
        }
    };

    const toggleFlag = async (key) => {
        try {
            await toggleFeatureFlag(key, !settings[key]);
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    const filteredUsers = users.filter(u => 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredBands = bands.filter(b => 
        (b.nombre || b.name_band)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const renderOverview = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                <Users size={40} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Usuarios Registrados</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{users.length}</div>
            </div>
            <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                <Database size={40} color="var(--accent-secondary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Bandas Totales</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{bands.length}</div>
            </div>
            <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                <Shield size={40} color="#10b981" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estado del Sistema</h3>
                <div style={{ color: '#10b981', fontWeight: 'bold' }}>CONTROL TOTAL</div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="glass" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                <Search size={20} color="var(--text-secondary)" />
                <input 
                    placeholder="Buscar usuarios por nombre o correo..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%' }}
                />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', fontSize: '0.8rem' }}>
                        <th style={{ padding: '1rem' }}>USUARIO</th>
                        <th style={{ padding: '1rem' }}>EMAIL</th>
                        <th style={{ padding: '1rem' }}>SISTEMA</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <td style={{ padding: '1rem' }}>{user.fullName || 'Anónimo'}</td>
                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                            <td style={{ padding: '1rem' }}>
                                <button
                                    onClick={() => handleToggleSysAdmin(user.id, user.sysAdmin)}
                                    style={{ 
                                        padding: '0.4rem 0.8rem', 
                                        borderRadius: '6px', 
                                        border: 'none',
                                        fontSize: '0.7rem',
                                        background: user.sysAdmin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: user.sysAdmin ? '#10b981' : 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {user.sysAdmin ? 'ADMIN' : 'USUARIO'}
                                </button>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <button 
                                    onClick={() => handleDeleteUser(user.id, user.fullName)}
                                    className="no-print"
                                    style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderBands = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filteredBands.map(band => (
                <div key={band.id} className="glass" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{band.nombre || band.name_band}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                onClick={() => handleGhostMode(band)}
                                title="Entrar en Modo Ghost"
                                style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)', border: 'none', padding: '0.4rem', borderRadius: '8px' }}
                            >
                                <Zap size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteBand(band.id, band.nombre || band.name_band)}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '8px' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        <Zap size={12} inline /> ID: <span style={{ fontFamily: 'monospace' }}>{band.id}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Users size={12} inline /> Miembros: {band.members?.length || 0}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderSystem = () => (
        <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} color="var(--accent-primary)" /> Motores y Feature Flags
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                    { key: 'maintenanceMode', label: 'Modo Mantenimiento', desc: 'Bloquea el acceso a usuarios no administradores.', icon: AlertTriangle, color: '#f59e0b' },
                    { key: 'enableAiAssistant', label: 'Asistente IA (Beta)', desc: 'Activa el módulo de Inteligencia Artificial.', icon: Zap, color: '#8b5cf6' },
                    { key: 'enableGlobalSearch', label: 'Búsqueda Global', desc: 'Permite buscar entre todas las bandas del sistema.', icon: Search, color: '#3b82f6' }
                ].map(flag => (
                    <div key={flag.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ background: `${flag.color}22`, padding: '0.75rem', borderRadius: '10px' }}>
                                <flag.icon size={20} color={flag.color} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{flag.label}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{flag.desc}</div>
                            </div>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={!!settings[flag.key]} 
                                onChange={() => toggleFlag(flag.key)}
                                style={{ transform: 'scale(1.4)', cursor: 'pointer' }}
                            />
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="container">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Server size={32} color="#10b981" /> Cuarto de Máquinas
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 'bold', letterSpacing: '1px' }}>ADMINISTRADOR SUPREMO</p>
                </div>
                <button 
                    onClick={loadData} 
                    style={{ background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <RefreshCcw size={18} className={loading ? 'spin' : ''} /> Refrescar
                </button>
            </header>

            {/* Admin Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {[
                    { id: 'overview', icon: Activity, label: 'Resumen' },
                    { id: 'users', icon: Users, label: 'Usuarios' },
                    { id: 'bands', icon: Database, label: 'Bandas' },
                    { id: 'system', icon: Shield, label: 'Sistema' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                        style={{
                            padding: '0.8rem 1.5rem',
                            background: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--glass-bg)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={activeTab}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <RefreshCcw size={48} className="spin" style={{ marginBottom: '1rem' }} />
                        <p>Sincronizando con los fierros de la base de datos...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'bands' && renderBands()}
                        {activeTab === 'system' && renderSystem()}
                    </>
                )}
            </motion.div>
            
            {actionLoading && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center' 
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <RefreshCcw size={64} className="spin" color="var(--accent-primary)" />
                        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>Ejecutando operación crítica...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const Activity = ({ size, color, style }) => <Server size={size} color={color} style={style} />;

export default AdminDashboard;
