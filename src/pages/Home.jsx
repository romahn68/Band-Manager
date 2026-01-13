import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Calendar, DollarSign, Package, Cloud, ChevronRight, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    React.useEffect(() => {
        if (currentUser && userProfile) {
            navigate('/dashboard');
        }
    }, [currentUser, userProfile, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0a0c',
            color: 'white',
            overflowX: 'hidden'
        }}>
            {/* Background Image with Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("/assets/studio_bg.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.25,
                zIndex: 0,
            }} />
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, transparent, #0a0a0c)',
                zIndex: 1,
            }} />

            {/* Navbar */}
            <nav style={{
                position: 'relative',
                zIndex: 10,
                padding: '2rem 5%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <img src="/assets/logo_brand.png" alt="Logo" style={{ height: '50px' }} />
                <button
                    onClick={() => navigate('/login')}
                    className="glass-button"
                    style={{
                        padding: '0.8rem 2rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid var(--accent-primary)',
                        color: 'white'
                    }}
                >
                    <LogIn size={18} /> Entrar
                </button>
            </nav>

            {/* Hero Section */}
            <main style={{
                position: 'relative',
                zIndex: 5,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '4rem 1rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <img src="/assets/logo_hero.png" alt="Band Manager Pro" style={{ maxWidth: '400px', width: '80%', marginBottom: '2.5rem', borderRadius: '15px' }} />

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        marginBottom: '1.5rem',
                        textShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
                    }}>
                        Domina el Escenario.<br />
                        <span style={{ color: 'var(--accent-secondary)' }}>Gestiona tu Banda.</span>
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        maxWidth: '700px',
                        margin: '0 auto 3rem',
                        opacity: 0.8,
                        lineHeight: '1.6'
                    }}>
                        La plataforma definitiva para músicos y directores. Centraliza tus canciones, conciertos, finanzas y equipo en un ecosistema profesional diseñado para la excelencia musical.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '1.2rem 3rem',
                                fontSize: '1.1rem',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            Empezar Ahora <ChevronRight size={20} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    </div>
                </motion.div>

                {/* Features Grid - The 'Marketing Model' (Interest & Desire) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    width: '100%',
                    maxWidth: '1200px',
                    marginTop: '8rem',
                    padding: '0 1rem'
                }}>
                    <FeatureCard
                        icon={<Music />}
                        title="Biblioteca Digital"
                        desc="Organiza letras, acordes y partituras con acceso instantáneo en cualquier lugar."
                    />
                    <FeatureCard
                        icon={<Calendar />}
                        title="Gigs & Rehearsals"
                        desc="Gestiona tus eventos, itinerarios y avisos a músicos sin complicaciones."
                    />
                    <FeatureCard
                        icon={<DollarSign />}
                        title="Control Financiero"
                        desc="Mantén las cuentas claras: ingresos, gastos y repartos automáticos para la banda."
                    />
                    <FeatureCard
                        icon={<Package />}
                        title="Gestión de Inventario"
                        desc="Control total sobre el equipo, estado técnico y responsables de carga."
                    />
                    <FeatureCard
                        icon={<Cloud />}
                        title="Nube de Archivos"
                        desc="Almacenamiento seguro para demos, manuales y documentos esenciales."
                    />
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                position: 'relative',
                zIndex: 10,
                padding: '4rem 1rem',
                textAlign: 'center',
                marginTop: '4rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.4)'
            }}>
                <img src="/assets/logo_brand.png" alt="Logo mini" style={{ height: '30px', opacity: 0.5, marginBottom: '1rem' }} />
                <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>
                    © {new Date().getFullYear()} Band Manager Pro. Todos los derechos reservados.
                </p>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '500' }}>
                    Design: <span style={{ color: 'var(--accent-secondary)' }}>Alan Romahn</span>
                </p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass" style={{
        padding: '2rem',
        textAlign: 'left',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'transform 0.3s ease',
        cursor: 'default'
    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            marginBottom: '1.5rem'
        }}>
            {icon}
        </div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>{title}</h3>
        <p style={{ opacity: 0.7, fontSize: '1rem', lineHeight: '1.5' }}>{desc}</p>
    </div>
);

export default Home;
