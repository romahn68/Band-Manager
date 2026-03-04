

import React, { useEffect, useState } from 'react';
import { auth, googleProvider, db } from './firebase';
import { AuthContext } from './hooks/Contexts';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    const [profileLoading, setProfileLoading] = useState(true);

    const loginWithGoogle = () => {
        setAuthError(null);
        return signInWithPopup(auth, googleProvider);
    };

    const registerWithEmail = (email, password) => {
        setAuthError(null);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const loginWithEmail = (email, password) => {
        setAuthError(null);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        setAuthError(null);
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setAuthError(null); // Clear previous errors on state change
            setProfileLoading(true); // Start loading profile when auth state changes

            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    // Removed arbitrary timeout - let Firestore handle network latency
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        // Explicitly null - user exists in Auth but not in Firestore (needs Onboarding)
                        setUserProfile(null);
                    }
                } catch (error) {
                    console.error("AuthContext: Error fetching user profile:", error);
                    setAuthError(error);
                    // Maintain userProfile as null or previous state? 
                    // If we set null and loading false, Login redirects to Onboarding. 
                    // We must block that by showing Error UI below.
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
            setProfileLoading(false); // Profile load complete
        });
        return unsubscribe;
    }, []);

    const retryAuth = () => {
        setLoading(true);
        setAuthError(null);
        // Triggering a re-check relies on onAuthStateChanged firing or manual fetch.
        // Since onAuthStateChanged might not fire if user is same, we might need manual fetch logic here.
        // Simplest strategy: Reload page to force full re-sync.
        window.location.reload();
    };

    // --- RENDER LOGIC ---

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0a0a0c',
                color: '#8b5cf6',
                fontFamily: 'Lato, sans-serif'
            }}>
                <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Band Manager</h2>
                    <p style={{ color: '#9ca3af' }}>Sincronizando sesión...</p>
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0a0a0c',
                fontFamily: 'Lato, sans-serif'
            }}>
                <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error de Conexión</h2>
                    <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
                        No pudimos recuperar tu perfil. Verifica tu conexión a internet.
                    </p>
                    <button
                        onClick={retryAuth}
                        style={{
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Reintentar
                    </button>
                    {import.meta.env.DEV && (
                        <pre style={{ marginTop: '1rem', color: '#666', fontSize: '0.7rem', textAlign: 'left', overflow: 'auto' }}>
                            {authError.message}
                        </pre>
                    )}
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            currentUser,
            userProfile,
            setUserProfile,
            loginWithGoogle,
            registerWithEmail,
            loginWithEmail,
            logout,
            loading,
            profileLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

