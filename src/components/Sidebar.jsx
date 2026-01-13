import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Music, Calendar, Mic2, LayoutDashboard, Settings, LogOut, User, Package, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../hooks/useApp';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { userProfile, currentUser, logout } = useAuth();
    const { activeBand } = useApp();
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error(error);
        }
    };

    const navItems = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Inicio' },
        { to: '/conciertos', icon: <Calendar size={20} />, label: 'Conciertos' },
        { to: '/ensayos', icon: <Mic2 size={20} />, label: 'Ensayos' },
        { to: '/biblioteca', icon: <Music size={20} />, label: 'Canciones' },
        { to: '/musicos', icon: <Users size={20} />, label: 'Músicos' },
        { to: '/inventario', icon: <Package size={20} />, label: 'Inventario' },
        { to: '/finanzas', icon: <DollarSign size={20} />, label: 'Finanzas' },
        { to: '/configuracion', icon: <Settings size={20} />, label: 'Ajustes' },
    ];

    const sidebarContent = (
        <div className="glass" style={{
            width: isMobile ? '280px' : '260px',
            height: isMobile ? '100%' : '95vh',
            position: isMobile ? 'fixed' : 'fixed',
            left: isMobile ? (isOpen ? '0' : '-300px') : '1rem',
            top: isMobile ? '0' : '1rem',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            borderRadius: isMobile ? '0' : '16px',
            zIndex: 1001,
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
        }}>
            {/* Logo / Band Name Area */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--accent-primary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}>
                        B
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                        {activeBand?.nombre || 'Band Manager'}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {userProfile?.roleInBand?.toUpperCase() || 'MÚSICO'}
                    </span>
                </div>
                {isMobile && (
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.4rem', borderRadius: '8px' }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Navigation Links */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => isMobile && setIsOpen(false)}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        })}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile / Logout Section */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                        <User size={18} color="var(--text-secondary)" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userProfile?.fullName || currentUser?.displayName || 'Usuario'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser?.email || 'Sin correo'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem'
                    }}
                >
                    <LogOut size={16} /> Salir
                </button>
            </div>
        </div>
    );

    return (
        <>
            {isMobile && isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        transition: 'opacity 0.3s'
                    }}
                />
            )}
            {sidebarContent}
        </>
    );
};

export default Sidebar;
