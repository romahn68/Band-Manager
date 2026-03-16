import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getRehearsalsPaginated, addRehearsal, deleteRehearsal, getSongs, updateRehearsal } from '../services/firestoreService';
import { Plus, Trash2, Calendar as CalendarIcon, GripVertical, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import SyncCalendarButton from '../components/SyncCalendarButton';
import CommentsSection from '../components/CommentsSection';
import AttachmentUploader from '../components/AttachmentUploader';
import styles from './Rehearsals.module.css';

const Rehearsals = () => {
    const { activeBand } = useApp();
    const [rehearsals, setRehearsals] = useState([]);
    const [songs, setSongs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ fecha: '', cancionesIds: [] });
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadInitial = React.useCallback(async () => {
        if (!activeBand) return;
        setLoading(true);
        try {
            const { data, lastVisible: lastDoc } = await getRehearsalsPaginated(activeBand.id, 15, null);
            setRehearsals(data);
            setLastVisible(lastDoc);
            setHasMore(data.length === 15);

            const sData = await getSongs(activeBand.id);
            setSongs(sData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [activeBand]);

    const loadMore = async () => {
        if (!activeBand || loading || !hasMore) return;
        setLoading(true);
        try {
            const { data, lastVisible: lastDoc } = await getRehearsalsPaginated(activeBand.id, 15, lastVisible);
            setRehearsals(prev => [...prev, ...data]);
            setLastVisible(lastDoc);
            setHasMore(data.length === 15);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeBand) {
            loadInitial();
        }
    }, [activeBand, loadInitial]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!formData.fecha) return;
        await addRehearsal(activeBand.id, formData);
        setFormData({ fecha: '', cancionesIds: [] });
        setShowForm(false);
        loadInitial();
    };

    const toggleSong = (songId) => {
        const current = formData.cancionesIds;
        if (current.includes(songId)) {
            setFormData({ ...formData, cancionesIds: current.filter(id => id !== songId) });
        } else {
            setFormData({ ...formData, cancionesIds: [...current, songId] });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este registro de ensayo?')) {
            await deleteRehearsal(activeBand.id, id);
            loadInitial();
        }
    };

    if (loading && rehearsals.length === 0) {
        return <div className={styles.container}><Loader2 className="animate-spin" /> Cargando ensayos...</div>;
    }

    return (
        <motion.div 
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className={styles.header}>
                <h1 className={styles.title}>Registro de Ensayos</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={styles.actionButton}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />} {showForm ? 'Cancelar' : 'Nuevo Ensayo'}
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.form 
                        className={styles.formGrid} 
                        onSubmit={handleAdd}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Fecha del Ensayo *</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.fecha}
                                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                                required
                            />
                        </div>

                        <label className={styles.label}>Seleccionar Canciones Practicadas:</label>
                        <div className={styles.songSelector}>
                            {songs.map(song => {
                                const isActive = formData.cancionesIds.includes(song.id);
                                return (
                                    <div
                                        key={song.id}
                                        onClick={() => toggleSong(song.id)}
                                        className={`${styles.songItem} ${isActive ? styles.songItemActive : ''}`}
                                    >
                                        <div className={styles.songItemTitle}>{song.titulo}</div>
                                        <div className={styles.songItemMeta}>{song.tonalidad}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {formData.cancionesIds.length > 0 && (
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Orden de Práctica (Arrastra para reordenar):</label>
                                <Reorder.Group axis="y" values={formData.cancionesIds} onReorder={(newOrder) => setFormData({ ...formData, cancionesIds: newOrder })}>
                                    {(formData.cancionesIds || []).map(id => {
                                        const song = songs.find(s => s.id === id);
                                        return (
                                            <Reorder.Item key={id} value={id}>
                                                <div className={styles.reorderItem}>
                                                    <GripVertical size={18} color="var(--text-secondary)" />
                                                    <span>{song?.titulo}</span>
                                                </div>
                                            </Reorder.Item>
                                        );
                                    })}
                                </Reorder.Group>
                            </div>
                        )}

                        <button type="submit" className={styles.submitButton}>
                            Guardar Ensayo
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className={styles.cardGrid}>
                <AnimatePresence>
                    {rehearsals.map(r => (
                        <motion.div 
                            key={r.id} 
                            className={styles.card}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.cardDateInfo}>
                                    <CalendarIcon size={24} color="var(--accent-primary)" />
                                    <h3 style={{ margin: 0 }}>{r.fecha ? new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha pendiente'}</h3>
                                </div>
                                <div className={styles.cardActions}>
                                    <SyncCalendarButton
                                        title={`Ensayo: ${activeBand?.nombre}`}
                                        date={r.fecha}
                                        location="Sala de Ensayo habitual"
                                        description={`Ensayo para practicar ${r.cancionesIds?.length || 0} canciones.`}
                                    />
                                    <button onClick={() => handleDelete(r.id)} className={styles.deleteButton}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className={styles.songBadgeList}>
                                {r.cancionesIds?.map((id, index) => {
                                    const song = songs.find(s => s.id === id);
                                    return (
                                        <span key={id} className={styles.songBadge}>
                                            {index + 1}. {song?.titulo || 'Canción eliminada'}
                                        </span>
                                    );
                                })}
                            </div>
                            
                            <AttachmentUploader
                                bandId={activeBand.id}
                                entityType="rehearsals"
                                entityId={r.id}
                                currentAttachments={r.attachments || []}
                                onUploadComplete={async (newAttachments) => {
                                    await updateRehearsal(activeBand.id, r.id, { attachments: newAttachments });
                                    loadInitial();
                                }}
                            />

                            <div style={{ marginTop: '1.5rem' }}>
                                <CommentsSection
                                    bandId={activeBand.id}
                                    parentId={r.id}
                                    parentType="rehearsal"
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {rehearsals.length === 0 && !loading && <p className={styles.emptyState}>No hay ensayos registrados.</p>}

                {hasMore && (
                    <div className={styles.loadMoreContainer}>
                        <button onClick={loadMore} disabled={loading} className={styles.loadMoreBtn}>
                            {loading ? 'Cargando...' : 'Cargar más ensayos'}
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Rehearsals;
