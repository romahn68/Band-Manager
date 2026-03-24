import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getFinancesPaginated, addFinance, deleteFinance, updateFinance, getFinanceTotals } from '../services/firestoreService';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Search, Camera, Loader2 } from 'lucide-react';
import { scanText } from '../services/ocrService';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Finances.module.css';

const Finances = () => {
    const { activeBand } = useApp();
    const [transactions, setTransactions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, ingreso, egreso
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [globalTotals, setGlobalTotals] = useState({ income: 0, expense: 0, balance: 0 });

    const loadTotals = React.useCallback(async () => {
        if (!activeBand) return;
        try {
            const totals = await getFinanceTotals(activeBand.id);
            setGlobalTotals(totals);
        } catch (e) {
            console.error(e);
        }
    }, [activeBand]);

    const [formData, setFormData] = useState({
        concepto: '',
        monto: '',
        tipo: 'ingreso',
        fecha: new Date().toISOString().split('T')[0],
        categoria: 'Concierto',
        notas: ''
    });

    const loadInitial = React.useCallback(async () => {
        if (!activeBand) return;
        setLoading(true);
        try {
            const { data, lastVisible: lastDoc } = await getFinancesPaginated(activeBand.id, 50, null);
            setTransactions(data);
            setLastVisible(lastDoc);
            setHasMore(data.length === 50);
            await loadTotals();
        } catch (error) {
            console.error("Error loading finances:", error);
        } finally {
            setLoading(false);
        }
    }, [activeBand, loadTotals]);

    const loadMore = async () => {
        if (!activeBand || loading || !hasMore) return;
        setLoading(true);
        try {
            const { data, lastVisible: lastDoc } = await getFinancesPaginated(activeBand.id, 50, lastVisible);
            setTransactions(prev => [...prev, ...data]);
            setLastVisible(lastDoc);
            setHasMore(data.length === 50);
        } catch (error) {
            console.error("Error loading more finances:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeBand) loadInitial();
    }, [activeBand, loadInitial]);

    useEffect(() => {
        const isDirty = formData.concepto || formData.monto;
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
        if (!activeBand) return;
        if (!formData.concepto || !formData.monto) return;

        setLoading(true);
        try {
            await addFinance(activeBand.id, {
                ...formData,
                monto: parseFloat(formData.monto)
            });
            setFormData({
                concepto: '',
                monto: '',
                tipo: 'ingreso',
                fecha: new Date().toISOString().split('T')[0],
                categoria: 'Concierto',
                notas: ''
            });
            setShowForm(false);
            loadInitial();
        } catch (error) {
            console.error("Error adding finance:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta transacción?')) {
            try {
                await deleteFinance(activeBand.id, id);
                await loadTotals();
                // Instead of full reload, just remove from list to save reads
                setTransactions(prev => prev.filter(t => t.id !== id));
            } catch (error) {
                console.error("Error deleting finance:", error);
            }
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.concepto.toLowerCase().includes(search.toLowerCase()) ||
            t.categoria.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || t.tipo === filter;
        return matchesSearch && matchesFilter;
    });

    const handleInlineUpdate = async (id, field, value) => {
        setUpdatingId(id);
        try {
            const parsedValue = field === 'monto' ? parseFloat(value) : value;
            await updateFinance(activeBand.id, id, { [field]: parsedValue });
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: parsedValue } : t));
            if (field === 'monto' || field === 'tipo') {
                await loadTotals();
            }
        } catch (error) {
            console.error("Error updating finance:", error);
            alert("Error al actualizar");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading && transactions.length === 0) {
        return <div className={styles.container}><Loader2 className="animate-spin" /> Cargando finanzas...</div>;
    }

    return (
        <motion.div 
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className={styles.header}>
                <h1 className={styles.title}>Gestión de Finanzas</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={styles.actionButton}
                >
                    {showForm ? 'Cancelar' : 'Nueva Transacción'}
                </button>
            </div>

            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className={styles.statLabel}>Balance General</div>
                    <div className={styles.statValue} style={{ color: globalTotals.balance >= 0 ? 'var(--accent-secondary)' : '#ef4444' }}>
                        ${globalTotals.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
                    <div className={styles.statLabel}>
                        <ArrowUpCircle size={16} /> Total Ingresos
                    </div>
                    <div className={styles.statValueLarge} style={{ color: 'var(--accent-secondary)' }}>
                        +${globalTotals.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className={styles.statLabel}>
                        <ArrowDownCircle size={16} /> Total Egresos
                    </div>
                    <div className={styles.statValueLarge} style={{ color: '#ef4444' }}>
                        -${globalTotals.expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showForm && (
                    <motion.form 
                        className={`${styles.formGrid} glass`} 
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className={styles.formHeader}>
                            <h3 className={styles.formTitle}>Detalle del Movimiento</h3>
                            {Capacitor.isNativePlatform() && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            const text = await scanText();
                                            if (text) {
                                                const matches = text.match(/[\d,]+\.\d{2}/g);
                                                let detectedMonto = formData.monto;
                                                if (matches && matches.length > 0) {
                                                    const maxNum = Math.max(...matches.map(m => parseFloat(m.replace(',', ''))));
                                                    if (maxNum > 0) detectedMonto = maxNum.toString();
                                                }
                                                setFormData(prev => ({
                                                    ...prev,
                                                    monto: detectedMonto,
                                                    notas: `Ticket Escaneado:\n${text.substring(0, 100)}...`
                                                }));
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className={styles.ocrButton}
                                >
                                    <Camera size={16} /> Autocompletar con IA
                                </button>
                            )}
                        </div>
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Concepto *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ej. Pago Evento Municipal"
                                    value={formData.concepto}
                                    onChange={e => setFormData({ ...formData, concepto: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Monto ($) *</label>
                                <input
                                    type="number"
                                    className="input"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.monto}
                                    onChange={e => setFormData({ ...formData, monto: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Tipo</label>
                                <select className="select" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                                    <option value="ingreso">Ingreso (+)</option>
                                    <option value="egreso">Egreso (-)</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Fecha</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.fecha}
                                    onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Categoría</label>
                                <select className="select" value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })}>
                                    <option>Concierto</option>
                                    <option>Merch</option>
                                    <option>Ensayo / Estudio</option>
                                    <option>Transporte</option>
                                    <option>Mantenimiento</option>
                                    <option>Sueldos</option>
                                    <option>Otros</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Notas (Opcional)</label>
                            <textarea
                                className="input"
                                rows="2"
                                value={formData.notas}
                                onChange={e => setFormData({ ...formData, notas: e.target.value })}
                            />
                        </div>
                        <button type="submit" disabled={loading} className={styles.submitButton}>
                            {loading ? 'Guardando...' : 'Registrar Movimiento'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className={styles.tableContainer}>
                <div className={styles.filterBar}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Buscar transacciones..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <button
                            onClick={() => setFilter('all')}
                            className={styles.filterBtn}
                            style={{ background: filter === 'all' ? 'var(--accent-primary)' : '' }}
                        >
                            Todo
                        </button>
                        <button
                            onClick={() => setFilter('ingreso')}
                            className={styles.filterBtn}
                            style={{ background: filter === 'ingreso' ? 'var(--accent-secondary)' : '' }}
                        >
                            Ingresos
                        </button>
                        <button
                            onClick={() => setFilter('egreso')}
                            className={styles.filterBtn}
                            style={{ background: filter === 'egreso' ? '#ef4444' : '' }}
                        >
                            Egresos
                        </button>
                    </div>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Fecha</th>
                            <th className={styles.th}>Concepto</th>
                            <th className={styles.th}>Categoría</th>
                            <th className={`${styles.th} ${styles.tdAmount}`}>Monto</th>
                            <th className={`${styles.th} ${styles.tdActions}`}></th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredTransactions.map(t => (
                                <motion.tr 
                                    key={t.id} 
                                    className={styles.tr}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <td className={styles.td} data-label="Fecha">
                                        <div className={styles.tdDate}>
                                            {t.fecha ? new Date(t.fecha).toLocaleDateString() : 'Pendiente'}
                                        </div>
                                    </td>
                                    <td className={styles.td} data-label="Concepto">
                                        <div className={styles.tdConcepto}>{t.concepto}</div>
                                        {t.notas && <div className={styles.tdNotas}>{t.notas}</div>}
                                    </td>
                                    <td className={styles.td} data-label="Categoría">
                                        <span className={styles.categoryBadge}>
                                            {t.categoria}
                                        </span>
                                    </td>
                                    <td className={`${styles.td} ${styles.tdAmount}`} data-label="Monto" style={{ color: t.tipo === 'ingreso' ? 'var(--accent-secondary)' : '#ef4444' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                            <span>{t.tipo === 'ingreso' ? '+' : '-'}</span>
                                            <input 
                                                className={styles.inlineInput}
                                                type="number"
                                                step="0.01"
                                                value={updatingId === t.id ? undefined : t.monto}
                                                onChange={(e) => handleInlineUpdate(t.id, 'monto', e.target.value)}
                                                style={{ width: '100px', fontWeight: 'bold' }}
                                            />
                                        </div>
                                    </td>
                                    <td className={`${styles.td} ${styles.tdActions}`}>
                                        <button onClick={() => handleDelete(t.id)} className={styles.deleteBtn}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredTransactions.length === 0 && (
                    <div className={styles.emptyState}>
                        No se encontraron transacciones.
                    </div>
                )}
            </div>

            {hasMore && !search && (
                <div className={styles.loadMoreContainer}>
                    <button onClick={loadMore} disabled={loading} className={styles.loadMoreBtn}>
                        {loading ? 'Cargando...' : 'Cargar más movimientos'}
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default Finances;
