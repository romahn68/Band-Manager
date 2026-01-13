import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../hooks/useApp';
import { Settings as SettingsIcon, UserPlus, Shield, Trash2, Save, Printer, ListOrdered, Plus, Database, FileSpreadsheet, Key } from 'lucide-react';
import { updateBandMetadata, updateUserProfile, bulkAddSongs, bulkAddGear, getSongs, getGear, getMusicians } from '../services/firestoreService';
import { sendInvitationEmail } from '../services/emailService';
import ImportExcel from '../components/ImportExcel';

const Settings = () => {
    const { currentUser, userProfile } = useAuth();
    const { activeBand, updateBandName, createNewBand } = useApp();
    const [tempBandName, setTempBandName] = useState(activeBand?.nombre || '');
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(false);



    const [profileData, setProfileData] = useState({
        fullName: '',
        age: '',
        country: '',
        city: '',
        roleInBand: ''
    });

    const [recentIds, setRecentIds] = useState({ songs: [], gear: [], musicians: [] });

    useEffect(() => {
        if (userProfile) {
            setProfileData({
                fullName: userProfile.fullName || '',
                age: userProfile.age || '',
                country: userProfile.country || '',
                city: userProfile.city || '',
                roleInBand: userProfile.roleInBand || ''
            });
        }
    }, [userProfile]);

    useEffect(() => {
        const loadRecentIds = async () => {
            if (!activeBand) return;
            const [s, g, m] = await Promise.all([
                getSongs(activeBand.id),
                getGear(activeBand.id),
                getMusicians(activeBand.id)
            ]);
            setRecentIds({
                songs: (s || []).slice(0, 5),
                gear: (g || []).slice(0, 5),
                musicians: (m || []).slice(0, 5)
            });
        };
        loadRecentIds();
    }, [activeBand]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(currentUser.uid, profileData);
            alert("Perfil actualizado correctamente.");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error al actualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    // Rider Data State
    const [riderData, setRiderData] = useState(activeBand?.metadata?.rider || {
        channels: [
            { ch: '1', item: 'Kick', mic: 'Beta 52', notes: '' },
            { ch: '2', item: 'Snare', mic: 'SM57', notes: '' }
        ],
        notes: ''
    });

    useEffect(() => {
        if (activeBand) {
            setTempBandName(activeBand.nombre);
            if (activeBand.metadata?.rider) {
                setRiderData(activeBand.metadata.rider);
            }
        }
    }, [activeBand]);

    const handleUpdateBand = async () => {
        setLoading(true);
        try {
            await updateBandName(tempBandName);
            await updateBandMetadata(activeBand.id, { ...activeBand.metadata, rider: riderData });
            alert("Configuración de banda actualizada correctamente.");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addChannel = () => {
        setRiderData({
            ...riderData,
            channels: [...riderData.channels, { ch: (riderData.channels.length + 1).toString(), item: '', mic: '', notes: '' }]
        });
    };

    const updateChannel = (index, field, value) => {
        const newChannels = [...riderData.channels];
        newChannels[index][field] = value;
        setRiderData({ ...riderData, channels: newChannels });
    };

    const removeChannel = (index) => {
        setRiderData({
            ...riderData,
            channels: riderData.channels.filter((_, i) => i !== index)
        });
    };

    const handlePrintRider = () => {
        window.print();
    };



    // ...

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await sendInvitationEmail(inviteEmail, activeBand.nombre, activeBand.inviteCode);
            if (result.success) {
                alert(`Invitación enviada a ${inviteEmail}`);
                setInviteEmail('');
            } else {
                alert("Modo Simulación (Sin API Key): Invitación registrada para " + inviteEmail);
                setInviteEmail('');
            }
        } catch (error) {
            console.error(error);
            alert("Error al enviar invitación");
        } finally {
            setLoading(false);
        }
    };

    const handleImportSongs = async (data) => {
        try {
            await bulkAddSongs(activeBand.id, data);
            alert(`¡Éxito! Se importaron ${data.length} canciones.`);
        } catch (error) {
            console.error(error);
            alert('Error al importar canciones.');
        }
    };

    const handleImportGear = async (data) => {
        try {
            await bulkAddGear(activeBand.id, data);
            alert(`¡Éxito! Se importaron ${data.length} artículos al inventario.`);
        } catch (error) {
            console.error(error);
            alert('Error al importar inventario.');
        }
    };

    const songMapping = { 'Título': 'titulo', 'Tonalidad': 'tonalidad', 'Letra': 'letra', 'Notas': 'acordes', 'Código': 'customId' };
    const gearMapping = { 'Nombre': 'name', 'Equipo': 'name', 'Categoría': 'category', 'Propietario': 'owner', 'Notas': 'notes', 'Código': 'customId' };

    return (
        <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <SettingsIcon size={32} color="var(--accent-primary)" />
                    <h1 style={{ margin: 0 }}>Configuración de la Banda</h1>
                </div>
                <button
                    onClick={handlePrintRider}
                    style={{ background: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    className="no-print"
                >
                    <Printer size={18} /> Exportar Rider Pro
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }} className="no-print">

                {/* Band Info Section */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} color="var(--accent-secondary)" /> Información General
                    </h2>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre de la Banda</label>
                        <input
                            type="text"
                            value={tempBandName}
                            onChange={(e) => setTempBandName(e.target.value)}
                        />
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <Key size={14} /> ID Administrativo (Band)
                        </div>
                        <code style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                            {activeBand?.customId || 'SIN ASIGNAR'}
                        </code>
                    </div>
                    <button
                        onClick={handleUpdateBand}
                        disabled={loading}
                        style={{ width: '100%', background: 'var(--accent-primary)', color: 'white' }}
                    >
                        <Save size={18} /> Guardar Configuración
                    </button>
                </div>

                {/* Data Import Section */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Database size={20} color="var(--accent-secondary)" /> Importación de Datos
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                        Carga masiva de información desde archivos Excel (.xlsx) o CSV.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <ImportExcel
                            onImport={handleImportSongs}
                            mapping={songMapping}
                            label="Importar Biblioteca de Canciones"
                        />
                        <ImportExcel
                            onImport={handleImportGear}
                            mapping={gearMapping}
                            label="Importar Inventario de Equipo"
                        />
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Nota: Si el archivo incluye una columna "Código", se respetará; si no, el sistema generará uno automáticamente.
                    </div>
                </div>

                {/* ID Dictionary Section */}
                <div className="glass" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Key size={20} color="var(--accent-secondary)" /> Diccionario de Códigos (Referencia)
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                        Lista de referencia para integraciones manuales o control de inventario.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Últimas Canciones</h3>
                            {recentIds.songs.map(s => (
                                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.8rem' }}>
                                    <span style={{ fontWeight: 600 }}>{s.titulo}</span>
                                    <code style={{ color: 'var(--accent-secondary)' }}>{s.customId}</code>
                                </div>
                            ))}
                            {recentIds.songs.length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Sin canciones registradas.</p>}
                        </div>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Últimos Músicos</h3>
                        {recentIds.musicians.map(m => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.8rem' }}>
                                <span style={{ fontWeight: 600 }}>{m.nombre}</span>
                                <code style={{ color: 'var(--accent-secondary)' }}>{m.customId}</code>
                            </div>
                        ))}
                        {recentIds.musicians.length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Sin músicos registrados.</p>}
                    </div>
                </div>

                {/* Create New Band Section */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} color="var(--accent-secondary)" /> Crear Nueva Banda
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        ¿Tienes otro proyecto musical? Crea un espacio separado para él.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            placeholder="Nombre de la nueva banda"
                            id="newBandNameInput"
                        />
                        <button
                            onClick={async () => {
                                const input = document.getElementById('newBandNameInput');
                                if (!input.value) return;
                                if (window.confirm(`¿Crear banda "${input.value}"?`)) {
                                    await createNewBand(input.value);
                                    setTempBandName(input.value);
                                    input.value = '';
                                    alert('¡Banda creada y seleccionada!');
                                }
                            }}
                            style={{ background: 'var(--accent-secondary)', color: 'white', whiteSpace: 'nowrap' }}
                        >
                            Crear
                        </button>
                    </div>
                </div>



                {/* User Info Section */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} color="var(--accent-secondary)" /> Mi Perfil
                    </h2>
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre Completo</label>
                            <input
                                type="text"
                                value={profileData.fullName}
                                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Edad</label>
                                <input
                                    type="number"
                                    value={profileData.age}
                                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rol</label>
                                <select
                                    value={profileData.roleInBand}
                                    onChange={(e) => setProfileData({ ...profileData, roleInBand: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }}
                                >
                                    <option value="musician">Músico</option>
                                    <option value="manager">Manager</option>
                                    <option value="tech">Técnico</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>País</label>
                                <input
                                    type="text"
                                    value={profileData.country}
                                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ciudad</label>
                                <input
                                    type="text"
                                    value={profileData.city}
                                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ width: '100%', background: 'var(--accent-secondary)', color: 'white' }}
                        >
                            Actualizar Perfil
                        </button>
                    </form>
                </div>

                {/* Rider Técnico Form */}
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
                                {riderData.channels.map((ch, index) => (
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

                {/* Team Management - Placeholder for logic */}
                <div className="glass" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Gestión de Equipo (Roles y Permisos)</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Invita a otros músicos o managers a colaborar en la nube.</p>

                    <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', maxWidth: '600px' }}>
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                        />
                        <button type="submit" style={{ background: 'var(--accent-secondary)', color: 'white', whiteSpace: 'nowrap' }}>
                            <UserPlus size={18} /> Invitar Músico
                        </button>
                    </form>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '1rem' }}>Usuario</th>
                                    <th style={{ padding: '1rem' }}>Rol</th>
                                    <th style={{ padding: '1rem' }}>Estado</th>
                                    <th style={{ padding: '1rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>{userProfile?.fullName} (Tú)</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
                                            ADMIN / {userProfile?.roleInBand?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#10b981' }}>Activo</td>
                                    <td style={{ padding: '1rem' }}>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Hidden Print Template for Rider */}
            <div className="print-only" style={{ padding: '40px', color: 'black', background: 'white' }}>
                <div style={{ borderBottom: '3px solid black', marginBottom: '30px', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28pt', color: 'black' }}>Rider Técnico: {activeBand?.nombre}</h1>
                        <p style={{ margin: 0, fontSize: '12pt', color: '#444' }}>Input List Oficial - Sincronizado vía Cloud</p>
                    </div>
                </div>

                <h2 style={{ fontSize: '18pt', marginBottom: '15px' }}>1. Input List</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid black' }}>CH</th>
                            <th style={{ padding: '10px', border: '1px solid black' }}>Instrumento / Voz</th>
                            <th style={{ padding: '10px', border: '1px solid black' }}>Micrófono / DI</th>
                            <th style={{ padding: '10px', border: '1px solid black' }}>Notas Técnicas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riderData.channels.map((ch, index) => (
                            <tr key={index}>
                                <td style={{ padding: '10px', border: '1px solid black' }}>{ch.ch}</td>
                                <td style={{ padding: '10px', border: '1px solid black', fontWeight: 'bold' }}>{ch.item}</td>
                                <td style={{ padding: '10px', border: '1px solid black' }}>{ch.mic}</td>
                                <td style={{ padding: '10px', border: '1px solid black' }}>{ch.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2 style={{ fontSize: '18pt', marginTop: '30px', marginBottom: '10px' }}>2. Notas de Monitoreo y Escenario</h2>
                <div style={{ border: '1px solid #ddd', padding: '15px', minHeight: '100px', fontSize: '11pt' }}>
                    {riderData.notes || 'No hay notas adicionales especificadas.'}
                </div>

                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', fontSize: '10pt', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <span>Fecha de Emisión: {new Date().toLocaleDateString()}</span>
                    <span>Generado por Band Manager Pro v1.0</span>
                </div>
            </div>
        </div>
    );
};

export default Settings;
