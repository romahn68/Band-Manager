

import React, { useEffect, useState } from 'react';
import { auth, googleProvider, db } from './firebase';
import { AuthContext } from './hooks/Contexts';
import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import LoadingScreen from './components/LoadingScreen';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Initialize persistence and handle redirect results
    useEffect(() => {
        const initAuth = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    console.log("AuthContext: Redirect login success");
                }
            } catch (error) {
                console.error("AuthContext: Error during auth initialization:", error);
                setAuthError(error);
            }
        };
        initAuth();
    }, []);

    const loginWithGoogle = async () => {
        setAuthError(null);
        setLoading(true);
        try {
            // Use popup for desktop, redirect for mobile/webview if possible
            // For now, providing both but defaulting to popup as per original
            // In a real mobile app (Capacitor), this would use a native plugin
            return await signInWithPopup(auth, googleProvider);
        } catch (error) {
            if (error.code === 'auth/popup-blocked') {
                return signInWithRedirect(auth, googleProvider);
            }
            throw error;
        }
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
        setUserProfile(null);
        return signOut(auth);
    };

    useEffect(() => {
        // Safety timeout: if auth/profile takes more than 8s (relaxed for slower mobile nets), let the app try to render
        const safetyTimer = setTimeout(() => {
            if (loading) {
                console.warn("Auth initialization safety timeout reached (6s). Forcing load.");
                setLoading(false);
                setProfileLoading(false);
            }
        }, 6000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setAuthError(null);
            
            if (user) {
                setProfileLoading(true);
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        // NEW: Create a placeholder profile to avoid redirect loops if onboarding fails
                        const initialProfile = {
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            createdAt: serverTimestamp(),
                            isNewUser: true
                        };
                        setUserProfile(initialProfile);
                    }
                } catch (error) {
                    console.error("AuthContext: Error fetching user profile:", error);
                    setAuthError(error);
                } finally {
                    setProfileLoading(false);
                }
            } else {
                setUserProfile(null);
                setProfileLoading(false);
            }
            
            clearTimeout(safetyTimer);
            setLoading(false);
        });

        return () => {
            clearTimeout(safetyTimer);
            unsubscribe();
        };
    }, []);

    const retryAuth = () => {
        setLoading(true);
        setAuthError(null);
        window.location.reload();
    };

    if (loading) {
        return <LoadingScreen message="Sincronizando sesión..." />;
    }

    if (authError && !currentUser) {
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
                        No pudimos establecer conexión con los servicios de autenticación.
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
                        <pre style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.7rem', textAlign: 'left', overflow: 'auto', background: 'rgba(0,0,0,0.3)', padding: '0.5rem' }}>
                            {authError.code || authError.message}
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


