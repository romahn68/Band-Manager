import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { AppContext } from './hooks/Contexts';
import { createBand, updateBand, getBandsByUser } from './services/firestoreService';
import { generateIdCode } from './utils/codeGenerator';
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

import { normalizeRole } from './utils/constants';

export const AppProvider = ({ children }) => {
    const { currentUser, userProfile, setUserProfile } = useAuth();
    const [activeBand, setActiveBand] = useState(null);
    const [userBands, setUserBands] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ghostMode, setGhostMode] = useState(false);

    // Fetch Role
    useEffect(() => {
        const fetchRole = async () => {
            if (activeBand && currentUser) {
                if (ghostMode) {
                    setUserRole('Administrador');
                    return;
                }
                
                // Pre-fetch cleanup: clear old role immediately to prevent race conditions
                setUserRole(null);

                try {
                    // Try to get role from the new standardized structure first
                    const memberRef = doc(db, "bands", activeBand.id, "musicians", currentUser.uid);
                    const memberDoc = await getDoc(memberRef);

                    if (memberDoc.exists()) {
                        setUserRole(normalizeRole(memberDoc.data().role));
                    } else {
                        // Fallback: search in collection if not found by ID (legacy support)
                        const q = query(
                            collection(db, "bands", activeBand.id, "musicians"),
                            where("uid", "==", currentUser.uid)
                        );
                        const querySnapshot = await getDocs(q);

                        if (!querySnapshot.empty) {
                            const legacyDoc = querySnapshot.docs[0];
                            const legacyData = legacyDoc.data();
                            const legacyId = legacyDoc.id;

                            console.log("Migrating legacy member record to UID key...", legacyId);

                            // 1. Create new doc with UID key
                            const newRef = doc(db, "bands", activeBand.id, "musicians", currentUser.uid);
                            await setDoc(newRef, {
                                ...legacyData,
                                uid: currentUser.uid,
                                musician_id: currentUser.uid
                            });

                            // 2. Delete old doc
                            try {
                                await deleteDoc(doc(db, "bands", activeBand.id, "musicians", legacyId));
                                console.log("Migration successful.");
                            } catch (e) {
                                console.warn("Could not delete legacy doc (minor):", e);
                            }

                            setUserRole(normalizeRole(legacyData.role));
                        } else {
                            setUserRole('Visor'); // Standardized default
                        }
                    }
                } catch (error) {
                    console.error("Error fetching role:", error);
                    setUserRole('Visor');
                }
            } else {
                setUserRole(null);
            }
        };

        fetchRole();
    }, [activeBand, currentUser]);

    const refreshBands = useCallback(async () => {
        if (!currentUser) return;
        try {
            const bands = await getBandsByUser(currentUser.uid);
            setUserBands(bands);

            // Should we update activeBand? Only if it's null or not in the new list (e.g. left band)
            // Ideally we stick to the current ID if possible.
            return bands;
        } catch (err) {
            console.error("Error refreshing bands:", err);
            // Don't set global error here to avoid blocking UI on background refreshes
            return [];
        }
    }, [currentUser]);

    useEffect(() => {
        const setup = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                // Fetch bands owned by the user
                const bands = await getBandsByUser(currentUser.uid);
                setUserBands(bands);

                if (bands.length > 0) {
                    const savedBandId = userProfile?.activeBandId || localStorage.getItem(`activeBandId_${currentUser.uid}`);
                    let savedBand = bands.find(b => b.id === savedBandId) || bands[0];

                    // Auto-fix missing customId for old bands
                    if (!savedBand.customId) {
                        const newId = generateIdCode('band');
                        await updateBand(savedBand.id, { customId: newId });
                        savedBand = { ...savedBand, customId: newId };
                        // Update in local state too
                        const updatedBands = bands.map(b => b.id === savedBand.id ? savedBand : b);
                        setUserBands(updatedBands);
                    }

                    setActiveBand(savedBand);
                } else {
                    // Create first band for new user
                    const newBand = await createBand(currentUser);
                    setUserBands([newBand]);
                    setActiveBand(newBand);
                    localStorage.setItem(`activeBandId_${currentUser.uid}`, newBand.id);
                }
            } catch (error) {
                console.error("Error setting up AppContext:", error);
                if (error.code === 'permission-denied') {
                    setError('Faltan permisos en Firestore. Revisa las reglas de seguridad.');
                } else {
                    setError('Error al conectar con la base de datos.');
                }
            } finally {
                setLoading(false);
            }
        };

        setup();
    }, [currentUser, userProfile?.activeBandId]);

    // Persist active band choice
    useEffect(() => {
        if (currentUser && activeBand) {
            localStorage.setItem(`activeBandId_${currentUser.uid}`, activeBand.id);
        }
    }, [activeBand, currentUser]);

    const switchBand = async (bandId) => {
        const band = userBands.find(b => b.id === bandId);
        if (band) {
            setActiveBand(band);
            localStorage.setItem(`activeBandId_${currentUser.uid}`, band.id);
            if (currentUser) {
                try {
                    await setDoc(doc(db, "users", currentUser.uid), { activeBandId: band.id }, { merge: true });
                    if (setUserProfile && userProfile) {
                        setUserProfile({ ...userProfile, activeBandId: band.id });
                    }
                } catch (e) {
                    console.error("Error syncing active band to profile:", e);
                }
            }
        }
    };

    const updateBandName = async (newName) => {
        if (activeBand) {
            await updateBand(activeBand.id, { nombre: newName });
            const updatedBand = { ...activeBand, nombre: newName };
            setActiveBand(updatedBand);
            setUserBands(prev => prev.map(b => b.id === activeBand.id ? updatedBand : b));
        }
    };

    const createNewBand = async (bandName) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const newBand = await createBand(currentUser, bandName);
            setUserBands(prev => [...prev, newBand]);
            setActiveBand(newBand);
            localStorage.setItem(`activeBandId_${currentUser.uid}`, newBand.id);
            try {
                await setDoc(doc(db, "users", currentUser.uid), { activeBandId: newBand.id }, { merge: true });
                if (setUserProfile && userProfile) {
                    setUserProfile({ ...userProfile, activeBandId: newBand.id });
                }
            } catch (e) {
                console.error("Error syncing active band to profile:", e);
            }
            return newBand;
        } catch (error) {
            console.error("Error creating band:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const enterGhostMode = (band) => {
        setGhostMode(true);
        setActiveBand(band);
    };

    const exitGhostMode = () => {
        setGhostMode(false);
        // Reset to real band (setup will handle this)
        const savedBandId = localStorage.getItem(`activeBandId_${currentUser.uid}`);
        const realBand = userBands.find(b => b.id === savedBandId) || userBands[0];
        setActiveBand(realBand);
    };

    return (
        <AppContext.Provider value={{
            activeBand,
            userBands,
            userRole,
            ghostMode,
            enterGhostMode,
            exitGhostMode,
            switchBand,
            refreshBands,
            updateBandName,
            createNewBand,
            loading,
            error: null
        }}>
            {children}
        </AppContext.Provider>
    );
};
