import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getGigs, addGig, deleteGig, getSongs } from '../services/firestoreService';
import { Plus, Trash2, Calendar as CalendarIcon, GripVertical, X, Music, Printer } from 'lucide-react';
import { Reorder } from 'framer-motion';
import SyncCalendarButton from '../components/SyncCalendarButton';

const Gigs = () => {
    const { activeBand } = useApp();
    const [gigs, setGigs] = useState([]);
    const [songs, setSongs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ fecha: '', setlist: [] });

    const loadData = React.useCallback(async () => {
        if (!activeBand) return;
        const gData = await getGigs(activeBand.id);
        const sData = await getSongs(activeBand.id);
        setGigs(gData.sort((a, b) => a.fecha.localeCompare(b.fecha)));
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
        await addGig(activeBand.id, formData);
        setFormData({ fecha: '', setlist: [] });
        setShowForm(false);
        loadData();
    };

    // toggleSong remains same
    const toggleSong = (songId) => {
        const current = formData.setlist;
        if (current.includes(songId)) {
            setFormData({ ...formData, setlist: current.filter(id => id !== songId) });
        } else {
            setFormData({ ...formData, setlist: [...current, songId] });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este concierto?')) {
            await deleteGig(activeBand.id, id);
            loadData();
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ color: 'var(--accent-primary)', margin: 0 }}>Próximos Conciertos</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />} {showForm ? 'Cancelar' : 'Nuevo Concierto'}
                </button>
            </div>

            {showForm && (
                <form className="glass" onSubmit={handleAdd} style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha del Concierto *</label>
                        <input
                            type="date"
                            value={formData.fecha}
                            onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                            required
                        />
                    </div>

                    <label style={{ display: 'block', marginBottom: '1rem' }}>Armar Setlist (Selecciona canciones):</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {songs.map(song => (
                            <div
                                key={song.id}
                                onClick={() => toggleSong(song.id)}
                                className="glass"
                                style={{
                                    padding: '0.75rem',
                                    cursor: 'pointer',
                                    border: formData.setlist.includes(song.id) ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                    background: formData.setlist.includes(song.id) ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-card)'
                                }}
                            >
                                <div style={{ fontWeight: '600' }}>{song.titulo}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{song.tonalidad}</div>
                            </div>
                        ))}
                    </div>

                    {formData.setlist.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem' }}>Orden del Show (Arrastra para reordenar):</label>
                            <Reorder.Group axis="y" values={formData.setlist} onReorder={(newOrder) => setFormData({ ...formData, setlist: newOrder })}>
                                {formData.setlist.map(id => {
                                    const song = songs.find(s => s.id === id);
                                    return (
                                        <Reorder.Item key={id} value={id}>
                                            <div className="glass" style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'grab' }}>
                                                <GripVertical size={18} color="var(--text-secondary)" />
                                                <span style={{ fontWeight: '600' }}>{song?.titulo}</span>
                                            </div>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>
                        </div>
                    )}

                    <button type="submit" style={{ background: 'var(--accent-secondary)', color: 'white', width: '100%', fontSize: '1.1rem' }}>
                        Guardar Concierto
                    </button>
                </form>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {gigs.map(g => (
                    <div key={g.id} className="gig-card-container">
                        {/* Visible UI Card */}
                        <div className="glass card-content" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '12px' }}>
                                        <CalendarIcon size={24} color="white" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{new Date(g.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</h3>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Concierto confirmado</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <SyncCalendarButton
                                        title={`Concierto: ${activeBand?.nombre}`}
                                        date={g.fecha}
                                        location="Por confirmar"
                                        description={`Setlist de ${g.setlist.length} canciones.`}
                                    />
                                    <button
                                        onClick={handlePrint}
                                        style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.5rem' }}
                                        title="Imprimir Setlist"
                                    >
                                        <Printer size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(g.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-secondary)', fontWeight: '600' }}>
                                    <Music size={16} /> Setlist ({g.setlist.length} temas)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {g.setlist.map((id, index) => {
                                        const song = songs.find(s => s.id === id);
                                        return (
                                            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'white' }}>
                                                <span>{index + 1}. {song?.titulo || 'Canción eliminada'}</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{song?.tonalidad}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Hidden Print Template */}
                        <div className="print-only" style={{ padding: '40px' }}>
                            <div style={{ borderBottom: '2px solid black', marginBottom: '20px', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <h1 style={{ margin: 0, fontSize: '24pt' }}>Setlist: {activeBand?.nombre}</h1>
                                <span style={{ fontSize: '14pt' }}>Fecha: {new Date(g.fecha).toLocaleDateString()}</span>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid black', textAlign: 'left' }}>
                                        <th style={{ padding: '10px 0', width: '40px' }}>#</th>
                                        <th style={{ padding: '10px 0' }}>Canción</th>
                                        <th style={{ padding: '10px 0', textAlign: 'right' }}>Tono</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {g.setlist.map((id, index) => {
                                        const song = songs.find(s => s.id === id);
                                        return (
                                            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                                <td style={{ padding: '12px 0' }}>{index + 1}</td>
                                                <td style={{ padding: '12px 0', fontWeight: 'bold' }}>{song?.titulo}</td>
                                                <td style={{ padding: '12px 0', textAlign: 'right' }}>{song?.tonalidad}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '30px', fontSize: '10pt', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                                Generado por Band Manager Cloud
                            </div>
                        </div>
                    </div>
                ))}
                {gigs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay conciertos programados.</p>}
            </div>
        </div>
    );
};

export default Gigs;
