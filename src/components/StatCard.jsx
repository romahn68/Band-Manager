import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import styles from '../pages/Dashboard.module.css';

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
};

const StatCard = ({ icon, label, value, color, to, navigate }) => {
    const Icon = icon;
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            onClick={() => navigate && to ? navigate(to) : null}
            className={`glass ${styles.statCard || 'statCard'}`}
            style={{
                '--stat-color': color || 'var(--accent-primary)',
                borderTopColor: color || 'var(--accent-primary)',
                cursor: navigate && to ? 'pointer' : 'default'
            }}
        >
            <div className={styles.iconWrapper || 'iconWrapper'} style={{ background: `${color || 'var(--accent-primary)'}20` }}>
                {Icon && <Icon size={28} color={color || 'var(--accent-primary)'} />}
            </div>
            <motion.h3
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                key={value}
                className={styles.statValue || 'statValue'}
            >
                {value}
            </motion.h3>
            <span className={styles.statLabel || 'statLabel'}>{label}</span>
        </motion.div>
    );
};

export default StatCard;
