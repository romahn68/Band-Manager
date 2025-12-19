import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from './firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

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
                    // Fetch extended profile
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        setUserProfile(null); // Force onboarding
                    }
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
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


export const useAuth = () => useContext(AuthContext);

