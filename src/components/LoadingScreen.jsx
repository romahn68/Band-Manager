import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = "Cargando..." }) => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1a1a1e 0%, #0a0a0c 100%)',
            color: 'white',
            fontFamily: "'Lato', sans-serif",
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--accent-primary, #8b5cf6)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
                    marginBottom: '2rem'
                }}
            >
                <span style={{ fontSize: '2rem', fontWeight: '900' }}>B</span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ textAlign: 'center' }}
            >
                <h2 style={{ 
                    fontSize: '1.5rem', 
                    letterSpacing: '2px', 
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(to right, #fff, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    BAND MANAGER PRO
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{message}</p>
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                        style={{ color: 'var(--accent-primary, #8b5cf6)' }}
                    >
                        ●
                    </motion.span>
                </div>
            </motion.div>

            {/* Subtle background glow */}
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                background: 'rgba(139, 92, 246, 0.1)',
                filter: 'blur(100px)',
                borderRadius: '50%',
                zIndex: -1
            }} />
        </div>
    );
};

export default LoadingScreen;
