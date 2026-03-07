import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getSongsPaginated, addSong, updateSong, deleteSong } from '../services/firestoreService';
import { Plus, Trash2, Edit2, Check, X, Search, FileText, MessageSquare, Camera } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';
import AttachmentUploader from '../components/AttachmentUploader';
import { scanText } from '../services/ocrService';
import { Capacitor } from '@capacitor/core';

const Songs = () => {
    const { activeBand } = useApp();
    const [songs, setSongs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ titulo: '', tonalidad: '', letra: '', acordes: '' });
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedSong, setSelectedSong] = useState(null);

    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadSongs = React.useCallback(async (isInitial = true) => {
        if (!activeBand) return;
        setLoading(true);

        try {
            const cursor = isInitial ? null : lastVisible;
            const { data, lastVisible: newLastVisible } = await getSongsPaginated(activeBand.id, 15, cursor);

            if (isInitial) {
                setSongs(data);
            } else {
                setSongs(prev => [...prev, ...data]);
            }

            setLastVisible(newLastVisible);
            setHasMore(data.length === 15);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [activeBand, lastVisible]);

    useEffect(() => {
        if (activeBand) loadSongs(true);
    }, [activeBand, loadSongs]);

    // Warn before leaving if form has unsaved changes
    useEffect(() => {
        const isDirty = formData.titulo || formData.letra || formData.acordes;
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
            } else {
                await addSong(activeBand.id, formData);
            }
            setFormData({ titulo: '', tonalidad: '', letra: '', acordes: '' });
            setShowForm(false);
            setEditingId(null);
            loadSongs();
        } catch (error) {
            console.error("Error saving song:", error);
            alert("Error al guardar la canción.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta canción?')) {
            await deleteSong(activeBand.id, id);
            setSongs(songs.filter(s => s.id !== id));
        }
    };

    const startEdit = (song) => {
        setEditingId(song.id);
        setFormData({ titulo: song.titulo, tonalidad: song.tonalidad, letra: song.letra, acordes: song.acordes });
        setShowForm(true);
    };

    const filteredSongs = songs.filter(s =>
        s.titulo.toLowerCase().includes(search.toLowerCase()) ||
        s.tonalidad.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ color: 'var(--accent-primary)', margin: 0 }}>Biblioteca de Canciones</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ titulo: '', tonalidad: '', letra: '', acordes: '' });
                    }}
                    style={{ background: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />} {showForm ? 'Cancelar' : 'Nueva Canción'}
                </button>
            </div>

            {showForm && (
                <form className="glass" onSubmit={handleSubmit} style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Título *</label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tonalidad *</label>
                            <input
                                type="text"
                                placeholder="C, Am, F#m..."
                                value={formData.tonalidad}
                                onChange={e => setFormData({ ...formData, tonalidad: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label>Letra</label>
                            {Capacitor.isNativePlatform() && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const text = await scanText();
                                            if (text) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    letra: prev.letra ? prev.letra + '\n\n' + text : text
                                                }));
                                            }
                                        } catch (e) {
                                            console.error(e);
                                            alert("No se pudo escanear: " + e.message);
                                        }
                                    }}
                                    style={{
                                        padding: '0.3rem 0.6rem',
                                        fontSize: '0.8rem',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        color: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem'
                                    }}
                                >
                                    <Camera size={14} /> Escanear
                                </button>
                            )}
                        </div>
                        <textarea
                            rows="5"
                            value={formData.letra}
                            onChange={e => setFormData({ ...formData, letra: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Acordes / Notas</label>
                        <textarea
                            rows="3"
                            value={formData.acordes}
                            onChange={e => setFormData({ ...formData, acordes: e.target.value })}
                        />
                    </div>
                    <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', width: '100%', fontSize: '1.1rem' }}>
                        {editingId ? 'Guardar Cambios' : 'Guardar Canción'}
                    </button>
                </form>
            )}

            <div className={`songs-layout ${selectedSong ? 'has-selected' : ''}`}>
                <div>
                    <div className="glass" style={{ padding: '0.5rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={20} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Buscar por título o tonalidad..."
                            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {loading && songs.length === 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="glass skeleton" style={{ padding: '1.5rem', height: '140px' }} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {filteredSongs.map(song => (
                                <div
                                    key={song.id}
                                    className="glass"
                                    onClick={() => setSelectedSong(selectedSong?.id === song.id ? null : song)}
                                    style={{
                                        padding: '1.5rem',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: selectedSong?.id === song.id ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)'
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEdit(song); }}
                                            style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.4rem' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(song.id); }}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.4rem' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--accent-secondary)' }}>{song.titulo}</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            {song.tonalidad}
                                        </span>
                                        {selectedSong?.id === song.id && <MessageSquare size={14} color="var(--accent-primary)" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Button */}
                    {hasMore && !search && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button
                                onClick={() => loadSongs(false)}
                                disabled={loading}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '0.75rem 2rem'
                                }}
                            >
                                {loading ? 'Cargando...' : 'Cargar más canciones'}
                            </button>
                        </div>
                    )}

                    {search && filteredSongs.length === 0 && (
                        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>No se encontraron canciones que coincidan con la búsqueda.</p>
                    )}
                </div>

                {selectedSong && (
                    <div className="no-print">
                        <div className="song-detail-panel">
                            <div className="glass" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{selectedSong.titulo}</h2>
                                    <button onClick={() => setSelectedSong(null)} style={{ background: 'none', padding: '0.2rem' }}><X size={18} /></button>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                    {selectedSong.letra || 'Sin letra registrada.'}
                                </div>
                                {selectedSong.acordes && (
                                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>Acordes/Tab:</div>
                                        <pre style={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.85rem',
                                            background: 'rgba(0,0,0,0.3)',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            overflowX: 'auto',
                                            color: '#10b981'
                                        }}>
                                            {selectedSong.acordes}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* Area para Adjuntos */}
                            <AttachmentUploader
                                bandId={activeBand.id}
                                entityType="songs"
                                entityId={selectedSong.id}
                                currentAttachments={selectedSong.attachments || []}
                                onUploadComplete={async (newAttachments) => {
                                    await updateSong(activeBand.id, selectedSong.id, { attachments: newAttachments });
                                    setSelectedSong(prev => ({ ...prev, attachments: newAttachments }));
                                    loadSongs(false); // Recarga silenciosa
                                }}
                            />

                            <CommentsSection
                                bandId={activeBand.id}
                                parentId={selectedSong.id}
                                parentType="song"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Songs;
