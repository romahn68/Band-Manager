import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, LogIn } from 'lucide-react';

const Login = () => {
    const { loginWithGoogle, loginWithEmail, registerWithEmail, currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser) {
            const redirectTo = localStorage.getItem('redirectAfterLogin');
            if (redirectTo) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectTo);
            } else if (!userProfile) {
                navigate('/onboarding');
            } else {
                navigate('/dashboard');
            }
        }
    }, [currentUser, userProfile, navigate]);

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch {
            setError("Error al iniciar con Google");
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegister) {
                await registerWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
        } catch {
            setError(isRegister ? "Error al registrarse" : "Correo o contraseña incorrectos");
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', padding: '1rem' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', textShadow: '0 0 20px #8b5cf6', textAlign: 'center' }}>Band Manager</h1>

            <div className="glass" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px' }}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--accent-primary)' }}>
                    {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </h2>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Correo Electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '3rem' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '3rem' }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', fontSize: '1.1rem', marginTop: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        {isRegister ? <><UserPlus size={20} /> Registrarse</> : <><LogIn size={20} /> Entrar</>}
                    </button>
                </form>

                <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    <span>O</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        background: 'white',
                        color: 'black',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        fontSize: '1rem',
                        padding: '0.8rem'
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
                    Iniciar con Google
                </button>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ background: 'none', color: 'var(--accent-secondary)', fontWeight: '600', padding: '0 0.5rem', cursor: 'pointer', border: 'none', boxShadow: 'none' }}
                    >
                        {isRegister ? 'Inicia sesión aquí' : 'Regístrate aquí'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;

