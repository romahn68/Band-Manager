import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Music, Calendar, Mic2, LayoutDashboard, Settings, LogOut, User, Package, DollarSign, Server } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import BandSwitcher from './BandSwitcher';
import styles from './Sidebar.module.css';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { DEV_EMAILS } from '../utils/constants';

import { usePermissions } from '../hooks/usePermissions';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { userProfile, currentUser, logout } = useAuth();
    const { canViewFinances, canAccessSettings } = usePermissions();
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
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Inicio', visible: true },
        { to: '/conciertos', icon: <Calendar size={20} />, label: 'Conciertos', visible: true },
        { to: '/ensayos', icon: <Mic2 size={20} />, label: 'Ensayos', visible: true },
        { to: '/biblioteca', icon: <Music size={20} />, label: 'Canciones', visible: true },
        { to: '/musicos', icon: <Users size={20} />, label: 'Músicos', visible: true },
        { to: '/inventario', icon: <Package size={20} />, label: 'Inventario', visible: true },
        { to: '/finanzas', icon: <DollarSign size={20} />, label: 'Finanzas', visible: canViewFinances },
        { to: '/configuracion', icon: <Settings size={20} />, label: 'Ajustes', visible: canAccessSettings },
    ].filter(item => item.visible);

    const sidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: isMobile ? '-100%' : 0, opacity: isMobile ? 0 : 1 }
    };

    return (
        <>
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className={styles.mobileOverlay}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={isMobile ? "closed" : false}
                animate={isMobile ? (isOpen ? "open" : "closed") : false}
                variants={sidebarVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`${styles.sidebarContainer} ${isMobile ? styles.sidebarMobile : styles.sidebarDesktop}`}
                style={{ width: isMobile ? '280px' : '260px' }}
            >
                <div className={styles.sidebarHeader}>
                    <BandSwitcher />
                    {isMobile && (
                        <button
                            onClick={() => setIsOpen(false)}
                            className={styles.closeBtn}
                            style={{ position: 'absolute', top: '0', right: '0' }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <nav className={styles.navMenu}>
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.to}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <NavLink
                                to={item.to}
                                onClick={() => isMobile && setIsOpen(false)}
                                className={({ isActive }) =>
                                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                                }
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        </motion.div>
                    ))}
                </nav>

                <div className={styles.userProfileSection}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            <User size={22} color="var(--accent-primary)" />
                        </div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>
                                {userProfile?.fullName || currentUser?.displayName || 'Usuario'}
                            </div>
                            <div className={styles.userEmail}>
                                {currentUser?.email || 'Sin correo'}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className={styles.btnLogout}
                    >
                        <LogOut size={18} /> Salir de la App
                    </button>

                    {/* DEV ONLY SECTION */}
                    {currentUser && DEV_EMAILS.includes(currentUser.email) && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <NavLink
                                to="/dev"
                                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                style={{ color: '#10b981' }} // Green for Dev
                            >
                                <span className={styles.navIcon}><Server size={20} /></span>
                                <span>Cuarto de Máquinas</span>
                            </NavLink>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
