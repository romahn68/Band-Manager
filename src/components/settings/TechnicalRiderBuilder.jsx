import React, { useCallback } from 'react';
import { ListOrdered, Trash2 } from 'lucide-react';

const TechnicalRiderBuilder = ({ riderData, setRiderData, handleUpdateBand }) => {
    
    // Performance Optimization: Prevent reallocation of inline functions
    const addChannel = useCallback(() => {
        setRiderData(prev => ({
            ...prev,
            channels: [...prev.channels, { ch: (prev.channels.length + 1).toString(), item: '', mic: '', notes: '' }]
        }));
    }, [setRiderData]);

    const updateChannel = useCallback((index, field, value) => {
        setRiderData(prev => {
            const newChannels = [...prev.channels];
            newChannels[index] = { ...newChannels[index], [field]: value };
            return { ...prev, channels: newChannels };
        });
    }, [setRiderData]);

    const removeChannel = useCallback((index) => {
        setRiderData(prev => ({
            ...prev,
            channels: prev.channels.filter((_, i) => i !== index)
        }));
    }, [setRiderData]);

    return (
        <div className="glass" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListOrdered size={20} color="var(--accent-secondary)" /> Rider Técnico (Input List)
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Define los canales y micrófonos que tu banda necesita para sonar perfecto.</p>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '0.5rem' }}>CH</th>
                            <th style={{ padding: '0.5rem' }}>Instrumento/Voz</th>
                            <th style={{ padding: '0.5rem' }}>Mic/Line</th>
                            <th style={{ padding: '0.5rem' }}>Notas</th>
                            <th style={{ padding: '0.5rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(riderData?.channels || []).map((ch, index) => (
                            <tr key={index}>
                                <td style={{ padding: '0.5rem', width: '60px' }}>
                                    <input type="text" value={ch.ch} onChange={(e) => updateChannel(index, 'ch', e.target.value)} style={{ padding: '0.4rem' }} />
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <input type="text" value={ch.item} placeholder="Ej. Guitarra L" onChange={(e) => updateChannel(index, 'item', e.target.value)} style={{ padding: '0.4rem' }} />
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <input type="text" value={ch.mic} placeholder="Ej. SM57" onChange={(e) => updateChannel(index, 'mic', e.target.value)} style={{ padding: '0.4rem' }} />
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <input type="text" value={ch.notes} placeholder="Phantom, DI, etc." onChange={(e) => updateChannel(index, 'notes', e.target.value)} style={{ padding: '0.4rem' }} />
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                    <button onClick={() => removeChannel(index)} style={{ background: 'none', color: '#ef4444', padding: '0.2rem' }}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={addChannel} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem' }}>+ Agregar Canal</button>
                <button onClick={handleUpdateBand} style={{ background: 'var(--accent-secondary)', color: 'white', fontSize: '0.9rem' }}>Guardar Cambios Rider</button>
            </div>
        </div>
    );
};

export default React.memo(TechnicalRiderBuilder);
