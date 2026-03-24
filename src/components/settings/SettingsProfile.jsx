import React, { useReducer, useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/firestoreService';

const initialState = { fullName: '', age: '', country: '', city: '', roleInBand: '' };

function profileReducer(state, action) {
    switch (action.type) {
        case 'SET_ALL':
            return { ...state, ...action.payload };
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        default:
            return state;
    }
}

const SettingsProfile = () => {
    const { currentUser, userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [state, dispatch] = useReducer(profileReducer, initialState);

    useEffect(() => {
        if (userProfile) {
            dispatch({
                type: 'SET_ALL',
                payload: {
                    fullName: userProfile.fullName || '',
                    age: userProfile.age || '',
                    country: userProfile.country || '',
                    city: userProfile.city || '',
                    roleInBand: userProfile.roleInBand || ''
                }
            });
        }
    }, [userProfile]);

    const handleChange = (field) => (e) => {
        dispatch({ type: 'UPDATE_FIELD', field, value: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(currentUser.uid, state);
            alert("Perfil actualizado correctamente.");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error al actualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} color="var(--accent-secondary)" /> Mi Perfil
            </h2>
            <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre Completo</label>
                    <input
                        type="text"
                        value={state.fullName}
                        onChange={handleChange('fullName')}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Edad</label>
                        <input
                            type="number"
                            value={state.age}
                            onChange={handleChange('age')}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rol</label>
                        <select
                            value={state.roleInBand}
                            onChange={handleChange('roleInBand')}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }}
                        >
                            <option value="musician">Músico</option>
                            <option value="manager">Manager</option>
                            <option value="tech">Técnico</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>País</label>
                        <input
                            type="text"
                            value={state.country}
                            onChange={handleChange('country')}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ciudad</label>
                        <input
                            type="text"
                            value={state.city}
                            onChange={handleChange('city')}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', background: 'var(--accent-secondary)', color: 'white' }}
                >
                    Actualizar Perfil
                </button>
            </form>
        </div>
    );
};

export default SettingsProfile;
