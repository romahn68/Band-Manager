

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

    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const registerWithEmail = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const loginWithEmail = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            try {
                if (user) {
                    const docRef = doc(db, "users", user.uid);

                    // Add a timeout to prevent perpetual loading if Firestore hangs
                    const profilePromise = getDoc(docRef);
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Firestore timeout")), 5000)
                    );

                    const docSnap = await Promise.race([profilePromise, timeoutPromise]);

                    if (docSnap && docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        setUserProfile(null);
                    }
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("AuthContext: Error fetching user profile or timeout:", error);
                setUserProfile(null);
            } finally {
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{
            currentUser,
            userProfile,
            setUserProfile,
            loginWithGoogle,
            registerWithEmail,
            loginWithEmail,
            logout,
            loading
        }}>
            {loading ? (
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
            ) : children}
        </AuthContext.Provider>
    );
};

