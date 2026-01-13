import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Music, Calendar, Mic2, LayoutDashboard, Settings, LogOut, User, Package, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();

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
        { to: '/musicos', icon: <Users size={20} />, label: 'Músicos' },
        { to: '/biblioteca', icon: <Music size={20} />, label: 'Canciones' },
        { to: '/ensayos', icon: <Mic2 size={20} />, label: 'Ensayos' },
        { to: '/conciertos', icon: <Calendar size={20} />, label: 'Conciertos' },
        { to: '/inventario', icon: <Package size={20} />, label: 'Inventario' },
        { to: '/finanzas', icon: <DollarSign size={20} />, label: 'Finanzas' },
        { to: '/configuracion', icon: <Settings size={20} />, label: 'Ajustes' },
    ];

    return (
        <>
            {/* User Profile Bar (Top/Fixed or part of layout) - Let's make it a small floating bar at top right */}
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 1000
            }}>
                {userProfile && (
                    <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: 'var(--accent-primary)', padding: '0.4rem', borderRadius: '50%' }}>
                            <User size={16} color="white" />
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{userProfile.fullName}</span>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.6rem', borderRadius: '12px' }}
                    title="Cerrar Sesión"
                >
                    <LogOut size={20} />
                </button>
            </div>

            <nav className="glass" style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                zIndex: 1000,
                maxWidth: '95vw',
                overflowX: 'auto'
            }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        style={({ isActive }) => ({
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontSize: '0.7rem',
                            textDecoration: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                            minWidth: '60px'
                        })}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
};

export default Navbar;

