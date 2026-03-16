import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getBandByInviteCode, joinBand, getInviteByEmail } from '../services/firestoreService';
import { Loader2, Music, CheckCircle2 } from 'lucide-react';

const JoinBand = () => {
    const { code } = useParams();
    const { currentUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [band, setBand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joined, setJoined] = useState(false);
    const [inviteInfo, setInviteInfo] = useState(null);

    useEffect(() => {
        const fetchBand = async () => {
            try {
                const b = await getBandByInviteCode(code);
                if (b) {
                    setBand(b);
                    // Check for invitation hint in URL
                    const params = new URLSearchParams(window.location.search);
                    const emailHint = params.get('email');
                    if (emailHint) {
                        const invite = await getInviteByEmail(b.id, emailHint);
                        if (invite) setInviteInfo(invite);
                    }
                } else {
                    setError("Código de invitación no válido.");
                }
            } catch (err) {
                console.error(err);
                setError("Error al buscar la banda.");
            } finally {
                setLoading(false);
            }
        };
        fetchBand();
    }, [code]);

    const handleJoin = async () => {
        if (!currentUser) {
            localStorage.setItem('redirectAfterLogin', `/unirse/${code}`);
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            await joinBand(band.id, currentUser);
            setJoined(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            console.error(err);
            setError("Error al unirse a la banda. Es posible que ya seas miembro.");
            setLoading(false);
        }
    };

    if (authLoading || loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }}>
            <Loader2 size={48} className="animate-spin" />
            <p style={{ marginTop: '1rem' }}>Procesando invitación...</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
            <div className="glass" style={{ maxWidth: '500px', width: '100%', padding: '3rem', textAlign: 'center' }}>
                <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem'
                }}>
                    <Music size={40} color="var(--accent-primary)" />
                </div>

                {error ? (
                    <>
                        <h2 style={{ color: '#ef4444' }}>Ups...</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                        <button onClick={() => navigate('/dashboard')} style={{ marginTop: '1.5rem', width: '100%' }}>Ir al Inicio</button>
                    </>
                ) : joined ? (
                    <>
                        <h2 style={{ color: 'var(--accent-secondary)' }}>¡Bienvenido!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Te has unido exitosamente a <strong>{band?.nombre}</strong>.</p>
                        <div style={{ margin: '2rem auto' }}>
                            <CheckCircle2 size={64} color="var(--accent-secondary)" />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Redirigiendo al panel...</p>
                    </>
                ) : (
                    <>
                        {inviteInfo ? (
                            <>
                                <h1 style={{ marginBottom: '0.5rem' }}>¡Hola {inviteInfo.nombre}!</h1>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                    Fuiste invitado a unirte a:
                                    <strong style={{ fontSize: '1.8rem', color: 'white', display: 'block', marginTop: '0.5rem' }}>{band?.nombre}</strong>
                                </p>
                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
                                    Entrarás como <strong>{inviteInfo.perfil}</strong> ({inviteInfo.permisos})
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 style={{ marginBottom: '1rem' }}>Invitación Recibida</h1>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                                    Has sido invitado a unirte a la banda:<br />
                                    <strong style={{ fontSize: '1.8rem', color: 'white', display: 'block', marginTop: '0.5rem' }}>{band?.nombre}</strong>
                                </p>
                            </>
                        )}

                        {!currentUser && (
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem' }}>
                                Necesitas iniciar sesión o registrarte para aceptar la invitación.
                            </div>
                        )}

                        <button
                            onClick={handleJoin}
                            style={{
                                width: '100%',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                fontSize: '1.1rem',
                                padding: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {currentUser ? 'Aceptar Invitación y Unirse' : 'Iniciar Sesión para Unirse'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default JoinBand;
