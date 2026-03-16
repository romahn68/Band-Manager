import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { ROLES } from '../utils/constants';
import { Users, Copy, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import styles from './Musicians.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../hooks/usePermissions';
import { getMusiciansPaginated, deleteMusician, updateMemberRole, createInvite, getMusiciansCount, updateMusician } from '../services/firestoreService';
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
    const [inviteData, setInviteData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        perfil: 'Musico',
        permisos: ROLES.VISOR
    });
    const [generatedLink, setGeneratedLink] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

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
            } else {
                await updateMusician(activeBand.id, id, { [field]: value });
            }
            // Update local state for immediate feedback
            setMusicians(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
        } catch (error) {
            console.error("Error updating field:", error);
            alert("Error al actualizar campo");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleGenerateLink = async (e) => {
        e.preventDefault();
        // Security Guard
        if (!canInvite) return;
        if (!activeBand || !inviteData.correo) return;

        setIsGenerating(true);
        try {
            await createInvite(activeBand.id, inviteData);
            const joinLink = `${window.location.origin}/unirse/banda/${activeBand.inviteCode}?email=${encodeURIComponent(inviteData.correo)}`;
            setGeneratedLink(joinLink);
        } catch (error) {
            console.error("Error generating invite:", error);
            alert("No se pudo generar la invitación.");
        } finally {
            setIsGenerating(false);
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
        const text = `🎸 *Invitación a Band Manager*\n\nHola ${inviteData.nombre}, te invito a unirte a la banda *${activeBand.nombre}*.\n\nUsa este enlace personalizado para registrarte y acceder al panel:\n${generatedLink}`;
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

            {canInvite && (
                <section className={styles.inviteSectionFull}>
                    <div className={styles.inviteContent}>
                        <h2 className={styles.inviteTitle}>Invitar músico / personal</h2>
                        <p className={styles.inviteSubtitle}>Genera liga de acceso personalizada para tu equipo.</p>
                        
                        <form onSubmit={handleGenerateLink} className={styles.inviteGrid}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Nombre</label>
                                <input 
                                    className={styles.input}
                                    placeholder="Nombre"
                                    value={inviteData.nombre}
                                    onChange={e => setInviteData({...inviteData, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Correo (Para Login)</label>
                                <input 
                                    className={styles.input}
                                    type="email"
                                    placeholder="email@ejemplo.com"
                                    value={inviteData.correo}
                                    onChange={e => setInviteData({...inviteData, correo: e.target.value.toLowerCase()})}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Rol en Banda</label>
                                <select 
                                    className={styles.select}
                                    value={inviteData.perfil}
                                    onChange={e => setInviteData({...inviteData, perfil: e.target.value})}
                                >
                                    <option value="Musico">Músico</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Staff">Staff</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Permisos App</label>
                                <select 
                                    className={styles.select}
                                    value={inviteData.permisos}
                                    onChange={e => setInviteData({...inviteData, permisos: e.target.value})}
                                >
                                    <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
                                    <option value={ROLES.EDITOR}>{ROLES.EDITOR}</option>
                                    <option value={ROLES.VISOR}>{ROLES.VISOR}</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button type="submit" className={styles.button} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="animate-spin" /> : 'Generar Acceso'}
                                </button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {generatedLink && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.linkBox}
                                >
                                    <div>
                                        <p className={styles.label} style={{ marginBottom: '0.2rem' }}>Liga personalizada lista:</p>
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
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            )}
        </motion.div>
    );
};

export default Musicians;
