import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getRehearsals, addRehearsal, deleteRehearsal, getSongs } from '../services/firestoreService';
import { Plus, Trash2, Calendar as CalendarIcon, GripVertical, X } from 'lucide-react';
import { Reorder } from 'framer-motion';
import SyncCalendarButton from '../components/SyncCalendarButton';

const Rehearsals = () => {
    const { activeBand } = useApp();
    const [rehearsals, setRehearsals] = useState([]);
    const [songs, setSongs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ fecha: '', cancionesIds: [] });

    const loadData = React.useCallback(async () => {
        if (!activeBand) return;
        const rData = await getRehearsals(activeBand.id);
        const sData = await getSongs(activeBand.id);
        setRehearsals(rData.sort((a, b) => b.fecha.localeCompare(a.fecha)));
        setSongs(sData);
    }, [activeBand]);

    useEffect(() => {
        if (activeBand) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadData();
        }
    }, [activeBand, loadData]);



    const handleAdd = async (e) => {
        e.preventDefault();
        if (!formData.fecha) return;
        await addRehearsal(activeBand.id, formData);
        setFormData({ fecha: '', cancionesIds: [] });
        setShowForm(false);
        loadData();
    };

    // toggleSong remains same
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
            loadData();
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--accent-primary)', margin: 0 }}>Registro de Ensayos</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />} {showForm ? 'Cancelar' : 'Nuevo Ensayo'}
                </button>
            </div>

            {showForm && (
                <form className="glass" onSubmit={handleAdd} style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha del Ensayo *</label>
                        <input
                            type="date"
                            value={formData.fecha}
                            onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                            required
                        />
                    </div>

                    <label style={{ display: 'block', marginBottom: '1rem' }}>Seleccionar Canciones Practicadas:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {songs.map(song => (
                            <div
                                key={song.id}
                                onClick={() => toggleSong(song.id)}
                                className="glass"
                                style={{
                                    padding: '0.75rem',
                                    cursor: 'pointer',
                                    border: formData.cancionesIds.includes(song.id) ? '2px solid var(--accent-secondary)' : '1px solid var(--glass-border)',
                                    background: formData.cancionesIds.includes(song.id) ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)'
                                }}
                            >
                                <div style={{ fontWeight: '600' }}>{song.titulo}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{song.tonalidad}</div>
                            </div>
                        ))}
                    </div>

                    {formData.cancionesIds.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem' }}>Orden de Práctica (Arrastra para reordenar):</label>
                            <Reorder.Group axis="y" values={formData.cancionesIds} onReorder={(newOrder) => setFormData({ ...formData, cancionesIds: newOrder })}>
                                {formData.cancionesIds.map(id => {
                                    const song = songs.find(s => s.id === id);
                                    return (
                                        <Reorder.Item key={id} value={id}>
                                            <div className="glass" style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'grab' }}>
                                                <GripVertical size={18} color="var(--text-secondary)" />
                                                <span>{song?.titulo}</span>
                                            </div>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>
                        </div>
                    )}

                    <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', width: '100%', fontSize: '1.1rem' }}>
                        Guardar Ensayo
                    </button>
                </form>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {rehearsals.map(r => (
                    <div key={r.id} className="glass" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <CalendarIcon size={24} color="var(--accent-primary)" />
                                <h3 style={{ margin: 0 }}>{new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <SyncCalendarButton
                                    title={`Ensayo: ${activeBand?.nombre}`}
                                    date={r.fecha}
                                    location="Sala de Ensayo habitual"
                                    description={`Ensayo para practicar ${r.cancionesIds.length} canciones.`}
                                />
                                <button onClick={() => handleDelete(r.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {r.cancionesIds.map((id, index) => {
                                const song = songs.find(s => s.id === id);
                                return (
                                    <span key={id} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        {index + 1}. {song?.titulo || 'Canción eliminada'}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {rehearsals.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay ensayos registrados.</p>}
            </div>
        </div>
    );
};

export default Rehearsals;
