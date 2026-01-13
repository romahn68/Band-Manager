import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AppContext } from './hooks/Contexts';
import { createBand, updateBand, getBandsByUser } from './services/firestoreService';
import { generateIdCode } from './utils/codeGenerator';
// db import removed

export const AppProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [activeBand, setActiveBand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const setup = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                // Fetch bands owned by the user
                const bands = await getBandsByUser(currentUser.uid);

                if (bands.length > 0) {
                    const savedBandId = localStorage.getItem(`activeBandId_${currentUser.uid}`);
                    let savedBand = bands.find(b => b.id === savedBandId) || bands[0];

                    // Auto-fix missing customId for old bands
                    if (!savedBand.customId) {
                        const newId = generateIdCode('band');
                        await updateBand(savedBand.id, { customId: newId });
                        savedBand = { ...savedBand, customId: newId };
                    }

                    setActiveBand(savedBand);
                } else {
                    // Create first band for new user
                    const newBand = await createBand(currentUser);
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
    }, [currentUser]);

    // Persist active band choice
    useEffect(() => {
        if (currentUser && activeBand) {
            localStorage.setItem(`activeBandId_${currentUser.uid}`, activeBand.id);
        }
    }, [activeBand, currentUser]);


    const updateBandName = async (newName) => {
        if (activeBand) {
            await updateBand(activeBand.id, { nombre: newName });
            setActiveBand({ ...activeBand, nombre: newName });
        }
    };

    const createNewBand = async (bandName) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const newBand = await createBand(currentUser, bandName);
            setActiveBand(newBand);
            localStorage.setItem(`activeBandId_${currentUser.uid}`, newBand.id);
            return newBand;
        } catch (error) {
            console.error("Error creating band:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    return (
        <AppContext.Provider value={{ activeBand, updateBandName, createNewBand, loading, error }}>
            {children}
        </AppContext.Provider>
    );
};
