import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, LogIn } from 'lucide-react';

const Login = () => {
    const { loginWithGoogle, loginWithEmail, registerWithEmail, currentUser, userProfile, loading, profileLoading } = useAuth();
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser && !loading && !profileLoading) {
            const redirectTo = localStorage.getItem('redirectAfterLogin');
            if (redirectTo) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectTo);
            } else if (userProfile) {
                navigate('/dashboard');
            } else {
                // Only redirect to onboarding if we are sure there is no profile
                // AND we are not loading AND profile check is done.
                // Note: AuthContext handles errors, so if we are here, it's a valid "New User"
                navigate('/onboarding');
            }
        }
    }, [currentUser, userProfile, loading, profileLoading, navigate]);

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
        <div className="container auth-container">
            <h1 className="auth-title">Band Manager</h1>

            <div className="glass auth-card">
                <h2 className="auth-subtitle">
                    {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </h2>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleEmailAuth} className="auth-form">
                    <div className="input-group">
                        <label className="input-label">Correo Electrónico</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-with-icon"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Contraseña</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-with-icon"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary">
                        {isRegister ? <><UserPlus size={20} /> Registrarse</> : <><LogIn size={20} /> Entrar</>}
                    </button>
                </form>

                <div className="auth-divider">
                    <div className="divider-line"></div>
                    <span>O</span>
                    <div className="divider-line"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="btn-google"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
                    Iniciar con Google
                </button>

                <p className="auth-footer">
                    {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="btn-link"
                    >
                        {isRegister ? 'Inicia sesión aquí' : 'Regístrate aquí'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
