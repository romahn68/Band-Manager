import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getFinances, addFinance, deleteFinance } from '../services/firestoreService';
import { Plus, Trash2, DollarSign, ArrowUpCircle, ArrowDownCircle, Search, Calendar, Filter } from 'lucide-react';

const Finances = () => {
    const { activeBand } = useApp();
    const [transactions, setTransactions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, income, expense

    const [formData, setFormData] = useState({
        concepto: '',
        monto: '',
        tipo: 'ingreso', // ingreso, egreso
        fecha: new Date().toISOString().split('T')[0],
        categoria: 'Concierto',
        notas: ''
    });

    const loadFinances = React.useCallback(async () => {
        if (!activeBand) return;
        setLoading(true);
        try {
            const data = await getFinances(activeBand.id);
            setTransactions(data.sort((a, b) => b.fecha.localeCompare(a.fecha)));
        } catch (error) {
            console.error("Error loading finances:", error);
        } finally {
            setLoading(false);
        }
    }, [activeBand]);

    useEffect(() => {
        if (activeBand) loadFinances();
    }, [activeBand, loadFinances]);

    // Warn before leaving if form has unsaved changes
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
            loadFinances();
        } catch (error) {
            console.error("Error adding finance:", error);
            alert("Error al guardar la transacción.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta transacción?')) {
            try {
                await deleteFinance(activeBand.id, id);
                loadFinances();
            } catch (error) {
                console.error("Error deleting finance:", error);
            }
        }
    };

    const totals = transactions.reduce((acc, curr) => {
        if (curr.tipo === 'ingreso') acc.income += curr.monto;
        else acc.expense += curr.monto;
        return acc;
    }, { income: 0, expense: 0 });

    const balance = totals.income - totals.expense;

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.concepto.toLowerCase().includes(search.toLowerCase()) ||
            t.categoria.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || t.tipo === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ color: 'var(--accent-primary)', margin: 0 }}>Gestión de Finanzas</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showForm ? 'Cancelar' : 'Nueva Transacción'}
                </button>
            </div>

            {/* Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Balance General</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: balance >= 0 ? 'var(--accent-secondary)' : '#ef4444' }}>
                        ${balance.toLocaleString()}
                    </div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowUpCircle size={16} /> Total Ingresos
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                        +${totals.income.toLocaleString()}
                    </div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowDownCircle size={16} /> Total Egresos
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>
                        -${totals.expense.toLocaleString()}
                    </div>
                </div>
            </div>

            {showForm && (
                <form className="glass" onSubmit={handleSubmit} style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Concepto *</label>
                            <input
                                type="text"
                                placeholder="Ej. Pago Evento Municipal"
                                value={formData.concepto}
                                onChange={e => setFormData({ ...formData, concepto: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Monto ($) *</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.monto}
                                onChange={e => setFormData({ ...formData, monto: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo</label>
                            <select value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                                <option value="ingreso">Ingreso (+)</option>
                                <option value="egreso">Egreso (-)</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha</label>
                            <input
                                type="date"
                                value={formData.fecha}
                                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Categoría</label>
                            <select value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })}>
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
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notas (Opcional)</label>
                        <textarea
                            rows="2"
                            value={formData.notas}
                            onChange={e => setFormData({ ...formData, notas: e.target.value })}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{ background: 'var(--accent-primary)', color: 'white', width: '100%', fontSize: '1.1rem' }}>
                        {loading ? 'Guardando...' : 'Registrar Movimiento'}
                    </button>
                </form>
            )}

            {/* Filters and List */}
            <div className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Buscar transacciones..."
                            style={{ paddingLeft: '3rem' }}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{ padding: '0.5rem 1rem', background: filter === 'all' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', fontSize: '0.9rem' }}
                        >
                            Todo
                        </button>
                        <button
                            onClick={() => setFilter('ingreso')}
                            style={{ padding: '0.5rem 1rem', background: filter === 'ingreso' ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.05)', fontSize: '0.9rem' }}
                        >
                            Ingresos
                        </button>
                        <button
                            onClick={() => setFilter('egreso')}
                            style={{ padding: '0.5rem 1rem', background: filter === 'egreso' ? '#ef4444' : 'rgba(255,255,255,0.05)', fontSize: '0.9rem' }}
                        >
                            Egresos
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem' }}>Fecha</th>
                                <th style={{ padding: '1rem' }}>Concepto</th>
                                <th style={{ padding: '1rem' }}>Categoría</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Monto</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                        {new Date(t.fecha).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{t.concepto}</div>
                                        {t.notas && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.notas}</div>}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            {t.categoria}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: t.tipo === 'ingreso' ? 'var(--accent-secondary)' : '#ef4444' }}>
                                        {t.tipo === 'ingreso' ? '+' : '-'}${t.monto.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(t.id)} style={{ background: 'none', color: '#ef4444' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No se encontraron transacciones.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Finances;
