import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const { loginWithGoogle, loginWithEmail, registerWithEmail, currentUser, userProfile, loading, profileLoading } = useAuth();
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [localLoading, setLocalLoading] = useState(false);

    useEffect(() => {
        if (currentUser && !loading && !profileLoading) {
            const redirectTo = localStorage.getItem('redirectAfterLogin');
            if (redirectTo) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectTo);
            } else if (userProfile) {
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        }
    }, [currentUser, userProfile, loading, profileLoading, navigate]);

    const handleGoogleLogin = async () => {
        setError('');
        setLocalLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error("Login Error:", err);
            setError("Error al iniciar con Google. Reintenta.");
        } finally {
            setLocalLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);
        try {
            if (isRegister) {
                await registerWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
        } catch (err) {
            console.error("Auth Error:", err);
            setError(isRegister ? "Error al registrarse" : "Correo o contraseña incorrectos");
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container auth-container"
        >
            <motion.h1 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="auth-title"
            >
                Band Manager
            </motion.h1>

            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass auth-card"
                style={{ backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
                <h2 className="auth-subtitle">
                    {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </h2>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="error-alert"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                disabled={localLoading}
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
                                disabled={localLoading}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={localLoading}>
                        {localLoading && !currentUser ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : isRegister ? (
                            <><UserPlus size={20} /> Registrarse</>
                        ) : (
                            <><LogIn size={20} /> Entrar</>
                        )}
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
                    disabled={localLoading}
                    style={{ position: 'relative' }}
                >
                    {localLoading && currentUser ? (
                         <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
                            Iniciar con Google
                        </>
                    )}
                </button>

                <p className="auth-footer">
                    {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="btn-link"
                        disabled={localLoading}
                    >
                        {isRegister ? 'Inicia sesión aquí' : 'Regístrate aquí'}
                    </button>
                </p>
            </motion.div>
        </motion.div>
    );
};

export default Login;

