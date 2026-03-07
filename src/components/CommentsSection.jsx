import React, { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, Send, Trash2, User } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente de Comentarios con diseño Premium / Glassmorphism.
 * @frontend.md: Implementado con framer-motion y validación de autor.
 */
const CommentsSection = ({ bandId, parentId, parentType }) => {
    const { currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    // parentType en español para la UI
    const typeLabels = {
        song: 'Canción',
        gig: 'Concierto',
        rehearsal: 'Ensayo'
    };

    useEffect(() => {
        if (!bandId || !parentId) return;

        // Suscripción en tiempo real (Backend Service)
        const unsubscribe = commentService.subscribeToComments(bandId, parentId, (data) => {
            setComments(data);
        });

        return () => unsubscribe();
    }, [bandId, parentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || loading) return;

        setLoading(true);
        try {
            await commentService.addComment(
                bandId,
                parentId,
                parentType,
                currentUser,
                newComment
            );
            setNewComment('');
        } catch (error) {
            console.error("Error al publicar comentario:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
            try {
                await commentService.deleteComment(bandId, commentId);
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    return (
        <div className="comments-container" style={{ marginTop: '2rem' }}>
            <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                fontSize: '1.2rem',
                color: 'var(--accent-primary)'
            }}>
                <MessageSquare size={20} />
                Comentarios de {typeLabels[parentType] || 'este tema'}
            </h3>

            {/* Formulario de comentario */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', position: 'relative' }}>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={`Escribe algo sobre este ${typeLabels[parentType]?.toLowerCase()}...`}
                    className="glass-input"
                    style={{
                        width: '100%',
                        padding: '1rem 3.5rem 1rem 1.2rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                    }}
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || loading}
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'var(--accent-primary)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: newComment.trim() ? 1 : 0.5
                    }}
                >
                    <Send size={18} color="white" />
                </button>
            </form>

            {/* Lista de comentarios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                    {comments.map((comment) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass"
                            style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                gap: '1rem',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(139, 92, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {comment.author.photoURL ? (
                                    <img
                                        src={comment.author.photoURL}
                                        alt={comment.author.displayName}
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <User size={20} color="var(--accent-primary)" />
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>
                                        {comment.author.displayName}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                                        {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.4', margin: 0, opacity: 0.9 }}>
                                    {comment.text}
                                </p>
                            </div>

                            {/* Botón borrar (solo autor o admin) */}
                            {(comment.author.uid === currentUser?.uid) && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        opacity: 0.3,
                                        padding: '4px',
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.3}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {comments.length === 0 && (
                    <p style={{ textAlign: 'center', opacity: 0.3, fontSize: '0.9rem', marginTop: '1rem' }}>
                        No hay comentarios aún. ¡Sé el primero en decir algo!
                    </p>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
