import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getGear, addGear, updateGear, deleteGear } from '../services/firestoreService';
import { Plus, Trash2, Edit2, Check, X, Search, Pocket, Package, User } from 'lucide-react';

const Inventory = () => {
    const { activeBand } = useApp();
    const [gear, setGear] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', category: 'Instrumento', owner: '', condition: 'Bueno', notes: '' });
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');

    const loadGear = React.useCallback(async () => {
        if (!activeBand) return;
        const data = await getGear(activeBand.id);
        setGear(data);
    }, [activeBand]);

    useEffect(() => {
        if (activeBand) loadGear();
    }, [activeBand, loadGear]);

    // Warn before leaving if form has unsaved changes
    useEffect(() => {
        const isDirty = formData.name || formData.owner || formData.notes;
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
        if (!formData.name) return;

        if (editingId) {
            await updateGear(activeBand.id, editingId, formData);
            setEditingId(null);
        } else {
            await addGear(activeBand.id, formData);
        }

        setFormData({ name: '', category: 'Instrumento', owner: '', condition: 'Bueno', notes: '' });
        setShowForm(false);
        loadGear();
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este equipo del inventario?')) {
            await deleteGear(activeBand.id, id);
            loadGear();
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setFormData({ name: item.name, category: item.category, owner: item.owner, condition: item.condition, notes: item.notes });
        setShowForm(true);
    };

    const filteredGear = gear.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ color: 'var(--accent-primary)', margin: 0 }}>Inventario de Equipo (Gear)</h1>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', category: 'Instrumento', owner: '', condition: 'Bueno', notes: '' }); }}
                    style={{ background: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />} {showForm ? 'Cancelar' : 'Agregar Equipo'}
                </button>
            </div>

            {showForm && (
                <form className="glass" onSubmit={handleSubmit} style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre del Equipo *</label>
                            <input
                                type="text"
                                value={formData.name}
                                placeholder="Ej. Fender Stratocaster"
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Categoría</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option>Instrumento</option>
                                <option>Amplificación</option>
                                <option>Pedales / FX</option>
                                <option>Audio / Microfonia</option>
                                <option>Cables / Accesorios</option>
                                <option>Otros</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Propietario / Responsable</label>
                            <input
                                type="text"
                                value={formData.owner}
                                placeholder="Nombre"
                                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notas / Estado</label>
                        <textarea
                            rows="2"
                            value={formData.notes}
                            placeholder="Ej. Recién calibrada, necesita cuerdas nuevas..."
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                    <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', width: '100%', fontSize: '1.1rem' }}>
                        {editingId ? 'Actualizar Equipo' : 'Guardar Equipo'}
                    </button>
                </form>
            )}

            <div className="glass" style={{ padding: '0.5rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={20} color="var(--text-secondary)" />
                <input
                    type="text"
                    placeholder="Buscar equipo o categoría..."
                    style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredGear.map(item => (
                    <div key={item.id} className="glass" style={{ padding: '1.5rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => startEdit(item)} style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.4rem' }}>
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.4rem' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ background: 'var(--accent-secondary)', padding: '0.5rem', borderRadius: '10px' }}>
                                <Package size={20} color="white" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h3>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.category}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                <User size={14} /> <span>Resp: {item.owner || 'Banda'}</span>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', opacity: 0.7, display: 'block', marginBottom: '0.25rem' }}>Notas Técnicas:</span>
                                {item.notes || 'Sin notas.'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Inventory;
