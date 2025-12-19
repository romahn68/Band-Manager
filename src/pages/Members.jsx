import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { getMembers, addMember, updateMember, deleteMember } from '../services/firestoreService';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

const Members = () => {
    const { activeBand } = useApp();
    const [members, setMembers] = useState([]);
    const [newMember, setNewMember] = useState({ nombre: '', instrumento: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ nombre: '', instrumento: '' });

    useEffect(() => {
        if (activeBand) {
            loadMembers();
        }
    }, [activeBand]);

    const loadMembers = async () => {
        if (!activeBand) return;
        const data = await getMembers(activeBand.id);
        setMembers(data);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newMember.nombre || !newMember.instrumento) return;
        await addMember(activeBand.id, newMember);
        setNewMember({ nombre: '', instrumento: '' });
        loadMembers();
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este miembro?')) {
            await deleteMember(activeBand.id, id);
            loadMembers();
        }
    };

    const startEdit = (member) => {
        setEditingId(member.id);
        setEditForm({ nombre: member.nombre, instrumento: member.instrumento });
    };

    const handleUpdate = async (id) => {
        await updateMember(activeBand.id, id, editForm);
        setEditingId(null);
        loadMembers();
    };

    return (
        <div className="container">
            <h1 style={{ color: 'var(--accent-primary)' }}>Miembros de la Banda</h1>

            {/* Formulario Agregar */}
            <form className="glass" onSubmit={handleAdd} style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombre</label>
                    <input
                        type="text"
                        placeholder="Nombre del músico"
                        value={newMember.nombre}
                        onChange={(e) => setNewMember({ ...newMember, nombre: e.target.value })}
                        required
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Instrumento</label>
                    <input
                        type="text"
                        placeholder="Ej. Guitarra, Voz"
                        value={newMember.instrumento}
                        onChange={(e) => setNewMember({ ...newMember, instrumento: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" style={{ background: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Agregar
                </button>
            </form>

            {/* Lista de Miembros */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {members.map(member => (
                    <div key={member.id} className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {editingId === member.id ? (
                            <>
                                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                                    <input value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
                                    <input value={editForm.instrumento} onChange={(e) => setEditForm({ ...editForm, instrumento: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <button onClick={() => handleUpdate(member.id)} style={{ background: 'var(--accent-secondary)', padding: '0.5rem' }}><Check size={18} /></button>
                                    <button onClick={() => setEditingId(null)} style={{ background: '#4b5563', padding: '0.5rem' }}><X size={18} /></button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h3 style={{ margin: 0 }}>{member.nombre}</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{member.instrumento}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEdit(member)} style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)', padding: '0.5rem' }}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(member.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.5rem' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {members.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay miembros registrados.</p>}
            </div>
        </div>
    );
};

export default Members;
