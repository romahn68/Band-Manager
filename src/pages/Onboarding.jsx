import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, Calendar, Briefcase } from 'lucide-react';

const Onboarding = () => {
    const { currentUser, userProfile, setUserProfile } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        country: '',
        city: '',
        roleInBand: 'musico' // Default
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser && userProfile) {
            navigate('/dashboard');
        }
    }, [currentUser, userProfile, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        setLoading(true);

        try {
            const profileData = {
                ...formData,
                email: currentUser.email,
                uid: currentUser.uid,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, "users", currentUser.uid), profileData);
            setUserProfile(profileData);
            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving profile", error);
            alert("Error al guardar el perfil. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', padding: '1rem' }}>
            <div className="glass" style={{ padding: '3rem', width: '100%', maxWidth: '500px' }}>
                <h1 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', textAlign: 'center' }}>¡Bienvenido!</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', textAlign: 'center' }}>Cuéntanos un poco más sobre ti para empezar.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre Completo</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Ej. Juan Pérez"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                style={{ paddingLeft: '3rem' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Edad</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="number"
                                placeholder="Tu edad"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                style={{ paddingLeft: '3rem' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>País</label>
                        <input
                            type="text"
                            placeholder="Tu país"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            style={{ paddingLeft: '1rem', width: '100%' }}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ciudad</label>
                        <input
                            type="text"
                            placeholder="Tu ciudad"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            style={{ paddingLeft: '1rem', width: '100%' }}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tu Rol Principal</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <select
                                value={formData.roleInBand}
                                onChange={(e) => setFormData({ ...formData, roleInBand: e.target.value })}
                                style={{ paddingLeft: '3rem', width: '100%', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px' }}
                            >
                                <option value="manager">Manager</option>
                                <option value="representante">Representante</option>
                                <option value="musico">Músico</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ background: 'var(--accent-secondary)', color: 'white', fontSize: '1.1rem', marginTop: '1rem', padding: '1rem' }}
                    >
                        {loading ? 'Guardando...' : 'Completar Perfil'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
