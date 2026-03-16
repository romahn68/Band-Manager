import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
    width = '100%', 
    height = '20px', 
    borderRadius = '8px',
    count = 1,
    className = ''
}) => {
    const skeletons = Array(count).fill(0);

    const baseStyle = {
        width,
        height,
        borderRadius,
        background: 'rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    };

    const shimmerVariants = {
        shimmer: {
            x: ['-100%', '100%'],
            transition: {
                repeat: Infinity,
                duration: 1.5,
                ease: 'linear'
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }} className={className}>
            {skeletons.map((_, i) => (
                <div key={i} style={baseStyle} className="skeleton-box">
                    <motion.div
                        variants={shimmerVariants}
                        animate="shimmer"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '40%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
