import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getMembers as getMusicians, addMember as addMusician, deleteMember as deleteMusician, inviteUserToBand } from '../services/firestoreService';
import { sendInvitationEmail } from '../services/emailService';
import { Plus, Trash2, Mail, Loader2, Copy, Users } from 'lucide-react';
import { generateIdCode } from '../utils/codeGenerator';

const Musicians = () => {
    const { activeBand } = useApp();
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [musicians, setMusicians] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadMusicians = React.useCallback(async () => {
        if (!activeBand) return;
        setLoading(true);
        const data = await getMusicians(activeBand.id);
        setMusicians(data);
        setLoading(false);
    }, [activeBand]);

    useEffect(() => {
        loadMusicians();
    }, [activeBand, loadMusicians]);

    const handleAddMusician = async (e) => {
        e.preventDefault();
        const form = e.target;
        const newMusician = {
            nombre: form.nombre.value,
            instrument: {
                id: generateIdCode('instrument'),
                nombre: form.instrumento.value
            },
            email: form.email.value || '',
            role: form.role.value
        };

        try {
            await addMusician(activeBand.id, newMusician);
            form.reset();
            loadMusicians();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar a este músico?')) {
            await deleteMusician(activeBand.id, id);
            loadMusicians();
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail || !activeBand) return;

        setInviting(true);
        try {
            const result = await sendInvitationEmail(inviteEmail, activeBand.nombre, activeBand.inviteCode);

            if (result.success) {
                alert(`¡Éxito! Invitación enviada a ${inviteEmail}`);
            } else {
                alert(result.message || "La invitación se registró internamente, pero el envío de correo falló.");
            }

            await inviteUserToBand(activeBand.id, inviteEmail);
            setInviteEmail('');
            loadMusicians();
        } catch (error) {
            console.error("Error in invitation flow:", error);
            alert("Hubo un problema al procesar la invitación.");
        } finally {
            setInviting(false);
        }
    };

    const handleCopyLink = () => {
        const joinLink = `${window.location.origin}/unirse/${activeBand.inviteCode}`;
        navigator.clipboard.writeText(joinLink);
        alert("¡Enlace copiado al portapapeles!");
    };

    if (loading) return <div className="container"><Loader2 className="animate-spin" /> Cargando músicos...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Users size={32} color="var(--accent-primary)" />
                <h1 style={{ color: 'var(--accent-primary)' }}>Músicos de la Banda</h1>
            </div>

            {/* Invitation Section */}
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-secondary)' }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                    <Mail size={18} color="var(--accent-secondary)" /> Invitar Músico vía Email
                </h3>
                <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Correo Electrónico</label>
                        <input
                            type="email"
                            name="inviteEmail"
                            placeholder="musico@email.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            disabled={inviting}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={inviting}
                        style={{ background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px', justifyContent: 'center' }}
                    >
                        {inviting ? <Loader2 size={18} className="animate-spin" /> : 'Enviar Invitación'}
                    </button>
                </form>
                {activeBand?.inviteCode && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Enlace de Unión Rápida</span>
                            <code style={{ fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>{activeBand.inviteCode}</code>
                        </div>
                        <button
                            onClick={handleCopyLink}
                            style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                            <Copy size={16} /> Copiar Link
                        </button>
                    </div>
                )}
            </div>

            {/* Formulario Agregar Manual */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Registro Manual de Músico</h3>
            <form className="glass" onSubmit={handleAddMusician} style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Nombre</label>
                    <input type="text" name="nombre" placeholder="Nombre completo" required />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Instrumento</label>
                    <input type="text" name="instrumento" placeholder="Ej. Batería" required />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Rol en App</label>
                    <select name="role" required style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }}>
                        <option value="member">Músico</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                <button type="submit" style={{ background: 'var(--accent-secondary)', color: 'white', padding: '0.7rem 1.5rem' }}>
                    <Plus size={18} /> Agregar
                </button>
            </form>

            {/* Lista de Músicos */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {musicians.map(musician => (
                    <div key={musician.id} className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{musician.nombre}</h3>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: 'bold', background: 'rgba(139, 92, 246, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    {musician.customId || 'SIN ID'}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {musician.instrument?.nombre || musician.instrumento || 'Sin instrumento'}
                                    <small style={{ opacity: 0.5, marginLeft: '0.4rem' }}>({musician.instrument?.id || 'NO-ID'})</small>
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>{musician.role === 'admin' ? 'Administrador' : 'Músico'}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(musician.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.6rem', borderRadius: '8px' }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {musicians.length === 0 && (
                    <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No hay músicos registrados aún.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Musicians;
