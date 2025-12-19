import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getBand, createBand, updateBand, getBandsByUser } from './services/firestoreService';
// db import removed

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [activeBand, setActiveBand] = useState(null);
    const [loading, setLoading] = useState(true);

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
                    setActiveBand(bands[0]);
                } else {
                    // Create first band for new user
                    const newId = await createBand(currentUser);
                    const newBand = {
                        id: newId,
                        nombre: 'Mi Nueva Banda',
                        ownerId: currentUser.uid,
                        createdAt: new Date().toISOString()
                    };
                    setActiveBand(newBand);
                }
            } catch (error) {
                console.error("Error setting up AppContext:", error);
            } finally {
                setLoading(false);
            }
        };

        setup();
    }, [currentUser]);


    const updateBandName = async (newName) => {
        if (activeBand) {
            await updateBand(activeBand.id, { nombre: newName });
            setActiveBand({ ...activeBand, nombre: newName });
        }
    };

    return (
        <AppContext.Provider value={{ activeBand, updateBandName, loading }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
