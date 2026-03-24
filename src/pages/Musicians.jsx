import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { ROLES } from '../utils/constants';
import { Users, Copy, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import styles from './Musicians.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../hooks/usePermissions';
import { getMusiciansPaginated, deleteMusician, updateMemberRole, getMusiciansCount, updateMusician, addMusician } from '../services/firestoreService';
import { Share2, MessageCircle } from 'lucide-react';

const Musicians = () => {
    const { activeBand } = useApp();
    const { isAdmin, canManageMembers, canInvite, isVisor } = usePermissions();
    const [musicians, setMusicians] = useState([]);
    const [totalMusicians, setTotalMusicians] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [manualData, setManualData] = useState({
        nombre: '',
        instrumento: '',
        profile: 'Musico',
        role: ROLES.VISOR
    });
    const generatedLink = activeBand ? `${window.location.origin}/unirse/banda/${activeBand.inviteCode}` : '';
    const [isAdding, setIsAdding] = useState(false);

    const loadInitial = React.useCallback(async () => {
        if (!activeBand) return;
        setLoading(true);
        try {
            const [paginationResult, count] = await Promise.all([
                getMusiciansPaginated(activeBand.id, 15, null),
                getMusiciansCount(activeBand.id)
            ]);
            
            setMusicians(paginationResult.data);
            setLastVisible(paginationResult.lastDoc);
            setHasMore(paginationResult.data.length === 15);
            setTotalMusicians(count);
        } catch (error) {
            console.error("Error loading musicians:", error);
        } finally {
            setLoading(false);
        }
    }, [activeBand]);

    useEffect(() => {
        loadInitial();
    }, [activeBand, loadInitial]);

    const handleDelete = async (id) => {
        // Security Guard (Fase D)
        if (isVisor) return;

        if (window.confirm('¿Eliminar a este músico?')) {
            await deleteMusician(activeBand.id, id);
            loadInitial();
        }
    };

    const handleInlineUpdate = async (id, field, value) => {
        // Security Guard (Fase D)
        if (!canManageMembers || isVisor) return;

        setUpdatingId(id);
        try {
            // If updating role, we use the specific updateMemberRole service
            if (field === 'role') {
                const musician = musicians.find(m => m.id === id);
                if (musician.uid) {
                    await updateMemberRole(activeBand.id, musician.uid, value);
                } else {
                    await updateMusician(activeBand.id, id, { role: value });
                }
            } else if (field === 'instrumento') {
                // Fix: Instrument is stored as an object { nombre: 'Guitarra' } in DataModels
                await updateMusician(activeBand.id, id, { instrument: { nombre: value } });
                setMusicians(prev => prev.map(m => m.id === id ? { ...m, instrument: { nombre: value } } : m));
            } else {
                await updateMusician(activeBand.id, id, { [field]: value });
                setMusicians(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
            }
            // Update local state for immediate feedback inside the above blocks based on structure
        } catch (error) {
            console.error("Error updating field:", error);
            alert("Error al actualizar campo");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAddManual = async (e) => {
        e.preventDefault();
        // Security Guard
        if (!canManageMembers) return;
        if (!activeBand || !manualData.nombre) return;

        setIsAdding(true);
        try {
            await addMusician(activeBand.id, {
                nombre: manualData.nombre,
                instrument: { nombre: manualData.instrumento },
                profile: manualData.profile,
                role: manualData.role
            });
            setManualData({ nombre: '', instrumento: '', profile: 'Musico', role: ROLES.VISOR });
            loadInitial();
        } catch (error) {
            console.error("Error adding musician:", error);
            alert("No se pudo agregar al músico.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleCopyLink = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        alert("¡Enlace copiado!");
    };

    const handleShareWA = () => {
        if (!generatedLink) return;
        // Adjusted sharing text for clarity and professionalism
        const text = `🎸 *Invitación a Band Manager*\n\n¡Hola! Te invito a unirte a nuestra banda *${activeBand.nombre}*.\n\nUsa este enlace para registrarte y unirte al panel:\n${generatedLink}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    if (loading) return <div className={styles.container}><Loader2 className="animate-spin" /> Cargando músicos...</div>;

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Users size={32} color="var(--accent-primary)" />
                    <h1 className={styles.title}>Directorio de Músicos</h1>
                </div>
                <div className={styles.idBadge}>
                    Total: {totalMusicians}
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Instrumento</th>
                            <th>Perfil</th>
                            <th>Permisos</th>
                            {canManageMembers && <th></th>}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {musicians.map(m => (
                                <motion.tr 
                                    key={m.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <td data-label="Nombre">
                                        <div className={styles.nameCell}>
                                            <div className={styles.avatar}>
                                                {m.nombre?.charAt(0) || 'M'}
                                            </div>
                                            {canManageMembers ? (
                                                <input 
                                                    className={styles.inlineInput}
                                                    value={m.nombre || ''}
                                                    onChange={(e) => handleInlineUpdate(m.id, 'nombre', e.target.value)}
                                                    onBlur={() => setUpdatingId(null)}
                                                />
                                            ) : (
                                                <span>{m.nombre}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td data-label="Instrumento">
                                        {canManageMembers ? (
                                            <input 
                                                className={styles.inlineInput}
                                                value={m.instrument?.nombre || m.instrumento || ''}
                                                onChange={(e) => handleInlineUpdate(m.id, 'instrumento', e.target.value)}
                                            />
                                        ) : (
                                            <span>{m.instrument?.nombre || m.instrumento || 'Sin instrumento'}</span>
                                        )}
                                    </td>
                                    <td data-label="Perfil">
                                        {canManageMembers ? (
                                            <select 
                                                className={styles.inlineSelect}
                                                value={m.profile || 'Musico'}
                                                onChange={(e) => handleInlineUpdate(m.id, 'profile', e.target.value)}
                                            >
                                                <option value="Musico">Músico</option>
                                                <option value="Director">Director</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Staff">Staff</option>
                                            </select>
                                        ) : (
                                            <span>{m.profile || 'Músico'}</span>
                                        )}
                                    </td>
                                    <td data-label="Permisos">
                                        {isAdmin && m.uid ? (
                                            <select 
                                                className={styles.inlineSelect}
                                                value={m.role || ROLES.VISOR}
                                                onChange={(e) => handleInlineUpdate(m.id, 'role', e.target.value)}
                                                disabled={updatingId === m.id}
                                            >
                                                <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
                                                <option value={ROLES.EDITOR}>{ROLES.EDITOR}</option>
                                                <option value={ROLES.VISOR}>{ROLES.VISOR}</option>
                                            </select>
                                        ) : (
                                            <span className={styles.idBadge}>{m.role || ROLES.VISOR}</span>
                                        )}
                                    </td>
                                    {canManageMembers && (
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => handleDelete(m.id)} className={styles.deleteButton}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {canManageMembers && (
                <section className={styles.inviteSectionFull}>
                    <div className={styles.inviteContent}>
                        <h2 className={styles.inviteTitle}>Agregar Músico Manualmente</h2>
                        <p className={styles.inviteSubtitle}>Añade un músico a la lista (sin acceso a la app).</p>
                        
                        <form onSubmit={handleAddManual} className={styles.inviteGrid}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Nombre</label>
                                <input 
                                    className={styles.input}
                                    placeholder="Nombre"
                                    value={manualData.nombre}
                                    onChange={e => setManualData({...manualData, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Instrumento</label>
                                <input 
                                    className={styles.input}
                                    placeholder="Ej. Guitarra"
                                    value={manualData.instrumento}
                                    onChange={e => setManualData({...manualData, instrumento: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Rol en Banda</label>
                                <select 
                                    className={styles.select}
                                    value={manualData.profile}
                                    onChange={e => setManualData({...manualData, profile: e.target.value})}
                                >
                                    <option value="Musico">Músico</option>
                                    <option value="Director">Director</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Staff">Staff</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Permisos App (Si se une luego)</label>
                                <select 
                                    className={styles.select}
                                    value={manualData.role}
                                    onChange={e => setManualData({...manualData, role: e.target.value})}
                                >
                                    <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
                                    <option value={ROLES.EDITOR}>{ROLES.EDITOR}</option>
                                    <option value={ROLES.VISOR}>{ROLES.VISOR}</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button type="submit" className={styles.button} disabled={isAdding}>
                                    {isAdding ? <Loader2 className="animate-spin" /> : 'Agregar Músico'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            )}

            {canInvite && (
                <section className={styles.inviteSectionFull} style={{ marginTop: '1rem' }}>
                    <div className={styles.inviteContent}>
                        <h2 className={styles.inviteTitle}>Enlace de Invitación</h2>
                        <p className={styles.inviteSubtitle}>Comparte este enlace para que otros miembros se unan a la banda con su propia cuenta.</p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.linkBox}
                            style={{ marginTop: '1rem' }}
                        >
                            <div style={{ wordBreak: 'break-all' }}>
                                <code className={styles.linkCode}>{generatedLink}</code>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={handleCopyLink} className={styles.copyButton}>
                                    <Copy size={16} /> Copiar
                                </button>
                                <button onClick={handleShareWA} className={`${styles.copyButton} ${styles.waButton}`}>
                                    <Share2 size={16} /> WhatsApp
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}
        </motion.div>
    );
};

export default Musicians;
