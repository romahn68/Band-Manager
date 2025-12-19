import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { getFinances, addFinance, deleteFinance } from '../services/firestoreService';
import { Plus, Trash2, Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign, X, Filter } from 'lucide-react';

const Finances = () => {
    const { activeBand } = useApp();
    const [records, setRecords] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ description: '', amount: '', type: 'Ingreso', category: 'Concierto', date: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeBand) loadFinances();
    }, [activeBand]);

    const loadFinances = async () => {
        if (!activeBand) return;
        const data = await getFinances(activeBand.id);
        // Sort by date descending
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecords(sorted);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) return;

        setLoading(true);
        try {
            await addFinance(activeBand.id, {
                ...formData,
                amount: parseFloat(formData.amount)
            });
            setFormData({ description: '', amount: '', type: 'Ingreso', category: 'Concierto', date: new Date().toISOString().split('T')[0] });
            setShowForm(false);
            loadFinances();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este registro financiero?')) {
            await deleteFinance(activeBand.id, id);
            loadFinances();
        }
    };

    const totalIncome = records.filter(r => r.type === 'Ingreso').reduce((acc, r) => acc + r.amount, 0);
    const totalExpenses = records.filter(r => r.type === 'Gasto').reduce((acc, r) => acc + r.amount, 0);
    const balance = totalIncome - totalExpenses;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--accent-primary)', margin: 0 }}>Gestión Financiera</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />} {showForm ? 'Cancelar' : 'Nuevo Registro'}
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                        <TrendingUp size={24} color="#10b981" />
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Ingresos</span>
                        <h2 style={{ margin: 0, color: '#10b981' }}>${totalIncome.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                        <TrendingDown size={24} color="#ef4444" />
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Gastos</span>
                        <h2 style={{ margin: 0, color: '#ef4444' }}>${totalExpenses.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--accent-primary)' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                        <DollarSign size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Balance General</span>
                        <h2 style={{ margin: 0, color: 'var(--accent-primary)' }}>${balance.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {showForm && (
                <form className="glass" onSubmit={handleSubmit} style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción *</label>
                            <input
                                type="text"
                                value={formData.description}
                                placeholder="Ej. Pago concierto Bulldog"
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Monto ($) *</label>
                            <input
                                type="number"
                                value={formData.amount}
                                placeholder="0.00"
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option>Ingreso</option>
                                <option>Gasto</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} style={{ background: 'var(--accent-primary)', color: 'white', width: '100%', fontSize: '1.1rem' }}>
                        {loading ? 'Guardando...' : 'Registrar Movimiento'}
                    </button>
                </form>
            )}

            <div className="glass" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    <Filter size={18} /> <span>Historial de Movimientos</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <th style={{ padding: '1rem' }}>Fecha</th>
                                <th style={{ padding: '1rem' }}>Descripción</th>
                                <th style={{ padding: '1rem' }}>Categoría</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Monto</th>
                                <th style={{ padding: '1rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(record => (
                                <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{record.date}</td>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{record.description}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {record.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: record.type === 'Ingreso' ? '#10b981' : '#ef4444' }}>
                                        {record.type === 'Ingreso' ? '+' : '-'}${record.amount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(record.id)} style={{ background: 'none', color: 'rgba(239, 68, 68, 0.5)', padding: '0.2rem' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay movimientos registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Finances;
