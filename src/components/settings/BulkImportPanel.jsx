import React, { useState } from 'react';
import { Database, FileSpreadsheet, UserPlus, MessageCircle } from 'lucide-react';
import ImportExcel from '../ImportExcel';
import { bulkAddSongs, bulkAddGear, createInvite } from '../../services/firestoreService';

const BulkImportPanel = ({ activeBand, isAdmin }) => {
    const [loading, setLoading] = useState(false);
    const [inviteData, setInviteData] = useState({
        perfil: 'Musico', nombre: '', apellido: '', correo: '', permisos: 'Editor'
    });

    const handleWhatsAppShare = async () => {
        if (!inviteData.correo || !inviteData.nombre) {
            alert('Por favor completa Nombre y Correo del invitado antes de compartir.');
            return;
        }
        try {
            setLoading(true);
            await createInvite(activeBand.id, inviteData);
            const inviteLink = `${window.location.origin}/unirse/${activeBand.inviteCode}`;
            const text = `¡Hola ${inviteData.nombre}! Únete a la banda ${activeBand.nombre} en Band Manager: ${inviteLink}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        } catch (error) {
            console.error(error);
            alert('Error al generar la invitación.');
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

    const songMapping = {
        'Título': 'titulo', 'titulo': 'titulo', 'song_name': 'titulo', 'Nombre': 'titulo',
        'Tonalidad': 'tonalidad', 'tonality': 'tonalidad', 'Key': 'tonalidad',
        'Letra': 'letra', 'Lyrics': 'letra', 'lyrics': 'letra',
        'Notas': 'acordes', 'Acordes': 'acordes', 'chords': 'acordes', 'Chords': 'acordes',
        'Código': 'customId', 'song_id': 'customId', 'id': 'customId'
    };

    const gearMapping = {
        'Nombre': 'name', 'Equipo': 'name', 'Item': 'name', 'gear_name': 'name',
        'Categoría': 'category', 'Category': 'category',
        'Propietario': 'owner', 'Owner': 'owner',
        'Notas': 'notes', 'Notes': 'notes',
        'Código': 'customId', 'gear_id': 'customId', 'id': 'customId'
    };

    if (!isAdmin) return null;

    return (
        <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="var(--accent-secondary)" /> Importación de Datos
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                Carga masiva de información desde archivos Excel (.xlsx) o CSV.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <a href="/templates/Plantilla_Canciones.xlsx" download className="glass-btn" style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                    <FileSpreadsheet size={16} /> Plantilla Canciones
                </a>
                <a href="/templates/Plantilla_Inventario.xlsx" download className="glass-btn" style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                    <FileSpreadsheet size={16} /> Plantilla Inventario
                </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <ImportExcel onImport={handleImportSongs} mapping={songMapping} label="Importar Biblioteca de Canciones" />
                <ImportExcel onImport={handleImportGear} mapping={gearMapping} label="Importar Inventario de Equipo" />
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={18} color="var(--accent-primary)" /> Invitar Músico / Personal
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Escriba los datos del invitado para generar su pase de acceso con permisos específicos.
                </p>
                <div className="glass" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', marginBottom: '1.5rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>Perfil</th>
                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>Nombre</th>
                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>Apellido</th>
                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>Correo</th>
                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>Permisos</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '0.5rem' }}>
                                    <select value={inviteData.perfil} onChange={(e) => setInviteData({...inviteData, perfil: e.target.value})} style={{ width: '100%', padding: '0.4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}>
                                        <option value="Manager">Manager</option>
                                        <option value="Musico">Músico</option>
                                        <option value="Invitado">Invitado</option>
                                    </select>
                                </td>
                                <td style={{ padding: '0.5rem' }}><input type="text" placeholder="Ej. Alejandro" value={inviteData.nombre} onChange={(e) => setInviteData({...inviteData, nombre: e.target.value})} style={{ width: '100%', padding: '0.4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }} /></td>
                                <td style={{ padding: '0.5rem' }}><input type="text" placeholder="Ej. Perez" value={inviteData.apellido} onChange={(e) => setInviteData({...inviteData, apellido: e.target.value})} style={{ width: '100%', padding: '0.4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }} /></td>
                                <td style={{ padding: '0.5rem' }}><input type="email" placeholder="correo@gmail.com" value={inviteData.correo} onChange={(e) => setInviteData({...inviteData, correo: e.target.value})} style={{ width: '100%', padding: '0.4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }} /></td>
                                <td style={{ padding: '0.5rem' }}>
                                    <select value={inviteData.permisos} onChange={(e) => setInviteData({...inviteData, permisos: e.target.value})} style={{ width: '100%', padding: '0.4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Editor">Editor</option>
                                        <option value="Visor">Visor</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                    <button onClick={handleWhatsAppShare} disabled={loading} style={{ width: '200px', background: 'white', color: 'black', border: '2px solid black', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                        {loading ? 'Generando...' : <><MessageCircle size={18} /> Compartir</>}
                    </button>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6 }}>Al compartir, se guardarán los datos y se generará el enlace.</p>
                </div>
            </div>
        </div>
    );
};

export default BulkImportPanel;
