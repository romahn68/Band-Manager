import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getSongs, getMembers, getRehearsals, getGigs } from '../services/firestoreService';
import { Music, Users, Mic2, Calendar, Edit2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmartTuner from '../components/SmartTuner';

const StatCard = ({ icon, label, value, color, to, navigate }) => {
    const Icon = icon;
    return (
        <div
            onClick={() => navigate(to)}
            className="glass"
            style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                borderTop: `4px solid ${color}`
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ background: `${color}20`, padding: '0.75rem', borderRadius: '50%' }}>
                <Icon size={24} color={color} />
            </div>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{value}</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
        </div>
    );
};

const Dashboard = () => {
    const { activeBand, updateBandName } = useApp();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ songs: 0, musicians: 0, rehearsals: 0, gigs: 0 });
    const [nextGig, setNextGig] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(activeBand?.nombre || '');
    const [prevBandId, setPrevBandId] = useState(activeBand?.id);

    // Sync state during render if band changes (avoids effect-based cascading renders)
    if (activeBand?.id !== prevBandId) {
        setPrevBandId(activeBand?.id);
        setTempName(activeBand?.nombre || '');
    }

    const loadStats = React.useCallback(async () => {
        if (!activeBand) return;

        const s = await getSongs(activeBand.id);
        const m = await getMembers(activeBand.id);
        const r = await getRehearsals(activeBand.id);
        const g = await getGigs(activeBand.id);

        const today = new Date().toISOString().split('T')[0];
        const upcomingGigs = g
            .filter(gig => gig.fecha >= today)
            .sort((a, b) => a.fecha.localeCompare(b.fecha));

        setStats({ songs: s.length, musicians: m.length, rehearsals: r.length, gigs: g.length });
        setNextGig(upcomingGigs[0] || null);
    }, [activeBand]);

    useEffect(() => {
        if (activeBand) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadStats();
        }
    }, [activeBand, loadStats]);

    const handleUpdateName = () => {
        updateBandName(tempName);
        setIsEditingName(false);
    };

    return (
        <div className="container">
            {/* Header / Band Name */}
            <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
                {isEditingName ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            style={{ fontSize: '2rem', textAlign: 'center', width: 'auto', minWidth: '300px' }}
                            autoFocus
                        />
                        <button onClick={handleUpdateName} style={{ background: 'var(--accent-secondary)', color: 'white' }}>OK</button>
                    </div>
                ) : (
                    <div
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'pointer' }}
                        onClick={() => setIsEditingName(true)}
                    >
                        <h1 style={{ margin: 0, textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
                            {activeBand?.nombre || 'Mi Banda'}
                        </h1>
                        <Edit2 size={20} color="var(--text-secondary)" />
                    </div>
                )}
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Panel de Control</p>
            </div>

            {/* Next Gig Hero Widget */}
            <div className="glass" style={{
                padding: '2rem',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} /> Próximo Evento
                    </h3>
                    {nextGig ? (
                        <div>
                            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>
                                {new Date(nextGig.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h2>
                            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-primary)' }}>
                                {nextGig.setlist.length} canciones en el setlist
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-secondary)' }}>Nada programado</h2>
                            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>¡Es hora de buscar fechas!</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => navigate('/conciertos')}
                    style={{ background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {nextGig ? 'Ver Detalles' : 'Agendar Concierto'} <ArrowRight size={18} />
                </button>
            </div>

            {/* Dashboard Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 768 ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
                gap: '1.5rem'
            }}>

                {/* Stats Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth > 480 ? 'repeat(auto-fit, minmax(140px, 1fr))' : 'repeat(2, 1fr)',
                    gap: '1rem',
                    gridColumn: '1 / -1'
                }}>
                    <StatCard icon={Users} label="Músicos" value={stats.musicians} color="#f472b6" to="/musicos" navigate={navigate} />
                    <StatCard icon={Music} label="Canciones" value={stats.songs} color="#8b5cf6" to="/biblioteca" navigate={navigate} />
                    <StatCard icon={Mic2} label="Ensayos" value={stats.rehearsals} color="#10b981" to="/ensayos" navigate={navigate} />
                    <StatCard icon={Calendar} label="Conciertos" value={stats.gigs} color="#3b82f6" to="/conciertos" navigate={navigate} />
                </div>

                {/* AI Tools Section */}
                <div style={{ gridColumn: window.innerWidth > 768 ? '1 / span 1' : 'auto' }}>
                    <SmartTuner />
                </div>

                {/* Additional Quick Actions or Info */}
                <div className="glass" style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-secondary)', fontSize: '1.2rem' }}>Resumen</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Tienes {nextGig ? '1 concierto próximo' : '0 conciertos próximos'}.
                        Has registrado {stats.rehearsals} ensayos.
                    </p>
                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Band Manager Cloud v1.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
