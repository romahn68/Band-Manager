import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getSongsCount, getMusiciansCount, getRehearsalsCount, getGigsCount, getUpcomingGigs } from '../services/firestoreService';
import { Music, Users, Mic2, Calendar, Edit2, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmartTuner from '../components/SmartTuner';
import StatCard from '../components/StatCard';
import styles from './Dashboard.module.css';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
};

const Dashboard = () => {
    const { activeBand, updateBandName } = useApp();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ songs: 0, musicians: 0, rehearsals: 0, gigs: 0 });
    const [nextGig, setNextGig] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(activeBand?.nombre || '');
    const [prevBandId, setPrevBandId] = useState(activeBand?.id);
    const [loading, setLoading] = useState(true);

    if (activeBand?.id !== prevBandId) {
        setPrevBandId(activeBand?.id);
        setTempName(activeBand?.nombre || '');
    }

    const loadStats = React.useCallback(async () => {
        if (!activeBand) return;
        setLoading(true);
        try {
            // Parallel execution for performance (Architect Rule #1)
            const [sCount, mCount, rCount, gCount, nextGigs] = await Promise.all([
                getSongsCount(activeBand.id),
                getMusiciansCount(activeBand.id),
                getRehearsalsCount(activeBand.id),
                getGigsCount(activeBand.id), // We now use countFromServer (optimization)
                getUpcomingGigs(activeBand.id, 1) // Optimized query for hero widget
            ]);

            setStats({
                songs: sCount,
                musicians: mCount,
                rehearsals: rCount,
                gigs: gCount
            });

            setNextGig(nextGigs[0] || null);
        } catch (error) {
            console.error("Error loading dashboard stats:", error);
        }
        setLoading(false);
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
        <motion.div
            className="container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header / Band Name */}
            <header className={styles.dashboardHeader}>
                <AnimatePresence mode="wait">
                    {isEditingName ? (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={styles.editNameForm}
                        >
                            <input
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className={styles.editInput}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                            />
                            <button onClick={handleUpdateName} className={styles.saveBtn}>Guardar</button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="view"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className={styles.titleContainer}
                            onClick={() => setIsEditingName(true)}
                        >
                            <h1>{activeBand?.nombre || 'Mi Banda'}</h1>
                            <Edit2 size={24} color="var(--accent-primary)" />
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.subtitle}
                >
                    <Zap size={16} inline style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Panel de Control Elite
                </motion.p>
            </header>

            {/* Next Gig Hero Widget */}
            <motion.div
                variants={itemVariants}
                className={`glass ${styles.heroWidget} ${loading ? 'skeleton' : ''}`}
            >
                <div className={styles.heroContent}>
                    <h3><Calendar size={24} /> Próximo Evento</h3>
                    {nextGig ? (
                        <div>
                            <h2 className={styles.heroTitle}>
                                {new Date(nextGig.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h2>
                            <p className={styles.heroText}>
                                {nextGig.setlist.length} canciones preparadas para el show
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h2 className={styles.heroEmptyTitle}>Escenario Vacío</h2>
                            <p className={styles.heroEmptyText}>Tu próxima gran fecha te está esperando.</p>
                        </div>
                    )}
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/conciertos')}
                    className={styles.heroBtn}
                >
                    {nextGig ? 'Gestionar Show' : 'Programar Ahora'} <ArrowRight size={22} />
                </motion.button>
            </motion.div>

            {/* Dashboard Grid */}
            <div className={styles.dashboardGrid}>
                {/* Stats Section */}
                <div className={styles.statsSection}>
                    {loading ? (
                        <>
                            <div className={`glass ${styles.statCard} skeleton`} style={{ height: '120px' }} />
                            <div className={`glass ${styles.statCard} skeleton`} style={{ height: '120px' }} />
                            <div className={`glass ${styles.statCard} skeleton`} style={{ height: '120px' }} />
                            <div className={`glass ${styles.statCard} skeleton`} style={{ height: '120px' }} />
                        </>
                    ) : (
                        <>
                            <StatCard icon={Users} label="Músicos" value={stats.musicians} color="var(--accent-tertiary)" to="/musicos" navigate={navigate} />
                            <StatCard icon={Music} label="Canciones" value={stats.songs} color="var(--accent-primary)" to="/biblioteca" navigate={navigate} />
                            <StatCard icon={Mic2} label="Ensayos" value={stats.rehearsals} color="var(--accent-secondary)" to="/ensayos" navigate={navigate} />
                            <StatCard icon={Calendar} label="Conciertos" value={stats.gigs} color="var(--accent-quaternary)" to="/conciertos" navigate={navigate} />
                        </>
                    )}
                </div>

                {/* AI Tools Section */}
                <motion.div variants={itemVariants} className={styles.tunerSection}>
                    <SmartTuner />
                </motion.div>

                {/* Resumen Card */}
                <motion.div variants={itemVariants} className={`glass ${styles.summaryCard}`}>
                    <h3>Análisis de Actividad</h3>
                    <p className={styles.summaryText}>
                        Actualmente tienes {nextGig ? 'un show confirmado' : 'ningún show activo'} en el radar.
                        La banda ha completado {stats.rehearsals} sesiones de ensayo. Mantén el ritmo para el próximo éxito.
                    </p>
                    <div className={styles.summaryFooter}>
                        <span className={styles.versionTag}>BAND MANAGER PRO // v1.0</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
