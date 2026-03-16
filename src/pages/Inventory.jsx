import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getGearPaginated, addGear, updateGear, deleteGear } from '../services/firestoreService';
import { Plus, Trash2, Edit2, X, Search, Package, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Inventory.module.css';

const Inventory = () => {
    const { activeBand } = useApp();
    const [gear, setGear] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', category: 'Instrumento', owner: '', condition: 'Bueno', notes: '' });
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const [updatingId, setUpdatingId] = useState(null);

    const loadInitial = React.useCallback(async () => {
        if (!activeBand) return;
        setLoading(true);
        try {
            const { data, lastVisible: lastDoc } = await getGearPaginated(activeBand.id, 15, null);
            setGear(data);
            setLastVisible(lastDoc);
            setHasMore(data.length === 15);
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
            const { data, lastVisible: lastDoc } = await getGearPaginated(activeBand.id, 15, lastVisible);
            setGear(prev => [...prev, ...data]);
            setLastVisible(lastDoc);
            setHasMore(data.length === 15);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeBand) loadInitial();
    }, [activeBand, loadInitial]);

    const handleInlineUpdate = async (id, field, value) => {
        setUpdatingId(id);
        try {
            await updateGear(activeBand.id, id, { [field]: value });
            setGear(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        } catch (error) {
            console.error("Error updating gear:", error);
            alert("Error al actualizar");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        setLoading(true);
        try {
            if (editingId) {
                await updateGear(activeBand.id, editingId, formData);
                setEditingId(null);
            } else {
                await addGear(activeBand.id, formData);
            }
            setFormData({ name: '', category: 'Instrumento', owner: '', condition: 'Bueno', notes: '' });
            setShowForm(false);
            loadInitial();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este equipo del inventario?')) {
            await deleteGear(activeBand.id, id);
            loadInitial();
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setFormData({ name: item.name, category: item.category, owner: item.owner, condition: item.condition, notes: item.notes });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredGear = gear.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div 
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className={styles.header}>
                <h1 className={styles.title}>Inventario de Equipo (Gear)</h1>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', category: 'Instrumento', owner: '', condition: 'Bueno', notes: '' }); }}
                    className={styles.actionButton}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />} {showForm ? 'Cancelar' : 'Agregar Equipo'}
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.form 
                        className={styles.formGrid} 
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Nombre del Equipo *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    placeholder="Ej. Fender Stratocaster"
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Categoría</label>
                                <select className="select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option>Instrumento</option>
                                    <option>Amplificación</option>
                                    <option>Pedales / FX</option>
                                    <option>Audio / Microfonia</option>
                                    <option>Cables / Accesorios</option>
                                    <option>Otros</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Dueño / Resp.</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.owner}
                                    placeholder="Nombre"
                                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Notas / Estado</label>
                            <textarea
                                className="input"
                                rows="2"
                                value={formData.notes}
                                placeholder="Notas técnicas..."
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            {editingId ? 'Actualizar Equipo' : 'Guardar Equipo'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className={styles.tableContainer}>
                <div className={styles.searchBar}>
                    <Search size={20} color="var(--text-secondary)" />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Buscar por nombre o categoría..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Equipo</th>
                            <th className={styles.th}>Categoría</th>
                            <th className={styles.th}>Responsable</th>
                            <th className={styles.th}>Notas</th>
                            <th className={styles.th}></th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredGear.map(item => (
                                <motion.tr 
                                    key={item.id} 
                                    className={styles.tr}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <td className={styles.td} data-label="Equipo">
                                        <h3 className={styles.itemTitle}>{item.name}</h3>
                                    </td>
                                    <td className={styles.td} data-label="Categoría">
                                        <span className={styles.itemCategory}>{item.category}</span>
                                    </td>
                                    <td className={styles.td} data-label="Responsable">
                                        <input 
                                            className={styles.inlineInput}
                                            value={item.owner || ''}
                                            placeholder="Banda"
                                            onChange={(e) => handleInlineUpdate(item.id, 'owner', e.target.value)}
                                        />
                                    </td>
                                    <td className={styles.td} data-label="Notas">
                                        <div className={styles.notesCell}>{item.notes || '-'}</div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.actionsCell}>
                                            <button onClick={() => startEdit(item)} className={styles.editButton}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>

                {filteredGear.length === 0 && !loading && (
                    <div className={styles.emptyState}>No hay equipos registrados.</div>
                )}
                
                {loading && gear.length === 0 && (
                    <div style={{ padding: '2rem' }}>
                        {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
                    </div>
                )}
            </div>

            {hasMore && !search && (
                <div className={styles.loadMoreContainer}>
                    <button onClick={loadMore} disabled={loading} className={styles.loadMoreBtn}>
                        {loading ? 'Cargando...' : 'Cargar más equipo'}
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default Inventory;
