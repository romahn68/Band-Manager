import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getMusiciansPaginated, addMusician, deleteMusician, inviteUserToBand } from '../services/firestoreService';
import { generateIdCode } from '../utils/codeGenerator';
import { sendInvitationEmail } from '../services/emailService';
import { Users, Mail, Copy, Plus, Trash2, Loader2 } from 'lucide-react';
import styles from './Musicians.module.css';
import { AnimatePresence } from 'framer-motion';

const Musicians = () => {
    const { activeBand } = useApp();
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [musicians, setMusicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(false);

    const loadInitial = React.useCallback(async () => {
        if (!activeBand) return;
        setLoading(true);
        try {
            const { data, lastVisible: lastDoc } = await getMusiciansPaginated(activeBand.id, 15, null);
            setMusicians(data);
            setLastVisible(lastDoc);
            setHasMore(data.length === 15);
        } catch (error) {
            console.error("Error loading musicians:", error);
        } finally {
            setLoading(false);
        }
    }, [activeBand]);

    const loadMore = async () => {
        if (!activeBand || loading || !hasMore) return;
        setLoading(true);
        try {
            const { data, lastVisible: lastDoc } = await getMusiciansPaginated(activeBand.id, 15, lastVisible);
            setMusicians(prev => [...prev, ...data]);
            setLastVisible(lastDoc);
            setHasMore(data.length === 15);
        } catch (error) {
            console.error("Error loading more musicians:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitial();
    }, [activeBand, loadInitial]);

    const handleAddMusician = async (e) => {
        e.preventDefault();
        const form = e.target;

        const newMusician = {
            nombre: form.nombre.value,
            instrument: {
                id: generateIdCode('instrument'),
                nombre: form.instrumento.value
            },
            email: form.email?.value || '',
            role: form.role.value
        };

        try {
            await addMusician(activeBand.id, newMusician);
            form.reset();
            loadInitial();
            alert("Músico agregado correctamente");
        } catch (error) {
            console.error("Error adding musician:", error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar a este músico?')) {
            await deleteMusician(activeBand.id, id);
            loadInitial();
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
            loadInitial();
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

    if (loading) return <div className={styles.container}><Loader2 className="animate-spin" /> Cargando músicos...</div>;

    return (
        <div
            className={styles.container}
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            style={{ animation: 'fadeIn 0.5s ease-out' }}
        >
            <div className={styles.header}>
                <Users size={32} color="var(--accent-primary)" />
                <h1 className={styles.title}>Músicos de la Banda</h1>
            </div>

            {/* Invitation Section */}
            <div
                className={styles.inviteSection}
                style={{ animation: 'slideInRight 0.5s ease-out' }}
            >
                <h3 className={styles.inviteHeader}>
                    <Mail size={18} color="var(--accent-secondary)" /> Invitar Músico vía Email
                </h3>
                <form onSubmit={handleInvite} className={styles.inviteForm}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Correo Electrónico</label>
                        <input
                            type="email"
                            name="inviteEmail"
                            placeholder="musico@email.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            disabled={inviting}
                            required
                            className={styles.input}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={inviting}
                        className={styles.button}
                    >
                        {inviting ? <Loader2 size={18} className="animate-spin" /> : 'Enviar Invitación'}
                    </button>
                </form>
                {activeBand?.inviteCode && (
                    <div className={styles.linkBox}>
                        <div>
                            <span className={styles.label} style={{ marginBottom: 0 }}>Enlace de Unión Rápida</span>
                            <code className={styles.linkCode}>{activeBand.inviteCode}</code>
                        </div>
                        <button onClick={handleCopyLink} className={styles.copyButton}>
                            <Copy size={16} /> Copiar Link
                        </button>
                    </div>
                )}
            </div>

            {/* Formulario Agregar Manual */}
            <h3 className={styles.sectionTitle}>Registro Manual de Músico</h3>
            <form
                className={styles.addForm}
                onSubmit={handleAddMusician}
                style={{ animation: 'slideInUp 0.5s ease-out' }}
            >
                <div className={styles.inputGroup} style={{ minWidth: '150px' }}>
                    <label className={styles.label}>Nombre</label>
                    <input type="text" name="nombre" placeholder="Nombre completo" required className={styles.input} />
                </div>
                <div className={styles.inputGroup} style={{ minWidth: '150px' }}>
                    <label className={styles.label}>Instrumento</label>
                    <input type="text" name="instrumento" placeholder="Ej. Batería" required className={styles.input} />
                </div>
                <div className={styles.inputGroup} style={{ minWidth: '150px' }}>
                    <label className={styles.label}>Rol en App</label>
                    <select name="role" required className={styles.select}>
                        <option value="Miembro">Músico</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Administrador</option>
                    </select>
                </div>
                <button type="submit" className={styles.addButton}>
                    <Plus size={18} /> Agregar
                </button>
            </form>

            {/* Lista de Músicos */}
            <div className={styles.grid}>
                <AnimatePresence>
                    {musicians.map(musician => (
                        <div
                            key={musician.id}
                            className={styles.card}
                            style={{ animation: 'zoomIn 0.3s ease-out' }}
                        >
                            <div>
                                <h3 className={styles.cardName}>{musician.nombre}</h3>
                                <div className={styles.cardMeta}>
                                    <span className={styles.idBadge}>
                                        {musician.customId || 'SIN ID'}
                                    </span>
                                    <span className={styles.instrument}>
                                        {musician.instrument?.nombre || musician.instrumento || 'Sin instrumento'}
                                    </span>
                                    <span className={styles.roleBadge} data-role={musician.role}>
                                        {musician.role === 'Admin' ? 'Administrador' : musician.role === 'Manager' ? 'Manager' : 'Músico'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(musician.id)} className={styles.deleteButton}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </AnimatePresence>

                {musicians.length === 0 && (
                    <div className={styles.emptyState}>
                        No hay músicos registrados aún.
                    </div>
                )}
            </div>

            {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '2rem' }}>
                    <button onClick={loadMore} disabled={loading} style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem 2rem', border: 'none', borderRadius: '30px', cursor: 'pointer' }}>
                        {loading ? 'Cargando...' : 'Cargar más músicos'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Musicians;
