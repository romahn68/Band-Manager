import React, { useState, useEffect } from 'react';
import { useApp } from '../../hooks/useApp';
import { getSongsPaginated, addSong, updateSong, deleteSong } from '../../services/firestoreService';
import { usePermissions } from '../../hooks/usePermissions';
import { Plus, Trash2, Edit2, Check, X, Search, FileText, MessageSquare, Camera } from 'lucide-react';
import CommentsSection from '../../components/CommentsSection';
import AttachmentUploader from '../../components/AttachmentUploader';
import { scanText } from '../../services/ocrService';
import { Capacitor } from '@capacitor/core';
import ChordProViewer from './ChordProViewer';
import { AnimatePresence } from 'framer-motion';
import styles from './Songs.module.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const Songs = () => {
    const { activeBand } = useApp();
    const { canEditRepertoire, isVisor } = usePermissions();
    const [songs, setSongs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ titulo: '', tonalidad: '', letraCruda: '', acordesExtra: '' });
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedSong, setSelectedSong] = useState(null);

    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadInitial = React.useCallback(async () => {
        if (!activeBand) return;
        setLoading(true);
        try {
            const { data, lastVisible: newLastVisible } = await getSongsPaginated(activeBand.id, 15, null);
            setSongs(data);
            setLastVisible(newLastVisible);
            setHasMore(data.length === 15);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [activeBand]);

    const loadMore = async () => {
        if (!activeBand || !lastVisible) return;
        setLoading(true);
        try {
            const { data, lastVisible: newLastVisible } = await getSongsPaginated(activeBand.id, 15, lastVisible);
            setSongs(prev => [...prev, ...data]);
            setLastVisible(newLastVisible);
            setHasMore(data.length === 15);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitial();
    }, [activeBand, loadInitial]);

    // Warn before leaving if form has unsaved changes
    useEffect(() => {
        const isDirty = formData.titulo || formData.letraCruda || formData.acordesExtra;
        const handleBeforeUnload = (e) => {
            if (showForm && isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [showForm, formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeBand || !formData.titulo || !formData.tonalidad) return;

        try {
            if (editingId) {
                await updateSong(activeBand.id, editingId, formData);
                setSongs(prevSongs => prevSongs.map(s => 
                    s.id === editingId ? { ...s, ...formData } : s
                ));
                if (selectedSong && selectedSong.id === editingId) {
                    setSelectedSong(prev => ({ ...prev, ...formData }));
                }
            } else {
                await addSong(activeBand.id, formData);
                loadInitial(); // Recargar desde inicio para el componente
            }
            setFormData({ titulo: '', tonalidad: '', letraCruda: '', acordesExtra: '' });
            setShowForm(false);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving song:", error);
            alert("Error al guardar la canción.");
        }
    };

    const handleDelete = async (id) => {
        if (isVisor) return;
        if (window.confirm('¿Estás seguro de que deseas eliminar esta canción?')) {
            await deleteSong(activeBand.id, id);
            setSongs(songs.filter(s => s.id !== id));
        }
    };

    const startEdit = (song) => {
        if (isVisor) return;
        setEditingId(song.id);
        setFormData({ 
            titulo: song.titulo, 
            tonalidad: song.tonalidad || song.tono || '', 
            letraCruda: song.letraCruda || song.letra || '', 
            acordesExtra: song.acordesExtra || song.acordes || '' 
        });
        setShowForm(true);
    };

    const filteredSongs = React.useMemo(() => {
        return songs.filter(s =>
            s.titulo.toLowerCase().includes(search.toLowerCase()) ||
            (s.tonalidad && s.tonalidad.toLowerCase().includes(search.toLowerCase()))
        );
    }, [songs, search]);

    return (
        <motion.div 
            className="container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className={styles.header}>
                <h1 className={styles.title}>Biblioteca de Canciones</h1>
                {canEditRepertoire && (
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                            setFormData({ titulo: '', tonalidad: '', letraCruda: '', acordesExtra: '' });
                        }}
                        className={styles.newSongBtn}
                    >
                        {showForm ? <X size={20} /> : <Plus size={20} />} {showForm ? 'Cancelar' : 'Nueva Canción'}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`glass ${styles.songForm}`} 
                        onSubmit={handleSubmit}
                    >
                        <div className={styles.formGrid}>
                            <div>
                                <label className={styles.label}>Título *</label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className={styles.label}>Tonalidad *</label>
                                <input
                                    type="text"
                                    placeholder="C, Am, F#m..."
                                    value={formData.tonalidad}
                                    onChange={e => setFormData({ ...formData, tonalidad: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className={styles.label}>Letra con Acordes</label>
                                {Capacitor.isNativePlatform() && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const text = await scanText();
                                                if (text) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        letraCruda: prev.letraCruda ? prev.letraCruda + '\n\n' + text : text
                                                    }));
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert("No se pudo escanear: " + e.message);
                                            }
                                        }}
                                        className={styles.ocrBtn}
                                    >
                                        <Camera size={14} /> Escanear Letra
                                    </button>
                                )}
                            </div>
                            <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>
                                Pega la letra directamente. Si tiene acordes, ponlos en la línea de arriba de la letra.
                            </p>
                            <textarea
                                rows="12"
                                placeholder="C&#10;Cielito lindo vienen bajando..."
                                value={formData.letraCruda}
                                onChange={e => setFormData({ ...formData, letraCruda: e.target.value })}
                            />
                        </div>
                        <div className={styles.textareaGroup} style={{marginTop: '1rem'}}>
                            <label className={styles.label}>Notas o Tablatura extra (Opcional)</label>
                            <textarea
                                rows="3"
                                value={formData.acordesExtra}
                                onChange={e => setFormData({ ...formData, acordesExtra: e.target.value })}
                            />
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            {editingId ? 'Guardar Cambios' : 'Guardar Canción'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className={`songs-layout ${selectedSong ? 'has-selected' : ''}`}>
                <div>
                    <div className={`glass ${styles.searchBar}`}>
                        <Search size={20} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Buscar por título o tonalidad..."
                            className={styles.searchInput}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {loading && songs.length === 0 ? (
                        <div className={styles.songsGrid}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="glass skeleton" style={{ padding: '1.5rem', height: '140px' }} />
                            ))}
                        </div>
                    ) : (
                        <motion.div className={styles.songsGrid} layout>
                            {filteredSongs.map(song => (
                                <motion.div
                                    key={song.id}
                                    variants={itemVariants}
                                    layout
                                    className={`glass ${styles.songCard} ${selectedSong?.id === song.id ? styles.songCardSelected : ''}`}
                                    onClick={() => setSelectedSong(selectedSong?.id === song.id ? null : song)}
                                >
                                    {canEditRepertoire && (
                                        <div className={styles.cardActions}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startEdit(song); }}
                                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(song.id); }}
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <h3 className={styles.songTitle}>{song.titulo}</h3>
                                    <div className={styles.tagGroup}>
                                        <span className={styles.tag}>
                                            {song.tonalidad}
                                        </span>
                                        {selectedSong?.id === song.id && <MessageSquare size={14} color="var(--accent-primary)" />}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Pagination Button */}
                    {hasMore && !search && (
                        <div className={styles.paginationContainer}>
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className={styles.loadMoreBtn}
                            >
                                {loading ? 'Cargando...' : 'Cargar más canciones'}
                            </button>
                        </div>
                    )}

                    {search && filteredSongs.length === 0 && (
                        <p className={styles.emptySearch}>No se encontraron canciones que coincidan con la búsqueda.</p>
                    )}
                </div>

                <AnimatePresence>
                    {selectedSong && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="no-print"
                        >
                            <div className="song-detail-panel">
                                <div className={`glass ${styles.detailCard}`}>
                                    <div className={styles.detailHeader}>
                                        <h2 className={styles.detailTitle}>{selectedSong.titulo}</h2>
                                        <button onClick={() => setSelectedSong(null)} style={{ background: 'none', padding: '0.2rem' }}><X size={18} /></button>
                                    </div>
                                    {(selectedSong.letraCruda || selectedSong.old_chordProContent) ? (
                                        <ChordProViewer content={selectedSong.letraCruda || selectedSong.old_chordProContent} parserType={selectedSong.letraCruda ? 'ultimate' : 'chordpro'} title={selectedSong.titulo} />
                                    ) : (
                                        <>
                                            <div className={styles.detailContent}>
                                                {selectedSong.old_letra || 'Sin letra registrada.'}
                                            </div>
                                            {(selectedSong.acordesExtra || selectedSong.old_acordes) && (
                                                <div className={styles.chordsContainer}>
                                                    <div className={styles.chordsLabel}>Acordes/Tab:</div>
                                                    <pre className={styles.chordsPre}>
                                                        {selectedSong.acordesExtra || selectedSong.old_acordes}
                                                    </pre>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <AttachmentUploader
                                    bandId={activeBand.id}
                                    entityType="songs"
                                    entityId={selectedSong.id}
                                    currentAttachments={selectedSong.attachments || []}
                                    onUploadComplete={async (newAttachments) => {
                                        await updateSong(activeBand.id, selectedSong.id, { attachments: newAttachments });
                                        setSelectedSong(prev => ({ ...prev, attachments: newAttachments }));
                                        // Update local state without triggering pagination duplicates
                                        setSongs(prevSongs => prevSongs.map(s => 
                                            s.id === selectedSong.id ? { ...s, attachments: newAttachments } : s
                                        ));
                                    }}
                                />

                                <CommentsSection
                                    bandId={activeBand.id}
                                    parentId={selectedSong.id}
                                    parentType="song"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Songs;

